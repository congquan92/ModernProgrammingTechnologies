import type {
    Movie,
    MovieListResponse,
    MovieDetails,
    MovieCredits,
    DiscoverParams,
    MovieVideo,
    MovieVideosResponse,
} from "@/types/tmdb";
import dns from "node:dns";

// Tự động phân giải DNS cho api.themoviedb.org qua Google DNS (8.8.8.8) & Cloudflare (1.1.1.1)
// để giải quyết triệt để lỗi ENOTFOUND / ISP block tại Việt Nam.
if (typeof window === "undefined" && dns && dns.lookup) {
    const origLookup = dns.lookup;
    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    // @ts-expect-error Node.js internal lookup overload
    dns.lookup = function (hostname: string, options: unknown, callback: unknown) {
        let cb = callback as (err: Error | null, address?: unknown, family?: number) => void;
        let opt = options as Record<string, unknown> | undefined;
        if (typeof options === "function") {
            cb = options as typeof cb;
            opt = {};
        }

        if (hostname && hostname.includes("themoviedb.org")) {
            resolver
                .resolve4(hostname)
                .then((addresses) => {
                    if (opt && opt.all) {
                        cb(null, addresses.map((a) => ({ address: a, family: 4 })));
                    } else {
                        cb(null, addresses[0], 4);
                    }
                })
                .catch(() => {
                    Reflect.apply(origLookup, dns, [hostname, opt, cb]);
                });
        } else {
            Reflect.apply(origLookup, dns, [hostname, opt, cb]);
        }
    };
}

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Hàm gọi API TMDB dùng chung trên Server với chiến lược Caching (ISR - Tầng 1B)
 * @param endpoint Đường dẫn API TMDB (ví dụ: '/trending/movie/week')
 * @param revalidateTime Thời gian lưu cache tính bằng giây
 * @param language Ngôn ngữ trả về (mặc định vi-VN)
 */
