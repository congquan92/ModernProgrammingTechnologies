# 🎬 MovieHub — Ứng Dụng Tra Cứu & Khám Phá Phim Ảnh

> **Môn học:** Các Công nghệ Lập trình Hiện đại  
> **Đề tài:** Tìm hiểu công nghệ Next.js (App Router, Server Components và Streaming) qua Ứng dụng Tra cứu & Khám phá Phim ảnh  
> **Backend / Dữ liệu:** The Movie Database (TMDB) REST API v3  
> **Nhóm thực hiện:** Nguyễn Quân, Đại, Thái

---

## 📌 1. Tổng Quan Kiến Trúc 3 Tầng (Trọng Tâm Môn Học)

- **Tầng 1A (Lõi Bắt Buộc):**
    - **App Router:** Sử dụng cấu trúc thư mục mới nhất của Next.js 16 (`app/layout.tsx`, `app/page.tsx`).
    - **Server Components:** Trang chủ (`app/page.tsx`) lấy bốn nhóm dữ liệu song song trên server; `MovieCard` được dựng ở server rồi truyền cho thanh cuộn client.
    - **Khóa TMDB:** `TMDB_API_KEY` được đọc ở tầng dịch vụ server. Không đưa khóa vào `NEXT_PUBLIC_` hoặc props của Client Component.
- **Tầng 1B (Cơ Chế Nâng Cao Đã Áp Dụng):**
    - **Data Cache và revalidation:** Cache kết quả TMDB có thời hạn qua `fetch(url, { next: { revalidate: N } })`.
        - Phim thịnh hành (Trending): Cache 1 giờ (3600s).
        - Phim đang chiếu (Now Playing): Cache 30 phút (1800s).
        - Phim đánh giá cao (Top Rated): Cache 24 giờ (86400s).
    - Trang chủ và sitemap dùng `await connection()` để render khi có request, không gọi TMDB lúc build. Các fetch vẫn có Data Cache theo thời hạn; trang chủ truyền lỗi tải danh mục tới error boundary. Đây là SSR với Data Cache, không phải ISR của toàn trang.
    - **Hình ảnh (`next/image`):** Có `remotePatterns`, `sizes` đáp ứng màn hình và khung poster tỉ lệ 2:3. Chưa đo CLS thực tế.
    - **Trạng thái điều hướng:** `app/loading.tsx` hiển thị Skeleton loaders mượt mà khi dữ liệu đang được nạp.
- **Tầng 2 (Chuẩn Kỹ Nghệ Phần Mềm):**
    - Phân nhánh Git: `feature/home-and-layout`.
    - TypeScript strict mode, ESLint chuẩn Next.js.
    - Quản lý biến môi trường với `.env.example` và `.env.local`.
    - Test Node kiểm tra logic và render các trang thật; GitHub Actions chạy `npm run evidence` bằng mock, không cần secret TMDB.
    - Codex hỗ trợ rà soát và sửa mã nguồn. Thay đổi được kiểm chứng bằng lint, test, build và kiểm tra trình duyệt; nhóm vẫn chịu trách nhiệm khai báo theo quy định môn học và giải thích code độc lập.
- **Tầng 3 (Đo Lường & Đào Sâu Hiệu Năng):** Chưa có tệp Lighthouse, bundle analyzer hoặc trace đối chứng gốc; không công bố các chỉ số đó như kết quả đã đạt.

---

## 🚀 2. Yêu Cầu Môi Trường & Cài Đặt

### Yêu Cầu Hệ Thống:

- **Node.js:** `>= 24.0.0` (CI dùng Node.js 24; bộ test dùng khả năng chạy TypeScript của Node)
- **Framework:** Next.js `16.4.5`, React/React DOM `19.2.8`; phiên bản cài lại được chốt trong `package-lock.json`.
- **Trình quản lý gói:** `npm` (khuyến nghị) hoặc `pnpm`/`yarn`
- **Kiểm tra trình duyệt:** Chrome/Chromium; nếu không ở đường dẫn Linux thông dụng, đặt `CHROME_BIN` thành đường dẫn tệp thực thi. CI dùng Chrome có sẵn trên `ubuntu-latest`.

