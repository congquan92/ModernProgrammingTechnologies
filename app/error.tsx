"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Root Error Boundary (app/error.tsx) - Next.js 16 App Router
 * Bắt lỗi runtime cấp Root, giữ nguyên RootLayout (Header/Footer).
 * Phong cách giao diện: Netflix Dark Cinema (#141414, #E50914, #FFFFFF)
 */
export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("[RootError] Lỗi runtime toàn cục:", error);
    }, [error]);

    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-[#141414]">
            <div className="space-y-6 max-w-lg">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                    <svg className="w-8 h-8 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Đã Xảy Ra Sự Cố Không Mong Muốn!
                </h1>
                
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Hệ thống không thể hoàn tất yêu cầu lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử tải lại trang.
                </p>

                {error?.digest && (
                    <p className="text-xs text-zinc-500 font-mono bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md inline-block">
                        Mã lỗi: {error.digest}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="bg-white hover:bg-white/80 text-black font-extrabold px-6 py-2.5 rounded-md transition-colors shadow-lg cursor-pointer"
                    >
                        Thử Lại
                    </button>
                    <Link
                        href="/"
                        className="bg-[#242424] hover:bg-[#303030] text-white font-bold px-6 py-2.5 rounded-md transition-colors border border-zinc-700"
                    >
                        Về Trang Chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
