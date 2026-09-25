import Link from "next/link";

/**
 * Header - Server Component thanh điều hướng chính của ứng dụng (Tầng 1A)
 * Được đặt trong Root Layout để chia sẻ trên mọi trang mà không bị re-render lại khi chuyển route
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-950/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110">
            🎬
          </span>
          <span className="text-xl font-black tracking-tight text-white">
            Movie<span className="text-yellow-400">Hub</span>
          </span>
        </Link>

        {/* Menu Điều Hướng */}
        <nav className="flex items-center gap-1 sm:gap-6 text-sm font-semibold">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-gray-200 hover:text-yellow-400 hover:bg-gray-900 transition-colors"
          >
            Trang Chủ
          </Link>
          <Link
            href="/search"
            className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-900 transition-colors"
          >
            Tìm Kiếm
          </Link>
          <Link
            href="/watchlist"
            className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-900 transition-colors flex items-center gap-1.5"
          >
            <span>❤️</span>
            <span className="hidden sm:inline">Yêu Thích</span>
          </Link>
        </nav>

        {/* Badge công nghệ Next.js */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-gray-900 text-gray-400 px-3 py-1 rounded-full border border-gray-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Next.js 16 App Router</span>
        </div>
      </div>
    </header>
  );
}
