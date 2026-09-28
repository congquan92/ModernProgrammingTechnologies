"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavbarDropdown from "@/components/client/NavbarDropdown";
import NavSearchBar from "@/components/client/NavSearchBar";
import { MOVIE_GENRES, COUNTRIES, YEARS } from "@/utils/constants";

/**
 * Header - Client Component thanh điều hướng phong cách Netflix Dark Cinema
 * Tích hợp Mega Menu Dropdown đa cột, Live Search Bar co giãn và menu di động.
 */
export default function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Xác định các trang có hero banner lớn tràn viền ở đầu trang
    const hasHeroBanner = pathname === "/" || pathname?.startsWith("/movie/") || pathname === "/tv";

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const isSolid = isScrolled || !hasHeroBanner;

    // Chuẩn bị dữ liệu cho Dropdown
    const genreItems = MOVIE_GENRES.map((g) => ({
        label: g.label,
        href: `/browse?genre=${g.id}`,
    }));

    const countryItems = COUNTRIES.map((c) => ({
        label: c.label,
        href: `/browse?country=${c.id}`,
    }));

    const yearItems = YEARS.map((y) => ({
        label: y.label,
        href: `/browse?year=${y.id}`,
    }));

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
                isSolid
                    ? "bg-[#141414] py-3 shadow-xl shadow-black/80"
                    : "bg-gradient-to-b from-black/80 via-black/30 to-transparent py-3.5 sm:py-4"
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-12">
                {/* Phía bên trái: Logo & Menu điều hướng Desktop */}
                <div className="flex items-center gap-5 lg:gap-8">
                    {/* Nút Hamburger cho Mobile */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="md:hidden text-gray-300 hover:text-white p-1"
                        aria-label="Mở menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Logo đỏ chuẩn Netflix */}
                    <Link href="/" className="flex items-center group flex-shrink-0">
                        <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] group-hover:scale-105 transition-transform duration-200">
                            MOVIE<span className="text-white">HUB</span>
                        </span>
                    </Link>

                    {/* Menu điều hướng chính trên Desktop */}
                    <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium">
                        <Link
                            href="/"
                            className={`transition-colors ${
                                pathname === "/" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                            }`}
                        >
                            Trang chủ
                        </Link>

                        <Link
                            href="/tv"
                            className={`transition-colors ${
                                pathname === "/tv" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                            }`}
                        >
                            Phim T.hình
                        </Link>

                        <Link
                            href="/browse?type=movie"
                            className={`transition-colors ${
                                pathname === "/browse" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                            }`}
                        >
                            Phim Lẻ
                        </Link>

                        {/* Mega Menu Dropdown Thể Loại (3 cột) */}
                        <NavbarDropdown
                            title="Thể Loại"
                            items={genreItems}
                            columns={3}
                        />

                        {/* Dropdown Quốc Gia (2 cột) */}
                        <NavbarDropdown
                            title="Quốc Gia"
                            items={countryItems}
                            columns={2}
                        />

                        {/* Dropdown Năm Phát Hành (2 cột) */}
                        <NavbarDropdown
                            title="Năm"
                            items={yearItems}
                            columns={2}
                        />

                        <Link
                            href="/browse?sortBy=popularity.desc"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Mới & Phổ biến
                        </Link>

                        <Link
                            href="/watchlist"
                            className={`transition-colors ${
                                pathname === "/watchlist" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                            }`}
                        >
                            Danh sách của tôi
                        </Link>
                    </nav>
                </div>

                {/* Phía bên phải: Live Search, Thông báo & Profile Avatar */}
                <div className="flex items-center gap-3 sm:gap-5 text-white">
                    {/* Live Search Co Giãn */}
                    <NavSearchBar />

                    {/* Chuông thông báo */}
                    <button className="hidden sm:block p-1 text-gray-300 hover:text-white transition-colors" title="Thông báo">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </button>

                    {/* Avatar Profile vuông kiểu Netflix */}
                    <div className="flex items-center gap-1.5 cursor-pointer group">
                        <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 via-indigo-500 to-red-500 flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/20">
                            NQ
                        </div>
                        <span className="text-[10px] text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180">▼</span>
                    </div>
                </div>
            </div>

            {/* Menu Drawer cho Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#181818] border-b border-[#2E2E2E] px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col space-y-2 text-sm font-medium">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-white hover:text-[#E50914]">
                            Trang chủ
                        </Link>
                        <Link href="/tv" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-zinc-300 hover:text-[#E50914]">
                            Phim Truyền Hình
                        </Link>
                        <Link href="/browse?type=movie" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-zinc-300 hover:text-[#E50914]">
                            Phim Lẻ
                        </Link>
                        <Link href="/browse?sortBy=popularity.desc" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-zinc-300 hover:text-[#E50914]">
                            Mới & Phổ biến
                        </Link>
                        <Link href="/watchlist" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-zinc-300 hover:text-[#E50914]">
                            Danh sách của tôi
                        </Link>
                    </div>

                    <div className="pt-2 border-t border-[#2E2E2E]">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Thể loại</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {MOVIE_GENRES.slice(0, 10).map((g) => (
                                <Link
                                    key={g.id}
                                    href={`/browse?genre=${g.id}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-zinc-300 hover:text-[#E50914] py-1 truncate"
                                >
                                    {g.label}
                                </Link>
                            ))}
                            <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className="text-[#E50914] font-semibold py-1">
                                Xem tất cả thể loại →
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-[#2E2E2E]">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Quốc gia</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {COUNTRIES.slice(0, 6).map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/browse?country=${c.id}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-zinc-300 hover:text-[#E50914] py-1 truncate"
                                >
                                    {c.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
