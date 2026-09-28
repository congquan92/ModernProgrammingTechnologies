"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Movie } from "@/types/tmdb";
import MovieCard from "@/components/server/MovieCard";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    isTop10?: boolean;
    exploreHref?: string;
}

/**
 * MovieRow - Client Component hàng phim cuộn ngang phong cách Netflix
 * - Hiển thị đầy đủ danh sách phim (lên tới 20 phim thay vì bị cắt còn 10)
 * - Tự động lặp vòng vô tận (Infinite Loop): khi cuộn đến cuối bấm tiếp sẽ quay lại đầu, và ngược lại
 * - Bước cuộn được tối ưu để cuộn được nhiều lần mượt mà
 * - Nút "Khám phá tất cả >" dẫn thẳng tới trang duyệt phim tương ứng
 */
export default function MovieRow({
    title,
    movies,
    isTop10 = false,
    exploreHref,
}: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const lastScrollPosRef = useRef<{ left: number; time: number }>({ left: 0, time: 0 });

    // Xác định link khám phá thông minh theo danh mục
    const targetHref =
        exploreHref ||
        (isTop10
            ? "/browse?sortBy=vote_average.desc"
            : title.includes("Thịnh Hành")
            ? "/browse?sortBy=popularity.desc"
            : title.includes("Chiếu Rạp")
            ? "/browse?type=movie"
            : "/browse");

    // Top 10 thì giữ 10 phim, các hàng khác hiển thị tối đa toàn bộ phim được truyền vào (20 phim)
    const displayMovies = isTop10 ? movies.slice(0, 10) : movies;
    if (displayMovies.length === 0) return null;

    const handleScroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const el = rowRef.current;
            const { scrollLeft, clientWidth, scrollWidth } = el;
            const maxScrollLeft = scrollWidth - clientWidth;
            // Tối ưu bước cuộn: mỗi lần trượt khoảng 55% độ rộng màn hình (~3-4 thẻ)
            const scrollStep = Math.max(clientWidth * 0.55, 320);

            const now = Date.now();
            // Nếu vị trí cuộn hiện tại gần như không đổi so với lần bấm trước đó
            // nghĩa là đã bị kịch biên của container trình duyệt
            const wasStuck =
                Math.abs(scrollLeft - lastScrollPosRef.current.left) < 15 &&
                now - lastScrollPosRef.current.time < 1500;

            if (direction === "right") {
                // Đến gần kịch biên (khoảng cách <= 80px do padding ngang px-12 chiếm 48px) HOẶC bị kẹt kịch biên
                if (scrollLeft >= maxScrollLeft - 80 || wasStuck) {
                    el.scrollTo({ left: 0, behavior: "smooth" });
                    lastScrollPosRef.current = { left: 0, time: now };
                } else {
                    const scrollTo = Math.min(scrollLeft + scrollStep, maxScrollLeft);
                    el.scrollTo({ left: scrollTo, behavior: "smooth" });
                    lastScrollPosRef.current = { left: scrollLeft, time: now };
                }
            } else {
                // Ở gần đầu danh sách (<= 80px) HOẶC bị kẹt kịch biên trái
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
        <div className="space-y-2 group/row relative">
            {/* Tiêu đề hàng & Link Khám phá tất cả phong cách Netflix */}
            <div className="px-4 sm:px-12 flex items-baseline">
                <Link
                    href={targetHref}
                    className="group/title inline-flex items-baseline gap-2 cursor-pointer transition-colors"
                    title={`Khám phá toàn bộ ${title}`}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover/title:text-zinc-200 transition-colors">
                        {title}
                    </h2>
                    <span className="text-xs text-[#54b9c5] group-hover/title:text-[#7ee2ed] font-semibold opacity-0 group-hover/row:opacity-100 transition-all flex items-center gap-0.5">
                        <span>Khám phá tất cả</span>
                        <span className="text-sm font-bold leading-none">&gt;</span>
                    </span>
                </Link>
            </div>

            {/* Vùng chứa các thẻ phim cuộn ngang */}
            <div className="relative">
                {/* Nút trượt sang trái - Luôn sẵn sàng khi hover để cuộn lặp vòng */}
                <button
                    onClick={() => handleScroll("left")}
                    className="absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none"
                    aria-label="Cuộn sang trái"
                    title="Cuộn sang trái (lặp vòng)"
                >
                    <span className="text-2xl sm:text-3xl font-bold">‹</span>
                </button>

                {/* Danh sách thẻ phim */}
                <div
                    ref={rowRef}
                    className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar px-4 sm:px-12 py-4 scroll-smooth"
                >
                    {displayMovies.map((movie, index) => {
                        if (isTop10) {
                            return (
                                <div key={movie.id} className="flex items-center shrink-0 relative group/item">
                                    {/* Chữ số thứ tự TOP 10 khổng lồ kiểu Netflix */}
                                    <span className="netflix-number text-7xl sm:text-8xl md:text-9xl font-black select-none -mr-4 sm:-mr-6 z-0 leading-none">
                                        {index + 1}
                                    </span>
                                    <div className="w-32 sm:w-40 md:w-48 z-10">
                                        <MovieCard movie={movie} />
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={movie.id}
                                className="w-36 sm:w-44 md:w-52 shrink-0 transition-transform duration-300"
                            >
                                <MovieCard movie={movie} />
                            </div>
                        );
                    })}
                </div>

                {/* Nút trượt sang phải */}
                <button
                    onClick={() => handleScroll("right")}
                    className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none"
                    aria-label="Cuộn sang phải"
                    title="Cuộn sang phải (lặp vòng)"
                >
                    <span className="text-2xl sm:text-3xl font-bold">›</span>
                </button>
            </div>
        </div>
    );
}
