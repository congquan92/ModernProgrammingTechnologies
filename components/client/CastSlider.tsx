"use client";

import { useRef } from "react";
import Image from "next/image";
import type { CastMember } from "@/types/tmdb";

interface CastSliderProps {
    cast: CastMember[];
}

/**
 * CastSlider - Client Component thanh cuộn Carousel cho Dàn Diễn Viên Chính
 * - Nút trượt trái/phải hiển thị mượt mà khi rê chuột
 * - Lặp vòng vô tận và trượt mượt mà
 */
export default function CastSlider({ cast }: CastSliderProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const lastScrollPosRef = useRef<{ left: number; time: number }>({ left: 0, time: 0 });

    if (!cast || cast.length === 0) return null;

    const handleScroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const el = rowRef.current;
            const { scrollLeft, clientWidth, scrollWidth } = el;
            const maxScrollLeft = scrollWidth - clientWidth;
            const scrollStep = Math.max(clientWidth * 0.6, 280);

            const now = Date.now();
            const wasStuck =
                Math.abs(scrollLeft - lastScrollPosRef.current.left) < 15 &&
                now - lastScrollPosRef.current.time < 1500;

            if (direction === "right") {
                if (scrollLeft >= maxScrollLeft - 80 || wasStuck) {
                    el.scrollTo({ left: 0, behavior: "smooth" });
                    lastScrollPosRef.current = { left: 0, time: now };
                } else {
                    const scrollTo = Math.min(scrollLeft + scrollStep, maxScrollLeft);
                    el.scrollTo({ left: scrollTo, behavior: "smooth" });
                    lastScrollPosRef.current = { left: scrollLeft, time: now };
                }
            } else {
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
        <div className="relative group/cast">
            {/* Nút trượt sang trái */}
            <button
                type="button"
                onClick={() => handleScroll("left")}
                className="absolute top-0 bottom-0 left-0 z-30 m-auto h-full w-9 sm:w-11 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Cuộn sang trái"
                title="Cuộn sang trái"
            >
                <span className="text-2xl font-bold">‹</span>
            </button>

            {/* Danh sách diễn viên */}
            <div
                ref={rowRef}
                className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            >
                {cast.map((actor: CastMember) => (
                    <div
                        key={actor.id}
                        className="w-24 sm:w-28 shrink-0 text-center space-y-1.5 group/actor"
                    >
                        {/* Khung ảnh diễn viên tỷ lệ 3:4 chuẩn DESIGN.md */}
                        <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-md overflow-hidden bg-[#202020] border border-zinc-800/80 group-hover/actor:border-zinc-700 transition-colors">
                            {actor.profile_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                    alt={actor.name}
                                    fill
                                    sizes="112px"
                                    className="object-cover transition-transform duration-300 group-hover/actor:scale-105"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-gray-500 text-xs gap-1 p-2">
                                    <svg className="w-6 h-6 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                    <span className="text-[10px] text-zinc-600">No Photo</span>
                                </div>
                            )}
                        </div>
                        <p
                            className="text-xs font-bold text-white truncate group-hover/actor:text-[#E50914] transition-colors"
                            title={actor.name}
                        >
                            {actor.name}
                        </p>
                        <p
                            className="text-[10px] text-gray-400 truncate"
                            title={actor.character}
                        >
                            {actor.character}
                        </p>
                    </div>
                ))}
            </div>

            {/* Nút trượt sang phải */}
            <button
                type="button"
                onClick={() => handleScroll("right")}
                className="absolute top-0 bottom-0 right-0 z-30 m-auto h-full w-9 sm:w-11 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Cuộn sang phải"
                title="Cuộn sang phải"
            >
                <span className="text-2xl font-bold">›</span>
            </button>
        </div>
    );
}
