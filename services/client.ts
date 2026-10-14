import dns from "node:dns";
import type { Movie } from "@/types/tmdb";

// Tự động phân giải DNS cho api.themoviedb.org qua Google DNS (8.8.8.8) & Cloudflare (1.1.1.1)
// để giải quyết triệt để lỗi ENOTFOUND / ISP block tại Việt Nam trên Node.js Server runtime.
if (typeof window === "undefined" && dns && dns.lookup) {
    const origLookup = dns.lookup;
    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    // @ts-expect-error Node.js internal lookup overload
    dns.lookup = function (hostname: string, options: unknown, callback: unknown) {
        let cb = callback as (err: Error | null, address?: unknown, family?: number) => void;
        let opt = options as Record<string, unknown> | undefined;
        if (typeof options === "function") {
            cb = options as typeof cb;
            opt = {};
        }

        if (hostname && hostname.includes("themoviedb.org")) {
            resolver
                .resolve4(hostname)
                .then((addresses) => {
                    if (opt && opt.all) {
                        cb(null, addresses.map((a) => ({ address: a, family: 4 })));
                    } else {
                        cb(null, addresses[0], 4);
                    }
                })
                .catch(() => {
                    Reflect.apply(origLookup, dns, [hostname, opt, cb]);
                });
        } else {
            Reflect.apply(origLookup, dns, [hostname, opt, cb]);
        }
    };
}

export const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
export const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
