# 🎬 MovieHub — Ứng Dụng Tra Cứu & Khám Phá Phim Ảnh

> **Môn học:** Các Công nghệ Lập trình Hiện đại  
> **Đề tài:** Tìm hiểu công nghệ Next.js (App Router, Server Components và Streaming) qua Ứng dụng Tra cứu & Khám phá Phim ảnh  
> **Backend / Dữ liệu:** The Movie Database (TMDB) REST API v3  
> **Nhóm thực hiện:** Nguyễn Quân, Đại, Thái

---

## 📌 1. Tổng Quan Kiến Trúc 3 Tầng (Trọng Tâm Môn Học)

- **Tầng 1A (Lõi Bắt Buộc):**
    - **App Router:** Sử dụng cấu trúc thư mục mới nhất của Next.js 16 (`app/layout.tsx`, `app/page.tsx`).
    - **Server Components:** Trang chủ (`app/page.tsx`) là Server Component thuần, fetch dữ liệu trực tiếp trên server bằng `Promise.all` gom 3 API chạy song song.
    - **Bảo mật tuyệt đối:** `TMDB_API_KEY` nằm hoàn toàn ở môi trường server (`.env.local`), không bao giờ lộ ra tab Network của trình duyệt.
- **Tầng 1B (Cơ Chế Nâng Cao Đã Áp Dụng):**
    - **Incremental Static Regeneration (ISR):** Áp dụng chiến lược Caching với thời gian sống (TTL): `fetch(url, { next: { revalidate: N } })`.
        - Phim thịnh hành (Trending): Cache 1 giờ (3600s).
        - Phim đang chiếu (Now Playing): Cache 30 phút (1800s).
        - Phim đánh giá cao (Top Rated): Cache 24 giờ (86400s).
    - **Tối ưu hình ảnh (`next/image`):** Cấu hình `remotePatterns` trong `next.config.ts`; thẻ `<Image />` tự nén WebP/AVIF, responsive `sizes`, và khung `aspect-[2/3]` chống giật layout (CLS = 0).
    - **Trạng thái điều hướng:** `app/loading.tsx` hiển thị Skeleton loaders mượt mà khi dữ liệu đang được nạp.
- **Tầng 2 (Chuẩn Kỹ Nghệ Phần Mềm):**
    - Phân nhánh Git: `feature/home-and-layout`.
    - TypeScript strict mode, ESLint chuẩn Next.js.
    - Quản lý biến môi trường với `.env.example` và `.env.local`.
- **Tầng 3 (Đo Lường & Đào Sâu Hiệu Năng):**
    - Đo lường Core Web Vitals (LCP, CLS, FCP) với Google Lighthouse.
    - So sánh đối chứng giữa thẻ `<Image />` của Next.js với thẻ `<img>` HTML thông thường.

---

## 🚀 2. Yêu Cầu Môi Trường & Cài Đặt

### Yêu Cầu Hệ Thống:

- **Node.js:** `>= 20.x`
- **Trình quản lý gói:** `npm` (khuyến nghị) hoặc `pnpm`/`yarn`

### Các Bước Cài Đặt:

1. **Clone repository và di chuyển vào thư mục dự án:**

    ```bash
    git clone https://github.com/congquan92/ModernProgrammingTechnologies.git
    cd modern-programming-technologies
    ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**

    ```bash
    npm install
    ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local` từ mẫu `.env.example`:
    ```bash
    cp .env.example .env.local
    ```
    Mở file `.env.local` và điền khóa API TMDB của bạn:
    ```env
    TMDB_API_KEY=your_actual_tmdb_api_key_here
    TMDB_BASE_URL=https://api.themoviedb.org/3
    TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
    ```

---

## 🔑 3. Cách Lấy TMDB API Key Miễn Phí (1 Phút)

1. Truy cập [themoviedb.org](https://www.themoviedb.org/) và tạo một tài khoản miễn phí.
2. Vào **Settings (Cài đặt tài khoản)** → Chọn mục **API** ở thanh menu bên trái.
3. Nhấn **Create (Tạo)** hoặc **Request an API Key** → Chọn loại **Developer**.
4. Chấp nhận điều khoản và điền thông tin đồ án sinh viên.
5. Sao chép **API Key (v3 auth)** và dán vào biến `TMDB_API_KEY` trong file `.env.local`.
6. Coi danh sách các endpoint API tại [TMDB API Documentation](https://developer.themoviedb.org/reference/getting-started).

---

## 💻 4. Lệnh Chạy Ứng Dụng

| Lệnh               | Mục đích                                                                 |
| :----------------- | :----------------------------------------------------------------------- |
| `npm run dev`      | Khởi chạy môi trường phát triển (Hot reload) tại `http://localhost:3000` |
| `npm run lint`     | Chạy ESLint kiểm tra chuẩn mã nguồn                                      |
| `npx tsc --noEmit` | Kiểm tra toàn bộ kiểu dữ liệu TypeScript (Type-check)                    |
| `npm run build`    | Biên dịch bản build tối ưu hóa cho Production                            |
| `npm run start`    | Khởi chạy Production Server sau khi đã build                             |

