# ĐỀ CƯƠNG ĐỀ TÀI MÔN CÔNG NGHỆ LẬP TRÌNH HIỆN ĐẠI

## TÊN ĐỀ TÀI:
> **Tìm hiểu công nghệ Next.js (App Router, Server Components và Streaming) qua Ứng dụng Tra cứu & Khám phá Phim ảnh**

---

## 1. THÔNG TIN TỔNG QUAN

* **Môn học**: Các Công nghệ Lập trình Hiện đại
* **Track**: Web Frontend
* **Công nghệ trọng tâm**: **Next.js (App Router) / React 19**
* **Nguồn Backend / Dữ liệu**: **The Movie Database (TMDB) REST API v3** (Sử dụng API có sẵn, không xây dựng backend riêng theo đúng định hướng môn học).
* **Mục tiêu**: Làm chủ các cơ chế cốt lõi tạo nên sự khác biệt giữa Next.js App Router và React SPA truyền thống: Server Components, ranh giới Server/Client, Streaming với Suspense, Caching/Revalidation, tối ưu hóa đa phương tiện (`next/image`) và Dynamic SEO Metadata.

---

## 2. BẢNG PHÂN RÃ KỸ THUẬT THEO CHUẨN ĐÁNH GIÁ (3 TẦNG)

### 📌 TẦNG 1A — LÕI BẮT BUỘC (Hiểu bản chất Next.js)

1. **App Router & Cấu trúc thư mục:**
   * Tổ chức layout, page theo kiến trúc thư mục chuẩn (`app/layout.tsx`, `app/page.tsx`, `app/movie/[id]/page.tsx`).
   * Phân cấp layout dùng chung: Root Layout (Header, Navbar, Footer) không bị re-render khi chuyển trang.
2. **Phân định rõ ranh giới Server Component và Client Component:**
   * **Server Component (mặc định):** Trang chủ (`/`), Trang chi tiết phim (`/movie/[id]`), Trang danh mục. Thực hiện fetch dữ liệu trực tiếp trên server, giảm tải dung lượng Javascript gửi về trình duyệt.
   * **Client Component (`"use client"`):** Chỉ dùng ở những thành phần thực sự cần tương tác người dùng: Thanh tìm kiếm (SearchBar với debounce), Nút bấm lưu yêu thích (FavoriteButton), Modal xem Trailer phim.
3. **Data Fetching phía Server:**
   * Gọi dữ liệu trực tiếp trong Server Components bằng `fetch()`.
   * **Bảo mật:** API Key của TMDB (`TMDB_API_KEY`) nằm hoàn toàn ở môi trường server, không bao giờ lộ ra tab Network của trình duyệt.
4. **Luồng Render chính:**
   * Request từ trình duyệt -> Next.js Server nhận route -> Gọi TMDB API -> Render HTML phía server -> Trả về Client hiển thị ngay lập tức (kèm hydration cho các Client Components).

---

### 📌 TẦNG 1B — CÁC CƠ CHẾ TỰ CHỌN THEO ĐẶC THÙ ỨNG DỤNG

1. **Dynamic Routes & Xử lý trạng thái điều hướng:**
   * Dynamic route: `app/movie/[id]/page.tsx` hiển thị thông tin chi tiết phim theo ID.
   * `loading.tsx`: Hiển thị Skeleton loader mượt mà khi dữ liệu đang được nạp.
   * `error.tsx`: Bắt lỗi khi API TMDB bị sự cố hoặc timeout, có nút "Thử lại" (Retry).
   * `not-found.tsx`: Hiển thị giao diện 404 thân thiện khi người dùng truy cập ID phim không tồn tại trong hệ thống TMDB.
2. **Streaming với React Suspense:**
   * Tại trang chi tiết phim (`/movie/[id]`):
     * Phần thông tin tổng quan (Poster, Tiêu đề, Điểm số, Tóm tắt) render và gửi về ngay lập tức.
     * Phần danh sách Diễn viên (Cast) và Phim tương tự (Similar Movies) được bọc trong `<Suspense fallback={<CastSkeleton />}>` để stream về sau khi API phản hồi.
3. **Caching & Revalidation (ISR):**
   * Danh sách phim Trending / Top Rated áp dụng chiến lược Static Data với thời gian tái tạo định kỳ:
     `fetch('https://api.themoviedb.org/3/trending/movie/day', { next: { revalidate: 3600 } })` (Cache trong 1 giờ).
4. **Tối ưu hóa đa phương tiện & SEO:**
   * `next/image`: Tự động nén ảnh poster/backdrop phim sang định dạng WebP, lazy loading, responsive tự co giãn kích thước, chống giật layout (CLS).
   * `generateMetadata()`: Tự động trích xuất thông tin phim để sinh các thẻ SEO động (`<title>`, `<meta description>`, OpenGraph preview ảnh khi chia sẻ lên mạng xã hội).
5. **Server Actions (Xử lý thay đổi dữ liệu mà không cần Backend riêng):**
   * Tính năng "Thêm/Xóa phim khỏi Danh sách yêu thích" (Watchlist/Favorites).
   * Viết Server Action (`"use server"`) lưu danh sách ID phim vào Cookie trình duyệt bằng `cookies()` từ `next/headers` (hoặc kết nối Supabase bảng đơn giản).
   * Gọi `revalidatePath('/watchlist')` để cập nhật dữ liệu tức thì.

---

### 📌 TẦNG 2 — CHUẨN KỸ NGHỆ PHẦN MỀM (Bắt buộc để Đạt)

