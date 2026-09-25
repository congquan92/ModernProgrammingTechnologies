import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/tmdb";

interface HeroBannerProps {
  movie?: Movie;
}

/**
 * HeroBanner - Server Component hiển thị phim nổi bật nhất ở đầu trang chủ
 * Tối ưu hóa chỉ số LCP (Largest Contentful Paint) của Core Web Vitals (Tầng 3):
 * Sử dụng thuộc tính `priority` để báo cho trình duyệt ưu tiên tải ảnh backdrop này đầu tiên!
 */
export default function HeroBanner({ movie }: HeroBannerProps) {
  if (!movie) {
    return null;
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : "/no-poster.svg";

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "";

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Ảnh nền Backdrop với priority=true để tối ưu LCP */}
      <Image
        src={backdropUrl}
        alt={movie.title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-top opacity-50 transition-transform duration-700 hover:scale-105"
      />

      {/* Lớp phủ Gradient đen điện ảnh */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent" />

      {/* Nội dung thông tin phim */}
      <div className="absolute bottom-0 left-0 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-400 text-black font-extrabold px-2.5 py-1 rounded text-xs uppercase tracking-wider shadow">
            🔥 Phim Nổi Bật
          </span>
          <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-yellow-400/30">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
          </span>
          {releaseYear && (
            <span className="text-gray-300 text-sm font-medium">
              {releaseYear}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {movie.title}
        </h1>

        <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow">
          {movie.overview || "Khám phá câu chuyện điện ảnh đặc sắc..."}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl transition duration-200 shadow-lg hover:shadow-yellow-400/20 hover:scale-105"
          >
            <span>▶</span>
            <span>Xem Chi Tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
