import { getSimilarMovies } from "@/services/tmdb";
import MovieCard from "@/components/server/MovieCard";

interface SimilarMoviesProps {
  movieId: string;
}

/**
 * SimilarMovies - async Server Component bọc trong <Suspense> riêng biệt với CastList
 * Fetch song song (parallel streaming) với CastList, không chờ nhau
 */
export default async function SimilarMovies({ movieId }: SimilarMoviesProps) {
  const movies = await getSimilarMovies(movieId);
  const displayed = movies.slice(0, 10);

  if (displayed.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2">
        Không tìm thấy phim tương tự cho nội dung này.
      </p>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
      {displayed.map((movie) => (
        <div key={movie.id} className="w-36 sm:w-44 shrink-0">
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
}
