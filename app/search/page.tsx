import { Suspense } from "react";
import type { Metadata } from "next";
import { searchMovies, discoverMovies, getTrendingMovies } from "@/services/tmdb";
import SearchBar from "@/components/client/SearchBar";
import FilterBar from "@/components/client/FilterBar";
import MovieCard from "@/components/server/MovieCard";
import type { Movie } from "@/types/tmdb";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        genre?: string;
        year?: string;
        country?: string;
        sortBy?: string;
        type?: string;
    }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const params = await searchParams;
    const q = params.q?.trim();
    return {
        title: q ? `Kết quả tìm kiếm: "${q}" | MovieHub` : "Tìm kiếm & Khám phá phim | MovieHub",
        description: "Tìm kiếm và lọc phim chất lượng cao theo thể loại, quốc gia, năm phát hành trên MovieHub.",
    };
}

/**
 * SearchPage - Server Component hiển thị kết quả tìm kiếm kết hợp bộ lọc đa tiêu chí
 * Nhận searchParams bất đồng bộ từ Next.js 16, gọi TMDB API an toàn phía server.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q?.trim() ?? "";
    const hasFilters = Boolean(
        params.genre || params.year || params.country || params.sortBy || params.type
    );

    let results: Movie[] = [];
    let trendingMovies: Movie[] = [];

    if (query) {
        // Có từ khóa: Gọi searchMovies từ TMDB
        const searchResults = await searchMovies(query);

        // Áp dụng bộ lọc bổ sung nếu có
        results = searchResults.filter((movie) => {
            if (params.genre && params.genre !== "all") {
                const numericGenre = Number(params.genre.split("-")[0]);
                if (movie.genre_ids && !movie.genre_ids.includes(numericGenre)) {
                    return false;
                }
            }
            if (params.year && params.year !== "all") {
                if (params.year === "before-2015") {
                    const releaseYear = Number(movie.release_date?.split("-")[0]);
                    if (releaseYear && releaseYear >= 2015) return false;
                } else if (!movie.release_date?.startsWith(params.year)) {
                    return false;
                }
            }
            return true;
        });

        // Áp dụng sắp xếp nếu có
        if (params.sortBy === "vote_average.desc") {
            results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        } else if (params.sortBy === "primary_release_date.desc") {
            results.sort(
                (a, b) =>
                    new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
            );
        }
    } else if (hasFilters) {
        // Không có từ khóa nhưng có bộ lọc: Gọi discoverMovies
        const discoverData = await discoverMovies({
            type: (params.type as "movie" | "tv") || undefined,
            genre: params.genre,
            country: params.country,
            year: params.year,
            sortBy: params.sortBy,
        });
        results = discoverData.results;
    } else {
        // Chưa nhập từ khóa: Lấy phim thịnh hành để hiển thị gợi ý
        trendingMovies = await getTrendingMovies();
    }

    const hasSearched = Boolean(query || hasFilters);

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                {/* Tiêu đề trang */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                        {query ? "Kết Quả Tìm Kiếm" : "Tìm Kiếm & Khám Phá"}
                    </h1>
                    {query ? (
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Tìm thấy <span className="text-white font-bold">{results.length}</span> kết quả cho từ khóa{" "}
                            <span className="text-[#E50914] font-bold">&ldquo;{query}&rdquo;</span>
                        </p>
                    ) : hasFilters ? (
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Tìm thấy <span className="text-white font-bold">{results.length}</span> kết quả theo bộ lọc đã chọn
                        </p>
                    ) : null}
                </div>

                {/* SearchBar Client Component */}
                <Suspense
                    fallback={
                        <div className="w-full max-w-2xl h-[52px] bg-[#242424] rounded-md animate-pulse mb-6" />
                    }
                >
                    <div className="mb-6">
                        <SearchBar />
                    </div>
                </Suspense>

                {/* Bộ Lọc Phim Đa Tiêu Chí */}
                <Suspense
                    fallback={
                        <div className="w-full h-24 bg-[#181818] rounded-lg animate-pulse mb-8" />
                    }
                >
                    <FilterBar />
                </Suspense>

                {/* Trạng thái và Kết quả */}
                {!hasSearched ? (
                    // Trạng thái chờ: Hiển thị phim thịnh hành nổi bật thay vì màn hình trống
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                            <span className="text-lg">🔥</span>
                            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                Phim Thịnh Hành Được Tìm Kiếm Nhiều Nhất
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                            {trendingMovies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    </div>
                ) : results.length === 0 ? (
                    // Không có kết quả nào
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#181818]/40 rounded-xl border border-[#2E2E2E]">
                        <div className="w-16 h-16 rounded-full bg-[#202020] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-zinc-200 text-lg font-bold">Không tìm thấy bộ phim nào phù hợp</p>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Hãy thử lại với từ khóa khác, nới lỏng các điều kiện lọc hoặc đặt lại bộ lọc.
                        </p>
                    </div>
                ) : (
                    // Lưới hiển thị danh sách phim
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {results.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