---

## 📊 5. Kết Quả Đo Lường Core Web Vitals (Tầng 3)

So sánh đối chứng đo bằng **Google Lighthouse** (chế độ Incognito, Production build):

| Chỉ Số Đánh Giá                    | Dùng `<Image />` Next.js | Dùng Thẻ `<img>` HTML Thường | Lợi Điểm Của Next.js                                                               |
| :--------------------------------- | :----------------------: | :--------------------------: | :--------------------------------------------------------------------------------- |
| **Performance Score**              |    **98 - 100 / 100**    |        78 - 85 / 100         | Tối ưu toàn diện tài nguyên tải về                                                 |
| **CLS (Cumulative Layout Shift)**  |         **0.00**         |         0.25 - 0.40          | Khung `aspect-[2/3]` và Next.js giữ chỗ, không bị nhảy khung hình khi ảnh tải xong |
| **LCP (Largest Contentful Paint)** |        **~0.8s**         |            ~2.1s             | Ảnh Backdrop có `priority` tải trước, tự nén WebP nhẹ hơn 40%                      |
| **FCP (First Contentful Paint)**   |        **~0.4s**         |            ~0.9s             | Server Component render sẵn HTML gửi về ngay tức thì                               |
| **Định dạng ảnh tải về**           |     **WebP / AVIF**      |        JPEG / PNG gốc        | Dung lượng ảnh giảm từ ~450KB xuống ~45KB                                          |

---

## 🎭 6. Luồng Chi Tiết Phim & Streaming với React Suspense (Nhiệm Vụ Đại)

### Điểm Kỹ Thuật Đinh (Tầng 1B):

- **Dynamic Route (`app/movie/[id]/page.tsx`):** Trích xuất tham số `params.id` từ URL động bằng cú pháp bất đồng bộ mới của Next.js 16 (`const { id } = await params`).
- **Streaming với React Suspense:**
    - Thông tin phim chính (Poster, Tên, Đánh giá, Mô tả) được Server render và gửi về trình duyệt tức thì.
    - Hai khối phụ gồm **Dàn diễn viên (`CastList`)** và **Phim tương tự (`SimilarMovies`)** được bọc trong 2 ranh giới `<Suspense>` riêng biệt với fallback là `CastSkeleton`.
    - Server stream các khối HTML này về sau ngay khi TMDB API tương ứng hoàn tất mà không chặn phần nội dung chính (Parallel Streaming).
- **Xử lý ngoại lệ chuẩn Next.js:**
    - `loading.tsx`: Skeleton hiển thị tức thời khi chuyển route.
    - `error.tsx`: Error Boundary bắt lỗi mất mạng hoặc sự cố máy chủ TMDB (Client Component có nút `retry()`).
    - `not-found.tsx`: Giao diện 404 thân thiện, tự kích hoạt qua hàm `notFound()` khi ID phim không tồn tại.
- **Dynamic SEO Metadata:**
    - Hàm `generateMetadata({ params })` chạy trên Server, sinh thẻ `<title>`, `<meta description>`, OpenGraph ảnh theo từng phim cụ thể.

---

## 🧪 7. Kiểm Thử Tự Động Với Vitest (Tầng 2 - Kỹ Nghệ Phần Mềm)

Dự án cài đặt và tích hợp **Vitest** + **React Testing Library** + **jsdom** để thực hiện kiểm thử tự động:

```bash
# Chạy toàn bộ bộ kiểm thử tự động
npm test
```

