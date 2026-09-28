"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
    MOVIE_GENRES,
    COUNTRIES,
    YEARS,
    SORT_OPTIONS,
    CONTENT_TYPES,
} from "@/utils/constants";

interface FilterBarProps {
    hideType?: boolean;
}

export default function FilterBar({ hideType = false }: FilterBarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentType = searchParams.get("type") || "all";
    const currentGenre = searchParams.get("genre") || "all";
    const currentCountry = searchParams.get("country") || "all";
    const currentYear = searchParams.get("year") || "all";
    const currentSort = searchParams.get("sortBy") || "popularity.desc";

    const hasActiveFilters =
        (currentType !== "all" && !hideType) ||
        currentGenre !== "all" ||
        currentCountry !== "all" ||
        currentYear !== "all" ||
        currentSort !== "popularity.desc";

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all" && value !== "popularity.desc") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset về trang 1 khi đổi bộ lọc
        params.delete("page");

        startTransition(() => {
            const query = params.toString();
            router.push(`${pathname}${query ? `?${query}` : ""}`);
        });
    };

    const resetFilters = () => {
        const params = new URLSearchParams();
        // Giữ lại từ khóa tìm kiếm q nếu có
        const currentQ = searchParams.get("q");
        if (currentQ) params.set("q", currentQ);

        startTransition(() => {
            const query = params.toString();
            router.push(`${pathname}${query ? `?${query}` : ""}`);
        });
    };

    return (
        <div className="bg-[#181818]/90 border border-[#2E2E2E] rounded-lg p-3 sm:p-4 mb-8 backdrop-blur-sm shadow-xl shadow-black/40">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[#E50914] font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Bộ Lọc Phim
                    </span>
                    {isPending && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span className="w-3 h-3 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                            Đang lọc...
                        </span>
                    )}
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-zinc-400 hover:text-[#E50914] flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#222222] hover:bg-[#282828]"
                    >
                        <span>✕</span>
                        <span>Đặt lại bộ lọc</span>
                    </button>
                )}
            </div>

            {/* Lưới các Dropdown lọc */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
                {/* 1. Loại phim */}
                {!hideType && (
                    <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-medium">Định dạng</label>
                        <select
                            value={currentType}
                            onChange={(e) => updateFilter("type", e.target.value)}
                            className="w-full bg-[#222222] text-white text-xs sm:text-sm rounded border border-zinc-700 px-2.5 py-2 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                        >
                            {CONTENT_TYPES.map((type) => (
                                <option key={type.id} value={type.id} className="bg-[#181818] text-white">
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 2. Thể loại */}
                <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Thể loại</label>
                    <select
                        value={currentGenre}
                        onChange={(e) => updateFilter("genre", e.target.value)}
                        className="w-full bg-[#222222] text-white text-xs sm:text-sm rounded border border-zinc-700 px-2.5 py-2 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                    >
                        <option value="all" className="bg-[#181818] text-white">
                            Tất cả thể loại
                        </option>
                        {MOVIE_GENRES.map((genre) => (
                            <option key={genre.id} value={genre.id} className="bg-[#181818] text-white">
                                {genre.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Quốc gia */}
                <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Quốc gia</label>
                    <select
                        value={currentCountry}
                        onChange={(e) => updateFilter("country", e.target.value)}
                        className="w-full bg-[#222222] text-white text-xs sm:text-sm rounded border border-zinc-700 px-2.5 py-2 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                    >
                        <option value="all" className="bg-[#181818] text-white">
                            Tất cả quốc gia
                        </option>
                        {COUNTRIES.map((country) => (
                            <option key={country.id} value={country.id} className="bg-[#181818] text-white">
                                {country.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 4. Năm phát hành */}
                <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Năm phát hành</label>
                    <select
                        value={currentYear}
                        onChange={(e) => updateFilter("year", e.target.value)}
                        className="w-full bg-[#222222] text-white text-xs sm:text-sm rounded border border-zinc-700 px-2.5 py-2 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                    >
                        <option value="all" className="bg-[#181818] text-white">
                            Tất cả các năm
                        </option>
                        {YEARS.map((year) => (
                            <option key={year.id} value={year.id} className="bg-[#181818] text-white">
                                {year.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 5. Sắp xếp */}
                <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Sắp xếp theo</label>
                    <select
                        value={currentSort}
                        onChange={(e) => updateFilter("sortBy", e.target.value)}
                        className="w-full bg-[#222222] text-white text-xs sm:text-sm rounded border border-zinc-700 px-2.5 py-2 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                    >
                        {SORT_OPTIONS.map((sort) => (
                            <option key={sort.id} value={sort.id} className="bg-[#181818] text-white">
                                {sort.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
