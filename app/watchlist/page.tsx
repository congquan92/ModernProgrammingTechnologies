import type { Metadata } from "next";
import Link from "next/link";
import { getWatchlistIds } from "@/app/actions/watchlist";
import { getMovieDetails } from "@/services/tmdb";
import MovieCard from "@/components/server/MovieCard";
import WatchlistButton from "@/components/client/WatchlistButton";
import ClearWatchlistButton from "@/components/client/ClearWatchlistButton";
import type { MovieDetails } from "@/types/tmdb";

export const metadata: Metadata = {
    title: "Danh Sách Yêu Thích | MovieHub",
    description: "Tất cả các bộ phim bạn đã lưu vào danh sách xem sau.",
};

/**
 * WatchlistPage - Server Component hiển thị danh sách phim yêu thích (Tầng 1B)
 * Đọc dữ liệu ID từ Cookie an toàn trên Server, fetch chi tiết từng phim song song bằng Promise.all.
 */
export default async function WatchlistPage() {
    const ids = await getWatchlistIds();

    // Fetch thông tin chi tiết song song cho các phim trong cookie
    const movies: MovieDetails[] =
        ids.length > 0
            ? (
                  await Promise.all(
                      ids.map(async (id) => {
                          try {
                              return await getMovieDetails(String(id));
                          } catch {
                              return null;
                          }
                      })
                  )
              ).filter((item): item is MovieDetails => item !== null)
            : [];

    return (
        <main className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-12">
                {/* Tiêu đề & Nút thao tác */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-zinc-800 pb-5">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Danh Sách Của Tôi
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {movies.length > 0 ? `${movies.length} bộ phim đã lưu` : "Chưa có phim nào trong danh sách"}
                        </p>
                    </div>

                    {movies.length > 0 && <ClearWatchlistButton />}
                </div>

                {/* Nội dung danh sách */}
                {movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#181818] border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-zinc-300 text-lg font-semibold">Danh sách xem sau của bạn đang trống</p>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Khám phá các bộ phim thịnh hành hoặc tìm kiếm phim bạn yêu thích và nhấn &ldquo;Lưu Xem Sau&rdquo; để thêm vào đây.
                        </p>
                        <Link
                            href="/"
                            className="mt-3 inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-6 py-2.5 rounded-md transition-colors text-sm shadow-lg shadow-red-950/40"
                        >
                            Khám phá phim ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {movies.map((movie) => (
                            <div key={movie.id} className="relative group/item">
                                <MovieCard movie={movie} />
                                {/* Nút WatchlistButton nhỏ gọn góc phải trên poster (bên dưới star badge) */}
                                <div className="absolute top-8 right-1.5 z-40">
                                    <WatchlistButton movieId={movie.id} initialSaved={true} variant="compact" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
