import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/client/Header";
import Footer from "@/components/server/Footer";

// Tối ưu hóa font chữ bằng next/font (Tầng 1A & Tầng 2)
// Tự động tải trước font và nhúng thẳng vào CSS, không phát sinh thêm HTTP request ra ngoài
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "MovieHub - Tra cứu & Khám phá Phim ảnh",
        template: "%s | MovieHub",
    },
    description: "Ứng dụng tra cứu và khám phá phim ảnh xây dựng với Next.js App Router, Server Components và The Movie Database (TMDB) API.",
    keywords: ["Next.js", "Movie App", "TMDB", "Server Components", "ISR", "React 19"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-[#141414] text-white">
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
            </body>
        </html>
    );
}
