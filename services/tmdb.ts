import type {
  Movie,
  MovieListResponse,
  MovieDetails,
  MovieCredits,
} from "@/types/tmdb";

const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Hàm gọi API TMDB dùng chung trên Server với chiến lược Caching (ISR - Tầng 1B)
 * @param endpoint Đường dẫn API TMDB (ví dụ: '/trending/movie/week')
 * @param revalidateTime Thời gian lưu cache tính bằng giây
 */
async function fetchTMDB<T>(
  endpoint: string,
  revalidateTime: number = 3600
): Promise<T> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_actual_api_key_here") {
    console.warn(
      `[TMDB Service] Cảnh báo: TMDB_API_KEY chưa được cấu hình hợp lệ trong .env.local!`
    );
    throw new Error("TMDB_API_KEY chưa được thiết lập.");
  }

  const delimiter = endpoint.includes("?") ? "&" : "?";
  const url = `${TMDB_BASE_URL}${endpoint}${delimiter}api_key=${TMDB_API_KEY}&language=vi-VN`;

  const res = await fetch(url, {
    next: { revalidate: revalidateTime },
  });

  if (!res.ok) {
    throw new Error(`Lỗi gọi API TMDB [${res.status}]: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Lấy danh sách phim thịnh hành trong tuần (Trending)
 * Chiến lược cache: 1 giờ (3600s)
 */
export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const data = await fetchTMDB<MovieListResponse>(
      "/trending/movie/week",
      3600
    );
    return data.results || [];
  } catch (error) {
    console.error("Lỗi getTrendingMovies:", error);
    return [];
  }
}

/**
 * Lấy danh sách phim đang chiếu rạp (Now Playing)
 * Chiến lược cache: 30 phút (1800s)
 */
export async function getNowPlayingMovies(): Promise<Movie[]> {
  try {
    const data = await fetchTMDB<MovieListResponse>(
      "/movie/now_playing",
      1800
    );
    return data.results || [];
  } catch (error) {
    console.error("Lỗi getNowPlayingMovies:", error);
    return [];
  }
}

/**
 * Lấy danh sách phim có điểm đánh giá cao nhất (Top Rated)
 * Chiến lược cache: 24 giờ (86400s)
 */
export async function getTopRatedMovies(): Promise<Movie[]> {
  try {
    const data = await fetchTMDB<MovieListResponse>(
      "/movie/top_rated",
      86400
    );
    return data.results || [];
  } catch (error) {
    console.error("Lỗi getTopRatedMovies:", error);
    return [];
  }
}

/**
 * Lấy chi tiết một bộ phim theo ID (Dành cho trang chi tiết phim - Đại phụ trách)
 */
export async function getMovieDetails(id: string): Promise<MovieDetails> {
  return fetchTMDB<MovieDetails>(`/movie/${id}`, 3600);
}

/**
 * Lấy danh sách diễn viên của phim (Cast Credits - Dành cho Streaming Suspense)
 */
export async function getMovieCredits(id: string): Promise<MovieCredits> {
  return fetchTMDB<MovieCredits>(`/movie/${id}/credits`, 3600);
}

/**
 * Tìm kiếm phim theo từ khóa (Dành cho SearchBar - Thái phụ trách)
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  try {
    const data = await fetchTMDB<MovieListResponse>(
      `/search/movie?query=${encodeURIComponent(query)}`,
      300 // Cache 5 phút
    );
    return data.results || [];
  } catch (error) {
    console.error("Lỗi searchMovies:", error);
    return [];
  }
}
