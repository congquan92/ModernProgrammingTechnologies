export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date: string;
    overview: string;
    genre_ids?: number[];
    original_language?: string;
    popularity?: number;
    name?: string;
    first_air_date?: string;
    media_type?: string;
}

export interface DiscoverParams {
    type?: "movie" | "tv";
    genre?: string;
    year?: string;
    country?: string;
    sortBy?: string;
    page?: number;
    perPage?: number;
    query?: string;
}

export interface MovieListResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface MovieDetails extends Movie {
    runtime: number;
    tagline: string;
    genres: Genre[];
    status: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface MovieCredits {
    id: number;
    cast: CastMember[];
}

export interface MovieVideo {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes" | string;
    official: boolean;
    published_at: string;
}

export interface MovieVideosResponse {
    id: number;
    results: MovieVideo[];
}