### Các Bước Cài Đặt:

1. **Clone repository và di chuyển vào thư mục dự án:**

    ```bash
    git clone https://github.com/congquan92/ModernProgrammingTechnologies.git
    cd ModernProgrammingTechnologies
    ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**

    ```bash
    npm ci
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
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

   Đổi `NEXT_PUBLIC_SITE_URL` thành URL triển khai khi xuất sitemap/robots. Ảnh dùng `image.tmdb.org` theo `remotePatterns` trong `next.config.ts`. Build cần tải Google Fonts; khóa và kết nối TMDB chỉ cần khi chạy ứng dụng. Dùng `npm run evidence` để kiểm tra với dữ liệu giả.

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
| `npm run lint`     | Chạy ESLint, thất bại nếu có bất kỳ warning nào                           |
| `npm test`         | Chạy bộ kiểm thử chính trong `tests/` bằng Node.js                         |
| `npm audit --audit-level=moderate` | Kiểm tra cảnh báo dependency; CI chặn từ mức moderate trở lên       |
| `npx tsc --noEmit` | Kiểm tra toàn bộ kiểu dữ liệu TypeScript (Type-check)                    |
| `npm run build`    | Biên dịch production bằng Webpack, không gọi TMDB                         |
| `npm run start`    | Khởi chạy Production Server sau khi đã build                             |

Các script cũ `scripts/test-suite.mjs` và `scripts/adversarial-probe.mjs` đã được thay thế bởi bộ test và quy trình minh chứng hiện tại. Dùng `npm test` cho kiểm thử logic; dùng `npm run evidence` cho kiểm chứng HTTP production với mock TMDB.

`package.json` chỉ override `minimatch` của `@typescript-eslint/typescript-estree` lên `11.0.1` để vá GHSA-g3hv-75wg-m249; upstream hiện vẫn yêu cầu bản 10 chưa vá. Bỏ override khi upstream dùng phiên bản đã vá. Callsite `minimatch(filePath, pattern, { dot: true })` giữ nguyên API; lint xác minh parser trên source thật.

---

## 📊 5. Bằng chứng hiện có và số đo cần bổ sung

### Biên dịch báo cáo LaTeX

Từ thư mục gốc repo, chạy `latexmk -xelatex -interaction=nonstopmode -halt-on-error -outdir=baocao/build baocao/baocao.tex` với MiKTeX hoặc TeX Live có XeLaTeX. PDF và tệp trung gian nằm trong `baocao/build/`; chép `baocao/build/baocao.pdf` sang `baocao/baocao.pdf` sau khi biên dịch thành công.

Để tự tạo lại log trên máy của bạn, chạy `powershell -ExecutionPolicy Bypass -File scripts/refresh-evidence.ps1`. Sau đó mở terminal khác chạy `npm run start`, rồi chạy `powershell -ExecutionPolicy Bypass -File scripts/refresh-evidence.ps1 -RuntimeOnly`. Script ghi lệnh, thời điểm, commit và exit code vào từng log; hãy chụp terminal sau khi lệnh chạy xong.

- `baocao/evidence/build-output.txt`: production build thường, phân loại trang chủ và sitemap là SSR; ghi số error/warning.
- `baocao/evidence/lint-output.txt`, `typecheck-output.txt`, `test-output.txt`: kết quả kiểm tra mã có lệnh và exit code.
- `baocao/evidence/server-render.txt`: kiểm tra HTML server qua HTTP sau `npm run start`; log cũ từ bản prerender cần đọc ngày/commit riêng.
- `baocao/evidence/runtime-http.txt`: route phim hợp lệ và giao diện không tìm thấy cho ID sai.
- `baocao/HUONG_DAN_THU_MINH_CHUNG.md`: các bước tự ghi video Watchlist, streaming và bộ đếm cache.
- Chưa có báo cáo Lighthouse hay phép so sánh `<Image />` với `<img>` trên cùng route và thiết bị. Muốn công bố LCP/CLS/FCP, hãy lưu tệp kết quả gốc, cấu hình thiết bị và URL đo.

