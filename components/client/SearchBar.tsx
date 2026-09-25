"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition, useCallback, useRef } from "react";

/**
 * SearchBar - Client Component đồng bộ từ khóa tìm kiếm lên URL (Tầng 1B)
 * Cơ chế: gõ phím -> debounce 400ms -> cập nhật ?q= trên URL -> Server Component xử lý fetch TMDB
 * Thiết kế chuẩn Netflix Dark Cinema, không sử dụng emoji, icon hoàn toàn bằng vector SVG.
 */
export default function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback(
        (term: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString());
                const trimmed = term.trim();
                if (trimmed) {
                    params.set("q", trimmed);
                } else {
                    params.delete("q");
                }

                startTransition(() => {
                    replace(`${pathname}?${params.toString()}`);
                });
            }, 400);
        },
        [searchParams, pathname, replace]
    );

    return (
        <div className="relative w-full max-w-2xl">
            {/* Search Icon SVG */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <input
                type="text"
                placeholder="Nhập tên phim cần tìm (ví dụ: Batman, Avatar)..."
                defaultValue={searchParams.get("q")?.toString() ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-md bg-[#242424] text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:border-[#E50914] transition-colors text-sm sm:text-base"
            />

            {/* Spinner indicator during transition */}
            {isPending && (
                <div className="absolute inset-y-0 right-4 flex items-center">
                    <div className="w-4 h-4 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
