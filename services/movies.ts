import type { Movie, MovieListResponse, MovieDetails, MovieCredits } from "@/types/tmdb";
import { fetchTMDB, deduplicateMovies } from "./client";

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
 * Lấy chi tiết một bộ phim theo ID (Dành cho trang chi tiết phim)
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
 * Lấy danh sách phim tương tự theo ID phim (Dành cho SimilarMovies component)
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
