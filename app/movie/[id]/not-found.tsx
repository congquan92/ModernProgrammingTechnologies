import Link from "next/link";

/**
 * MovieNotFound (not-found.tsx) - Kích hoạt tự động khi gọi notFound() trong route segment (Tầng 1B)
 * Hiển thị giao diện 404 thân thiện phong cách Netflix khi ID phim không tồn tại trên TMDB
 */
export default function MovieNotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-[#141414]">
      <div className="space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <svg className="w-10 h-10 fill-none stroke-current" strokeWidth={1.5} viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tight">404</h2>
        <p className="text-xl font-bold text-gray-200">
          Không Tìm Thấy Bộ Phim Này
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Bộ phim với mã ID này không tồn tại hoặc đã bị gỡ bỏ khỏi cơ sở dữ liệu TMDB.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-8 py-3 rounded-md transition-colors shadow-lg shadow-white/10"
          >
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
