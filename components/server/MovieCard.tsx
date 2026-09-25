import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/tmdb";

interface MovieCardProps {
  movie: Movie;
}

/**
 * MovieCard - Server Component hiển thị thông tin thẻ phim (Tầng 1A)
 * Điểm kỹ thuật cốt lõi (Tầng 1B & Tầng 3):
 * 1. Dùng thẻ `<Image />` của Next.js với thuộc tính `fill` và `sizes` responsive.
 * 2. Tự động tối ưu hóa ảnh sang WebP/AVIF và sinh srcset tương ứng theo kích thước thiết bị.
 * 3. Khung chứa `aspect-[2/3]` giữ diện tích cố định, chống giật layout (CLS = 0).
 */
export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-poster.svg";

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "N/A";

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group block overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-400/10"
    >
      {/* Khung ảnh cố định aspect-[2/3] chống giật màn hình (CLS) */}
      <div className="relative aspect-[2/3] w-full bg-gray-800">
        <Image
          src={imageUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          loading="lazy"
        />

        {/* Badge đánh giá ⭐ */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md shadow-md border border-yellow-400/20">
          <span>⭐</span>
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}</span>
        </div>
      </div>

      {/* Thông tin văn bản */}
      <div className="p-3.5">
        <h3
          className="truncate font-semibold text-sm sm:text-base text-white group-hover:text-yellow-400 transition-colors"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
          <span>{releaseYear}</span>
          {movie.vote_count ? (
            <span className="text-[11px] text-gray-500">
              {movie.vote_count} lượt vote
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
