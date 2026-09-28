"use client";

import { useRef } from "react";
import type { Movie } from "@/types/tmdb";
import MovieCard from "@/components/server/MovieCard";

interface SimilarMoviesSliderProps {
    movies: Movie[];
}

/**
 * SimilarMoviesSlider - Client Component thanh cuộn Carousel cho Phim Tương Tự
 * - Cung cấp nút trượt sang trái/phải hiển thị mượt mà khi rê chuột (chuẩn Ảnh 2)
 * - Tự động lặp vòng (Infinite Loop) khi cuộn hết danh sách
 * - Hiển thị đầy đủ danh sách phim tương tự
 */
export default function SimilarMoviesSlider({ movies }: SimilarMoviesSliderProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const lastScrollPosRef = useRef<{ left: number; time: number }>({ left: 0, time: 0 });

    if (!movies || movies.length === 0) return null;

    const handleScroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const el = rowRef.current;
            const { scrollLeft, clientWidth, scrollWidth } = el;
            const maxScrollLeft = scrollWidth - clientWidth;
            // Bước cuộn khoảng 60% độ rộng màn hình (~3-4 phim)
            const scrollStep = Math.max(clientWidth * 0.6, 320);

            const now = Date.now();
            const wasStuck =
                Math.abs(scrollLeft - lastScrollPosRef.current.left) < 15 &&
                now - lastScrollPosRef.current.time < 1500;

            if (direction === "right") {
                // Đến gần cuối hàng HOẶC bị kịch biên -> Lặp vòng về đầu
                if (scrollLeft >= maxScrollLeft - 80 || wasStuck) {
                    el.scrollTo({ left: 0, behavior: "smooth" });
                    lastScrollPosRef.current = { left: 0, time: now };
                } else {
                    const scrollTo = Math.min(scrollLeft + scrollStep, maxScrollLeft);
                    el.scrollTo({ left: scrollTo, behavior: "smooth" });
                    lastScrollPosRef.current = { left: scrollLeft, time: now };
                }
            } else {
                // Ở gần đầu hàng HOẶC bị kịch biên -> Lặp vòng tới cuối
                if (scrollLeft <= 80 || wasStuck) {
                    el.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
                    lastScrollPosRef.current = { left: maxScrollLeft, time: now };
                } else {
                    const scrollTo = Math.max(scrollLeft - scrollStep, 0);
                    el.scrollTo({ left: scrollTo, behavior: "smooth" });
                    lastScrollPosRef.current = { left: scrollLeft, time: now };
                }
            }
        }
    };

    return (
        <div className="relative group/similar">
            {/* Nút trượt sang trái (‹) */}
            <button
                type="button"
                onClick={() => handleScroll("left")}
                className="absolute top-0 bottom-0 left-0 z-30 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/similar:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Cuộn sang trái"
                title="Cuộn sang trái (lặp vòng)"
            >
                <span className="text-2xl sm:text-3xl font-bold">‹</span>
            </button>

            {/* Danh sách thẻ phim cuộn ngang */}
            <div
                ref={rowRef}
                className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            >
                {movies.map((movie, index) => (
                    <div
                        key={`${movie.id}-${index}`}
                        className="w-36 sm:w-44 md:w-52 shrink-0 transition-transform duration-300"
                    >
                        <MovieCard movie={movie} />
                    </div>
                ))}
            </div>

            {/* Nút trượt sang phải (›) */}
            <button
                type="button"
                onClick={() => handleScroll("right")}
                className="absolute top-0 bottom-0 right-0 z-30 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/similar:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Cuộn sang phải"
                title="Cuộn sang phải (lặp vòng)"
            >
                <span className="text-2xl sm:text-3xl font-bold">›</span>
            </button>
        </div>
    );
}
