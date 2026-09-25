import Link from "next/link";

/**
 * Header - Server Component thanh điều hướng chính phong cách Netflix (Tầng 1A)
 * Sử dụng logo đỏ biểu tượng #E50914, nền chuyển sắc đen trong suốt và avatar kinh điển
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-[2px] transition-all duration-300">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8">
        {/* Phía bên trái: Logo & Menu */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Logo đỏ phong cách Netflix */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] group-hover:scale-105 transition-transform duration-200">
              MOVIE<span className="text-white">HUB</span>
            </span>
          </Link>

          {/* Menu điều hướng chính */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/"
              className="text-white hover:text-gray-300 font-bold transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Phim T.hình
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Phim
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Mới & Phổ biến
            </Link>
            <Link
              href="/watchlist"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Danh sách của tôi
            </Link>
          </nav>
        </div>

        {/* Phía bên phải: Search, Thông báo & Profile Avatar */}
        <div className="flex items-center gap-4 sm:gap-6 text-white">
          {/* Nút Tìm kiếm */}
          <Link
            href="/search"
            className="p-1.5 text-gray-200 hover:text-white transition-colors"
            title="Tìm kiếm phim"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          {/* Chuông thông báo */}
          <button
            className="hidden sm:block p-1.5 text-gray-200 hover:text-white transition-colors"
            title="Thông báo"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* Avatar Profile vuông kiểu Netflix */}
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 via-indigo-500 to-red-500 flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/20">
              NQ
            </div>
            <span className="text-[10px] text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180">
              ▼
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
