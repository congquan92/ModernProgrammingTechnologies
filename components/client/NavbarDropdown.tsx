"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface DropdownItem {
    label: string;
    href: string;
}

interface NavbarDropdownProps {
    title: string;
    items: DropdownItem[];
    columns?: 1 | 2 | 3;
    active?: boolean;
}

export default function NavbarDropdown({
    title,
    items,
    columns = 2,
    active = false,
}: NavbarDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Cấu hình độ rộng và số cột
    const gridColsClass =
        columns === 3
            ? "grid-cols-3 min-w-[420px] sm:min-w-[480px]"
            : columns === 2
            ? "grid-cols-2 min-w-[260px] sm:min-w-[300px]"
            : "grid-cols-1 min-w-[180px]";

    return (
        <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors ${
                    active || isOpen ? "text-white font-bold" : "text-gray-300 hover:text-white"
                }`}
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#E50914]" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Menu Popover */}
            {isOpen && (
                <div
                    className={`absolute top-full left-0 mt-2 bg-[#181818] border border-[#2E2E2E] rounded-md shadow-2xl shadow-black/90 p-3 sm:p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${gridColsClass} grid gap-x-4 gap-y-2`}
                >
                    {items.map((item, index) => (
                        <Link
                            key={`${item.href}-${index}`}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-xs sm:text-sm text-zinc-300 hover:text-[#E50914] hover:bg-white/5 px-2 py-1.5 rounded transition-all truncate block"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
