<div align="center">

# 🎬 MovieHub — Modern Cinema Exploration

**Hệ sinh thái khám phá điện ảnh hiện đại chuẩn phong cách Netflix Dark Cinema, khai thác chuyên sâu kiến trúc Next.js 16 App Router, React Server Components (RSC) và Parallel Streaming UI.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-43%2F43%20Passing-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/api/test.html)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[📖 Báo Cáo Đồ Án](baocao/baocao.pdf) · [🧪 Hands-on Lab](labs/streaming-cache/README.md)

<br />

</div>

---

## ✨ Tính Năng Nổi Bật (Key Features)

- ⚡ **Zero-Bundle Interleaving Slider:** Trang chủ dựng thẻ `<MovieCard />` trên server rồi truyền dưới dạng `cards: ReactNode[]` cho client slider `MovieRow` (`'use client'`), giúp thanh cuộn tương tác mượt mà mà không nạp component MovieCard vào client JavaScript bundle.
- 🌊 **Parallel Streaming UI với React Suspense:** Trang chi tiết phim (`/movie/[id]`) hiển thị ngay thông tin chính; dàn diễn viên (`CastList`) và phim tương tự (`SimilarMovies`) được bọc trong các ranh giới `<Suspense>` độc lập, stream song song về trình duyệt ngay khi TMDB API phản hồi.
- ⚡ **Dynamic SSR & Data Cache Revalidation:** Trang chủ và Sitemap sử dụng `await connection()` để chỉ truy vấn dữ liệu khi có request thực tế (không gọi API lúc build-time), kết hợp cơ chế lưu đệm có thời hạn qua `fetch(url, { next: { revalidate: N } })` (Trending 1h, Now Playing 30m, Top Rated 24h).
- 🔒 **Server Actions & Watchlist An Toàn (RFC 6265):** Đột biến dữ liệu không cần Database trung gian thông qua Server Action ghi Cookie `mh_watchlist` (`httpOnly: true`, `sameSite: "lax"`, tối đa 200 ID, dưới 3.800 bytes). Giao diện tích hợp React 19 `useOptimistic` cập nhật tức thời và tự động rollback nếu gặp sự cố.
- 🔍 **Live Search Route Handler & Mega Menu Lọc Đa Chiều:** Header tích hợp Live Search Preview gọi Route Handler `GET /api/search?q=...` với Debounce 300ms và `AbortController`. Trang `/browse` cung cấp bộ lọc 5 tiêu chí đồng bộ 2 chiều với URL SearchParams qua `useTransition`.
- 🛡️ **Xử Lý Lỗi Tầng Root & Tự Phục Hồi (Resilience):** Cấu trúc đầy đủ `app/error.tsx` (có nút thử lại), `app/global-error.tsx` và `app/not-found.tsx`. Tự động bẫy lỗi HTTP 404, phim trong Watchlist bị xóa hoặc fallback sang tìm kiếm YouTube khi trailer không khả dụng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Tầng công nghệ       | Công nghệ / Thư viện                                  | Vai trò trong hệ thống                                                   |
| :------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------- |
| **Core Framework**   | [Next.js 16.4.5](https://nextjs.org/) (App Router)    | Server Components, Streaming Suspense, Server Actions, Route Handlers    |
| **Frontend Library** | [React 19.2.8](https://react.dev/)                    | React Server Components (RSC), `useOptimistic`, `useTransition`, Actions |
| **Ngôn ngữ**         | [TypeScript 5.x](https://www.typescriptlang.org/)     | Strict Type Checking, định nghĩa kiểu TMDB an toàn (`types/tmdb.d.ts`)   |
| **Styling & Theme**  | [Tailwind CSS v4](https://tailwindcss.com/)           | Netflix Dark Cinema Design System (`#141414`, `#E50914`, `#FFFFFF`)      |
| **Data Source**      | [TMDB REST API v3](https://developer.themoviedb.org/) | Nguồn dữ liệu phim ảnh, diễn viên, video trailer trực tuyến              |
| **Testing**          | Node.js Native Test Runner                            | Bộ 43 bài test tự động không cần thư viện bên thứ ba (`node --test`)     |
| **Tự động hóa & CI** | GitHub Actions & Webpack                              | Build Webpack cô lập, kiểm tra lint, type-check, evidence loopback mock  |

---

## ⚙️ Yêu Cầu Cài Đặt Trước (Prerequisites)

- **Node.js:** Phiên bản `>= 24.0.0` (Khuyến nghị bản LTS v24+)
- **Trình quản lý gói:** `npm` (đi kèm Node.js)
- **Khóa API TMDB:** Đăng ký miễn phí tại [themoviedb.org](https://www.themoviedb.org/settings/api) để nhận API Key (v3 auth).

---

## 🚀 Hướng Dẫn Cài Đặt (Installation & Setup)

1. **Clone mã nguồn dự án:**

    ```bash
    git clone https://github.com/congquan92/ModernProgrammingTechnologies.git
    cd ModernProgrammingTechnologies
    ```

2. **Cài đặt các gói phụ thuộc:**

    ```bash
    npm ci
    ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local` từ mẫu [`.env.example`](.env.example):

    ```bash
    cp .env.example .env.local
    ```

    Mở file `.env.local` và điền API Key TMDB của bạn:

    ```env
    TMDB_API_KEY=your_actual_tmdb_api_key_here
    TMDB_BASE_URL=https://api.themoviedb.org/3
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4. **Khởi chạy máy chủ phát triển:**
    ```bash
    npm run dev
    ```
    Truy cập ứng dụng tại `http://localhost:3000`.

---

## 💻 Các Lệnh Vận Hành & Kiểm Thử (Commands)

| Lệnh thực thi      | Mục đích sử dụng                                                                   |
| :----------------- | :--------------------------------------------------------------------------------- |
| `npm run dev`      | Khởi chạy máy chủ phát triển (Hot-reload) tại cổng 3000                            |
| `npm run build`    | Biên dịch bản production bằng Webpack (không phụ thuộc mạng TMDB)                  |
| `npm run start`    | Khởi chạy Production Server sau khi đã hoàn tất build                              |
| `npm test`         | Chạy toàn bộ **43 bài test tự động** bằng Node Native Test Runner                  |
| `npm run evidence` | Chạy pipeline nghiệm thu toàn diện (mock loopback, HTTP, cache, streaming, Chrome) |
| `npm run lab`      | Chạy bộ kiểm chứng độc lập cho Hands-on Lab Streaming & Data Cache                 |
| `npm run lint`     | Kiểm tra toàn bộ cú pháp và quy chuẩn mã nguồn với ESLint                          |
| `npx tsc --noEmit` | Kiểm tra tính tương thích kiểu dữ liệu TypeScript (Strict mode)                    |

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
modern-programming-technologies/
├── app/                          # Next.js 16 App Router (File-system routing)
│   ├── layout.tsx                # Root layout (Header, Footer, Google Geist fonts)
│   ├── page.tsx                  # Trang chủ Server Component (4 danh mục song song)
│   ├── browse/page.tsx           # Khám phá phim với FilterBar và phân trang
│   ├── search/page.tsx           # Kết quả tìm kiếm theo từ khóa có bộ lọc
│   ├── movie/[id]/page.tsx       # Chi tiết phim với React Suspense Parallel Streaming
│   ├── watchlist/page.tsx        # Danh sách phim yêu thích cá nhân (đọc từ Cookie)
│   ├── actions/watchlist.ts      # Server Action mutation Watchlist an toàn
│   ├── api/search/route.ts       # Route Handler GET phục vụ Live Search Preview
│   ├── error.tsx / global-error  # Error Boundaries xử lý sự cố runtime tầng Root
│   ├── not-found.tsx             # Giao diện 404 chuẩn điện ảnh
│   └── sitemap.ts / robots.ts    # Dynamic SEO Metadata
├── components/
│   ├── client/                   # Client Components ("use client": Header, MovieRow, FilterBar...)
│   └── server/                   # Server Components (MovieCard, CastList, SimilarMovies...)
├── services/                     # Tầng kết nối dữ liệu TMDB & Data Cache
│   ├── client.ts                 # Hàm fetchTMDB, kiểm tra khóa API, cấu hình cache
│   ├── movies.ts / discover.ts   # Nghiệp vụ lấy phim thịnh hành, đang chiếu, bộ lọc
│   └── search.ts / videos.ts     # Tìm kiếm từ khóa và thuật toán chọn YouTube trailer
├── tests/                        # 43 bài test Node Native Runner
├── labs/streaming-cache/         # Gói bài thực hành Hands-on Lab (README, WORKSHEET, SOLUTION, patch)
├── baocao/                       # Báo cáo học thuật LaTeX (baocao.tex, PDF 79 trang, minh chứng)
├── individual/                   # Báo cáo cá nhân thành viên và biên bản làm việc nhóm
└── next.config.ts                # Cấu hình Next.js, HTTP Security Headers, remotePatterns
```

---

<!-- ## 🧪 Hands-on Lab & Hồ Sơ Bàn Giao

- **Hands-on Lab (40 phút):** Tài liệu thực hành độc lập dành cho sinh viên/nhóm khác tìm hiểu về Server/Client Boundary, Suspense Streaming và Data Cache tại [`labs/streaming-cache/README.md`](labs/streaming-cache/README.md) (đi kèm [Phiếu bài làm](labs/streaming-cache/WORKSHEET.md), [Lời giải chi tiết](labs/streaming-cache/SOLUTION.md) và `starter.patch`).
- **Báo cáo học thuật chính:** Toàn văn báo cáo 79 trang trình bày chi tiết cơ sở lý thuyết, kiến trúc và ma trận kiểm chứng tại [`baocao/baocao.pdf`](baocao/baocao.pdf).
- **Hồ sơ cá nhân & Biên bản:** Lưu trữ tại thư mục [`individual/`](individual/) gồm báo cáo cá nhân của từng thành viên và biên bản làm việc nhóm 9 tuần. -->

## 👥 Thành Viên Thực Hiện (Authors)

Đồ án được thực hiện bởi **Nhóm 21** — Học phần _Các Công nghệ Lập trình Hiện đại_, Khoa Công nghệ Thông tin, **Trường Đại học Sài Gòn (SGU)**:

- **Giảng viên hướng dẫn:** ThS. Phạm Thi Vương
- **Sinh viên thực hiện:**
    - **Nguyễn Công Quân (Trưởng nhóm)** — MSSV: `3123560070` _(Kiến trúc hệ thống, Server Components, Zero-Bundle Slider, Data Fetching song song)_
    - **Nguyễn Quốc Đại** — MSSV: `3123560013` _(Kiểm toán kiến trúc, Error Boundaries tầng Root, SEO Metadata, Security Headers, 43 Unit Tests)_
    - **Nguyễn Thái Vinh** — MSSV: `3123410433` _(Server Actions Mutation, Cookie RFC 6265, Optimistic UI, Live Search, Bộ lọc đa chiều)_

---