### Kiểm chứng tự động bằng một lệnh

```powershell
npm run evidence
```

Lệnh chạy lint/test, tạo build production Webpack riêng trong `.next-evidence`, kiểm tra kiểu rồi khởi động mock TMDB và Next.js trên hai cổng loopback còn trống. Build thường và build minh chứng đều dùng Webpack được Next.js hỗ trợ, tránh lỗi cổng nội bộ của Turbopack trong môi trường hạn chế. Script từ chối warning/error trong log build và tự dừng các tiến trình đã tạo. Không cần khóa TMDB thật; build `.next` được giữ riêng. Đặt `MOVIEHUB_EVIDENCE_DIR` để ghi log ngoài `baocao/evidence`; CI ghi vào thư mục tạm.

- `baocao/evidence/mock-runtime.json`: trạng thái toàn bộ lượt chạy, phiên bản Node/Next, Git HEAD, trạng thái working tree và SHA-256 mã nguồn.
- `baocao/evidence/build-mock-output.txt`: bảng route production; trang chủ và sitemap là SSR. TTL **15 giây của Data Cache mock** được kiểm chứng khi chạy trong `cache-mock.json`.
- `baocao/evidence/routes-http.json`: bốn hàng phim có trong HTML server, Route Handler tìm kiếm trả kết quả, query lặp chạy được và ID phim sai có `noindex`.
- `baocao/evidence/streaming-mock.json`: thời điểm và số thứ tự chunk HTML của nội dung chính, hai fallback và hai kết quả. Với mock trì hoãn 2,5/4 giây, kết quả phải tới ở chunk sau và ít nhất 1 giây sau nội dung chính; gửi dồn nhiều chunk cùng lúc cũng bị từ chối.
- `baocao/evidence/cache-mock.json`: bộ đếm origin trước request, sau miss, hit, hết TTL và hit sau khi revalidate. Mỗi endpoint phải có chuỗi `0 → 1 → 1 → 2 → 2`; nội dung đổi từ “Phiên bản 1” sang “Phiên bản 2” sau revalidation.
- `baocao/evidence/watchlist-http.json`: POST Server Action thật, cờ cookie, thêm/xóa, tải lại `/watchlist` và kiểm tra phiên cookie khác vẫn trống. Không ghi giá trị cookie.
- `baocao/evidence/browser-interactions.json`: Chrome kiểm tra đổi bộ lọc liên tiếp, tìm kiếm chậm/Unicode, đồng bộ URL/Back/Forward, debounce kết hợp bộ lọc, rollback Watchlist, focus bàn phím, responsive header, carousel có nhiều thẻ và kích thước skeleton trước/sau streaming. Chạy qua Chrome DevTools Protocol bằng Node, không thêm thư viện test.

TTL ngắn chỉ được phép khi `TMDB_BASE_URL` là HTTP tại `127.0.0.1`; cấu hình này bị từ chối với TMDB thật. Đây là kiểm chứng HTTP với dữ liệu giả có độ trễ chủ động, không phải số đo Lighthouse, thời gian vẽ của trình duyệt, video giao diện hoặc shared cache tại CDN. Đọc ngày/commit trong từng log; các lượt build thường, mock và ảnh trình duyệt phải được phân biệt, không ghép thành cùng một lượt đo.

Lượt kiểm tra giao diện riêng có các ảnh `watchlist-browser-saved.png`, `watchlist-browser-list.png`, `watchlist-browser-removed.png` và ghi chú `watchlist-browser.json` trong thư mục minh chứng. Chúng ghi nhận thêm phim, giữ trạng thái sau reload, hiển thị danh sách và xóa phim; `npm run evidence` chạy kiểm tra HTTP và Chrome, không tự tạo lại các ảnh này.

---

## 🎭 6. Luồng Chi Tiết Phim & Streaming với React Suspense

### Cơ chế đang dùng (Tầng 1B):

