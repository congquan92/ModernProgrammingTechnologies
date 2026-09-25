import Image from "next/image";
import { getMovieCredits } from "@/services/tmdb";
import type { CastMember } from "@/types/tmdb";

interface CastListProps {
  movieId: string;
}

/**
 * CastList - async Server Component nạp chậm, bọc trong <Suspense> ở trang chi tiết phim (Tầng 1B)
 * Fetch getMovieCredits() độc lập — không chặn thông tin phim chính hiển thị trước
 */
export default async function CastList({ movieId }: CastListProps) {
  const credits = await getMovieCredits(movieId);
  const cast = credits.cast?.slice(0, 10) || [];

  if (cast.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Chưa có thông tin dàn diễn viên cho bộ phim này.
      </p>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
      {cast.map((actor: CastMember) => (
        <div
          key={actor.id}
          className="w-24 sm:w-28 shrink-0 text-center space-y-1.5 group"
        >
          {/* Khung ảnh diễn viên tỷ lệ 3:4 chuẩn DESIGN.md */}
          <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-md overflow-hidden bg-[#202020] border border-zinc-800/80 group-hover:border-zinc-700 transition-colors">
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                alt={actor.name}
                fill
                sizes="112px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-500 text-xs gap-1 p-2">
                <svg className="w-6 h-6 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-[10px] text-zinc-600">No Photo</span>
              </div>
            )}
          </div>
          <p
            className="text-xs font-bold text-white truncate group-hover:text-[#E50914] transition-colors"
            title={actor.name}
          >
            {actor.name}
          </p>
          <p
            className="text-[10px] text-gray-400 truncate"
            title={actor.character}
          >
            {actor.character}
          </p>
        </div>
      ))}
    </div>
  );
}
