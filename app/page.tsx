import { getTrendingMovies, getNowPlayingMovies, getTopRatedMovies } from "@/services/tmdb";
import HeroBanner from "@/components/server/HeroBanner";
import MovieRow from "@/components/client/MovieRow";

/**
 * HomePage - Server Component trang chủ mang phong cách trải nghiệm Netflix (Tầng 1A & Tầng 1B)
 *
 * 🎯 ĐIỂM KỸ THUẬT QUAN TRỌNG:
 * 1. Fetch dữ liệu TMDB song song trên Server qua Promise.all, không lộ TMDB_API_KEY ở Client.
 * 2. Caching theo chiến lược ISR (revalidate) định kỳ.
 * 3. Hàng phim thiết kế dạng cuộn ngang (MovieRow) kèm hàng TOP 10 với số thứ tự khổng lồ.
 */
export default async function HomePage() {
    const [trending, nowPlaying, topRated] = await Promise.all([getTrendingMovies(), getNowPlayingMovies(), getTopRatedMovies()]);

    // Bộ phim nổi bật nhất dùng cho Billboard Banner
    const featuredMovie = trending[0] || nowPlaying[0] || topRated[0];

    return (
        <main className="min-h-screen bg-[#141414] pb-24 overflow-x-hidden">
            {/* 1. Hero Billboard Banner (Tràn viền với 2 nút Phát & Thông tin khác) */}
            <HeroBanner movie={featuredMovie} />

            {/* Thông báo nếu chưa có API Key */}
            {trending.length === 0 && nowPlaying.length === 0 && topRated.length === 0 && (
                <div className="container mx-auto px-4 sm:px-12 my-8">
                    <div className="rounded-md border border-[#E50914]/40 bg-[#181818] p-6 text-center text-gray-200 shadow-xl">
                        <p className="text-xl font-bold text-[#E50914]">Chưa cấu hình TMDB API Key</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Vui lòng mở file <code className="text-white bg-black px-2 py-0.5 rounded">.env.local</code> và điền <code className="text-white bg-black px-2 py-0.5 rounded">TMDB_API_KEY</code> để tải toàn bộ poster phim từ TMDB.
                        </p>
                    </div>
                </div>
            )}

            {/* 2. Các hàng danh mục phim cuộn ngang chuẩn Netflix (bắt đầu phủ lên chân Billboard) */}
            <div className="-mt-10 sm:-mt-16 lg:-mt-24 relative z-20 space-y-6 sm:space-y-10">
                {/* Hàng 1: Phim Thịnh Hành Trong Tuần */}
                <MovieRow title="Phim Thịnh Hành Trong Tuần" movies={trending} />

                {/* Hàng 2: TOP 10 Phim Được Đánh Giá Cao Nhất (Có số thứ tự khổng lồ) */}
                <MovieRow title="Top 10 Phim Đánh Giá Cao Nhất" movies={topRated} isTop10={true} />

                {/* Hàng 3: Phim Đang Chiếu Rạp */}
                <MovieRow title="Phim Đang Chiếu Rạp Dành Cho Bạn" movies={nowPlaying} />

                {/* Hàng 4: Bộ Sưu Tập Phim Kinh Điển */}
                <MovieRow title="Có Thể Bạn Muốn Xem Lại" movies={topRated.slice(5)} />
            </div>
        </main>
    );
}
