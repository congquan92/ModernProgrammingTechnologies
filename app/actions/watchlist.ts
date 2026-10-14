"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const WATCHLIST_COOKIE = "mh_watchlist";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày (tính bằng giây)

/**
 * Lấy danh sách ID các bộ phim đã lưu từ Cookie (Tầng 1B: Mutation không cần Backend)
 */
export async function getWatchlistIds(): Promise<number[]> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(WATCHLIST_COOKIE)?.value;
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => Number(item))
                .filter((id) => Number.isInteger(id) && id > 0);
        }
        return [];
    } catch {
        return [];
    }
}

const MAX_WATCHLIST_ITEMS = 200;
const MAX_WATCHLIST_COOKIE_BYTES = 3800;

/**
 * Thêm hoặc xóa phim khỏi danh sách yêu thích
 * Cập nhật Cookie an toàn phía Server và tự động revalidate trang /watchlist
 * Thực hiện kiểm thực đầu vào (Input Validation) nghiêm ngặt phía server
 */
export async function toggleWatchlist(movieId: number): Promise<{ isSaved: boolean; error?: string }> {
    // 1. Kiểm thực đầu vào nghiêm ngặt trên Server
    if (!Number.isInteger(movieId) || movieId <= 0) {
        throw new Error("Mã định danh phim (movieId) không hợp lệ.");
    }

    const cookieStore = await cookies();
    const currentIds = await getWatchlistIds();

    let updatedIds: number[];
    let isSaved: boolean;

    if (currentIds.includes(movieId)) {
        updatedIds = currentIds.filter((id) => id !== movieId);
        isSaved = false;
    } else {
        // 2. Kiểm soát giới hạn kích thước Cookie (~4KB RFC 6265)
        if (currentIds.length >= MAX_WATCHLIST_ITEMS) {
            return {
                isSaved: false,
                error: `Danh sách yêu thích đã đạt giới hạn tối đa (${MAX_WATCHLIST_ITEMS} phim) của bộ nhớ Cookie.`,
            };
        }
        updatedIds = [...currentIds, movieId];
        isSaved = true;
    }

    const serializedIds = JSON.stringify(updatedIds);
    if (Buffer.byteLength(`${WATCHLIST_COOKIE}=${serializedIds}`, "utf8") > MAX_WATCHLIST_COOKIE_BYTES) {
        return { isSaved: false, error: "Danh sách yêu thích đã đạt giới hạn dung lượng Cookie." };
    }

    cookieStore.set(WATCHLIST_COOKIE, serializedIds, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    // Revalidate trang watchlist và trang chi tiết phim để cập nhật dữ liệu tức thì
    revalidatePath("/watchlist");
    revalidatePath(`/movie/${movieId}`);

    return { isSaved };
}

/**
 * Xóa toàn bộ danh sách phim yêu thích
 */
export async function clearAllWatchlist(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(WATCHLIST_COOKIE);
    revalidatePath("/watchlist");
}

/**
 * Kiểm tra xem một phim cụ thể đã được lưu trong Watchlist hay chưa
 */
export async function isMovieSaved(movieId: number): Promise<boolean> {
    const currentIds = await getWatchlistIds();
    return currentIds.includes(movieId);
}