async function fetchTMDB<T>(
    endpoint: string,
    revalidateTime: number = 3600,
    language: string = "vi-VN"
): Promise<T> {
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_actual_api_key_here") {
        console.warn(`[TMDB Service] Cảnh báo: TMDB_API_KEY chưa được cấu hình hợp lệ trong .env.local!`);
        throw new Error("TMDB_API_KEY chưa được thiết lập.");
    }

    const delimiter = endpoint.includes("?") ? "&" : "?";
    const langParam = language ? `&language=${language}` : "";
    const url = `${TMDB_BASE_URL}${endpoint}${delimiter}api_key=${TMDB_API_KEY}${langParam}`;

    const res = await fetch(url, {
        next: { revalidate: revalidateTime },
    });

    if (!res.ok) {
        throw new Error(`Lỗi gọi API TMDB [${res.status}]: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Hàm tiện ích loại bỏ phim trùng lặp theo ID (phòng ngừa TMDB trả về cùng phim ở ranh giới các trang)
 */
function deduplicateMovies(movies: Movie[]): Movie[] {
    const seen = new Set<number>();
    const unique: Movie[] = [];
    for (const movie of movies) {
        if (movie && movie.id && !seen.has(movie.id)) {
            seen.add(movie.id);
            unique.push(movie);
        }
    }
    return unique;
}

/**
 * Lấy danh sách phim thịnh hành trong tuần (Trending)
 * Mặc định lấy 24 phim để lấp đầy 4 hàng x 6 cột
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getTrendingMovies(limit: number = 24): Promise<Movie[]> {
    try {
        const [page1, page2] = await Promise.all([
            fetchTMDB<MovieListResponse>("/trending/movie/week?page=1", 3600),
            limit > 20
                ? fetchTMDB<MovieListResponse>("/trending/movie/week?page=2", 3600).catch(() => ({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }))
                : Promise.resolve({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }),
        ]);
        const combined = deduplicateMovies([...(page1.results || []), ...(page2.results || [])]);
        return combined.slice(0, limit);
    } catch (error) {
        console.error("Lỗi getTrendingMovies:", error);
        return [];
    }
}

/**
 * Lấy danh sách phim đang chiếu rạp (Now Playing)
 * Mặc định lấy 24 phim
 * Chiến lược cache: 30 phút (1800s)
 */
export async function getNowPlayingMovies(limit: number = 24): Promise<Movie[]> {
    try {
        const [page1, page2] = await Promise.all([
            fetchTMDB<MovieListResponse>("/movie/now_playing?page=1", 1800),
            limit > 20
                ? fetchTMDB<MovieListResponse>("/movie/now_playing?page=2", 1800).catch(() => ({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }))
                : Promise.resolve({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }),
        ]);
        const combined = deduplicateMovies([...(page1.results || []), ...(page2.results || [])]);
        return combined.slice(0, limit);
    } catch (error) {
        console.error("Lỗi getNowPlayingMovies:", error);
        return [];
    }
}

/**
 * Lấy danh sách phim có điểm đánh giá cao nhất (Top Rated)
 * Chiến lược cache: 24 giờ (86400s)
 */
export async function getTopRatedMovies(): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<MovieListResponse>("/movie/top_rated", 86400);
        return data.results || [];
    } catch (error) {
        console.error("Lỗi getTopRatedMovies:", error);
        return [];
    }
}

/**
 * Lấy chi tiết một bộ phim theo ID (Dành cho trang chi tiết phim - Đại phụ trách)
 */
export async function getMovieDetails(id: string): Promise<MovieDetails> {
    return fetchTMDB<MovieDetails>(`/movie/${id}`, 3600);
}

/**
 * Lấy danh sách diễn viên của phim (Cast Credits - Dành cho Streaming Suspense)
 */
export async function getMovieCredits(id: string): Promise<MovieCredits> {
    return fetchTMDB<MovieCredits>(`/movie/${id}/credits`, 3600);
}

/**
 * Tìm kiếm phim theo từ khóa (Dành cho SearchBar - Thái phụ trách)
 * Mặc định lấy đến 48 phim (2 trang TMDB) để lọc và hiển thị đủ 24 phim
 */
export async function searchMovies(query: string, limit: number = 48): Promise<Movie[]> {
    if (!query.trim()) return [];
    try {
        const [page1, page2] = await Promise.all([
            fetchTMDB<MovieListResponse>(
                `/search/movie?query=${encodeURIComponent(query)}&page=1`,
                300 // Cache 5 phút
            ).catch(() => ({ results: [] as Movie[], page: 1, total_pages: 0, total_results: 0 })),
            limit > 20
                ? fetchTMDB<MovieListResponse>(
                      `/search/movie?query=${encodeURIComponent(query)}&page=2`,
                      300
                  ).catch(() => ({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }))
                : Promise.resolve({ results: [] as Movie[], page: 2, total_pages: 0, total_results: 0 }),
        ]);
        const combined = deduplicateMovies([...(page1.results || []), ...(page2.results || [])]);
        return combined.slice(0, limit);
    } catch (error) {
        console.error("Lỗi searchMovies:", error);
        return [];
    }
}

/**
 * Lấy danh sách phim tương tự theo ID phim (Dành cho SimilarMovies component - Đại phụ trách)
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getSimilarMovies(id: string): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<MovieListResponse>(`/movie/${id}/similar`, 3600);
        return data.results || [];
    } catch (error) {
        console.error("Lỗi getSimilarMovies:", error);
        return [];
    }
}

/**
 * Khám phá phim và TV Series đa tiêu chí (Discover API)
 * Hỗ trợ phân trang chuẩn 24 phim / trang (lấp đầy hoàn hảo 4 hàng x 6 cột)
 * Cache: 30 phút (1800s)
 */
export async function discoverMovies(params: DiscoverParams): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> {
    try {
        const isTv = params.type === "tv" || params.genre === "tv";
        const endpointBase = isTv ? "/discover/tv" : "/discover/movie";
        const queryParts: string[] = [];

        // Xử lý thể loại
        if (params.genre && params.genre !== "all" && params.genre !== "tv") {
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
                queryParts.push(isTv ? "first_air_date.lte=2014-12-31" : "primary_release_date.lte=2014-12-31");
            } else if (/^\d{4}$/.test(params.year)) {
                queryParts.push(isTv ? `first_air_date_year=${params.year}` : `primary_release_year=${params.year}`);
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

/**
 * Lấy danh sách phim truyền hình phổ biến (TV Popular)
 * Mặc định trả về 24 phim
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getTvPopular(page: number = 1, limit: number = 24): Promise<{ results: Movie[]; totalPages: number }> {
    try {
        const [page1, page2] = await Promise.all([
            fetchTMDB<MovieListResponse>(`/tv/popular?page=${page}`, 3600),
            limit > 20
                ? fetchTMDB<MovieListResponse>(`/tv/popular?page=${page + 1}`, 3600).catch(() => ({ results: [] as Movie[], page: page + 1, total_pages: 0, total_results: 0 }))
                : Promise.resolve({ results: [] as Movie[], page: page + 1, total_pages: 0, total_results: 0 }),
        ]);
        const combined = deduplicateMovies([...(page1.results || []), ...(page2.results || [])]);
        const normalizedResults = combined.slice(0, limit).map((item) => ({
            ...item,
            title: item.name || item.title || "Phim bộ",
            release_date: item.first_air_date || item.release_date || "",
        }));

        return {
            results: normalizedResults,
            totalPages: Math.min(page1.total_pages || 1, 500),
        };
    } catch (error) {
        console.error("Lỗi getTvPopular:", error);
        return { results: [], totalPages: 1 };
    }
}

/**
 * Tìm kiếm nhanh trả về tối đa 5 kết quả cho Live Search Preview trên Navbar
 * Cache ngắn: 2 phút (120s)
 */
export async function searchQuickLive(query: string): Promise<Movie[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
        const data = await fetchTMDB<MovieListResponse>(
            `/search/multi?query=${encodeURIComponent(trimmed)}`,
            120,
        );
        const filtered = (data.results || [])
            .filter((item) => (item as unknown as { media_type?: string }).media_type !== "person")
            .slice(0, 5)
            .map((item) => ({
                ...item,
                title: item.title || item.name || "Phim",
                release_date: item.release_date || item.first_air_date || "",
            }));

        return filtered;
    } catch (error) {
        console.error("Lỗi searchQuickLive:", error);
        return [];
    }
}

/**
 * Lấy danh sách video / trailer chính thức của phim từ TMDB API
 * Hỗ trợ tham số include_video_language để ưu tiên trailer tiếng Việt và tiếng Anh.
 * Cache: 1 giờ (3600s)
 */
export async function getMovieVideos(id: string): Promise<MovieVideo[]> {
    try {
        const data = await fetchTMDB<MovieVideosResponse>(
            `/movie/${id}/videos?include_video_language=vi,en,null`,
            3600,
            ""
        );
        return data.results || [];
    } catch (error) {
        console.error(`Lỗi getMovieVideos [ID: ${id}]:`, error);
        return [];
    }
}

/**
 * Thuật toán lựa chọn Trailer tối ưu nhất từ danh sách videos của TMDB
 * 1. Trailer chính thức tiếng Việt
 * 2. Trailer chính thức bất kỳ (official === true)
 * 3. Trailer YouTube bất kỳ
 * 4. Teaser YouTube
 * 5. Bất kỳ video YouTube nào
 */
export function selectBestTrailer(videos: MovieVideo[]): MovieVideo | null {
    if (!videos || videos.length === 0) return null;

    const youtubeVideos = videos.filter((v) => v.site === "YouTube" && v.key);
    if (youtubeVideos.length === 0) return null;

    // 1. Trailer tiếng Việt chính thức
    const viOfficialTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.official && v.iso_639_1 === "vi"
    );
    if (viOfficialTrailer) return viOfficialTrailer;

    // 2. Trailer tiếng Việt bất kỳ
    const viTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.iso_639_1 === "vi"
    );
    if (viTrailer) return viTrailer;

    // 3. Trailer chính thức (official === true)
    const officialTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.official
    );
    if (officialTrailer) return officialTrailer;

    // 4. Trailer bất kỳ
    const anyTrailer = youtubeVideos.find((v) => v.type === "Trailer");
    if (anyTrailer) return anyTrailer;

    // 5. Teaser bất kỳ
    const anyTeaser = youtubeVideos.find((v) => v.type === "Teaser");
    if (anyTeaser) return anyTeaser;

    // 6. Video đầu tiên
    return youtubeVideos[0] || null;
}

