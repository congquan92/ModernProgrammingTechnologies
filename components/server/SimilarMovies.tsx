import { getSimilarMovies } from "@/services/tmdb";
import SimilarMoviesSlider from "@/components/client/SimilarMoviesSlider";

interface SimilarMoviesProps {
  movieId: string;
}

/**
 * SimilarMovies - async Server Component bọc trong <Suspense> riêng biệt với CastList
 * Fetch song song (parallel streaming) với CastList, không chờ nhau
 */
export default async function SimilarMovies({ movieId }: SimilarMoviesProps) {
  const movies = await getSimilarMovies(movieId);

  if (!movies || movies.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Không tìm thấy phim tương tự cho nội dung này.
      </p>
    );
  }

  return <SimilarMoviesSlider movies={movies} />;
}
