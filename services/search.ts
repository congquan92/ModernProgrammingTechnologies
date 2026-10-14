import type { Movie, MovieListResponse } from "@/types/tmdb";
import { fetchTMDB, deduplicateMovies } from "./client";

/**
 * Tìm kiếm phim theo từ khóa (Dành cho trang Search đầy đủ)
 * Mặc định lấy đến 48 phim (2 trang TMDB) để lọc và hiển thị đủ 24 phim
 * Cache: 5 phút (300s)
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
 * Tìm kiếm nhanh trả về tối đa 5 kết quả cho Live Search Preview trên Navbar / Route Handler
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
