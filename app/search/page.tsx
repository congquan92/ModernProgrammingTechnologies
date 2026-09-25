import { Suspense } from "react";
import type { Metadata } from "next";
import { searchMovies } from "@/services/tmdb";
import SearchBar from "@/components/client/SearchBar";
import MovieCard from "@/components/server/MovieCard";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Kết quả tìm kiếm: "${q}" | MovieHub` : "Tìm kiếm phim | MovieHub",
        description: "Tìm kiếm và khám phá hàng nghìn bộ phim trên MovieHub.",
    };
}

/**
 * SearchPage - Server Component hiển thị kết quả tìm kiếm (Tầng 1B)
 * Nhận searchParams bất đồng bộ từ Next.js 16, gọi TMDB API an toàn phía server.
 * Nhúng SearchBar (Client Component) được bọc trong React Suspense.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q?.trim() ?? "";

    // Fetch kết quả tìm kiếm trên server - API key không bao giờ lộ ra client
    const results = query ? await searchMovies(query) : [];

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-12">
                {/* Tiêu đề trang */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                        {query ? "Kết Quả Tìm Kiếm" : "Tìm Kiếm Phim"}
                    </h1>
                    {query && (
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Tìm thấy <span className="text-white font-bold">{results.length}</span> kết quả cho từ khóa{" "}
                            <span className="text-[#E50914] font-bold">&ldquo;{query}&rdquo;</span>
                        </p>
                    )}
                </div>

                {/* SearchBar Client Component được bọc trong Suspense */}
                <Suspense
                    fallback={
                        <div className="w-full max-w-2xl h-[52px] bg-[#242424] rounded-md animate-pulse mb-10" />
                    }
                >
                    <div className="mb-10">
                        <SearchBar />
                    </div>
                </Suspense>

                {/* Kết quả tìm kiếm */}
                {!query ? (
                    // Trạng thái chờ: chưa nhập từ khóa
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#181818] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-zinc-300 text-lg font-medium">Nhập tên phim vào ô tìm kiếm để bắt đầu</p>
                        <p className="text-zinc-500 text-sm">Ví dụ: Avatar, Batman, Inception, Spider-Man...</p>
                    </div>
                ) : results.length === 0 ? (
                    // Không có kết quả nào
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#181818] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-zinc-300 text-lg font-semibold">Không tìm thấy bộ phim nào phù hợp</p>
                        <p className="text-zinc-500 text-sm">Hãy thử lại với từ khóa khác hoặc kiểm tra chính tả</p>
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
