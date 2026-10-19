import Link from "next/link";

/**
 * Root Not Found Component (app/not-found.tsx) - Next.js 16 App Router
 * Server Component hiển thị khi người dùng truy cập route không tồn tại (404)
 * hoặc khi một Server Component gọi hàm notFound().
 * Phong cách giao diện: Netflix Dark Cinema (#141414, #E50914, #FFFFFF)
 */
export default function NotFound() {
    return (
        <main className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-[#141414]">
            <div className="space-y-6 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E50914]">
                    <svg className="w-10 h-10 fill-none stroke-current" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                </div>

                <div className="space-y-1">
                    <h1 className="text-7xl font-black text-[#E50914] tracking-tighter">
                        404
                    </h1>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Không Tìm Thấy Trang
                    </h2>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                    Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn đã thay đổi. Vui lòng quay về trang chủ để khám phá kho phim phong phú của MovieHub.
                </p>

                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-8 py-3 rounded-md transition-colors shadow-lg shadow-white/10"
                    >
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Quay về Trang Chủ</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