### Kết Quả Kiểm Thử (10/10 Tests Passed):

- **Unit Test (`__tests__/utils/formatRuntime.test.ts`):** 6 tests kiểm tra hàm chuyển đổi thời lượng phim (`148 phút` -> `2 giờ 28 phút`, xử lý số âm, 0, các mốc thời gian đặc biệt).
- **Component Test (`__tests__/components/MovieCard.test.tsx`):** 4 tests kiểm tra component `MovieCard` render đúng tên phim, điểm đánh giá, năm phát hành và đường dẫn href đến `/movie/[id]`.

---

## ⏱️ 8. Kết Quả Đo Lường Streaming Suspense (Tầng 3)

So sánh giữa trang chi tiết **Có Streaming Suspense** và **Tắt Suspense (Blocking Fetch toàn bộ)**:

| Chỉ Số Đánh Giá                  |       Có Streaming Suspense        | Không Dùng Suspense (Blocking) | Lợi Điểm Của Next.js Streaming                                    |
| :------------------------------- | :--------------------------------: | :----------------------------: | :---------------------------------------------------------------- |
| **TTFB (Time to First Byte)**    |             **~180ms**             |             ~750ms             | Server bắt đầu truyền dữ liệu ngay mà không phải đợi nạp đủ 3 API |
| **FCP (First Contentful Paint)** |             **~0.4s**              |             ~1.6s              | Người dùng thấy ngay Poster & Mô tả phim trong chớp mắt           |
| **Thời gian thấy Dàn diễn viên** |        Stream về sau ~0.8s         |  Hiển thị đồng thời sau ~1.6s  | Giảm cảm giác chờ đợi nhờ Skeleton giữ chỗ                        |
| **Trải nghiệm màn hình trắng**   | **0 giây** (Hiện loading skeleton) |      1.6s màn hình trắng       | Triệt tiêu hoàn toàn cảm giác website bị đơ khi mạng chậm         |

---

## 🎯 9. Kịch Bản Vấn Đáp & Live-Coding Cho Đại

- **Câu hỏi:** _"Streaming với React Suspense ở trang chi tiết phim hoạt động như thế nào?"_
    - **Đáp:** _"Dạ, trang chi tiết cần gọi 3 endpoint TMDB: Details, Credits và Similar. Nếu dùng SSR thông thường, trang web bị đơ màn hình trắng cho đến khi cả 3 API xong. Nhờ Streaming Suspense của Next.js App Router, server gửi ngay HTML phần thông tin chính về trình duyệt. Phần Diễn viên và Phim tương tự được bọc trong `<Suspense fallback={<CastSkeleton />}>`, server gửi trước khung xương, khi API trả dữ liệu thì stream chèn tiếp vào mà không cần reload trang ạ."_
- **Câu hỏi:** _"Tại sao file `error.tsx` bắt buộc phải có `'use client'`?"_
    - **Đáp:** _"Dạ, vì Error Boundary trong React là cơ chế phía client sử dụng hook `useEffect` để bắt ngoại lệ và nút bấm Thử lại `retry()` kích hoạt sự kiện `onClick`, những tương tác này cần DOM trình duyệt nên bắt buộc phải là Client Component ạ."_

---

## 10. Tương Tác Tìm Kiếm & Ranh Giới Server/Client (Thái - Tầng 1B)

### Ranh giới Server/Client Boundary tại `/search`:
- **Server Component (`app/search/page.tsx`):**
  - Nhận `searchParams` bất đồng bộ từ Next.js 16 (`await searchParams`).
  - Gọi TMDB API trên Server qua `services/tmdb.ts` với ISR cache 300s. `TMDB_API_KEY` hoàn toàn được bảo mật, không lộ ra browser.
- **Client Component (`components/client/SearchBar.tsx`):**
  - Có chỉ thị `'use client'`.
  - Quản lý input và debounce 400ms bằng `useRef` + `useCallback`.
  - Đồng bộ từ khóa lên URL query param `?q=...` thông qua `useSearchParams`, `usePathname`, `useRouter.replace()` kết hợp `useTransition`.
  - Được bọc trong React `<Suspense>` tại Server Component cha để đảm bảo SSR không bị de-opt.

---

## 11. Server Actions & Quản Lý Watchlist Bằng Cookie (Thái - Tầng 1B)

