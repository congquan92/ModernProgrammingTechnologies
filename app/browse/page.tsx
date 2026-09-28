import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { discoverMovies } from "@/services/tmdb";
import MovieCard from "@/components/server/MovieCard";
import FilterBar from "@/components/client/FilterBar";
import { MOVIE_GENRES, COUNTRIES, YEARS, SORT_OPTIONS } from "@/utils/constants";

interface BrowsePageProps {
    searchParams: Promise<{
        type?: string;
        genre?: string;
        year?: string;
        country?: string;
        sortBy?: string;
        page?: string;
    }>;
}

// Hàm hỗ trợ tạo tiêu đề ngữ cảnh từ params
function getFilterTitle(genre?: string, country?: string, year?: string, type?: string, sortBy?: string): string {
    const parts: string[] = [];

    if (type === "tv") {
        parts.push("Phim Truyền Hình");
    } else if (type === "movie") {
        parts.push("Phim Lẻ");
    } else {
        parts.push("Kho Phim");
    }

    if (genre && genre !== "all") {
        const found = MOVIE_GENRES.find((g) => g.id === genre);
        if (found) parts.push(found.label);
    }

    if (country && country !== "all") {
        const found = COUNTRIES.find((c) => c.id === country);
        if (found) parts.push(found.label);
    }

    if (year && year !== "all") {
        const found = YEARS.find((y) => y.id === year);
        if (found) parts.push(found.label);
    }

    if (sortBy && sortBy !== "all" && sortBy !== "popularity.desc") {
        const found = SORT_OPTIONS.find((s) => s.id === sortBy);
        if (found) parts.push(found.label);
    }

    return parts.join(" - ");
}

function getPageRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (current > 3) {
        pages.push("...");
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    if (current < total - 2) {
        pages.push("...");
    }
    pages.push(total);
    return pages;
}

export async function generateMetadata({ searchParams }: BrowsePageProps): Promise<Metadata> {
    const params = await searchParams;
    const title = getFilterTitle(params.genre, params.country, params.year, params.type, params.sortBy);
    return {
        title: `${title} | MovieHub`,
        description: `Khám phá danh sách ${title} chất lượng cao chuẩn Netflix trên MovieHub.`,
    };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    const { results, totalPages, totalResults } = await discoverMovies({
        type: (params.type as "movie" | "tv") || undefined,
        genre: params.genre,
        country: params.country,
        year: params.year,
        sortBy: params.sortBy,
        page: currentPage,
    });

    const pageTitle = getFilterTitle(params.genre, params.country, params.year, params.type, params.sortBy);

    // Tạo hàm build link phân trang giữ nguyên query hiện tại
    const buildPaginationUrl = (pageNumber: number) => {
        const current = new URLSearchParams();
        if (params.type) current.set("type", params.type);
        if (params.genre) current.set("genre", params.genre);
        if (params.country) current.set("country", params.country);
        if (params.year) current.set("year", params.year);
        if (params.sortBy) current.set("sortBy", params.sortBy);
        current.set("page", pageNumber.toString());
        return `/browse?${current.toString()}`;
    };

    const paginationPages = getPageRange(currentPage, totalPages);

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                {/* Header Tiêu Đề */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#2E2E2E] pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {pageTitle}
                        </h1>
                        <p className="text-zinc-400 text-xs sm:text-sm mt-1 flex items-center gap-2 flex-wrap">
                            <span>Tổng cộng</span>
                            <span className="text-[#E50914] font-bold text-base">{totalResults.toLocaleString("vi-VN")}</span>
                            <span>tác phẩm phù hợp</span>
                            <span className="text-zinc-600">·</span>
                            <span>Trang <strong className="text-white">{currentPage}</strong> / {totalPages}</span>
                        </p>
                    </div>

                    <div className="text-xs text-zinc-500 font-medium">
                        Hiển thị {results.length} phim / trang
                    </div>
                </div>

                {/* Bộ Lọc Đa Tiêu Chí */}
                <Suspense
                    fallback={
                        <div className="w-full h-24 bg-[#181818] rounded-lg animate-pulse mb-8" />
                    }
                >
                    <FilterBar />
                </Suspense>

                {/* Kết Quả Phim */}
                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#181818]/50 rounded-xl border border-[#2E2E2E]">
                        <div className="w-16 h-16 rounded-full bg-[#202020] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <h2 className="text-zinc-200 text-lg font-bold">Không tìm thấy phim phù hợp</h2>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Rất tiếc, không có bộ phim nào đáp ứng tất cả các tiêu chí lọc hiện tại. Hãy thử chọn thể loại khác hoặc đặt lại bộ lọc.
                        </p>
                        <Link
                            href="/browse"
                            className="bg-[#E50914] hover:bg-[#B80710] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded transition-colors"
                        >
                            Đặt lại toàn bộ bộ lọc
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
                            {results.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Phân Trang Số Phong Cách Phimmoi / Netflix */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1.5 pt-8 border-t border-[#2E2E2E] flex-wrap">
                                {/* Nút Đầu Trang */}
                                {currentPage > 2 && (
                                    <Link
                                        href={buildPaginationUrl(1)}
                                        className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                        title="Về trang đầu"
                                    >
                                        ««
                                    </Link>
                                )}

                                {/* Nút Trang Trước */}
                                {currentPage > 1 ? (
                                    <Link
                                        href={buildPaginationUrl(currentPage - 1)}
                                        className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                        title="Trang trước"
                                    >
                                        ‹ Trước
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-600 text-xs sm:text-sm cursor-not-allowed">
                                        ‹ Trước
                                    </span>
                                )}

                                {/* Danh Sách Số Trang */}
                                {paginationPages.map((page, idx) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-zinc-500 text-xs sm:text-sm select-none">
                                            ...
                                        </span>
                                    ) : (
                                        <Link
                                            key={`page-${page}`}
                                            href={buildPaginationUrl(page)}
                                            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-bold transition-colors ${
                                                page === currentPage
                                                    ? "bg-[#E50914] text-white shadow-lg shadow-red-900/40"
                                                    : "bg-[#202020] hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    )
                                )}

                                {/* Nút Trang Kế Tiếp */}
                                {currentPage < totalPages ? (
                                    <Link
                                        href={buildPaginationUrl(currentPage + 1)}
                                        className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                        title="Trang kế tiếp"
                                    >
                                        Tiếp ›
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-600 text-xs sm:text-sm cursor-not-allowed">
                                        Tiếp ›
                                    </span>
                                )}

                                {/* Nút Về Trang Cuối */}
                                {currentPage < totalPages - 1 && (
                                    <Link
                                        href={buildPaginationUrl(totalPages)}
                                        className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                        title="Trang cuối cùng"
                                    >
                                        »»
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
