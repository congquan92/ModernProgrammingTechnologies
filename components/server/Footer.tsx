/**
 * Footer - Server Component chân trang của ứng dụng (Tầng 1A)
 */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-800/80 bg-gray-950 py-10 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-lg font-bold text-white">
            Movie<span className="text-yellow-400">Hub</span>
          </span>
          <span className="text-xs text-gray-500 ml-2">
            © 2026 Nhóm Đồ Án Next.js
          </span>
        </div>

        <div className="text-xs text-center sm:text-right space-y-1">
          <p>
            Dữ liệu phim được cung cấp bởi{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline font-semibold"
            >
              The Movie Database (TMDB) API
            </a>
          </p>
          <p className="text-gray-500">
            Môn học: Các Công nghệ Lập trình Hiện đại • App Router & Server Components
          </p>
        </div>
      </div>
    </footer>
  );
}
