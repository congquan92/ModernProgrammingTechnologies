"use client";

import { useState, useEffect, useCallback } from "react";

interface TrailerModalProps {
    trailerKey?: string | null;
    movieTitle: string;
}

/**
 * TrailerModal - Client Component phát Trailer phim chuẩn phong cách Netflix Cinema
 * - Nhúng trực tiếp iframe YouTube chính thức lấy từ TMDB
 * - Hỗ trợ Autoplay, phím tắt ESC để đóng và nhấp ngoài màn hình để đóng
 * - Có chế độ fallback tìm kiếm YouTube nếu TMDB chưa cập nhật video
 */
export default function TrailerModal({ trailerKey, movieTitle }: TrailerModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Khóa cuộn trang và lắng nghe phím ESC khi mở Modal
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, handleClose]);

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${movieTitle} official trailer`
    )}`;

    return (
        <>
            {/* Nút Xem Trailer phong cách Netflix */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white hover:bg-white/85 text-black font-extrabold px-6 sm:px-8 py-2.5 rounded-md transition-all duration-200 text-sm sm:text-base shadow-lg cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={`Xem Trailer phim ${movieTitle}`}
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Trailer</span>
            </button>

            {/* Cinema Modal Popup */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Trailer phim ${movieTitle}`}
                >
                    <div
                        className="relative w-full max-w-5xl bg-[#181818] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header của Modal */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#121212] border-b border-[#282828]">
                            <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                <span className="bg-[#E50914] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                    Trailer HD
                                </span>
                                <h3 className="text-white font-bold text-sm sm:text-base truncate">
                                    {movieTitle}
                                </h3>
                            </div>

                            {/* Nút Đóng */}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none"
                                aria-label="Đóng trailer"
                                title="Đóng (ESC)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Vùng phát Video */}
                        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                            {trailerKey ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                                    title={`Trailer phim ${movieTitle}`}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md">
                                    <div className="w-16 h-16 rounded-full bg-[#202020] border border-zinc-800 flex items-center justify-center text-zinc-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold text-base">
                                            Chưa có Trailer trên TMDB
                                        </h4>
                                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                                            TMDB hiện chưa cập nhật video chính thức cho tác phẩm này. Bạn có thể tìm nhanh trailer trên YouTube.
                                        </p>
                                    </div>
                                    <a
                                        href={youtubeSearchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded transition-colors"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                        <span>Tìm trên YouTube</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