- **Dynamic Route (`app/movie/[id]/page.tsx`):** Trích xuất tham số `params.id` từ URL động bằng cú pháp bất đồng bộ mới của Next.js 16 (`const { id } = await params`).
- **Streaming với React Suspense:**
    - Thông tin phim chính được server dựng sau khi có chi tiết phim, video và trạng thái Watchlist. Thời điểm hiển thị cần quan sát bằng trace.
    - Hai khối phụ **Dàn diễn viên (`CastList`)** và **Phim tương tự (`SimilarMovies`)** có hai ranh giới `<Suspense>` và fallback riêng.
    - Server stream các khối HTML này về sau ngay khi TMDB API tương ứng hoàn tất mà không chặn phần nội dung chính (Parallel Streaming).
- **Xử lý ngoại lệ chuẩn Next.js:**
    - `loading.tsx`: Skeleton hiển thị tức thời khi chuyển route.
    - `error.tsx`: Error Boundary bắt lỗi mất mạng hoặc sự cố máy chủ TMDB (Client Component có nút `retry()`).
    - `not-found.tsx`: Giao diện không tìm thấy khi gọi `notFound()`. Response đã stream có thể vẫn mang HTTP 200 nhưng có `robots=noindex` theo quy tắc Next.js.
- **Dynamic SEO Metadata:**
    - Hàm `generateMetadata({ params })` chạy trên Server, sinh thẻ `<title>`, `<meta description>`, OpenGraph ảnh theo từng phim cụ thể.

---

## ⏱️ 7. Cách chứng minh Streaming và Data Cache

Chạy `scripts/mock-tmdb-evidence.mjs` để có dữ liệu TMDB giả với thời gian chờ có kiểm soát. Sau đó build/start production với `TMDB_BASE_URL=http://127.0.0.1:4100/3` và khóa giả. `scripts/verify-stream-evidence.mjs` ghi thời điểm phần chính, fallback, diễn viên và phim tương tự đến client. Gọi cùng route hai lần và so bộ đếm `http://127.0.0.1:4100/_counts` để nhận diện cache miss/hit. Đây là thử nghiệm có độ trễ giả lập, không phải số đo Core Web Vitals trên TMDB thật.

---

## 🔍 8. Tương Tác Tìm Kiếm & Ranh Giới Server/Client Boundary

### Ranh giới Server/Client Boundary tại `/search`:
- **Server Component (`app/search/page.tsx`):**
  - Nhận `searchParams` bất đồng bộ từ Next.js 16 (`await searchParams`).
  - Gọi TMDB API trên Server qua `services/tmdb.ts` với Data Cache theo thời gian `revalidate` của từng lời gọi. `TMDB_API_KEY` chỉ được dùng ở server; không in khóa vào ảnh hoặc log nộp bài.
- **Client Components (`components/client/FilterBar.tsx`, `SearchBar.tsx`):**
  - Có chỉ thị `'use client'`; `SearchBar` hiển thị input, `FilterBar` quản lý chung query và bộ lọc.
  - Debounce 400ms đọc query mới nhất; `useOptimistic` phản hồi lựa chọn ngay trong khi chờ server.
  - Đồng bộ URL qua `useSearchParams`, `usePathname`, `useRouter` và `useTransition`; giữ bản nháp mới hơn khi response cũ về, cập nhật input khi điều hướng ngoài.
  - Được bọc trong React `<Suspense>` tại Server Component cha để đảm bảo SSR không bị de-opt.

---

## 📦 9. Server Actions & Quản Lý Watchlist Bằng Cookie

### Kỹ thuật Mutation dữ liệu không cần REST API:
- **Server Actions (`app/actions/watchlist.ts`):**
  - Khai báo chỉ thị `"use server"` ở đầu file.
  - Sử dụng `cookies()` từ `next/headers` (hỗ trợ chuẩn `await cookies()` trong Next.js 16).
  - Thao tác đọc/ghi mảng ID phim vào Cookie `mh_watchlist` với `httpOnly: true`, `SameSite=Lax` và thời hạn 30 ngày. HttpOnly chỉ chặn JavaScript đọc trực tiếp cookie, không loại bỏ mọi rủi ro XSS.
  - Tích hợp `revalidatePath` cho `/watchlist` và đường dẫn chi tiết phim cụ thể để làm mới dữ liệu liên quan.
