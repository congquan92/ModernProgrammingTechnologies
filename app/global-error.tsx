"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Global Error Boundary (app/global-error.tsx) - Next.js 16 App Router
 * Bắt các lỗi nghiêm trọng phát sinh trong chính RootLayout (app/layout.tsx).
 * Theo quy chuẩn Next.js, component này BẮT BUỘC phải tự định nghĩa thẻ <html> và <body>.
 */
export default function GlobalErrorBoundary({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error("[GlobalError] Lỗi layout toàn cục:", error);
    }, [error]);

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <html lang="vi">
            <body className="bg-[#141414] text-white min-h-screen m-0 p-0 font-sans antialiased flex items-center justify-center">
                <main className="w-full max-w-md px-6 py-12 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center text-[#E50914] shadow-lg shadow-[#E50914]/10">
                        <svg className="w-10 h-10 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold tracking-widest text-[#E50914] uppercase">
                            MovieHub System Error
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Sự Cố Hệ Thống Toàn Cục
                        </h1>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        Ứng dụng không thể khởi tạo cấu trúc giao diện chính. Vui lòng bấm thử lại để phục hồi luồng hoạt động hoặc tải lại ứng dụng.
                    </p>

                    {error?.digest && (
                        <p className="text-xs text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded inline-block">
                            Mã tham chiếu: {error.digest}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="bg-white hover:bg-white/80 text-black font-extrabold px-6 py-2.5 rounded-md transition-colors shadow-lg cursor-pointer text-sm"
                        >
                            Thử lại
                        </button>
                        <button
                            type="button"
                            onClick={handleReload}
                            className="bg-[#242424] hover:bg-[#303030] text-white font-bold px-6 py-2.5 rounded-md transition-colors border border-zinc-700 cursor-pointer text-sm"
                        >
                            Tải lại ứng dụng
                        </button>
                    </div>
                </main>
            </body>
        </html>
    );
}
