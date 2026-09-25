import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/tmdb";

interface HeroBannerProps {
  movie?: Movie;
}

/**
 * HeroBanner - Server Component phong cách Billboard Banner biểu tượng của Netflix (Tầng 1A & Tầng 3)
 * Tối ưu hóa chỉ số LCP bằng thuộc tính priority trên thẻ <Image />
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
    : "2026";

  // Giả lập điểm Match score chuẩn Netflix (dựa trên vote_average)
  const matchScore = movie.vote_average
    ? Math.round(movie.vote_average * 10)
    : 95;

  return (
    <div className="relative -mt-16 sm:-mt-20 w-full h-[75vh] sm:h-[85vh] min-h-[500px] overflow-hidden select-none">
      {/* Ảnh Backdrop toàn màn hình, tải ưu tiên để đạt LCP tối đa */}
      <Image
        src={backdropUrl}
        alt={movie.title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-[0.75]"
      />

      {/* Các lớp chuyển sắc (Gradient) tạo chiều sâu điện ảnh Netflix */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent" />

      {/* Khối thông tin Billboard nằm góc dưới bên trái */}
      <div className="absolute bottom-16 sm:bottom-24 left-4 sm:left-12 lg:left-16 max-w-2xl space-y-4 z-10">
        {/* Huy hiệu TOP 10 hôm nay kiểu Netflix */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#E50914] text-white font-black text-xs px-2 py-0.5 rounded shadow">
            <span>TOP</span>
            <span>10</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">
            Số 1 trong bảng xếp hạng hôm nay
          </span>
        </div>

        {/* Tên phim chữ lớn kiểu cinematic */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
          {movie.title}
        </h1>

        {/* Thông số kỹ thuật chuẩn Netflix: % Phù hợp, Năm, Tuổi, HD */}
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="text-emerald-400 font-bold">{matchScore}% Phù hợp</span>
          <span className="text-gray-300">{releaseYear}</span>
          <span className="border border-gray-500/80 px-1.5 py-0.5 text-xs text-gray-300 rounded-sm">
            16+
          </span>
          <span className="border border-gray-500/80 px-1.5 py-0.5 text-xs text-gray-300 rounded-sm font-bold">
            Ultra HD 4K
          </span>
        </div>

        {/* Tóm tắt nội dung */}
        <p className="text-sm sm:text-base text-gray-200 line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
          {movie.overview || "Một bộ phim đặc sắc không thể bỏ lỡ trong tuần này."}
        </p>

        {/* Cặp nút bấm huyền thoại của Netflix: Phát & Thông tin khác */}
        <div className="flex items-center gap-3 pt-3">
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-md transition-colors text-base shadow-lg"
          >
            <span className="text-xl">▶</span>
            <span>Phát</span>
          </Link>

          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-white/30 hover:bg-white/20 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md backdrop-blur-md transition-colors text-base"
          >
            <span className="text-lg">ⓘ</span>
            <span>Thông tin khác</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
