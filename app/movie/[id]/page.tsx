import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieDetails } from "@/services/tmdb";
import { formatRuntime } from "@/utils/formatRuntime";
import CastList from "@/components/server/CastList";
import CastSkeleton from "@/components/server/CastSkeleton";
import SimilarMovies from "@/components/server/SimilarMovies";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ─── 1. DYNAMIC SEO METADATA (Tầng 1B) ──────────────────────────────────────
 * Chạy 100% trên Server trước khi trả HTML về.
 * Tự động sinh <title>, <meta description> và OpenGraph preview theo từng bộ phim.
 */
export async function generateMetadata(
  { params }: MovieDetailPageProps
): Promise<Metadata> {
  const { id } = await params; // Next.js 16: params là Promise
  try {
    const movie = await getMovieDetails(id);
    const year = movie.release_date ? movie.release_date.split("-")[0] : "";

    return {
      title: `${movie.title} ${year ? `(${year})` : ""} | MovieHub`,
      description:
        movie.overview ||
        `Xem thông tin chi tiết, dàn diễn viên và đánh giá của bộ phim ${movie.title} trên MovieHub.`,
      openGraph: {
        title: `${movie.title} - MovieHub`,
        description: movie.overview || "Chi tiết phim trên MovieHub",
        images: movie.poster_path
          ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
          : movie.backdrop_path
          ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`]
          : [],
      },
    };
  } catch {
    return {
      title: "Không tìm thấy phim | MovieHub",
      description: "Bộ phim bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.",
    };
  }
}

/**
 * ─── 2. SERVER COMPONENT CHÍNH & STREAMING SUSPENSE (Tầng 1A & Tầng 1B) ─────
 * Cơ chế hoạt động:
 * 1. Khối thông tin phim chính: Fetch và render ngay lập tức.
 * 2. Khối Dàn diễn viên & Phim tương tự: Bọc trong 2 <Suspense> riêng biệt để
 *    server stream HTML về sau mà không làm chậm thời gian tải trang ban đầu.
 */
export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;

  // Lấy thông tin phim chính — nếu lỗi hoặc không tồn tại sẽ chuyển sang 404
  let movie;
  try {
    movie = await getMovieDetails(id);
    if (!movie || !movie.id) {
      notFound();
    }
  } catch {
    notFound();
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-poster.svg";

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "Chưa rõ";

  const matchScore = movie.vote_average
    ? Math.round(movie.vote_average * 10)
    : 90;


  return (
    <main className="min-h-screen bg-[#141414] pb-20 relative">
      {/* ── NÚT QUAY LẠI TRANG CHỦ Ở ĐẦU BÊN TAY TRÁI ── */}
      <div className="absolute top-20 sm:top-24 left-4 sm:left-12 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-300 hover:text-white font-medium text-sm sm:text-base hover:underline underline-offset-4 decoration-white/80 transition-colors group cursor-pointer drop-shadow-lg"
        >
          <svg
            className="w-4 h-4 fill-none stroke-current transition-transform group-hover:-translate-x-1"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Về trang chủ</span>
        </Link>
      </div>

      {/* ── ẢNH NỀN BACKDROP BANNER TRÀN VIỀN ── */}
      {backdropUrl && (
        <div className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[60vh] overflow-hidden select-none">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />
        </div>
      )}

      {/* ── KHỐI THÔNG TIN PHIM CHÍNH (RENDER TỨC THÌ TRÊN SERVER) ── */}
      <div className="container mx-auto px-4 sm:px-12">
        <div
          className={`flex flex-col md:flex-row gap-8 lg:gap-12 ${
            backdropUrl ? "-mt-24 sm:-mt-40 lg:-mt-48 relative z-10" : "pt-8"
          }`}
        >
          {/* Poster phim cố định aspect-[2/3] chống CLS */}
          <div className="w-48 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] shrink-0 rounded-md overflow-hidden shadow-2xl shadow-black/95 border border-zinc-800 bg-[#202020] self-start mx-auto md:mx-0">
            <div className="relative w-full h-full">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                priority
                sizes="(max-width: 768px) 256px, 320px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Chi tiết nội dung phim */}
          <div className="flex-1 space-y-5 md:pt-16">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-1.5 text-base sm:text-lg italic text-zinc-400 font-light">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Thông số nhanh chuẩn Netflix */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-sm font-semibold">
              <span className="text-emerald-400 font-bold">
                {matchScore}% Phù hợp
              </span>
              <span className="text-gray-300">{releaseYear}</span>
              <span className="border border-zinc-600 px-2 py-0.5 rounded text-xs text-gray-300">
                {formatRuntime(movie.runtime)}
              </span>
              <span className="border border-zinc-600 px-1.5 py-0.5 rounded text-xs text-zinc-300 font-bold">
                Ultra HD 4K
              </span>
              <span className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded text-yellow-400 font-bold text-xs border border-yellow-500/30">
                <svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}</span>
              </span>
              {movie.vote_count ? (
                <span className="text-zinc-500 text-xs font-normal">
                  ({movie.vote_count.toLocaleString()} đánh giá)
                </span>
              ) : null}
            </div>

            {/* Thể loại phim */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-200 border border-zinc-700/80 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Tóm tắt nội dung */}
            <div className="space-y-2 max-w-3xl">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Nội dung phim
              </h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {movie.overview || "Bộ phim này hiện chưa có phần tóm tắt nội dung tiếng Việt."}
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-6 sm:px-8 py-2.5 rounded-md transition-colors text-sm sm:text-base shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Trailer</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── KHỐI DÀN DIỄN VIÊN (STREAMING VỚI REACT SUSPENSE 1) ── */}
        <section className="mt-14 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dàn Diễn Viên Chính
            </h2>
          </div>
          {/* Suspense độc lập: Server stream HTML ngay khi API Credits trả về */}
          <Suspense fallback={<CastSkeleton />}>
            <CastList movieId={id} />
          </Suspense>
        </section>

        {/* ── KHỐI PHIM TƯƠNG TỰ (STREAMING VỚI REACT SUSPENSE 2) ── */}
        <section className="mt-14 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Phim Tương Tự
            </h2>
          </div>
          {/* Suspense độc lập thứ 2: Chạy song song không block CastList */}
          <Suspense
            fallback={
              <div className="flex gap-3 sm:gap-4 overflow-hidden pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-36 sm:w-44 aspect-[2/3] shrink-0 rounded-md bg-zinc-800/80 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <SimilarMovies movieId={id} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
