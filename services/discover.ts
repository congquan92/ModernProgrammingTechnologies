import type { Movie, MovieListResponse, DiscoverParams } from "@/types/tmdb";
import { fetchTMDB, deduplicateMovies } from "./client";

/**
 * Khám phá phim điện ảnh đa tiêu chí (Discover API)
 * Hỗ trợ phân trang chuẩn 24 phim / trang (lấp đầy hoàn hảo 4 hàng x 6 cột)
 * Cache: 30 phút (1800s)
 */
export async function discoverMovies(params: DiscoverParams): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> {
    try {
        const endpointBase = "/discover/movie";
        const queryParts: string[] = [];

        // Xử lý thể loại
        if (params.genre && params.genre !== "all") {
            if (params.genre === "classic") {
                queryParts.push("primary_release_date.lte=2000-01-01");
            } else {
                const numericGenreId = params.genre.split("-")[0];
                if (/^\d+$/.test(numericGenreId)) {
                    queryParts.push(`with_genres=${numericGenreId}`);
                }
            }
        }

        // Xử lý quốc gia
        if (params.country && params.country !== "all") {
            queryParts.push(`with_origin_country=${encodeURIComponent(params.country)}`);
        }

        // Xử lý năm phát hành
        if (params.year && params.year !== "all") {
            if (params.year === "before-2015") {
                queryParts.push("primary_release_date.lte=2014-12-31");
            } else if (/^\d{4}$/.test(params.year)) {
                queryParts.push(`primary_release_year=${params.year}`);
            }
        }

        // Xử lý sắp xếp
        const sortBy = params.sortBy || "popularity.desc";
        queryParts.push(`sort_by=${sortBy}`);
        if (sortBy.includes("vote_average")) {
            queryParts.push("vote_count.gte=50");
        }

        // Phân trang chuẩn 24 phim/trang (TMDB trả về 20 phim/page)
        const uiPage = Math.max(1, params.page || 1);
        const perPage = Math.max(1, params.perPage || 24);

        const startIdx = (uiPage - 1) * perPage;
        const endIdx = startIdx + perPage;

        const firstTmdbPage = Math.min(Math.floor(startIdx / 20) + 1, 500);
        const secondTmdbPage = Math.min(Math.floor((endIdx - 1) / 20) + 1, 500);

        const fetchPage = async (pageNumber: number): Promise<MovieListResponse> => {
            const qParts = [...queryParts, `page=${pageNumber}`];
            const qString = `?${qParts.join("&")}`;
            return fetchTMDB<MovieListResponse>(`${endpointBase}${qString}`, 1800);
        };

        const [firstData, secondData] = await Promise.all([
            fetchPage(firstTmdbPage).catch((err) => {
                console.error(`Lỗi fetchTMDB page ${firstTmdbPage}:`, err);
                return { page: firstTmdbPage, results: [] as Movie[], total_pages: 0, total_results: 0 };
            }),
            secondTmdbPage !== firstTmdbPage && secondTmdbPage <= 500
                ? fetchPage(secondTmdbPage).catch((err) => {
                      console.error(`Lỗi fetchTMDB page ${secondTmdbPage}:`, err);
                      return { page: secondTmdbPage, results: [] as Movie[], total_pages: 0, total_results: 0 };
                  })
                : Promise.resolve({ page: secondTmdbPage, results: [] as Movie[], total_pages: 0, total_results: 0 }),
        ]);

        const rawResults = deduplicateMovies([...(firstData.results || []), ...(secondData.results || [])]);
        const localStart = startIdx - (firstTmdbPage - 1) * 20;
        const localEnd = localStart + perPage;

        // Nếu sau khi loại bỏ trùng lặp mà chưa đủ số lượng phim cần thiết, thử lấy tiếp trang kế tiếp
        const tmdbTotalPages = Math.min(firstData.total_pages || 1, 500);
        if (rawResults.length < localEnd && secondTmdbPage < tmdbTotalPages) {
            try {
                const thirdData = await fetchPage(secondTmdbPage + 1);
                for (const item of (thirdData.results || [])) {
                    if (item && item.id && !rawResults.some((m) => m.id === item.id)) {
                        rawResults.push(item);
                    }
                }
            } catch {
                // Giữ nguyên kết quả hiện có nếu trang tiếp theo lỗi
            }
        }

        const slicedResults = rawResults.slice(localStart, localEnd);

        // Chuẩn hóa tên và ngày phát hành cho phim truyền hình
        const normalizedResults = slicedResults.map((item) => ({
            ...item,
            title: item.title || item.name || "Chưa có tiêu đề",
            release_date: item.release_date || item.first_air_date || "",
        }));

        const totalResults = firstData.total_results || 0;
        const maxAvailableItems = Math.min(totalResults, 500 * 20);
        const totalPages = Math.max(1, Math.ceil(maxAvailableItems / perPage));

        return {
            results: normalizedResults,
            totalPages,
            totalResults,
        };
    } catch (error) {
        console.error("Lỗi discoverMovies:", error);
        return { results: [], totalPages: 1, totalResults: 0 };
    }
}