- **Client Component tương tác (`components/client/WatchlistButton.tsx`):**
  - Nút lưu/xóa phim tích hợp Optimistic UI: đổi trạng thái hiển thị ngay khi click, gọi Server Action ngầm và tự động rollback nếu xảy ra sự cố.
  - Hỗ trợ 2 chế độ hiển thị: `default` (kèm chữ trên trang chi tiết) và `compact` (icon tròn nhỏ trên poster danh sách).
- **Trang Danh sách (`app/watchlist/page.tsx`):**
  - Server Component đọc ID từ Cookie, sau đó dùng `Promise.all` fetch chi tiết các phim song song.
  - Cung cấp nút `ClearWatchlistButton` để xóa sạch danh sách khi cần.

---

## ⚡ 10. Phân tích JavaScript bundle

Dự án có lệnh `npm run analyze`, nhưng chưa lưu tệp kết quả analyzer trước/sau. `MovieCard` được dựng trên server và truyền cho `MovieRow` phía client; muốn phát biểu kích thước bundle theo KB phải xuất analyzer trên bản build cụ thể.

---

## 🧭 11. Hệ Thống Mega Menu Navbar, Live Search & Bộ Lọc Đa Tiêu Chí

Nhằm nâng cấp trải nghiệm người dùng theo tiêu chuẩn Netflix và các nền tảng phim hiện đại (Phimmoi, TMDB), hệ thống điều hướng và khám phá phim đã được mở rộng toàn diện:

### 1. Mega Menu Dropdown trên Header:
- **Thể Loại ⌵:** Menu chọn thể loại phim theo danh sách trong ứng dụng.
- **Quốc Gia ⌵:** Dropdown chọn theo nguồn gốc xuất xứ phim (Âu Mỹ, Hàn Quốc, Trung Quốc, Nhật Bản, Việt Nam, Thái Lan, Ấn Độ...).
- **Năm Phát Hành ⌵:** Lọc theo các năm từ 2026 lùi dần về trước 2015.
- Điều hướng phim điện ảnh: "Phim Lẻ" (`/browse?type=movie`), "Mới & Phổ biến" (`/browse?sortBy=popularity.desc`) và Watchlist.

### 2. Thanh Tìm Kiếm Co Giãn & Gợi Ý Trực Tiếp (Live Autocomplete):
- **Slide-in Animation:** Biểu tượng kính lúp mở rộng mượt mà khi nhấp chuột chuẩn giao diện Netflix.
- **Instant Preview Popover:** Debounce 300ms gọi `GET /api/search?q=...` qua Route Handler; kết quả tối đa năm mục.
- Phím tắt tiện lợi: `Enter` để tới trang kết quả đầy đủ, `Escape` hoặc nhấp ra ngoài để đóng nhanh.

### 3. Bộ Lọc Phim Đa Tiêu Chí (Comprehensive Filter Bar):
- Tích hợp tại cả 2 trang `/browse` và `/search`.
- `/browse` giữ các tiêu chí phim điện ảnh hiện có, lấy một trang TMDB tối đa 20 phim, giới hạn 500 trang. Không ghép nhiều trang để đủ 24 phim; TMDB có thể đổi thứ tự giữa các lượt tải nên không cam kết danh sách bất biến xuyên trang.
- Khi tìm theo từ khóa, hỗ trợ thể loại (kể cả kinh điển), năm và sắp xếp theo độ liên quan/điểm/ngày phát hành. Quốc gia và doanh thu không có trong dữ liệu search nên được ẩn; URL cũ chứa các lựa chọn này chuyển về URL phù hợp. Lọc trong tối đa 40 kết quả đầu, hiển thị tối đa 24 phim.
- Đồng bộ URL SearchParams hai chiều, hỗ trợ lưu link, chia sẻ bộ lọc và phân trang mượt mà qua React Transitions.

### Đối chiếu Tầng 1A, 1B, 2

