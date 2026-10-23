import type { MetadataRoute } from "next";

/**
 * Next.js 16 Metadata Route - Robots.txt tự động (app/robots.ts)
 * Thiết lập chính sách thu thập dữ liệu cho bot tìm kiếm (Googlebot, Bingbot).
 * Cho phép crawl các trang nội dung công khai, chặn route nội bộ /api/ và trang cookie /watchlist.
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moviehub.vn";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/watchlist"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
