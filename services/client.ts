import type { Movie } from "@/types/tmdb";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
export class TMDBError extends Error {
    status: number;
    constructor(message: string, status = 0) {
        super(message);
        this.name = "TMDBError";
        this.status = status;
    }
}

/**
 * Hàm gọi API TMDB trên Server với Data Cache theo thời hạn.
 * ISR của toàn route phụ thuộc thêm request-time API và cấu hình route.
 * @param endpoint Đường dẫn API TMDB (ví dụ: '/trending/movie/week')
 * @param revalidateTime Thời gian lưu cache tính bằng giây
 * @param language Ngôn ngữ trả về (mặc định vi-VN)
 */
export async function fetchTMDB<T>(
    endpoint: string,
    revalidateTime: number = 3600,
    language: string = "vi-VN"
): Promise<T> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_actual_api_key_here") {
        console.warn(`[TMDB Service] Cảnh báo: TMDB_API_KEY chưa được cấu hình hợp lệ trong .env.local!`);
        throw new TMDBError("TMDB_API_KEY chưa được thiết lập.");
    }

    // Chỉ rút ngắn TTL khi kiểm chứng bằng mock loopback; không đổi TTL TMDB thật.
    const mockTTL = process.env.TMDB_MOCK_REVALIDATE_SECONDS;
    if (mockTTL !== undefined) {
        const origin = new URL(TMDB_BASE_URL);
        if (origin.protocol !== "http:" || origin.hostname !== "127.0.0.1") {
            throw new Error("TMDB_MOCK_REVALIDATE_SECONDS requires an HTTP loopback mock.");
        }
        const seconds = Number(mockTTL);
        if (!Number.isInteger(seconds) || seconds < 1 || seconds > 60) {
            throw new Error("TMDB_MOCK_REVALIDATE_SECONDS must be an integer from 1 to 60.");
        }
        revalidateTime = seconds;
    }

    const delimiter = endpoint.includes("?") ? "&" : "?";
    const langParam = language ? `&language=${language}` : "";
    const url = `${TMDB_BASE_URL}${endpoint}${delimiter}api_key=${TMDB_API_KEY}${langParam}`;

    try {
        const res = await fetch(url, {
            next: { revalidate: revalidateTime },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new TMDBError(`Lỗi gọi API TMDB [${res.status}]`, res.status);
        return await res.json() as T;
    } catch (error) {
        if (error instanceof TMDBError) throw error;
        // ponytail: log only safe context; add request IDs if distributed tracing is needed.
        console.error("[TMDB] Request failed", endpoint.split("?")[0]);
        throw new TMDBError("Không thể tải dữ liệu phim. Vui lòng thử lại.");
    }
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
