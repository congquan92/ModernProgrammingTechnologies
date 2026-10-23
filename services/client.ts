import type { Movie } from "@/types/tmdb";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Hàm gọi API TMDB dùng chung trên Server với chiến lược Caching (ISR - Tầng 1B)
 * @param endpoint Đường dẫn API TMDB (ví dụ: '/trending/movie/week')
 * @param revalidateTime Thời gian lưu cache tính bằng giây
 * @param language Ngôn ngữ trả về (mặc định vi-VN)
 */
export async function fetchTMDB<T>(
    endpoint: string,
    revalidateTime: number = 3600,
    language: string = "vi-VN"
): Promise<T> {
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_actual_api_key_here") {
        console.warn(`[TMDB Service] Cảnh báo: TMDB_API_KEY chưa được cấu hình hợp lệ trong .env.local!`);
        throw new Error("TMDB_API_KEY chưa được thiết lập.");
    }

    const delimiter = endpoint.includes("?") ? "&" : "?";
    const langParam = language ? `&language=${language}` : "";
    const url = `${TMDB_BASE_URL}${endpoint}${delimiter}api_key=${TMDB_API_KEY}${langParam}`;

    const res = await fetch(url, {
        next: { revalidate: revalidateTime },
    });

    if (!res.ok) {
        throw new Error(`Lỗi gọi API TMDB [${res.status}]: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Hàm tiện ích loại bỏ phim trùng lặp theo ID (phòng ngừa TMDB trả về cùng phim ở ranh giới các trang)
 */
export function deduplicateMovies(movies: Movie[]): Movie[] {
    const seen = new Set<number>();
    const unique: Movie[] = [];
    for (const movie of movies) {
        if (movie && movie.id && !seen.has(movie.id)) {
            seen.add(movie.id);
            unique.push(movie);
        }
    }
    return unique;
}
