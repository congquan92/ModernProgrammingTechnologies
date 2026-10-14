import { NextResponse } from "next/server";
import { searchQuickLive } from "@/services/tmdb";

/**
 * Route Handler GET /api/search?q=...
 *
 * 🎯 ĐỐI CHỨNG KỸ THUẬT VỚI SERVER ACTION (Giải quyết vấn đề P5):
 * - Server Action dùng phương thức POST, thực thi tuần tự (queue) và không có HTTP Cache trình duyệt.
 * - Route Handler dùng phương thức GET chuẩn RESTful:
 *   1. Có thể cache trực tiếp trên trình duyệt hoặc Edge CDN qua Cache-Control header.
 *   2. Có thể bị hủy (AbortController) phía client khi người dùng tiếp tục gõ phím, tránh race condition.
 *   3. Không bị tắc nghẽn hàng đợi (action queue) của React 19.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || typeof query !== "string") {
        return NextResponse.json({ results: [] }, { status: 200 });
    }

    const trimmed = query.trim().slice(0, 100).replace(/[\x00-\x1F\x7F]/g, "");
    if (trimmed.length < 2) {
        return NextResponse.json({ results: [] }, { status: 200 });
    }

    try {
        const results = await searchQuickLive(trimmed);
        return NextResponse.json(
            { results },
            {
                status: 200,
                headers: {
                    // Cache 2 phút tại CDN/Browser, cho phép phục vụ stale trong 1 phút khi đang revalidate
                    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
                },
            }
        );
    } catch (error) {
        console.error("[RouteHandler GET /api/search] Error:", error);
        return NextResponse.json({ results: [], error: "Lỗi tìm kiếm" }, { status: 500 });
    }
}