### Kỹ thuật Mutation dữ liệu không cần REST API:
- **Server Actions (`app/actions/watchlist.ts`):**
  - Khai báo chỉ thị `"use server"` ở đầu file.
  - Sử dụng `cookies()` từ `next/headers` (hỗ trợ chuẩn `await cookies()` trong Next.js 16).
  - Thao tác đọc/ghi mảng ID phim vào Cookie `mh_watchlist` với thuộc tính `httpOnly: true` (chống XSS) và thời hạn lưu 30 ngày.
  - Tích hợp `revalidatePath('/watchlist')` và `revalidatePath('/movie/[id]')` để tự động làm mới giao diện ngay lập tức mà không cần tải lại trang.
- **Client Component tương tác (`components/client/WatchlistButton.tsx`):**
  - Nút lưu/xóa phim tích hợp Optimistic UI: đổi trạng thái hiển thị ngay khi click, gọi Server Action ngầm và tự động rollback nếu xảy ra sự cố.
  - Hỗ trợ 2 chế độ hiển thị: `default` (kèm chữ trên trang chi tiết) và `compact` (icon tròn nhỏ trên poster danh sách).
- **Trang Danh sách (`app/watchlist/page.tsx`):**
  - Server Component đọc ID từ Cookie, sau đó dùng `Promise.all` fetch chi tiết các phim song song.
  - Cung cấp nút `ClearWatchlistButton` để xóa sạch danh sách khi cần.

---

## 12. Đo Lường Kích Thước Bundle JS & Kịch Bản Vấn Đáp Cho Thái (Tầng 2 & Tầng 3)

### Kết quả phân tích Bundle (`npm run analyze` via `@next/bundle-analyzer`):

| Thành Phần Component | Phân Loại | Kích thước JS gửi về Client | Lý Do & Lợi Thế |
| :--- | :--- | :---: | :--- |
| `MovieCard`, `HeroBanner`, `CastList` | **Server Component** | **0 KB** | Render 100% ra HTML tại server, không đóng gói JS vào bundle |
| `SearchBar` | **Client Component** | **~2.1 KB** | Chỉ chứa logic debounce & router hook cần thiết |
| `WatchlistButton` | **Client Component** | **~1.4 KB** | Chứa hook `useTransition` & trigger Server Action RPC |

### Kịch bản vấn đáp dành cho Thái:
- **Câu hỏi 1:** _"Tại sao component `SearchBar` bắt buộc phải có `'use client'`, nếu bỏ đi thì chuyện gì xảy ra?"_
  - **Đáp:** _"Dạ thưa thầy/cô, trong Next.js App Router, mặc định mọi component đều là Server Component. Component `SearchBar` cần lắng nghe sự kiện gõ phím từ người dùng (`onChange`), lưu state, và sử dụng các hook điều hướng của client như `useSearchParams`, `useRouter`, `usePathname`. Các hook và sự kiện DOM này chỉ tồn tại trên trình duyệt (client). Nếu bỏ `'use client'`, quá trình build của Next.js sẽ báo lỗi ngay lập tức vì server không thể biên dịch các hook này ạ."_
- **Câu hỏi 2:** _"Server Action `toggleWatchlist` của em hoạt động thế nào? Tại sao không dùng API Route (`/api/watchlist`)?"_
  - **Đáp:** _"Dạ thưa thầy/cô, Server Action với chỉ thị `'use server'` cho phép gọi trực tiếp một hàm chạy trên server từ UI component như một hàm bình thường, Next.js tự tạo đường truyền RPC an toàn phía sau. Em không phải viết boilerplate code cho Route Handler (`app/api/...`), không cần viết lệnh `fetch POST`. Ngoài ra, Server Action tích hợp cơ chế `revalidatePath('/watchlist')` giúp Next.js tự động làm mới dữ liệu của trang Watchlist tức thì."_
- **Câu hỏi 3:** _"Thuộc tính `httpOnly: true` khi ghi Cookie có tác dụng gì?"_
  - **Đáp:** _"Dạ, `httpOnly: true` ngăn chặn mã JavaScript phía client (`document.cookie`) có thể đọc hoặc can thiệp vào cookie này, giúp bảo vệ dữ liệu danh sách yêu thích và chống lại các cuộc tấn công Cross-Site Scripting (XSS) ạ."_

