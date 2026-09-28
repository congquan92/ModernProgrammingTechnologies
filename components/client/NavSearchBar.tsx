"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { quickSearchAction } from "@/app/actions/search";
import type { Movie } from "@/types/tmdb";

export default function NavSearchBar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Movie[]>([]);
    const [isPending, startTransition] = useTransition();

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Xử lý click ra ngoài để đóng search bar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Focus input khi mở search bar
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Xử lý gõ phím và debounce tìm kiếm
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.trim().length >= 2) {
            debounceRef.current = setTimeout(() => {
                startTransition(async () => {
                    const data = await quickSearchAction(val);
                    setResults(data);
                });
            }, 300);
        } else {
            setResults([]);
        }
    };

    // Điều hướng sang trang tìm kiếm đầy đủ khi nhấn Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && query.trim()) {
            e.preventDefault();
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div ref={containerRef} className="relative flex items-center">
            {/* Thanh Input Co Giãn */}
            <div
                className={`flex items-center rounded-full transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "w-52 sm:w-72 md:w-80 bg-black/85 border border-[#E50914] px-3 py-1.5 shadow-lg shadow-black/80"
                        : "w-8 h-8 justify-center bg-transparent border-transparent"
                }`}
            >
                {/* Nút Kính Lúp */}
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none flex-shrink-0"
                    title="Tìm kiếm phim"
                    aria-label="Tìm kiếm phim"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm kiếm phim, thể loại..."
                            className="w-full bg-transparent text-white text-xs sm:text-sm pl-2 pr-1 focus:outline-none placeholder-zinc-500"
                        />

                        {isPending && (
                            <div className="w-3.5 h-3.5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin flex-shrink-0 mr-1" />
                        )}

                        {query && !isPending && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-zinc-400 hover:text-white text-xs px-1"
                                title="Xóa từ khóa"
                            >
                                ✕
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Live Preview Dropdown Popover */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full right-0 mt-2.5 w-72 sm:w-84 md:w-96 bg-[#181818] border border-[#2E2E2E] rounded-md shadow-2xl shadow-black/95 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-[#2E2E2E] flex items-center justify-between text-xs text-zinc-400">
                        <span>Gợi ý xem trước</span>
                        <span>{results.length} kết quả</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
                        {results.length > 0 ? (
                            results.map((movie) => {
                                const poster = movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                    : "/no-poster.svg";
                                const year = movie.release_date ? movie.release_date.split("-")[0] : "";

                                return (
                                    <Link
                                        key={movie.id}
                                        href={`/movie/${movie.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="relative w-10 h-14 rounded overflow-hidden bg-zinc-900 flex-shrink-0">
                                            <Image
                                                src={poster}
                                                alt={movie.title}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#E50914] truncate transition-colors">
                                                {movie.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                                                {year && <span>{year}</span>}
                                                {movie.vote_average ? (
                                                    <span className="flex items-center gap-0.5 text-yellow-400 font-medium">
                                                        ★ {movie.vote_average.toFixed(1)}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : !isPending ? (
                            <div className="p-4 text-center text-xs text-zinc-500">
                                Không tìm thấy phim phù hợp với &ldquo;{query}&rdquo;
                            </div>
                        ) : null}
                    </div>

                    {/* Footer: Xem tất cả kết quả */}
                    <Link
                        href={`/search?q=${encodeURIComponent(query.trim())}`}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2.5 text-center text-xs font-semibold text-white bg-[#202020] hover:bg-[#E50914] transition-colors border-t border-[#2E2E2E]"
                    >
                        Xem tất cả kết quả cho &ldquo;{query}&rdquo; →
                    </Link>
                </div>
            )}
        </div>
    );
}
