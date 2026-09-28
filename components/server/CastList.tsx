import { getMovieCredits } from "@/services/tmdb";
import CastSlider from "@/components/client/CastSlider";

interface CastListProps {
  movieId: string;
}

/**
 * CastList - async Server Component nạp chậm, bọc trong <Suspense> ở trang chi tiết phim (Tầng 1B)
 * Fetch getMovieCredits() độc lập — không chặn thông tin phim chính hiển thị trước
 */
export default async function CastList({ movieId }: CastListProps) {
  const credits = await getMovieCredits(movieId);
  const cast = credits.cast?.slice(0, 20) || [];

  if (cast.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Chưa có thông tin dàn diễn viên cho bộ phim này.
      </p>
    );
  }

  return <CastSlider cast={cast} />;
}
