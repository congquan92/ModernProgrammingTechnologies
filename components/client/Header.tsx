"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Header - Client Component thanh điều hướng phong cách Netflix (Tầng 1B)
 *
 * 🎯 HIỆU ỨNG NETFLIX CHUẨN:
 * 1. Ở vị trí trên cùng (scrollY <= 30):
 *    - Trong suốt hoàn toàn (bg-transparent) kèm một lớp dốc mờ nhẹ (from-black/80 to-transparent)
 *    - Nằm đè lên trên ảnh Backdrop của Hero Banner (fixed top-0 left-0 right-0)
 * 2. Khi người dùng cuộn/vuốt xuống (scrollY > 30):
 *    - Mượt mà chuyển sang nền đen xám nguyên khối của Netflix (bg-[#141414])
 *    - Đổ bóng nhẹ phía dưới (shadow-md shadow-black/80)
 */
export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

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

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled ? "bg-[#141414] shadow-xl shadow-black/80 py-3 sm:py-4" : "bg-gradient-to-b from-black/80 via-black/30 to-transparent py-4 sm:py-6"}`}
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
