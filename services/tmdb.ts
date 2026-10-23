/**
 * Tệp đóng vai trò Facade / Re-export toàn bộ các phân hệ API TMDB đã được module hóa:
 *
 * - client.ts: Cấu hình Base URL, API Key, fetchTMDB dùng chung, deduplicateMovies
 * - movies.ts: Trending, Now Playing, Top Rated, Details, Cast Credits, Similar Movies
 * - discover.ts: Khám phá lọc phim điện ảnh đa tiêu chí (Discover API)
 * - search.ts: Tìm kiếm đầy đủ (searchMovies), Tìm kiếm xem trước (searchQuickLive)
 * - videos.ts: Lấy Trailer video và thuật toán lựa chọn Trailer tối ưu (selectBestTrailer)
 */

export * from "./client";
export * from "./movies";
export * from "./discover";
export * from "./search";
export * from "./videos";
