import type { Movie } from "@/types/tmdb";
import MovieCard from "@/components/server/MovieCard";

interface MovieSectionProps {
    title: string;
    movies: Movie[];
    accentColor?: "yellow" | "red" | "blue" | "emerald";
    icon?: string;
    limit?: number;
}

const colorMap = {
    yellow: "border-yellow-400 text-yellow-400",
    red: "border-red-500 text-red-500",
    blue: "border-blue-400 text-blue-400",
    emerald: "border-emerald-400 text-emerald-400",
};

/**
 * MovieSection - Component hiển thị từng danh mục phim ở trang chủ
 * Grid responsive 2 -> 3 -> 4 -> 5 cột theo breakpoint Tailwind
 */
export default function MovieSection({ title, movies, accentColor = "yellow", icon = "🎬", limit = 10 }: MovieSectionProps) {
    const displayMovies = movies.slice(0, limit);

    if (displayMovies.length === 0) {
        return null;
    }

    const accentClasses = colorMap[accentColor] || colorMap.yellow;
    const borderColor = accentClasses.split(" ")[0];

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className={`flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-white border-l-4 ${borderColor} pl-3.5 tracking-tight`}>
                    <span>{icon}</span>
                    <span>{title}</span>
                </h2>
                <span className="text-xs text-gray-500 font-medium">{displayMovies.length} bộ phim</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {displayMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </section>
    );
}
