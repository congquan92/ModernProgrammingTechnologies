/**
 * Footer - Server Component chân trang phong cách tối giản của Netflix (Tầng 1A)
 */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800/60 bg-[#141414] py-12 text-zinc-500 text-xs">
      <div className="container mx-auto px-4 sm:px-12 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-[#E50914]">
            MOVIE<span className="text-white">HUB</span>
          </span>
          <span className="text-zinc-600">Vietnam</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-zinc-400">
          <span className="hover:underline cursor-pointer">Mô tả âm thanh</span>
          <span className="hover:underline cursor-pointer">Trung tâm trợ giúp</span>
          <span className="hover:underline cursor-pointer">Thẻ quà tặng</span>
          <span className="hover:underline cursor-pointer">Quan hệ với nhà đầu tư</span>
          <span className="hover:underline cursor-pointer">Điều khoản sử dụng</span>
          <span className="hover:underline cursor-pointer">Quyền riêng tư</span>
          <span className="hover:underline cursor-pointer">Tùy chọn cookie</span>
          <span className="hover:underline cursor-pointer">Thông tin doanh nghiệp</span>
        </div>

        <div className="pt-4 border-t border-zinc-900 text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2026 MovieHub — Đồ án môn Các Công nghệ Lập trình Hiện đại (Next.js 16 & TMDB API)</p>
          <p>
            Dữ liệu cung cấp bởi{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white underline"
            >
              TMDB API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