| Yêu cầu | Code và kiểm chứng |
| --- | --- |
| 1A — App Router, Server/Client, server fetching | `app/layout.tsx`, `app/page.tsx`, `MovieCard`, `MovieRow`; `routes-http.json` và `server-client-boundary.test.mjs` |
| 1B — Route động và trạng thái điều hướng | `app/movie/[id]/` với loading/error/not-found; `routes-http.json` |
| 1B — Cache và revalidation để giảm gọi TMDB | `services/client.ts`; `cache-mock.json` kiểm tra bộ đếm và dữ liệu trước/sau đổi |
| 1B — Mutation và API cho tương tác | `app/actions/watchlist.ts`, `app/api/search/route.ts`; `watchlist-http.json`, `api-search.test.mjs` |
| 1B — Streaming, Image/Font, SEO | Hai Suspense ở trang phim để tải khối phụ độc lập; `next/image`, `next/font`, metadata; `streaming-mock.json` |
| 2 — Git, cấu hình, test, CI, lỗi, tài liệu | Lịch sử nhánh/merge PR; `.env.example`; `tests/page-flows.test.mjs`, các test logic và `.github/workflows/check.yml`; log cùng lượt trong `mock-runtime.json` |

Trailer dùng `<dialog>.showModal()` để trình duyệt giữ/khôi phục focus và chặn tương tác phần nền. Các thành viên vẫn cần tự chạy, kiểm tra bàn phím và giải thích luồng đã nhận; log tự động không chứng minh năng lực cá nhân hay việc review PR trên GitHub.




## Đối chiếu nhận xét nhóm 21 (tuần 7)

Nguồn: [Google Sheets, nhóm 21](https://docs.google.com/spreadsheets/d/1FqmZ8Ihw5UeJ_y3nGx-ThKwZ_0JFUghJb0CJbu3iIDM/edit?gid=595430299).

```text
Server module imports: app/page → services/tmdb; app/page → MovieCard
Client module imports: MovieRow → React hooks (không import MovieCard)
Render: app/page dựng <MovieCard>, truyền cards={...} → MovieRow
```

`cards` là nội dung React truyền qua RSC; dữ liệu phim/props phải truyền được qua ranh giới server/client. Vị trí card dưới slider trong cây hiển thị không đưa module MovieCard vào client bundle. CastSlider hiện nhận dữ liệu diễn viên và dựng markup phía client; không áp kết luận của MovieRow cho mọi slider.

`cacheComponents: false` được khai báo rõ. Fetch TMDB có `next.revalidate`; đây là Data Cache. Full Route Cache phụ thuộc route có dùng request-time API hay không; Router Cache thuộc trình duyệt, request memoization chỉ trong lượt render. Không có cam kết “bốn tầng cache tự động”. Trang chủ dùng `Promise.all` cho bốn danh mục; lỗi tải được truyền tới error boundary để tránh cache trang rỗng. Trang chủ đợi các tác vụ, không streaming từng hàng. Trang chi tiết đợi details, cookie và trailer trước khi dựng nội dung chính; credits/similar nằm trong hai Suspense riêng.

HTTP 404 từ TMDB dẫn tới not-found cho trang chi tiết; lỗi mạng, timeout 10 giây, thiếu khóa hay 5xx tới error boundary có nút thử lại. Trang chủ và hai nhánh phụ có thông báo lỗi thay vì giả định kết quả rỗng là thiếu API key. Trailer có thể không khả dụng; lỗi trailer được log ở server. Không tự chuyển sang mock khi API thật lỗi. Chạy mock chỉ bằng cấu hình môi trường chủ động; kết quả giả không chứng minh tính ổn định TMDB.

`npm run evidence` tạo log build, bảng `steps` đầu vào → counter → kết luận, chunk streaming và Watchlist trên cùng `run_id`/`source_sha256`. HTTP Watchlist kiểm tra reload sau cả thêm và xóa; unit test kiểm tra ID trùng, giới hạn 200 ID/3800 byte. Ảnh trình duyệt cũ là lượt riêng, không phải kết quả tự tạo lại bởi lệnh này. Chưa đo browser Web Vitals trên bản sửa này.
