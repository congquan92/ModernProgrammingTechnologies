import {
  getTrendingMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
} from "@/services/tmdb";
import HeroBanner from "@/components/server/HeroBanner";
import MovieSection from "@/components/server/MovieSection";

/**
 * HomePage - Server Component chính của trang chủ (Tầng 1A)
 *
 * 🎯 ĐIỂM KỸ THUẬT QUAN TRỌNG ĐỂ VẤN ĐÁP VỚI THẦY CÔ:
 * 1. Server Component Data Fetching:
 *    - Toàn bộ hàm gọi API TMDB chạy 100% trên Next.js Server.
 *    - Bảo mật tuyệt đối: TMDB_API_KEY không bao giờ lộ ra tab Network của trình duyệt.
 *    - Tăng tốc độ hiển thị trang đầu (FCP/LCP) vì server render sẵn HTML cùng dữ liệu.
 * 2. Promise.all Fetch Song Song:
 *    - Gom 3 request Trending, Now Playing, Top Rated chạy đồng thời, tối ưu hoá TTFB.
 * 3. Caching & ISR (Incremental Static Regeneration):
 *    - Mỗi endpoint trong services/tmdb.ts được cấu hình thời gian cache riêng ({ next: { revalidate: N } }).
 */
export default async function HomePage() {
  // Fetch song song 3 danh mục phim trực tiếp ở Server Component
  const [trending, nowPlaying, topRated] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getTopRatedMovies(),
  ]);

  // Lấy bộ phim đầu tiên trong danh sách Trending để làm Hero Banner nổi bật
  const featuredMovie = trending[0] || nowPlaying[0] || topRated[0];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* 1. Hero Banner Phim Nổi Bật (Tối ưu LCP bằng next/image priority) */}
      <HeroBanner movie={featuredMovie} />

      {/* Thông báo nếu chưa cấu hình TMDB_API_KEY */}
      {trending.length === 0 && nowPlaying.length === 0 && topRated.length === 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center text-yellow-300">
          <p className="text-lg font-bold">⚠️ Chưa có dữ liệu phim từ TMDB</p>
          <p className="text-sm text-gray-300 mt-2">
            Vui lòng mở file <code className="bg-black/50 px-2 py-0.5 rounded text-yellow-400">.env.local</code> và điền <code className="bg-black/50 px-2 py-0.5 rounded text-yellow-400">TMDB_API_KEY</code> của bạn để tải dữ liệu thật.
          </p>
        </div>
      )}

      {/* 2. Danh mục: Phim Thịnh Hành Trong Tuần (ISR Cache: 3600s) */}
      <MovieSection
        title="Phim Thịnh Hành Trong Tuần"
        icon="🔥"
        movies={trending}
        accentColor="yellow"
        limit={10}
      />

      {/* 3. Danh mục: Phim Đang Chiếu Rạp (ISR Cache: 1800s) */}
      <MovieSection
        title="Phim Đang Chiếu Rạp"
        icon="🎬"
        movies={nowPlaying}
        accentColor="red"
        limit={10}
      />

      {/* 4. Danh mục: Phim Đánh Giá Cao Nhất (ISR Cache: 86400s) */}
      <MovieSection
        title="Phim Đánh Giá Cao Nhất"
        icon="⭐"
        movies={topRated}
        accentColor="blue"
        limit={10}
      />
    </main>
  );
}
