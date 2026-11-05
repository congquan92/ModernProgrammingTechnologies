import { MOVIE_GENRES, COUNTRIES, YEARS, SORT_OPTIONS, CONTENT_TYPES } from "./constants";

export type MovieSearchParams = Record<string, string | string[] | undefined>;

export function normalizeMovieParams(params: MovieSearchParams): Record<string, string> {
    const values = Object.fromEntries(Object.entries(params).map(([key, value]) => [
        key,
        ((Array.isArray(value) ? value[0] : value) ?? "").replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 100),
    ]));
    for (const [key, options] of [
        ["genre", MOVIE_GENRES], ["country", COUNTRIES], ["year", YEARS],
        ["sortBy", SORT_OPTIONS], ["type", CONTENT_TYPES],
    ] as const) {
        if (!options.some((option) => option.id === values[key])) delete values[key];
    }
    return values;
}
