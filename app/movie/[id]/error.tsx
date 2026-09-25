"use client";

import { useEffect } from "react";
import Link from "next/link";

interface MovieErrorProps {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}

/**
 * MovieError (error.tsx) - Error Boundary bắt lỗi runtime tại route segment (Tầng 1B)
 * Bắt buộc là Client Component vì sử dụng hook useEffect và sự kiện onClick
 * Hỗ trợ cả prop `retry` (Next.js 16) và `reset` (Next.js 14/15)
 */
export default function MovieError({ error, retry, reset }: MovieErrorProps) {
  useEffect(() => {
    console.error("[MovieDetailPage] Lỗi runtime:", error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry();
    } else if (typeof reset === "function") {
      reset();
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-[#141414]">
      <div className="space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <svg className="w-8 h-8 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Đã xảy ra sự cố tải phim!
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Không thể kết nối hoặc tải dữ liệu bộ phim từ máy chủ TMDB. Vui lòng kiểm tra
          kết nối mạng và nhấn nút thử lại.
        </p>

        {error?.message && (
          <p className="text-xs text-zinc-500 font-mono bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-md break-all">
            {error.message}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
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
