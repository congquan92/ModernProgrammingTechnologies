"use client";

import { useTransition, useState, useOptimistic, useId } from "react";
import { toggleWatchlist } from "@/app/actions/watchlist";

interface WatchlistButtonProps {
    movieId: number;
    initialSaved?: boolean;
    variant?: "default" | "compact";
    className?: string;
}

/**
 * WatchlistButton - Client Component gọi Server Action (Tầng 1B)
 * Thao tác thêm/xóa phim khỏi danh sách yêu thích bằng Cookie thông qua Server Action toggleWatchlist.
 * Hỗ trợ Optimistic UI cập nhật tức thì, không sử dụng emoji, icon dùng SVG vector chuẩn.
 */
export default function WatchlistButton({
    movieId,
    initialSaved = false,
    variant = "default",
    className = "",
}: WatchlistButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isSaved, setOptimisticSaved] = useOptimistic(initialSaved);
    const [errorMessage, setErrorMessage] = useState("");
    const errorId = useId();

    const handleToggle = () => {
        setErrorMessage("");
        startTransition(async () => {
            setOptimisticSaved(!isSaved);
            try {
                const res = await toggleWatchlist(movieId);
                if (res.error) setErrorMessage(res.error);
                // Cookie mutation re-renders initialSaved from the server.
                // useOptimistic rolls back automatically if the action fails.
            } catch {
                setErrorMessage("Không thể cập nhật danh sách. Vui lòng thử lại.");
            }
        });
    };

    const errorNotice = errorMessage ? (
        <p id={errorId} role="alert" className="text-sm text-red-400 max-w-xs">
            {errorMessage}
        </p>
    ) : null;

    if (variant === "compact") {
        return (
            <>
            <button
                type="button"
                disabled={isPending}
                onClick={handleToggle}
                className={`p-2.5 rounded-full transition-all duration-200 border backdrop-blur-md ${
                    isSaved
                        ? "bg-[#E50914] border-[#E50914] text-white hover:bg-[#B80710]"
                        : "bg-black/60 border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400"
                } ${isPending ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
                title={isSaved ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                aria-label={isSaved ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                aria-pressed={isSaved}
                aria-describedby={errorMessage ? errorId : undefined}
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isSaved ? "fill-white stroke-white scale-110" : "fill-none stroke-current"}`}
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>
            {errorNotice}
            </>
        );
    }

    return (
        <>
        <button
            type="button"
            disabled={isPending}
            onClick={handleToggle}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm transition-all duration-200 border disabled:opacity-60 disabled:cursor-not-allowed ${
                isSaved
                    ? "bg-[#E50914]/20 border-[#E50914] text-white hover:bg-[#E50914]/30"
                    : "bg-white/10 border-zinc-600 text-zinc-200 hover:bg-white/20 hover:border-zinc-400"
            } ${className}`}
            aria-label={isSaved ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            aria-pressed={isSaved}
            aria-describedby={errorMessage ? errorId : undefined}
        >
            {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg
                    className={`w-4 h-4 transition-all duration-200 ${
                        isSaved ? "fill-[#E50914] stroke-[#E50914]" : "fill-none stroke-current"
                    }`}
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}
            <span>{isPending ? "Đang lưu..." : isSaved ? "Đã Lưu" : "Lưu Xem Sau"}</span>
        </button>
        {errorNotice}
        </>
    );
}
