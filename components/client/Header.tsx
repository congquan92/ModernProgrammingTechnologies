"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Header - Client Component thanh điều hướng phong cách Netflix (Tầng 1B)
 *
 * 🎯 HIỆU ỨNG NETFLIX CHUẨN (HOÀN TOÀN KHÔNG ĐỔ BÓNG - ZERO SHADOW):
 * 1. Trên trang có Hero Banner (Trang chủ / Chi tiết phim):
 *    - Khi ở trên cùng (scrollY <= 30): Trong suốt đè lên backdrop banner
 *    - Khi cuộn xuống (scrollY > 30): Nền đen xám nguyên khối bg-[#141414], không đổ bóng
 * 2. Trên các trang khác (Watchlist / Search):
 *    - Nền đen xám nguyên khối bg-[#141414] phẳng hoàn toàn, không dốc gradient, không đổ bóng
 */
export default function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    // Xác định các trang có hero banner lớn tràn viền ở đầu trang
    const hasHeroBanner = pathname === "/" || pathname?.startsWith("/movie/");

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        // Lắng nghe sự kiện cuộn mượt với { passive: true } tối ưu hiệu năng
        window.addEventListener("scroll", handleScroll, { passive: true });
        // Kiểm tra ngay khi vừa nạp trang (phòng trường hợp người dùng F5 khi đang ở giữa trang)
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const isSolid = isScrolled || !hasHeroBanner;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
                isSolid
                    ? "bg-[#141414] py-3 sm:py-3.5"
                    : "bg-gradient-to-b from-black/50 to-transparent py-3.5 sm:py-4"
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4 sm:px-12">
                {/* Phía bên trái: Logo đỏ & Menu điều hướng */}
                <div className="flex items-center gap-6 lg:gap-10">
                    {/* Logo đỏ chuẩn Netflix */}
                    <Link href="/" className="flex items-center group">
                        <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] group-hover:scale-105 transition-transform duration-200">
                            MOVIE<span className="text-white">HUB</span>
                        </span>
                    </Link>

                    {/* Menu điều hướng chính */}
                    <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
                        <Link href="/" className="text-white hover:text-gray-300 font-bold transition-colors">
                            Trang chủ
                        </Link>
                        <Link href="/" className="text-gray-300 hover:text-gray-400 transition-colors">
                            Phim T.hình
                        </Link>
                        <Link href="/" className="text-gray-300 hover:text-gray-400 transition-colors">
                            Phim
                        </Link>
                        <Link href="/" className="text-gray-300 hover:text-gray-400 transition-colors">
                            Mới & Phổ biến
                        </Link>
                        <Link href="/watchlist" className="text-gray-300 hover:text-gray-400 transition-colors">
                            Danh sách của tôi
                        </Link>
                    </nav>
                </div>

                {/* Phía bên phải: Search, Thông báo & Profile Avatar */}
                <div className="flex items-center gap-4 sm:gap-6 text-white">
                    {/* Nút Tìm kiếm */}
                    <Link href="/search" className="p-1.5 text-gray-200 hover:text-white transition-colors" title="Tìm kiếm phim">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Link>

                    {/* Chuông thông báo */}
                    <button className="hidden sm:block p-1.5 text-gray-200 hover:text-white transition-colors" title="Thông báo">
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
                        <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 via-indigo-500 to-red-500 flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/20">NQ</div>
                        <span className="text-[10px] text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180">▼</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
