"use client";

import { useRef, useState } from "react";
import type { Movie } from "@/types/tmdb";
import MovieCard from "@/components/server/MovieCard";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    isTop10?: boolean;
}

/**
 * MovieRow - Client Component hàng phim cuộn ngang phong cách Netflix (Tầng 1B)
 * Có nút trượt trái/phải hiển thị khi rê chuột và hỗ trợ hiển thị số thứ tự TOP 10 khổng lồ
 */
export default function MovieRow({ title, movies, isTop10 = false }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isMoved, setIsMoved] = useState(false);

    const handleScroll = (direction: "left" | "right") => {
        setIsMoved(true);
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;

            rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    const displayMovies = movies.slice(0, 10);
    if (displayMovies.length === 0) return null;

    return (
        <div className="space-y-2 group relative">
            {/* Tiêu đề hàng phong cách Netflix */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white px-4 sm:px-12 flex items-center gap-2 group-hover:text-white transition-colors">
                <span>{title}</span>
                <span className="text-xs text-[#54b9c5] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center cursor-pointer">Khám phá tất cả &gt;</span>
            </h2>

            {/* Vùng chứa các thẻ phim cuộn ngang */}
            <div className="relative">
                {/* Nút trượt sang trái */}
                {isMoved && (
                    <button
                        onClick={() => handleScroll("left")}
                        className="absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        aria-label="Cuộn sang trái"
                    >
                        <span className="text-2xl sm:text-3xl font-bold">‹</span>
                    </button>
                )}

                {/* Danh sách thẻ phim */}
                <div ref={rowRef} className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-4 sm:px-12 py-4 scroll-smooth">
                    {displayMovies.map((movie, index) => {
                        if (isTop10) {
                            return (
                                <div key={movie.id} className="flex items-center shrink-0 relative group/item">
                                    {/* Chữ số thứ tự TOP 10 khổng lồ kiểu Netflix */}
                                    <span className="netflix-number text-7xl sm:text-8xl md:text-9xl font-black select-none -mr-4 sm:-mr-6 z-0 leading-none">{index + 1}</span>
                                    <div className="w-32 sm:w-40 md:w-48 z-10">
                                        <MovieCard movie={movie} />
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={movie.id} className="w-36 sm:w-44 md:w-52 shrink-0 transition-transform duration-300">
                                <MovieCard movie={movie} />
                            </div>
                        );
                    })}
                </div>

                {/* Nút trượt sang phải */}
                <button
                    onClick={() => handleScroll("right")}
                    className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Cuộn sang phải"
                >
                    <span className="text-2xl sm:text-3xl font-bold">›</span>
                </button>
            </div>
        </div>
    );
}
