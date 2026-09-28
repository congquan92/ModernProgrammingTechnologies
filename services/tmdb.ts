import type { Movie, MovieListResponse, MovieDetails, MovieCredits, DiscoverParams } from "@/types/tmdb";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Hàm gọi API TMDB dùng chung trên Server với chiến lược Caching (ISR - Tầng 1B)
 * @param endpoint Đường dẫn API TMDB (ví dụ: '/trending/movie/week')
 * @param revalidateTime Thời gian lưu cache tính bằng giây
 */
async function fetchTMDB<T>(endpoint: string, revalidateTime: number = 3600): Promise<T> {
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_actual_api_key_here") {
        console.warn(`[TMDB Service] Cảnh báo: TMDB_API_KEY chưa được cấu hình hợp lệ trong .env.local!`);
        throw new Error("TMDB_API_KEY chưa được thiết lập.");
    }

    const delimiter = endpoint.includes("?") ? "&" : "?";
    const url = `${TMDB_BASE_URL}${endpoint}${delimiter}api_key=${TMDB_API_KEY}&language=vi-VN`;

    const res = await fetch(url, {
        next: { revalidate: revalidateTime },
    });

    if (!res.ok) {
        throw new Error(`Lỗi gọi API TMDB [${res.status}]: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Lấy danh sách phim thịnh hành trong tuần (Trending)
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getTrendingMovies(): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<MovieListResponse>("/trending/movie/week", 3600);
        return data.results || [];
    } catch (error) {
        console.error("Lỗi getTrendingMovies:", error);
        return [];
    }
}

/**
 * Lấy danh sách phim đang chiếu rạp (Now Playing)
 * Chiến lược cache: 30 phút (1800s)
 */
export async function getNowPlayingMovies(): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<MovieListResponse>("/movie/now_playing", 1800);
        return data.results || [];
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
 */
export async function searchMovies(query: string): Promise<Movie[]> {
    if (!query.trim()) return [];
    try {
        const data = await fetchTMDB<MovieListResponse>(
            `/search/movie?query=${encodeURIComponent(query)}`,
            300, // Cache 5 phút
        );
        return data.results || [];
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
 * Hỗ trợ lọc theo thể loại, quốc gia, năm, sắp xếp và phân trang.
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

        // Phân trang
        const page = params.page || 1;
        queryParts.push(`page=${page}`);

        const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const data = await fetchTMDB<MovieListResponse>(`${endpointBase}${queryString}`, 1800);

        // Chuẩn hóa tên và ngày phát hành cho phim truyền hình
        const normalizedResults = (data.results || []).map((item) => ({
            ...item,
            title: item.title || item.name || "Chưa có tiêu đề",
            release_date: item.release_date || item.first_air_date || "",
        }));

        return {
            results: normalizedResults,
            totalPages: Math.min(data.total_pages || 1, 500), // TMDB giới hạn 500 pages
            totalResults: data.total_results || 0,
        };
    } catch (error) {
        console.error("Lỗi discoverMovies:", error);
        return { results: [], totalPages: 1, totalResults: 0 };
    }
}

/**
 * Lấy danh sách phim truyền hình phổ biến (TV Popular)
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getTvPopular(page: number = 1): Promise<{ results: Movie[]; totalPages: number }> {
    try {
        const data = await fetchTMDB<MovieListResponse>(`/tv/popular?page=${page}`, 3600);
        const normalizedResults = (data.results || []).map((item) => ({
            ...item,
            title: item.name || item.title || "Phim bộ",
            release_date: item.first_air_date || item.release_date || "",
        }));

        return {
            results: normalizedResults,
            totalPages: Math.min(data.total_pages || 1, 500),
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

