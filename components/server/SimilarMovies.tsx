import { getSimilarMovies } from "@/services/tmdb";
import SimilarMoviesSlider from "@/components/client/SimilarMoviesSlider";
import MovieCard from "@/components/server/MovieCard";

interface SimilarMoviesProps {
  movieId: string;
}

/**
 * SimilarMovies - async Server Component bọc trong <Suspense> riêng biệt với CastList
 * Fetch song song (parallel streaming) với CastList, không chờ nhau
 */
export default async function SimilarMovies({ movieId }: SimilarMoviesProps) {
  let movies;
  try {
    movies = await getSimilarMovies(movieId);
  } catch {
    return <p role="alert" className="text-gray-300 py-2">Không thể tải phim tương tự. Vui lòng thử tải lại trang.</p>;
  }

  if (!movies || movies.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Không tìm thấy phim tương tự cho nội dung này.
      </p>
    );
  }

  return <div data-stream="similar-result"><SimilarMoviesSlider cards={movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)} /></div>;
}