1. **Quản lý mã nguồn (Git Flow):**
   * Phân chia nhánh tính năng (`feature/home-page`, `feature/movie-detail`, `feature/watchlist`).
   * Sử dụng Pull Request (PR), review chéo giữa các thành viên, commit message rõ ràng (chuẩn Conventional Commits).
2. **Quản lý cấu hình & Bí mật:**
   * Lưu trữ `TMDB_API_KEY` và `TMDB_BASE_URL` trong file `.env.local`.
   * Cung cấp file `.env.example` với hướng dẫn cấu hình đầy đủ.
3. **Kiểm thử (Testing):**
   * Viết Unit/Component Test cơ bản với **Vitest** hoặc **Jest + React Testing Library** (ví dụ: test render thẻ Card phim, test format thời lượng phim, test format điểm số).
4. **CI & Kiểm tra tự động:**
   * Thiết lập **GitHub Actions** (`.github/workflows/ci.yml`) tự động chạy `npm run lint` và `npm run build` khi có Pull Request vào nhánh chính.
5. **Tài liệu kỹ thuật:**
   * `README.md` chỉ rõ phiên bản Node.js, lệnh cài đặt dependencies, cách lấy API key TMDB, lệnh chạy môi trường Dev và Production Build.

---

### 📌 TẦNG 3 — ĐÀO SÂU NÂNG CAO & ĐO LƯỜNG

* **Đo lường & Phân tích hiệu năng (Lighthouse / Core Web Vitals / Bundle Analyzer):**
  * Sử dụng `@next/bundle-analyzer` để phân tích dung lượng bundle Javascript tải về máy người dùng.
  * So sánh đối chứng:
    1. Kích thước bundle và chỉ số FCP/LCP khi giữ nguyên Server Component so với khi cố tình đánh dấu toàn bộ trang là `"use client"`.
    2. Chỉ số CLS (Cumulative Layout Shift) và tốc độ tải trang khi dùng `next/image` so với thẻ `<img>` HTML thông thường.
  * Lập bảng số liệu đo lường cụ thể đưa vào báo cáo nghiệm thu.

---

## 3. CẤU TRÚC THƯ MỤC DỰ KIẾN (SRC/APP)

```text
src/
├── app/
│   ├── layout.tsx                # Root layout (Header, Navbar, Footer)
│   ├── page.tsx                  # Trang chủ (Server Component: Trending, Now Playing)
│   ├── loading.tsx               # Skeleton loading cho trang chủ
│   ├── error.tsx                 # Error boundary bắt lỗi server
│   ├── movie/
│   │   └── [id]/
│   │       ├── page.tsx          # Chi tiết phim (Server Component + generateMetadata)
│   │       ├── loading.tsx       # Skeleton loading chi tiết phim
│   │       └── not-found.tsx     # Xử lý 404 khi ID phim không tồn tại
│   ├── search/
│   │   └── page.tsx              # Trang tìm kiếm kết hợp Server/Client Component
│   ├── watchlist/
│   │   └── page.tsx              # Danh sách phim yêu thích (lấy từ Cookie/Storage)
│   └── actions/
│       └── watchlist.ts          # Server Actions: toggleWatchlist()
├── components/
│   ├── server/                   # Các Server Components (MovieCard, MovieOverview)
│   └── client/                   # Các Client Components (SearchBar, FavoriteBtn, TrailerModal)
├── services/
│   └── tmdb.ts                   # Các hàm gọi API TMDB (chạy phía server)
└── types/
    └── tmdb.d.ts                 # Type definitions cho dữ liệu phim từ TMDB
```

---

## 4. HƯỚNG DẪN CẤU HÌNH NHANH CHO NHÓM

### Bước 1: Lấy TMDB API Key (Miễn phí)
1. Đăng ký tài khoản tại [themoviedb.org](https://www.themoviedb.org/).
2. Vào **Settings** -> **API** -> Chọn **Create/Request an API Key** -> Chọn mục **Developer**.
3. Điền thông tin đồ án sinh viên để nhận **API Key (v3 auth)** hoặc **API Read Access Token**.

### Bước 2: Khai báo biến môi trường (`.env.local`)
```env
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

### Bước 3: Cấu hình cho phép tải ảnh TMDB (`next.config.ts` hoặc `next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 5. DỰ KIẾN NỘI DUNG VẤN ĐÁP / KIỂM TRA THỰC HÀNH TẠI CHỖ

| Câu hỏi / Yêu cầu thực hành của Giảng viên | Hướng xử lý nhanh của nhóm |
| :--- | :--- |
| *"Tại sao trang chi tiết phim không dùng `useEffect` + `fetch`?"* | Trả lời: Trang dùng Server Component để fetch dữ liệu từ TMDB ngay tại server, giúp tăng tốc độ hiển thị trang đầu (FCP), tối ưu SEO và bảo mật API Key không bị lộ ra ngoài client. |
| *"Thành phần nào trên trang này bắt buộc phải là Client Component?"* | Chỉ ra `SearchBar` (cần lắng nghe sự kiện `onChange`, state của input) và `FavoriteButton` (cần sự kiện `onClick`). |
| *"Thầy muốn em thêm một trang Top Rated Movies ngay bây giờ."* | Tạo thêm thư mục `app/top-rated/page.tsx`, viết một Server Component gọi hàm `getTopRatedMovies()` từ `services/tmdb.ts` và tái sử dụng component `<MovieGrid />` có sẵn (khoảng 3 phút). |
| *"Hãy demo việc bắt lỗi khi người dùng gõ ID phim không có thật."* | Gọi hàm `notFound()` từ `next/navigation` khi TMDB trả về mã 404, Next.js sẽ tự động render file `not-found.tsx` đã thiết kế. |
