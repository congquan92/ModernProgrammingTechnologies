"use server";

import { searchQuickLive } from "@/services/tmdb";
import type { Movie } from "@/types/tmdb";

/**
 * Server Action tìm kiếm nhanh cho Live Preview trên Navbar
 * Bảo mật TMDB_API_KEY trên server và trả về tối đa 5 kết quả rút gọn.
 * Áp dụng kiểm thực dữ liệu đầu vào (Input Validation & Sanitization) phía server.
 */
export async function quickSearchAction(query: string): Promise<Movie[]> {
    if (!query || typeof query !== "string") {
        return [];
    }

    const trimmed = query.trim();
    // Giới hạn độ dài và loại bỏ ký tự điều khiển nguy hiểm
    if (trimmed.length < 2 || trimmed.length > 100) {
        return [];
    }

    // Loại bỏ các ký tự điều khiển (control characters)
    const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, "");
    if (!sanitized) {
        return [];
    }

    return searchQuickLive(sanitized);
}
