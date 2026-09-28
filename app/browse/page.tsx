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
function getFilterTitle(genre?: string, country?: string, year?: string, type?: string): string {
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

    return parts.join(" - ");
}

export async function generateMetadata({ searchParams }: BrowsePageProps): Promise<Metadata> {
    const params = await searchParams;
    const title = getFilterTitle(params.genre, params.country, params.year, params.type);
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

    const pageTitle = getFilterTitle(params.genre, params.country, params.year, params.type);

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

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                {/* Header Tiêu Đề */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#2E2E2E] pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {pageTitle}
                        </h1>
                        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                            Tổng cộng <span className="text-[#E50914] font-bold">{totalResults.toLocaleString()}</span> tác phẩm phù hợp
                        </p>
                    </div>

                    <div className="text-xs text-zinc-500 font-medium">
                        Trang {currentPage} / {totalPages}
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

                        {/* Phân Trang Chuẩn */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#2E2E2E]">
                                {currentPage > 1 ? (
                                    <Link
                                        href={buildPaginationUrl(currentPage - 1)}
                                        className="px-4 py-2 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                    >
                                        ← Trang trước
                                    </Link>
                                ) : (
                                    <span className="px-4 py-2 rounded bg-zinc-900 text-zinc-600 text-xs sm:text-sm cursor-not-allowed">
                                        ← Trang trước
                                    </span>
                                )}

                                <div className="px-4 py-2 rounded bg-[#181818] border border-zinc-800 text-white text-xs sm:text-sm font-bold">
                                    {currentPage} / {totalPages}
                                </div>

                                {currentPage < totalPages ? (
                                    <Link
                                        href={buildPaginationUrl(currentPage + 1)}
                                        className="px-4 py-2 rounded bg-[#202020] hover:bg-[#E50914] text-white text-xs sm:text-sm font-semibold transition-colors"
                                    >
                                        Trang sau →
                                    </Link>
                                ) : (
                                    <span className="px-4 py-2 rounded bg-zinc-900 text-zinc-600 text-xs sm:text-sm cursor-not-allowed">
                                        Trang sau →
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
