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
  let credits;
  try {
    credits = await getMovieCredits(movieId);
  } catch {
    return <p role="alert" className="text-gray-300 py-2">Không thể tải dàn diễn viên. Vui lòng thử tải lại trang.</p>;
  }
  const cast = credits.cast?.slice(0, 20) || [];

  if (cast.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Chưa có thông tin dàn diễn viên cho bộ phim này.
      </p>
    );
  }

  return <div data-stream="cast-result"><CastSlider cast={cast} /></div>;
}
