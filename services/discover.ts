import type { Movie, MovieListResponse, DiscoverParams } from "@/types/tmdb";
import { fetchTMDB, deduplicateMovies } from "./client";
import { MOVIE_GENRES, COUNTRIES, YEARS, SORT_OPTIONS } from "../utils/constants";

// ponytail: giữ 20 phim/trang của TMDB; dùng snapshot nếu cần thứ tự ổn định xuyên trang.
export async function discoverMovies(params: DiscoverParams): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> {
    const requestedPage = params.page ?? 1;
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 500) : 1;
    const sortBy = SORT_OPTIONS.find((option) => option.id === params.sortBy)?.id || "popularity.desc";
    const query = new URLSearchParams({ page: String(page), sort_by: sortBy });

    if (params.genre === "classic") {
        query.set("primary_release_date.lte", "2000-01-01");
    } else if (params.genre && MOVIE_GENRES.some((genre) => genre.id === params.genre)) {
        query.set("with_genres", params.genre);
    }
    if (params.country && COUNTRIES.some((country) => country.id === params.country)) {
        query.set("with_origin_country", params.country);
    }
    if (params.year === "before-2015") {
        query.set("primary_release_date.lte", params.genre === "classic" ? "2000-01-01" : "2014-12-31");
    } else if (params.year && YEARS.some((year) => year.id === params.year)) {
        query.set("primary_release_year", params.year);
    }
    if (sortBy === "vote_average.desc") query.set("vote_count.gte", "50");

    const data = await fetchTMDB<MovieListResponse>(`/discover/movie?${query}`, 1800);
    return {
        results: deduplicateMovies(data.results || []),
        totalPages: Math.max(1, Math.min(data.total_pages || 1, 500)),
        totalResults: data.total_results || 0,
    };
}
