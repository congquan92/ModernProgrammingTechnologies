"use client";

import { useState, useEffect, useCallback } from "react";

interface TrailerModalProps {
    trailerKey?: string | null;
    movieTitle: string;
}

/**
 * TrailerModal - Component phát Trailer YouTube tối giản (Minimal Cinema Dialog)
 * - Chỉ hiển thị khung video YouTube 16:9 sắc nét, không viền khung thừa
 * - Nút đóng nổi gọn gàng, tự động phát, hỗ trợ bấm ESC hoặc nhấp ra ngoài để đóng
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

            {/* Popup Dialog YouTube Tối Giản */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8 animate-in fade-in duration-200"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Trailer phim ${movieTitle}`}
                >
                    <div
                        className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-zinc-800/80 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Nút Đóng Nổi (Floating Close Button) */}
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-lg focus:outline-none"
                            aria-label="Đóng trailer"
                            title="Đóng (ESC)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Khung phát YouTube Player tràn viền */}
                        {trailerKey ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                                title={`Trailer phim ${movieTitle}`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-[#141414]">
                                <div className="w-14 h-14 rounded-full bg-[#202020] border border-zinc-800 flex items-center justify-center text-zinc-500">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <h4 className="text-white font-bold text-base">
                                        Chưa có Trailer trên TMDB
                                    </h4>
                                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                                        TMDB hiện chưa có video cho tác phẩm này. Bạn có thể mở xem trực tiếp trên YouTube.
                                    </p>
                                </div>
                                <a
                                    href={youtubeSearchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded transition-colors"
                                >
                                    <span>Tìm trên YouTube</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
