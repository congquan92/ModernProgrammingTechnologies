"use server";

import { searchQuickLive } from "@/services/tmdb";
import type { Movie } from "@/types/tmdb";

/**
 * Server Action tìm kiếm nhanh cho Live Preview trên Navbar
 * Bảo mật TMDB_API_KEY trên server và trả về tối đa 5 kết quả rút gọn.
 */
export async function quickSearchAction(query: string): Promise<Movie[]> {
    if (!query || query.trim().length === 0) {
        return [];
    }
    return searchQuickLive(query);
}
