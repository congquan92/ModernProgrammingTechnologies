import {
    getTrendingMovies,
    getNowPlayingMovies,
    getTopRatedMovies,
    discoverMovies,
} from "@/services/tmdb";
import HeroBanner from "@/components/server/HeroBanner";
import MovieCard from "@/components/server/MovieCard";
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
    const [trendingResult, nowPlayingResult, topRatedResult, classicResult] = await Promise.allSettled([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getTopRatedMovies(),
        discoverMovies({ genre: "classic" }),
    ]);

    const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
    const nowPlaying = nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [];
    const topRated = topRatedResult.status === "fulfilled" ? topRatedResult.value : [];
    const classicData = classicResult.status === "fulfilled" ? classicResult.value : { results: [] };
    const failed = [trendingResult, nowPlayingResult, topRatedResult, classicResult].some((result) => result.status === "rejected");

    // Bộ phim nổi bật nhất dùng cho Billboard Banner
    const featuredMovie = trending[0] || nowPlaying[0] || topRated[0];

    return (
        <main className="min-h-screen bg-[#141414] pb-24 overflow-x-hidden">
            {/* 1. Hero Billboard Banner (Tràn viền với 2 nút Phát & Thông tin khác) */}
            <HeroBanner movie={featuredMovie} />

            {(failed || !featuredMovie) && (
                <div role={failed ? "alert" : "status"} className="px-4 sm:px-12 pt-28 pb-16 text-white">
                    <p>{failed ? "Không thể tải một số danh mục phim. Vui lòng thử tải lại trang." : "Hiện chưa có phim để hiển thị."}</p>
                </div>
            )}

            {/* 2. Các hàng danh mục phim cuộn ngang chuẩn Netflix (bắt đầu phủ lên chân Billboard) */}
            <div className={`relative z-20 space-y-6 sm:space-y-10 ${failed || !featuredMovie ? "" : "-mt-10 sm:-mt-16 lg:-mt-24"}`}>
                {/* Hàng 1: Phim Thịnh Hành Trong Tuần */}
                <MovieRow title="Phim Thịnh Hành Trong Tuần" cards={trending.map((movie) => <MovieCard key={movie.id} movie={movie} />)} />

                {/* Hàng 2: TOP 10 Phim Được Đánh Giá Cao Nhất (Có số thứ tự khổng lồ) */}
                <MovieRow title="Top 10 Phim Đánh Giá Cao Nhất" cards={topRated.slice(0, 10).map((movie) => <MovieCard key={movie.id} movie={movie} />)} isTop10={true} />

                {/* Hàng 3: Phim Đang Chiếu Rạp */}
                <MovieRow title="Phim Đang Chiếu Rạp Dành Cho Bạn" cards={nowPlaying.map((movie) => <MovieCard key={movie.id} movie={movie} />)} />

                {/* Hàng 4: Bộ Sưu Tập Phim Kinh Điển */}
                <MovieRow
                    title="Có Thể Bạn Muốn Xem Lại"
                    cards={classicData.results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
                    exploreHref="/browse?genre=classic"
                />
            </div>
        </main>
    );
}
