import type { MetadataRoute } from "next";
import { getTrendingMovies } from "@/services/tmdb";

/**
 * Next.js 16 Metadata Route - Sitemap tự động (app/sitemap.ts)
 * Cung cấp sơ đồ trang web chuẩn XML cho công cụ tìm kiếm (Googlebot, Bingbot).
 * Có fallback try/catch đảm bảo build không bao giờ lỗi khi TMDB API ngắt kết nối.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moviehub.vn";
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/browse`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/watchlist`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    try {
        const trendingMovies = await getTrendingMovies();
        const movieRoutes: MetadataRoute.Sitemap = trendingMovies
            .filter((m) => m && m.id)
            .map((movie) => ({
                url: `${baseUrl}/movie/${movie.id}`,
                lastModified: movie.release_date ? new Date(movie.release_date) : now,
                changeFrequency: "weekly",
                priority: 0.8,
            }));

        return [...staticRoutes, ...movieRoutes];
    } catch (error) {
        console.warn("[Sitemap] Không thể lấy danh sách phim động từ TMDB, sử dụng sitemap tĩnh:", error);
        return staticRoutes;
    }
}
