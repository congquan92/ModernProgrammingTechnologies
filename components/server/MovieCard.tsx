import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/tmdb";

interface MovieCardProps {
    movie: Movie;
}

/**
 * MovieCard - Server Component thẻ phim phong cách Netflix (Tầng 1A & Tầng 1B)
 * Đảm bảo:
 * 1. Khung aspect-[2/3] cố định chống giật màn hình (CLS = 0)
 * 2. Thẻ Image của Next.js với WebP tự động và sizes responsive
 * 3. Hiệu ứng phóng to mượt mà chuẩn giao diện streaming
 */
export default function MovieCard({ movie }: MovieCardProps) {
    const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/no-poster.svg";

    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "";

    const matchPercent = movie.vote_average ? Math.round(movie.vote_average * 10) : 90;

    return (
        <Link href={`/movie/${movie.id}`} className="group/card relative block overflow-hidden rounded-md bg-[#181818] transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-black/80">
            {/* Khung Poster cố định chống CLS */}
            <div className="relative aspect-[2/3] w-full bg-[#202020]">
                <Image src={imageUrl} alt={movie.title} fill sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw" className="object-cover transition-opacity duration-300 group-hover/card:brightness-110" loading="lazy" />

                {/* Logo nhỏ chữ N kiểu Netflix ở góc trên bên trái */}
                <div className="absolute top-1.5 left-1.5 font-black text-xs text-[#E50914] drop-shadow select-none">N</div>

                {/* Điểm số đánh giá nhỏ gọn */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-yellow-400 backdrop-blur-sm">
                    <svg className="w-3 h-3 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}</span>
                </div>
            </div>

            {/* Thông tin vắn tắt phía dưới thẻ */}
            <div className="p-2 sm:p-2.5 bg-[#181818] space-y-1">
                <h3 className="truncate font-bold text-xs sm:text-sm text-white group-hover/card:text-[#E50914] transition-colors" title={movie.title}>
                    {movie.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-emerald-400 font-bold">{matchPercent}%</span>
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="border border-gray-600 px-1 py-0.2 rounded text-[9px]">HD</span>
                        {releaseYear && <span>{releaseYear}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}
