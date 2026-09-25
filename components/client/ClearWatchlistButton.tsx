"use client";

import { useTransition } from "react";
import { clearAllWatchlist } from "@/app/actions/watchlist";

/**
 * ClearWatchlistButton - Client Component kích hoạt Server Action xóa sạch cookie danh sách yêu thích
 */
export default function ClearWatchlistButton() {
    const [isPending, startTransition] = useTransition();

    const handleClear = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ phim khỏi danh sách yêu thích?")) {
            startTransition(async () => {
                await clearAllWatchlist();
            });
        }
    };

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3.5 py-2 rounded-md transition-colors disabled:opacity-50"
        >
            {isPending ? (
                <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            )}
            <span>{isPending ? "Đang xóa..." : "Xóa tất cả"}</span>
        </button>
    );
}
