import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { discoverMovies } from "@/services/tmdb";
import MovieCard from "@/components/server/MovieCard";
import FilterBar from "@/components/client/FilterBar";

interface TvPageProps {
    searchParams: Promise<{
        genre?: string;
        year?: string;
        country?: string;
        sortBy?: string;
        page?: string;
    }>;
}

export const metadata: Metadata = {
    title: "Phim Truyền Hình & TV Series Hot Nhất | MovieHub",
    description: "Xem trọn bộ phim truyền hình, phim bộ Hàn Quốc, Trung Quốc, Âu Mỹ chất lượng cao trên MovieHub.",
};

export default async function TvPage({ searchParams }: TvPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    const { results, totalPages, totalResults } = await discoverMovies({
        type: "tv",
        genre: params.genre,
        country: params.country,
        year: params.year,
        sortBy: params.sortBy,
        page: currentPage,
    });

    const buildPaginationUrl = (pageNumber: number) => {
        const current = new URLSearchParams();
        if (params.genre) current.set("genre", params.genre);
        if (params.country) current.set("country", params.country);
        if (params.year) current.set("year", params.year);
        if (params.sortBy) current.set("sortBy", params.sortBy);
        current.set("page", pageNumber.toString());
        return `/tv?${current.toString()}`;
    };

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                {/* Tiêu đề & Giới thiệu */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#2E2E2E] pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Phim Truyền Hình</span>
                            <span className="text-xs bg-[#E50914] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                TV Series
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                            Tổng cộng <span className="text-[#E50914] font-bold">{totalResults.toLocaleString()}</span> bộ phim truyền hình thịnh hành
                        </p>
                    </div>

                    <div className="text-xs text-zinc-500 font-medium">
                        Trang {currentPage} / {totalPages}
                    </div>
                </div>

                {/* Bộ Lọc (Ẩn chọn loại phim vì đã ở trang TV) */}
                <Suspense
                    fallback={
                        <div className="w-full h-24 bg-[#181818] rounded-lg animate-pulse mb-8" />
                    }
                >
                    <FilterBar hideType={true} />
                </Suspense>

                {/* Danh sách phim bộ */}
                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#181818]/50 rounded-xl border border-[#2E2E2E]">
                        <div className="w-16 h-16 rounded-full bg-[#202020] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-zinc-200 text-lg font-bold">Không tìm thấy phim truyền hình phù hợp</h2>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Không có kết quả nào khớp với các tiêu chí lọc hiện tại. Hãy thử chọn quốc gia hoặc thể loại khác.
                        </p>
                        <Link
                            href="/tv"
                            className="bg-[#E50914] hover:bg-[#B80710] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded transition-colors"
                        >
                            Xem tất cả phim bộ
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
                            {results.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Phân Trang */}
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
