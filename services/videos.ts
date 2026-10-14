import type { MovieVideo, MovieVideosResponse } from "@/types/tmdb";
import { fetchTMDB } from "./client";

/**
 * Lấy danh sách video / trailer chính thức của phim từ TMDB API
 * Hỗ trợ tham số include_video_language để ưu tiên trailer tiếng Việt và tiếng Anh.
 * Cache: 1 giờ (3600s)
 */
export async function getMovieVideos(id: string): Promise<MovieVideo[]> {
    try {
        const data = await fetchTMDB<MovieVideosResponse>(
            `/movie/${id}/videos?include_video_language=vi,en,null`,
            3600,
            ""
        );
        return data.results || [];
    } catch (error) {
        console.error(`Lỗi getMovieVideos [ID: ${id}]:`, error);
        return [];
    }
}

/**
 * Thuật toán lựa chọn Trailer tối ưu nhất từ danh sách videos của TMDB
 * 1. Trailer chính thức tiếng Việt
 * 2. Trailer chính thức bất kỳ (official === true)
 * 3. Trailer YouTube bất kỳ
 * 4. Teaser YouTube
 * 5. Bất kỳ video YouTube nào
 */
export function selectBestTrailer(videos: MovieVideo[]): MovieVideo | null {
    if (!videos || videos.length === 0) return null;

    const youtubeVideos = videos.filter((v) => v.site === "YouTube" && v.key);
    if (youtubeVideos.length === 0) return null;

    // 1. Trailer tiếng Việt chính thức
    const viOfficialTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.official && v.iso_639_1 === "vi"
    );
    if (viOfficialTrailer) return viOfficialTrailer;

    // 2. Trailer tiếng Việt bất kỳ
    const viTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.iso_639_1 === "vi"
    );
    if (viTrailer) return viTrailer;

    // 3. Trailer chính thức (official === true)
    const officialTrailer = youtubeVideos.find(
        (v) => v.type === "Trailer" && v.official
    );
    if (officialTrailer) return officialTrailer;

    // 4. Trailer bất kỳ
    const anyTrailer = youtubeVideos.find((v) => v.type === "Trailer");
    if (anyTrailer) return anyTrailer;

    // 5. Teaser bất kỳ
    const anyTeaser = youtubeVideos.find((v) => v.type === "Teaser");
    if (anyTeaser) return anyTeaser;

    // 6. Video đầu tiên
    return youtubeVideos[0] || null;
}
