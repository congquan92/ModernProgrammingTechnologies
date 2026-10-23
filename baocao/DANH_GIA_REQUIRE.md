# BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN VÀ ĐỐI SOÁT CHẤT LƯỢNG KỸ THUẬT DỰ ÁN MOVIEHUB

> **Văn bản Thẩm định & Giám định Kiến trúc Phần mềm Độc lập**  
> **Căn cứ Quy chuẩn:** `REQUIRE.md` (Quy định Đồ án Chuyên sâu Next.js 16)  
> **Tài liệu Đối soát:** Báo cáo đồ án `baocao/baocao.tex`, Tài liệu phản biện `PROPLEM.md`, và Hồ sơ minh chứng `baocao/evidence/`  
> **Đối tượng Giám định:** Toàn bộ cây mã nguồn thực tế tại kho lưu trữ MovieHub (`app/`, `components/`, `services/`, `tests/`, `scripts/`)  
> **Môi trường & Nền tảng:** Next.js 16.3.6 (App Router), React 19.2.8, Node.js v24.19.0, TypeScript 5.x, TMDB API v3  
> **Đơn vị thực hiện:** Senior Software Quality & Architecture Specialist (M2 Evaluation Specialist)  
> **Thời điểm xuất bản:** 2026-10-16  

---

## MỤC LỤC TỔNG QUAN

1. [Tổng quan & Tóm tắt Điều hành (Executive Summary)](#1-tổng-quan--tóm-tắt-điều-hành-executive-summary)
   - 1.1. Bối cảnh dự án & Mục tiêu giám định
   - 1.2. Phương pháp luận đối soát độc lập 3 chiều (Triangulation Audit)
   - 1.3. Thống kê tỷ lệ tuân thủ tổng thể theo từng tầng kiến trúc
2. [Ma trận Đối soát Chi tiết 100% Tiêu chí (Comprehensive Compliance Matrix)](#2-ma-trận-đối-soát-chi-tiết-100-tiêu-chí-comprehensive-compliance-matrix)
   - 2.1. Ma trận Tầng 1A — Lõi Bắt buộc Next.js 16
   - 2.2. Ma trận Tầng 1B — Lõi Tự chọn Nâng cao
   - 2.3. Ma trận Tầng 2 — Chuẩn Kỹ nghệ Phần mềm Dùng chung
   - 2.4. Ma trận Tầng 3 — Kỹ thuật Nâng cao Web Frontend
   - 2.5. Ma trận Đối soát 8 Tiêu chí trong Checklist Nộp bài (REQUIRE.md)
3. [Phân tích Chuyên sâu các Khiếm khuyết & Lỗ hổng Cốt lõi](#3-phân-tích-chuyên-sâu-các-khiếm-khuyết--lỗ-hổng-cốt-lõi)
   - 3.1. Vấn nạn Kiểm thử Tự động Hình thức (Potemkin Verification) và Sự biến mất của Vitest
   - 3.2. Cấu trúc Xử lý Lỗi bị Thủng ở Tầng Root (Thiếu Root Error, Global Error, Root 404)
   - 3.3. Thiếu hụt SEO Cốt lõi (Sitemap, Robots) và Tiêu chuẩn An ninh Mạng (CSP, Security Headers)
   - 3.4. Lỗi Logic và Phá vỡ Luồng Người dùng Phân hệ TV Series (`/tv` -> `/movie/[id]` HTTP 404)
4. [Nhận diện & Phân tích Chi tiết các Phần Dư thừa, Quá đà và Lệch trọng tâm (R4)](#4-nhận-diện--phân-tích-chi-tiết-các-phần-dư-thừa-quá-đà-và-lệch-trọng-tâm-r4)
   - 4.1. Cơ chế DNS Monkey-Patching can thiệp socket toàn cục của Node.js (`services/client.ts`)
   - 4.2. Mã chết Server Action tìm kiếm (`app/actions/search.ts`)
   - 4.3. Các thành phần bỏ hoang và Alias rác (`components/server/Header.tsx`, `components/server/MovieSection.tsx`)
   - 4.4. Kỹ thuật ép lấy 24 items gây nhân đôi/ba số lượng request upstream TMDB (`services/discover.ts`, `services/movies.ts`)
   - 4.5. Kiến trúc "Cookie-as-Database" và vi phạm ranh giới Server Component tại trang chi tiết (`app/movie/[id]/page.tsx`)
   - 4.6. Tính năng nửa vời và thiếu đồng bộ dữ liệu của phân hệ TV Series (`app/tv/page.tsx`)
5. [Đối soát & Thẩm định Báo cáo Học thuật (baocao.tex) và Phản biện (PROPLEM.md)](#5-đối-soát--thẩm-định-báo-cáo-học-thuật-baocaotex-và-phản-biện-proplemmd)
   - 5.1. Các tuyên bố sai lệch, phóng đại hoặc mâu thuẫn còn tồn đọng trong `baocao.tex`
   - 5.2. Thẩm định chi tiết 8 nhận xét phản biện P1 – P8 trong `PROPLEM.md`
6. [Lộ trình Cải tiến & Khắc phục Toàn diện (Actionable Remediation Roadmap)](#6-lộ-trình-cải-tiến--khắc-phục-toàn-diện-actionable-remediation-roadmap)
   - 6.1. Giai đoạn 1: Vá lỗi khẩn cấp, loại bỏ mã chết và tinh giản hệ thống (Zero-Waste Refactoring)
   - 6.2. Giai đoạn 2: Hoàn thiện cấu trúc ứng dụng chuẩn mực (Structural Completion)
   - 6.3. Giai đoạn 3: Chuẩn hóa kiểm thử tự động thực chất & Đo lường định lượng (Genuine Testing & Metrics)
7. [Phương pháp Xác minh Độc lập (Independent Verification Methodology)](#7-phương-pháp-xác-minh-độc-lập-independent-verification-methodology)

---

## 1. TỔNG QUAN & TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

### 1.1. Bối cảnh dự án & Mục tiêu giám định
Dự án **MovieHub** là một ứng dụng web khám phá và tra cứu thông tin điện ảnh thương mại, được phát triển phục vụ học phần Các Công nghệ Lập trình Hiện đại với định hướng chuyên sâu vào công nghệ **Next.js 16 (App Router)** và thư viện **React 19**. Ứng dụng tích hợp dữ liệu trực tiếp từ dịch vụ bên thứ ba The Movie Database (TMDB API v3) và triển khai hệ thống thiết kế chuẩn điện ảnh tối giản **Netflix Dark Cinema Design System** (nền tối `#141414`, đỏ thương hiệu `#E50914`, chữ trắng `#FFFFFF`).

Mục tiêu tối thượng của cuộc kiểm định độc lập này không nhằm đánh giá mức độ bắt mắt về mặt giao diện hay số lượng tính năng nghiệp vụ, mà tập trung kiểm chứng **chiều sâu công nghệ Next.js 16**, độ chuẩn xác của các ranh giới kiến trúc (Server/Client boundaries), sự tuân thủ chuẩn kỹ nghệ phần mềm và tính trung thực học thuật giữa những gì nhóm tác giả tuyên bố trong báo cáo (`baocao/baocao.tex`) so với thực tế triển khai trong mã nguồn.

### 1.2. Phương pháp luận đối soát độc lập 3 chiều (Triangulation Audit)
Để đảm bảo tính khách quan tuyệt đối, cuộc kiểm định áp dụng mô hình đối soát 3 chiều độc lập (Triangulation Audit Methodology):
1. **Trục 1 — Mã nguồn thực nghiệm (Ground Truth Codebase):** Phân tích tĩnh (Static Analysis) và kiểm tra runtime động trên toàn bộ các tệp mã nguồn thuộc `app/`, `components/`, `services/`, `tests/`, `scripts/`, cấu hình `tsconfig.json`, `next.config.ts`, `package.json`, và lịch sử phiên bản Git (`git log`).
2. **Trục 2 — Văn bản học thuật (Academic Report):** Khảo sát từng chương mục, bảng biểu, sơ đồ và công thức trong `baocao/baocao.tex`, đối chiếu với tài liệu hướng dẫn minh chứng `baocao/evidence/`.
3. **Trục 3 — Nhận xét phản biện độc lập (Critical Feedback):** Đối chiếu với 8 vấn đề cốt lõi được ghi nhận trong `PROPLEM.md` để đánh giá mức độ tiếp thu, khắc phục hoặc những chỗ còn né tránh, ngụy tạo.

```
                  [ MÃ NGUỒN THỰC NGHIỆM ]
                  (app/, components/, services/, git)
                             /      \
                            /        \
                           /          \
  [ BÁO CÁO HỌC THUẬT ] <------------> [ PHẢN BIỆN CHUYÊN GIA ]
    (baocao/baocao.tex)                      (PROPLEM.md)
```

### 1.3. Thống kê tỷ lệ tuân thủ tổng thể theo từng tầng kiến trúc

Dựa trên khung tiêu chuẩn tại `REQUIRE.md`, kết quả định lượng tổng quát được xác lập như sau:

| Tầng Tiêu Chí | Tổng Số Tiêu Chí | Đạt Chuẩn (Pass) | Đạt Một Phần / Thiếu Sót | Chưa Đạt / Vi Phạm | Tỷ Lệ Đạt Thực Chất |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Tầng 1A: Lõi Bắt Buộc Next.js 16** | 4 | 4 | 0 | 0 | **100.0%** |
| **Tầng 1B: Lõi Tự Chọn Nâng Cao** | 6 | 5 | 0 | 1 (Dư thừa/Mã chết) | **83.3%** |
| **Tầng 2: Chuẩn Kỹ Nghệ Phần Mềm** | 8 | 5 | 1 (Prettier, Error) | 2 (Kiểm thử hình thức) | **62.5%** |
| **Tầng 3: Kỹ Thuật Nâng Cao** | 8 | 4 | 1 (A11y ngữ nghĩa) | 3 (SEO, CSP, Metrics) | **50.0%** |
| **Checklist Nộp Bài (REQUIRE.md)** | 8 | 5 | 2 (CL6, CL8) | 1 (CL5 thiếu số liệu) | **62.5%** |
| **TỔNG HỢP TOÀN DỰ ÁN** | **34** | **23** | **4** | **7** | **67.6%** |

#### Đánh giá điều hành tổng kết:
- **Ưu điểm vượt trội:** Kiến trúc lõi của Next.js 16 (App Router, Server Components song song, ranh giới truyền `cards: ReactNode[]` không làm phình client bundle, xử lý `await params` bất đồng bộ, Route Handler GET với Cache-Control và AbortController) được hiện thực hóa mẫu mực, giải quyết trọn vẹn câu hỏi: *"Cái gì trong đồ án này là Next.js mà một React SPA bình thường không làm giống như vậy?"*.
- **Khiếm khuyết then chốt:** Dự án bộc lộ 3 "gót chân Asin" nghiêm trọng về mặt kỹ nghệ phần mềm:
  1. *Kiểm thử tự động mang tính hình thức (Potemkin Testing):* Kịch bản `scripts/test-suite.mjs` (24 ca kiểm thử) tự nhân bản lại hàm mock trong file script và dùng `fs.readFileSync` đọc văn bản tĩnh; trong khi toàn bộ hệ thống Vitest/Testing-Library đã bị xóa bỏ trong quá khứ (`commit 20b5175e`).
  2. *Cấu trúc xử lý lỗi bị thủng ở tầng Root:* Không có `app/error.tsx`, không có `app/global-error.tsx`, không có `app/not-found.tsx` ở cấp thư mục gốc.
  3. *Tồn dư mã chết và can thiệp quá đà:* Tồn tại Server Action rác (`app/actions/search.ts`), các component bỏ hoang, và đoạn mã monkey-patching `dns.lookup` toàn cục của Node.js.

---

## 2. MA TRẬN ĐỐI SOÁT CHI TIẾT 100% TIÊU CHÍ (COMPREHENSIVE COMPLIANCE MATRIX)

### 2.1. Ma trận Tầng 1A — Lõi Bắt Buộc Next.js 16

| Mã Tiêu Chí & Tên Tiêu Chí | Chuẩn Mực Quy Định (REQUIRE.md) | Minh Chứng Mã Nguồn Thực Tế (File & Dòng Cụ Thể) | Khảo Sát Tài Liệu (baocao.tex / README.md) | Đánh Giá Phản Biện (PROPLEM.md) | Kết Luận Thẩm Định |
|:---|:---|:---|:---|:---|:---:|
| **1A.1: Kiến trúc App Router** | Tổ chức route theo cây thư mục; hiểu vai trò của `page.tsx`, `layout.tsx` và cách dựng cây route. | `app/layout.tsx:28-38` (RootLayout bao bọc Header, Footer, Geist font).<br>`app/page.tsx:20-72` (Route `/`).<br>`app/movie/[id]/page.tsx:63-267` (`/movie/[id]`).<br>`app/browse/page.tsx:84-222` (`/browse`).<br>`app/search/page.tsx:33-176` (`/search`).<br>`app/watchlist/page.tsx:19-95` (`/watchlist`). | Trình bày tại Mục 1.4, Mục 3.1.1 (dòng 952-957), Bảng 4.3 (dòng 1177-1191). Giải thích rõ ràng vai trò server wrapper và cây route lồng nhau. | P1 yêu cầu bảng phân loại route phải khớp kết quả `next build`. Báo cáo đã đồng bộ chính xác. | **ĐẠT** |
| **1A.2: Phân định Server / Client Boundary** | Phân biệt component nào mặc định chạy server, khi nào dùng `"use client"`, tác động đến dữ liệu và client bundle. | **Server Components:** `components/server/MovieCard.tsx`, `HeroBanner.tsx`, `CastList.tsx`, `SimilarMovies.tsx`, `Footer.tsx`.<br>**Client Components (`"use client"`):** `components/client/Header.tsx:1`, `MovieRow.tsx:1`, `NavSearchBar.tsx:1`, `FilterBar.tsx:1`, `WatchlistButton.tsx:1`.<br>**Zero-Bundle Boundary:** `app/page.tsx:52` và `SimilarMovies.tsx:24` truyền JSX node `cards={movies.map(m => <MovieCard .../>)}` xuống `MovieRow`. `tests/server-client-boundary.test.mjs:5-13` xác minh `MovieRow` không import `MovieCard`. | Trình bày tại Mục 3.1.1 (dòng 952-957), Mục 4.2.2 (dòng 1195), Phụ lục 1 (dòng 1292-1304). Không phóng đại dung lượng bundle khi chưa có số đo thực nghiệm. | P2 nhắc nhở không suy diễn Header/MovieCard đọc cookie. Báo cáo dòng 591 ghi rõ MovieCard chỉ nhận props thuần túy. | **ĐẠT** |
| **1A.3: Data Fetching Phía Server & Secret Safety** | Lấy dữ liệu phía server trong Server Component; không biến mọi trang thành client component chỉ để fetch; an toàn secret. | `app/page.tsx:21-27`, `app/movie/[id]/page.tsx:70, 94-97`, `app/browse/page.tsx:88-96`, `app/tv/page.tsx:47-55` đều là async Server Components gọi hàm từ `services/tmdb.ts`.<br>`services/client.ts:40, 60`: `TMDB_API_KEY` chỉ đọc qua `process.env.TMDB_API_KEY`, không có tiền tố `NEXT_PUBLIC_`. Khóa API không lộ trong client bundle hay HTML render (`baocao/evidence/server-render.txt:9`). | Trình bày tại Mục 3.1.2 (dòng 959-971). Khớp hoàn toàn với cơ chế triển khai thực tế. | Hoàn toàn giải quyết triệt để rủi ro bảo mật khóa API. | **ĐẠT** |
| **1A.4: Luồng Render Chính & So Sánh React SPA** | Hiểu luồng render: request vào đâu, lấy dữ liệu ở đâu, render server/client thế nào; chứng minh Next.js khác gì React SPA thuần. | 1. Client gửi request.<br>2. Máy chủ chạy async Server Component, gọi `fetchTMDB` qua Data Cache có `revalidate`.<br>3. Trang `/movie/[id]` stream ngay HTML phần trên và phát Skeleton cho 2 khối Suspense.<br>4. Trang `/` phục vụ bản pre-render tĩnh với ISR 30 phút (`baocao/evidence/build-output.txt`).<br>5. Client hydrate nhẹ nhàng các tương tác (`Header.tsx:22-37` chỉ kích hoạt scroll listener sau mount chống mismatch). | Mục 1.1, 1.2, 2.1, 3.1, Bảng 1.1 so sánh Pages vs App Router, Bảng 1.2 đối sánh Vite, Nuxt, Astro. Mục 1.1.4 phân tích khi nào không dùng Next.js. | P6 & P8 yêu cầu giải thích Hydration, URL state, so sánh công nghệ ngoài Next.js. Báo cáo dòng 449-484 và 601-607 đã bổ sung đầy đủ. | **ĐẠT** |

---

### 2.2. Ma trận Tầng 1B — Lõi Tự Chọn Nâng Cao

| Mã Tiêu Chí & Tên Tiêu Chí | Chuẩn Mực Quy Định (REQUIRE.md) | Minh Chứng Mã Nguồn Thực Tế (File & Dòng Cụ Thể) | Khảo Sát Tài Liệu (baocao.tex / README.md) | Đánh Giá Phản Biện (PROPLEM.md) | Kết Luận Thẩm Định |
|:---|:---|:---|:---|:---|:---:|
| **1B.1: Dynamic Route & UI Segments** | Route động/lồng nhau; layout dùng chung; loading/error/not-found phù hợp với luồng ứng dụng. | `app/movie/[id]/page.tsx:15-17, 63-65` nhận `params: Promise<{ id: string }>`. Thực hiện `await params` chuẩn Next.js 16 và regex `!/^[1-9]\d*$/.test(id)` kích hoạt `notFound()`.<br>`app/layout.tsx:28-38` (Shared layout).<br>`app/loading.tsx:20-36`, `app/movie/[id]/loading.tsx:5-54` (Skeleton UI).<br>`app/movie/[id]/error.tsx:1-70` (Error boundary client).<br>`app/movie/[id]/not-found.tsx:7-45` (404 UI phong cách Netflix). | Mục 3.1.3 (dòng 973-1001), Mục 3.2.2 (dòng 1011-1026). Thẳng thắn thừa nhận hiện tượng "soft 404" (dòng 1193) do streaming gửi header HTTP 200 trước khi kích hoạt `notFound()`. | P7 lưu ý `params` Promise bắt đầu từ Next 15 và bắt buộc ở Next 16. Báo cáo dòng 355 và 974 đã đính chính chính xác. | **ĐẠT** |
| **1B.2: Caching & Revalidation (ISR)** | Chiến lược cache phù hợp tính chất dữ liệu; biết khi nào cần dữ liệu tươi và khi nào có thể cache. | `services/client.ts:62-64`: `fetch(url, { next: { revalidate: revalidateTime } })`.<br>Phân tầng TTL: Phim thịnh hành 3600s (`movies.ts:12`), Phim đang chiếu 1800s (`movies.ts:33`), Phim điểm cao nhất 86400s (`movies.ts:52`), Tìm kiếm nhanh 120s (`search.ts:42`).<br>`npm run build` xuất: `○ / (Static, Revalidate 30m, Expire 1y)`.<br>`next.config.ts:8-18`: Giữ `cacheComponents: false` an toàn. | Mục 2.1 (dòng 550-580), Bảng 2.2 (dòng 829), Bảng 4.3 (dòng 1181). Thừa nhận trung thực chưa đo benchmark số request upstream để tính tỷ lệ hit/miss (dòng 1197). | P1 xác nhận `fetch(..., { next: { revalidate } })` là API cache chuẩn, yêu cầu giải thích rõ cấu hình cacheComponents. Đã khắc phục 100%. | **ĐẠT** |
| **1B.3: Server Action vs Route Handler** | Server Action cho mutation; Route Handler cho query/API endpoint trong cùng dự án; an toàn RFC 6265 Cookie. | **Mutation:** `app/actions/watchlist.ts:38-83` (`toggleWatchlist`, `clearAllWatchlist`). Có `"use server"`, kiểm thực `Number.isInteger(movieId) && movieId > 0`, giới hạn `MAX_WATCHLIST_ITEMS = 200`, khống chế `MAX_WATCHLIST_COOKIE_BYTES = 3800` (< 4KB RFC 6265), cookie `httpOnly`, `sameSite: "lax"`, gọi `revalidatePath`.<br>**Query:** `app/api/search/route.ts:14-43` (`export async function GET`). Khử ký tự điều khiển ASCII, trả header `Cache-Control: public, s-maxage=120, stale-while-revalidate=60`. Client (`NavSearchBar.tsx:60-89`) dùng debounce 300ms và `AbortController`.<br>**Mã chết dư thừa:** `app/actions/search.ts` (`quickSearchAction`) hoàn toàn không được UI sử dụng! | Mục 2.2 (dòng 626-660), Mục 3.2.1 (dòng 1005-1010), dòng 1201, Phụ lục 2 (dòng 1307). Phân tích sâu sắc lý do kiến trúc: Live Search gõ phím cần GET + HTTP Cache + AbortController, tránh nghẽn action queue của React 19. Đính chính HttpOnly chỉ chặn `document.cookie` (dòng 655). | P5 chỉ trích việc dùng Server Action POST cho Live Search và ngộ nhận về HttpOnly. Đã tái cấu trúc mã nguồn và sửa chữa lý thuyết báo cáo hoàn toàn. | **ĐẠT (kèm 01 điểm DƯ THỪA: `search.ts`)** |
| **1B.4: Suspense và Streaming** | Suspense/streaming để chia nhỏ thời điểm hiển thị dữ liệu chậm. | `app/movie/[id]/page.tsx:236-238` và `249-262` bọc 2 khối async Server Components độc lập:<br>1. `<Suspense fallback={<CastSkeleton />}><CastList movieId={id} /></Suspense>`<br>2. `<Suspense fallback={<SimilarMoviesSkeleton />}><SimilarMovies movieId={id} /></Suspense>`<br>Không chặn render thông tin phim chính.<br>`app/browse/page.tsx:136-138` bọc `<FilterBar />` trong Suspense bảo vệ ranh giới `useSearchParams()`. | Mục 2.1.4 (dòng 594-599), Mục 3.2.2 (dòng 1011-1027), dòng 1199. Rút bỏ hoàn toàn các tuyên bố TTFB 180ms/750ms bịa đặt, chỉ khẳng định cấu trúc kiến trúc hỗ trợ streaming. | P3 & P4 phê bình các số liệu TTFB và FCP mâu thuẫn trước đây. Nhóm đã loại bỏ toàn bộ các bảng đo thiếu căn cứ theo đúng góp ý. | **ĐẠT** |
| **1B.5: Tối ưu Image / Font / Metadata** | Tối ưu Image/Font; metadata/SEO theo nhu cầu sản phẩm. | **Image:** `next.config.ts:9-17` (`remotePatterns` cho `image.tmdb.org`). `components/server/MovieCard.tsx:28-29` cố định tỉ lệ `aspect-[2/3]`, dùng `fill`, `sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"`, chống CLS. `app/movie/[id]/page.tsx:123-130` dùng `priority` cho hero backdrop.<br>**Font:** `app/layout.tsx:9-17` nạp `Geist` và `Geist_Mono` qua `next/font/google` nhúng nội bộ.<br>**Metadata:** `app/movie/[id]/page.tsx:24-54`, `app/browse/page.tsx:75-82`, `app/search/page.tsx:20-27` dùng `generateMetadata` bất đồng bộ. | Mục 3.1.3 (dòng 973-1001), Mục 3.2.3 (dòng 1028-1035), Bảng 4.5 (dòng 1220). Khớp chính xác với mã nguồn. | Hoàn toàn đạt chuẩn kỹ thuật. | **ĐẠT** |
| **1B.6: Middleware** | Middleware cho redirect/rewrite/check đơn giản; không lạm dụng chứa business logic. | Không có tệp `middleware.ts` hay `middleware.js` trong toàn bộ dự án. Dự án không có nhu cầu phân quyền đăng nhập tại Edge. | Báo cáo hoàn toàn không nhắc đến middleware và không tự nhận triển khai middleware. | Không có phản biện tiêu cực. | **KHÔNG CHỌN (Hợp lệ theo tiêu chí tự chọn)** |

---

### 2.3. Ma trận Tầng 2 — Chuẩn Kỹ Nghệ Phần Mềm Dùng Chung

| Mã Tiêu Chí & Tên Tiêu Chí | Chuẩn Mực Quy Định (REQUIRE.md) | Minh Chứng Mã Nguồn Thực Tế (File & Dòng Cụ Thể) | Khảo Sát Tài Liệu (baocao.tex / README.md) | Đánh Giá Phản Biện (PROPLEM.md) | Kết Luận Thẩm Định |
|:---|:---|:---|:---|:---|:---:|
| **2.1: Quản lý Phiên bản (Git Flow)** | Nhánh làm việc, pull request/merge request, review chéo, lịch sử commit có ý nghĩa; không commit thẳng vào main. | Git repo có nhánh `main`, `qdai`, và 4 nhánh tính năng (`feature/home-and-layout`, `feature/movie-detail-streaming`, `feature/navbar-filters-and-navigation`, `feature/search-watchlist`).<br>Có 7 Pull Request merge commit (`Merge pull request #5`, `#6`, `#7`...).<br>Commit tuân thủ Conventional Commits (`feat(...)`, `fix(...)`, `refactor(...)`). | Trình bày tại Mục 3.5.3, Bảng 4.1 và Bảng 4.5. Khớp chính xác với lịch sử git. | Không có vấn đề. | **ĐẠT** |
| **2.2: Khả năng Chạy lại & Tài liệu** | README rõ ràng, phiên bản runtime/package, lệnh cài và lệnh chạy. | `README.md:1-250` hướng dẫn chi tiết cài đặt, cấu hình biến môi trường, các lệnh chạy (`npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run analyze`). Build production thành công 100%. | Khớp hoàn toàn giữa README và môi trường thực thi. | Không có vấn đề. | **ĐẠT** |
| **2.3: Quản lý Cấu hình & Bí mật** | Secret qua biến môi trường; có `.env.example`, không commit secret thật. | `.env.example:1-4` cung cấp mẫu `TMDB_API_KEY=your_tmdb_api_key_here`.<br>`.gitignore:37-38` chặn toàn bộ `.env*`.<br>Quét `git log -S "TMDB_API_KEY"` xác nhận 0 rò rỉ khóa thật. `services/client.ts:40` đọc phía server. | Báo cáo dòng 923-930 và Bảng 4.5 dòng 1221 khẳng định bảo mật khóa API. | Đã giải quyết triệt để rủi ro rò rỉ khóa. | **ĐẠT** |
| **2.4: TypeScript Strictness** | Kiểm soát kiểu dữ liệu chặt chẽ; 0 `any`, 0 `@ts-ignore`. | `tsconfig.json:7` bật `"strict": true`.<br>Quét toàn bộ codebase: **0 `any`**, **0 `@ts-ignore`** (chỉ có 1 `@ts-expect-error` tại `services/client.ts:11` cho DNS overload).<br>Lệnh `npx tsc --noEmit` đạt exit code 0. | Báo cáo Bảng 4.1 (dòng 1162) ghi nhận chính xác. | Không có vi phạm. | **ĐẠT** |
| **2.5: Code Style & Linter** | Tuân thủ linter, 0 lỗi/cảnh báo; công cụ định dạng tự động. | `eslint.config.mjs:1-20` dùng ESLint 9 Flat Config (`next/core-web-vitals`, `next/typescript`).<br>Lệnh `npm run lint` đạt exit code 0 (0 error, 0 warning).<br>**Thiếu sót:** Dự án không cấu hình `.prettierrc` hoặc script Prettier. | Báo cáo ghi nhận kiểm tra linter đạt exit code 0. | Không có vi phạm linter. | **ĐẠT (ESLint) / THIẾU SÓT (Prettier)** |
| **2.6: Kiểm thử Tự động (Automated Testing)** | Có test phù hợp với sản phẩm: unit test logic, component/flow test; đảm bảo tính toàn vẹn mã nguồn. | `package.json:10`: `"test": "node --test tests/*.test.mjs"`.<br>Chỉ có 3 test files Node.js (3 ca test thô sơ: deduplicate, regex check boundary, fetch mock).<br>**Vấn đề Potemkin:** `scripts/test-suite.mjs` (24 tests) tự định nghĩa hàm clone cục bộ (`validateQuickSearch`, `validateMovieId`) và đọc file text bằng `fs.readFileSync` thay vì test code thật.<br>**Lịch sử xóa test:** Commit `20b5175e` (28/09) đã xóa sạch Vitest và React Testing Library (`__tests__/`). Không có test coverage, không có Playwright/E2E. | Báo cáo Bảng 4.1 (dòng 1164) khoe "24 ca kiểm thử tự động xác minh...", che giấu bản chất giả lập cục bộ. | Báo cáo phản ánh thiếu trung thực về năng lực kiểm thử. | **GIAN LẬN HÌNH THỨC (`test-suite.mjs`) / CHƯA ĐẠT (Kiểm thử thực chất)** |
| **2.7: CI và Kiểm tra Tự động** | Có GitHub Actions hoặc tương đương để build/lint/test khi đẩy mã lên kho. | `.github/workflows/check.yml:1-23` chạy trên `ubuntu-latest`: `npm ci` -> `npm run lint` -> `npx tsc --noEmit` -> `npm test` -> `npm run build`.<br>**Hạn chế:** Chỉ chạy 3 unit test thô sơ, chưa có file log một lượt chạy thật trên GitHub console. | Báo cáo dòng 1170 thừa nhận chưa lưu log chạy thực tế trên GitHub Actions. | Đạt mức cơ bản yêu cầu đồ án. | **ĐẠT** |
| **2.8: Xử lý Lỗi & Quan sát (Observability)** | Không để lỗi rơi tự do; thông báo lỗi phù hợp, bắt lỗi ở mọi cấp độ. | Đã có `app/movie/[id]/error.tsx` (Client Error Boundary có nút Thử lại) và `app/movie/[id]/not-found.tsx`.<br>**Lỗ hổng nghiêm trọng:** **KHÔNG CÓ `app/error.tsx`**, **KHÔNG CÓ `app/global-error.tsx`**, và **KHÔNG CÓ `app/not-found.tsx`** tại thư mục gốc. Khi xảy ra lỗi runtime hoặc truy cập sai URL tại `/`, `/browse`, `/tv`, `/watchlist`, Next.js rơi về màn hình mặc định thô của framework. | Báo cáo chỉ đề cập đến error/not-found tại `movie/[id]`, né tránh đề cập đến sự thiếu vắng ở tầng Root. | Vi phạm nguyên tắc "Không để lỗi rơi tự do" tại các route ngoài movie detail. | **CHƯA ĐẠT / THIẾU SÓT LỚN** |

---

### 2.4. Ma trận Tầng 3 — Kỹ Thuật Nâng Cao Web Frontend

| Mã Tiêu Chí & Tên Tiêu Chí | Chuẩn Mực Quy Định (REQUIRE.md) | Minh Chứng Mã Nguồn Thực Tế (File & Dòng Cụ Thể) | Khảo Sát Tài Liệu (baocao.tex / README.md) | Đánh Giá Phản Biện (PROPLEM.md) | Kết Luận Thẩm Định |
|:---|:---|:---|:---|:---|:---:|
| **3.1: Server Component Streaming** | Streaming Suspense cho các thành phần chậm; truyền tải HTML lũy tiến. | `app/movie/[id]/page.tsx:236-262`: Stream độc lập 2 khối `CastList` và `SimilarMovies`. Cơ chế hoạt động chuẩn HTTP Chunked Transfer Encoding. | Trình bày tại Mục 2.1.4, 3.2.2, dòng 1199. | Đã loại bỏ số liệu giả lập TTFB 180ms/750ms. | **ĐẠT** |
| **3.2: Image Optimization Chống CLS** | Khung tỉ lệ cố định, responsive sizes, cờ priority chống giật layout. | `components/server/MovieCard.tsx:28-30`: Khung chứa `aspect-[2/3]`, `fill`, `sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"`. `app/movie/[id]/page.tsx:127, 150` dùng `priority`. Bảo đảm CLS = 0. | Báo cáo Mục 3.2.3, NFR02 dòng 724. | Đáp ứng hoàn hảo chuẩn mực Next.js Image. | **ĐẠT** |
| **3.3: Bundle Analyzer** | Quan sát và phân tích kích thước bundle của Client, Server, Edge. | `next.config.ts:4-6` và `package.json:11` tích hợp `@next/bundle-analyzer`. Đã chạy sinh thành công 3 tệp HTML: `.next/analyze/client.html` (350KB), `edge.html` (274KB), `nodejs.html` (392KB). | Báo cáo dòng 1148 và Phụ lục 3 dòng 1319. | Đã triển khai công cụ thực tế. | **ĐẠT** |
| **3.4: Dynamic SEO & Metadata** | Metadata động, OpenGraph theo nội dung thực tế. | `app/movie/[id]/page.tsx:24-54`, `app/browse/page.tsx:75-82`, `app/search/page.tsx:20-27` dùng `generateMetadata` async, trích xuất title, description, openGraph images từ TMDB. | Báo cáo Mục 3.1.3, Bảng 4.5. | Khớp hoàn toàn với mã nguồn. | **ĐẠT** |
| **3.5: Chuẩn SEO Cốt lõi (Sitemap & Robots)** | Cung cấp sơ đồ trang web và chỉ thị bọ tìm kiếm cho web công khai. | **HOÀN TOÀN THIẾU `sitemap.ts` (hoặc `sitemap.xml`)**.<br>**HOÀN TOÀN THIẾU `robots.ts` (hoặc `robots.txt`)** trong toàn bộ dự án (`app/` và `public/`). | Báo cáo hoàn toàn không nhắc đến sitemap hay robots. | Bỏ sót 2 quy chuẩn SEO cơ bản nhất của Next.js App Router. | **CHƯA ĐẠT** |
| **3.6: Chuẩn Tiếp cận (Accessibility - a11y)** | Độ tương phản màu, hỗ trợ phím, thuộc tính ARIA, ngữ nghĩa thẻ HTML chuẩn WCAG 2.1 AA. | **Đạt:** Cặp màu `#FFFFFF` trên `#141414` đạt tương phản ~18.4:1 (chuẩn AA). Nút slider có `aria-label`, search có `aria-label`, modal trailer có `role="dialog"` và phím ESC.<br>**Vi phạm:**<br>- `components/server/Footer.tsx:16-24`: Dùng `<span className="cursor-pointer">` thay vì `<a>` hoặc `<button>`, liệt phím Tab.<br>- `components/client/Header.tsx:165`: Chuông thông báo thiếu `aria-label`.<br>- `Header.tsx:177`: Avatar profile dùng `<div>`, thiếu `role="button"`, không focus được bằng bàn phím.<br>- `NavbarDropdown.tsx:40-51`: Không hỗ trợ phím ESC hoặc phím mũi tên. | Báo cáo Bảng 2.3 dòng 859 đã đính chính hạ từ AAA xuống AA, thừa nhận chỉ kiểm định cặp màu đơn lẻ. | Chưa đạt trọn vẹn trải nghiệm tiếp cận cho người khuyết tật dùng bàn phím/screen reader. | **ĐẠT MỘT PHẦN / THIẾU SÓT** |
| **3.7: An ninh Cookie & Input Validation** | Bảo vệ đầu vào chống injection, kiểm soát kích thước cookie chuẩn RFC 6265. | `app/api/search/route.ts:18-25`: Khử sạch ký tự điều khiển ASCII, giới hạn độ dài 100 ký tự.<br>`app/actions/watchlist.ts:40-76`: Kiểm tra số nguyên dương, giới hạn 200 items, kiểm soát byte serialize < 3800 bytes phòng lỗi HTTP 431. | Báo cáo Mục 2.2 dòng 655 và Bảng 4.1 dòng 1164. | Tiếp thu và xử lý triệt để góp ý P5 trong PROPLEM.md. | **ĐẠT** |
| **3.8: An ninh Tiêu đề HTTP (CSP & Security Headers)** | Thiết lập Content-Security-Policy và các tiêu đề an ninh bảo vệ ứng dụng. | `next.config.ts:8-18` **HOÀN TOÀN KHÔNG CẤU HÌNH HEADERS** (không có hook `headers()`). Không có CSP, không có X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security. Không có `middleware.ts`. | Báo cáo hoàn toàn không nhắc đến CSP hay HTTP security headers. | Ứng dụng web mở cửa hoàn toàn trước nguy cơ Clickjacking và nhúng mã độc bên ngoài. | **CHƯA ĐẠT** |
| **3.9: Đo lường Định lượng Hiệu năng (Core Web Vitals)** | Đo lường thực nghiệm Lighthouse, TTFB, FCP, LCP có dữ liệu đối chứng. | **Không có dữ liệu thực nghiệm:** Không có file xuất Lighthouse thật, không có trace trình duyệt 10 lần đo độc lập.<br>Báo cáo `baocao.tex:1150` thừa nhận: *"Bản báo cáo này chưa có tệp xuất Lighthouse, trace trình duyệt, kết quả analyzer trước/sau hoặc dữ liệu thô 10 lần đo TTFB. Vì vậy nhóm không công bố..."* | Nhóm tác giả đã rút toàn bộ các bảng số liệu bịa đặt (Lighthouse 98-100, TTFB 180ms/750ms) khỏi báo cáo. | P3 & P4 đã bóc trần sự ngụy tạo số liệu. Nhóm đã sửa sai bằng cách rút số liệu, nhưng đồng nghĩa mục này chưa được nghiệm thu định lượng. | **CHƯA CÓ MINH CHỨNG NGHIỆM THU** |

---

### 2.5. Ma trận Đối soát 8 Tiêu chí trong Checklist Nộp bài (REQUIRE.md)

| STT | Tiêu chí Checklist (REQUIRE.md §5) | Hiện trạng tại Dự án MovieHub | Đánh giá Tuân thủ |
|:---:|:---|:---|:---:|
| **CL1** | Ghi đúng tên công nghệ chính trong tên đề tài và báo cáo; không chỉ ghi tên bài toán nghiệp vụ. | Tiêu đề báo cáo và tài liệu ghi rõ: "Tìm hiểu và Ứng dụng Công nghệ Next.js 16 (App Router) trong Phát triển Nền tảng Điện ảnh MovieHub". | **ĐẠT** |
| **CL2** | Đánh dấu các mục Tầng 1A đã hoàn thành và chỉ rõ file/module/route/screen nơi thể hiện. | Báo cáo Mục 4.4 (Bảng 4.5) đã liệt kê chi tiết các tệp: `app/layout.tsx`, `app/page.tsx`, `MovieCard.tsx`, `MovieRow.tsx`, `services/client.ts`. | **ĐẠT** |
| **CL3** | Liệt kê các mục Tầng 1B nhóm chủ động chọn vì phù hợp ứng dụng; nêu lý do chọn. | Đã liệt kê và giải trình 5 mục: Dynamic Route, ISR Caching, Server Action/Route Handler, Streaming Suspense, và Image/Font/Metadata. | **ĐẠT** |
| **CL4** | Liệt kê các yêu cầu Tầng 2 đã thực hiện và minh chứng chạy/test/repo. | Bảng 4.1 và Bảng 4.5 liệt kê Git, README, Secret, TypeScript, ESLint, Node test. Tuy nhiên bị giảm trừ điểm do kiểm thử hình thức. | **ĐẠT MỘT PHẦN** |
| **CL5** | Liệt kê Tầng 3 nếu có; mỗi mục phải kèm số liệu, test case hoặc minh chứng kỹ thuật tương xứng. | Bundle Analyzer, Streaming, Image có mã nguồn; nhưng số liệu định lượng (Lighthouse, TTFB) đã bị rút bỏ hoàn toàn do thiếu minh chứng thô. | **CHƯA ĐẠT MINH CHỨNG SỐ LIỆU** |
| **CL6** | Bảng phủ kỹ thuật trong báo cáo phải khớp code đã nộp; không khai kỹ thuật chỉ có trong slide hoặc demo rời. | Có sự sai lệch: FR06 khai có "thông tin số mùa phát sóng" nhưng code không có; hình 2.2 thiếu route `/tv`; khai cookie chỉ đọc ở `/watchlist` nhưng code `/movie/[id]` cũng đọc. | **CÒN SAI LỆCH (CẦN SỬA)** |
| **CL7** | Chuẩn bị để bất kỳ thành viên nào cũng có thể tìm đúng code, sửa một yêu cầu nhỏ và giải thích cơ chế mà không dùng AI. | Cấu trúc code mô-đun hóa sạch sẽ, tường minh giữa Server và Client, dễ định vị và giải trình khi vấn đáp. | **ĐẠT** |
| **CL8** | Kiểm tra lại phạm vi nghiệp vụ: nếu nhóm vẫn dành phần lớn thời gian cho quy trình/dữ liệu nghiệp vụ thay vì công nghệ, hãy đơn giản hóa. | Nhóm bị sa đà vào việc ép hiển thị 24 phim/trang (viết thuật toán phức tạp ở `services/discover.ts`), tính năng TV Series nửa vời, và monkey-patching DNS. Cần tinh giản ngay! | **CẦN TINH GIẢN GẤP** |

---

## 3. PHÂN TÍCH CHUYÊN SÂU CÁC KHIẾM KHUYẾT & LỖ HỔNG CỐT LÕI

### 3.1. Vấn nạn Kiểm thử Tự động Hình thức (Potemkin Verification) và Sự biến mất của Vitest

Một trong những phát hiện nghiêm trọng nhất trong cuộc kiểm định này nằm ở hệ thống kiểm thử tự động của dự án:

#### 1. Bản chất mô phỏng của `scripts/test-suite.mjs` (24 test cases):
Báo cáo học thuật `baocao.tex` (Bảng 4.1, dòng 1164) khẳng định: *"node scripts/test-suite.mjs: 24 ca kiểm thử tự động xác minh: kiểm thực đầu vào Live Search, giới hạn dung lượng Cookie Watchlist (< 3800 bytes RFC 6265, tối đa 200 mục)..."*. Tuy nhiên, khi soi chiếu vào từng dòng mã của tệp này:
- **Dòng 29-37:** Tệp tự định nghĩa một hàm cục bộ có tên `validateQuickSearch(query)` bên trong tệp test và chạy assert trên hàm này. Tệp **hoàn toàn KHÔNG import hàm thật `quickSearchAction` từ `app/actions/search.ts`**!
- **Dòng 67-92:** Tệp tự định nghĩa các hàm cục bộ `validateMovieId`, `checkCookieCapacity`, `parseCookieIds` bên trong test và chạy assert trên các hàm này. Tệp **hoàn toàn KHÔNG import từ `app/actions/watchlist.ts`**!
- **Dòng 136-185:** Kịch bản dùng `fs.readFileSync` đọc tệp `.tsx` dưới dạng chuỗi văn bản thuần túy và dùng `.includes()` để đếm chuỗi (ví dụ kiểm tra xem có chuỗi `updateFilter("type"` hay `as any` không).

```typescript
// scripts/test-suite.mjs (Dòng 29-37) - TỰ MÔ PHỎNG LẠI CODE ĐỂ TEST CHÍNH NÓ!
function validateQuickSearch(query) {
    if (!query || typeof query !== "string") return { valid: false, reason: "invalid_type" };
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return { valid: false, reason: "invalid_length" };
    const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, "");
    if (!sanitized) return { valid: false, reason: "empty_after_sanitize" };
    return { valid: true, sanitized };
}
```

Đây là biểu hiện kinh điển của **"Làng Potemkin" trong kiểm thử phần mềm (Potemkin Verification)**: xây dựng một vỏ bọc hào nhoáng vượt qua 24/24 ca kiểm thử để đưa vào báo cáo, nhưng nếu mã nguồn thật trong `app/actions/` bị lỗi hoặc sửa đổi, bộ test này vẫn xanh 100% vì nó không hề kiểm thử mã nguồn thật!

#### 2. Lịch sử xóa sổ toàn bộ hệ thống Unit Test chuẩn mực:
Truy vết lịch sử Git phát hiện tại Commit `20b5175e5a226a257e60c142a9838617ec11d0f5` (ngày 28/09/2026), nhóm phát triển đã thực hiện xóa bỏ:
- `__tests__/components/MovieCard.test.tsx`
- `__tests__/components/WatchlistButton.test.tsx`
- `__tests__/utils/formatRuntime.test.ts`
- `vitest.config.mts` (gỡ bỏ hoàn toàn framework Vitest và React Testing Library)
kèm theo một kế hoạch mang tên `docs/superpowers/plans/2026-09-28-remove-tests-and-ci.md`. Sau đó, đến ngày 14/10/2026 (Commit `3b86fa1`), nhóm mới vội vã tạo lại 3 tệp test Node.js tối giản trong `tests/` (`deduplicate.test.mjs`, `server-client-boundary.test.mjs`, `server-fetch.test.mjs`) để đối phó với tiêu chí Tầng 2.

Hậu quả là dự án hiện tại **hoàn toàn không có kiểm thử Component thực thụ trên môi trường DOM giả lập, không có kiểm thử E2E (Playwright/Cypress), và không có công cụ đo lường độ bao phủ (Coverage).**

---

### 3.2. Cấu trúc Xử lý Lỗi bị Thủng ở Tầng Root

Theo chuẩn kỹ nghệ phần mềm Tầng 2 của `REQUIRE.md`: *"Xử lý lỗi và quan sát: Không để lỗi rơi tự do. Có thông báo lỗi phù hợp."* Trong kiến trúc Next.js App Router, hệ thống xử lý lỗi được phân cấp theo từng phân đoạn (segment).

Khảo sát thực tế thư mục `app/` phát hiện:
- Phân đoạn chi tiết phim có đầy đủ `app/movie/[id]/error.tsx` (Client Error Boundary) và `app/movie/[id]/not-found.tsx` (Segment 404).
- Tuy nhiên, **ở cấp thư mục gốc `app/`, DỰ ÁN HOÀN TOÀN THIẾU:**
  1. **`app/error.tsx`:** Error Boundary mặc định cho toàn bộ các trang cấp cao (`/`, `/browse`, `/tv`, `/search`, `/watchlist`). Khi có bất kỳ lỗi runtime nào xảy ra ở các trang này, toàn bộ ứng dụng sẽ bị sụp đổ (crash) và rơi vào màn hình lỗi nội bộ thô của Next.js.
  2. **`app/global-error.tsx`:** Thành phần bắt buộc để bắt lỗi phát sinh ngay bên trong Root Layout (`app/layout.tsx`).
  3. **`app/not-found.tsx`:** Trang 404 cấp Root. Hiện tại, khi người dùng gõ sai bất kỳ đường dẫn nào ngoài `/movie/[id]` (ví dụ `/abc`, `/phim-moi`, `/user`), Next.js rơi về trang 404 đen trắng mặc định của framework, phá vỡ hoàn toàn trải nghiệm điện ảnh của Netflix Dark Cinema.

```
THỰC TRẠNG PHÂN CẤP XỬ LÝ LỖI TRONG APP ROUTER CỦA MOVIEHUB:

app/
├── layout.tsx
├── page.tsx
├── [KHUYẾT] error.tsx          <-- NGUY HIỂM: Lỗi tại trang chủ/browse làm sập toàn trang
├── [KHUYẾT] global-error.tsx   <-- NGUY HIỂM: Lỗi tại RootLayout không có bộ bắt lỗi
├── [KHUYẾT] not-found.tsx      <-- NGUY HIỂM: Route sai rơi về 404 thô mặc định
└── movie/[id]/
    ├── error.tsx               <-- ĐÃ CÓ: Hoạt động tốt
    └── not-found.tsx           <-- ĐÃ CÓ: Phong cách Netflix
```

---

### 3.3. Thiếu hụt SEO Cốt lõi (Sitemap, Robots) và Tiêu chuẩn An ninh Mạng (CSP)

Dù được xếp vào danh mục kỹ thuật Tầng 3 (Nâng cao), dự án MovieHub lại bỏ quên các trụ cột nền tảng nhất của một ứng dụng web sản phẩm:

#### 1. Hoàn toàn vắng bóng `sitemap.ts` và `robots.ts`:
Next.js App Router cung cấp giải pháp khai báo SEO tự động thông qua File Conventions `sitemap.ts` và `robots.ts`. Quét toàn bộ thư mục `app/` và `public/` xác nhận:
- **0 tệp `sitemap.ts` / `sitemap.xml`:** Các công cụ tìm kiếm (Google, Bing) không có danh mục chỉ mục để thu thập dữ liệu hàng ngàn bộ phim động của MovieHub.
- **0 tệp `robots.ts` / `robots.txt`:** Ứng dụng không có chỉ thị cho web crawler biết tuyến đường nào được phép hay không được phép đánh chỉ mục (ví dụ `/api/search` hay các endpoint nội bộ).

#### 2. Lỗ hổng bảo mật tiêu đề HTTP (Content Security Policy - CSP):
Khảo sát tệp cấu hình `next.config.ts:8-18`:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
};
```
Tệp cấu hình **hoàn toàn không có phương thức `headers()`**. Điều này đồng nghĩa với việc ứng dụng:
- Không có tiêu đề `Content-Security-Policy`: Cho phép nạp script tùy tiện từ bên ngoài, mở toang rủi ro tấn công XSS.
- Không có `X-Frame-Options: DENY`: Ứng dụng có thể bị nhúng vào `<iframe>` của website lừa đảo để thực hiện tấn công Clickjacking.
- Không có `X-Content-Type-Options: nosniff` và `Referrer-Policy`.
- Dự án cũng không tạo tệp `middleware.ts` để tiêm các tiêu đề bảo mật này ở tầng mạng.

---

### 3.4. Lỗi Logic và Phá vỡ Luồng Người dùng Phân hệ TV Series (`/tv` -> `/movie/[id]` HTTP 404)

Phân hệ Phim bộ (`app/tv/page.tsx`) là một minh chứng điển hình của việc phát triển tính năng vội vã, thiếu kiểm thử tích hợp:

1. **Hiển thị danh sách:** Tệp `app/tv/page.tsx:126-128` lấy danh sách TV Series từ `getTvPopular` và lặp qua mảng để render component `MovieCard`:
   ```tsx
   // app/tv/page.tsx:126-128
   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
       {results.map((movie, index) => (
           <MovieCard key={`${movie.id}-${index}`} movie={movie} />
       ))}
   </div>
   ```
2. **Hardcode liên kết trong thẻ:** Nhìn vào `components/server/MovieCard.tsx:26`, thẻ liên kết điều hướng được cố định cứng:
   ```tsx
   // components/server/MovieCard.tsx:26
   <Link href={'/movie/' + movie.id} ...>
   ```
3. **Sụp đổ luồng khi người dùng tương tác:** 
   - Khi người dùng nhấp vào một bộ phim truyền hình (ví dụ: *Squid Game* hoặc *Stranger Things*) trên trang `/tv`, ứng dụng sẽ điều hướng sang URL `/movie/[id]`.
   - Tại `app/movie/[id]/page.tsx:70`, trang gọi hàm `getMovieDetails(id)`.
   - Hàm `getMovieDetails` gọi endpoint của TMDB là `/movie/${id}`. Do đây là ID của phim bộ (TV Series), cơ sở dữ liệu TMDB trả về mã lỗi **HTTP 404 (Not Found)**.
   - Trang `/movie/[id]` ngay lập tức kích hoạt `notFound()`, đẩy người dùng vào màn hình báo lỗi không tìm thấy phim!
   - Dự án **hoàn toàn không có route `app/tv/[id]/page.tsx`** để hiển thị chi tiết phim bộ.

Đây là một lỗi nghiệp vụ và trải nghiệm nghiêm trọng (Broken User Experience), biến toàn bộ trang `/tv` thành một cái bẫy dẫn người dùng đến trang lỗi 404.

---

## 4. NHẬN DIỆN & PHÂN TÍCH CHI TIẾT CÁC PHẦN DƯ THỪA, QUÁ ĐÀ VÀ LỆCH TRỌNG TÂM (R4)

Checklist `REQUIRE.md` (Mục 8 & Câu ghi nhớ) nêu rõ:
> *"Bài toán chỉ cần đủ đơn giản để công nghệ có chỗ thể hiện. Điểm cao đến từ việc hiểu đúng, dùng đúng và đào sâu công nghệ — không đến từ việc xây một 'hệ thống nghiệp vụ thật' thật lớn."*  
> *"Nếu nhóm vẫn dành phần lớn thời gian cho quy trình/dữ liệu nghiệp vụ thay vì công nghệ, hãy đơn giản hóa trước khi quá muộn."*

Quá trình giám định phát hiện ít nhất **6 điểm dư thừa, quá đà và lệch trọng tâm** nghiêm trọng trong dự án MovieHub:

```
               DANH MỤC 6 ĐIỂM DƯ THỪA & LỆCH TRỌNG TÂM (R4)
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 1. Monkey-Patching DNS toàn cục (services/client.ts:6-37)              │
 │ 2. Dead Server Action: quickSearchAction (app/actions/search.ts)       │
 │ 3. Component bỏ hoang & Alias rác (MovieSection.tsx, Header.tsx)       │
 │ 4. Thuật toán ép lấy 24 items gây bội chi API TMDB (discover.ts)       │
 │ 5. Cookie-as-Database ép Dynamic SSR (/movie/[id]/page.tsx)            │
 │ 6. Phân hệ TV Series nửa vời, gãy luồng điều hướng (app/tv/page.tsx)   │
 └────────────────────────────────────────────────────────────────────────┘
```

### 4.1. DNS Fallback Resolver can thiệp socket toàn cục của Node.js (`services/client.ts:6-37`)
- **Hiện tượng:** Tại `services/client.ts:6-37`, nhóm tác giả chèn một đoạn mã tự động ghi đè hàm `dns.lookup` toàn cục của tiến trình Node.js:
  ```typescript
  // @ts-expect-error Node.js internal lookup overload
  dns.lookup = function (hostname: string, options: unknown, callback: unknown) {
      // Ép dùng resolver.setServers(["8.8.8.8", "1.1.1.1"]) khi hostname chứa "themoviedb.org"
  }
  ```
- **Lý do kỹ thuật phản biện:**
  1. *Lệch chuẩn môn học:* Đây là giải pháp can thiệp sâu vào tầng socket hệ điều hành của Node.js runtime, hoàn toàn không phải cơ chế hay tính năng của Next.js App Router.
  2. *Nguy cơ rủi ro cao:* Monkey-patching một hàm hệ thống toàn cục sẽ ảnh hưởng tiêu cực đến tất cả các thư viện và kết nối mạng khác trong cùng tiến trình máy chủ.
  3. *Không khả dụng trên Edge:* Đoạn mã sử dụng thư viện `node:dns`, khiến toàn bộ ứng dụng bị khóa chặt vào môi trường Node.js Server runtime, hoàn toàn không thể triển khai trên Vercel Edge Runtime hay Cloudflare Workers.
  4. *Tốn tài nguyên báo cáo:* Trước đây nhóm dành tới 3 mục lớn trong báo cáo (`2.3.2`, `3.5.1`, `TC10`) để ca ngợi cơ chế này như một tính năng "tự phục hồi". Cần loại bỏ khỏi danh mục tính năng công nghệ của đồ án.

### 4.2. Mã chết Server Action tìm kiếm (`app/actions/search.ts:1-30`)
- **Hiện tượng:** Tệp `app/actions/search.ts` dài 30 dòng khai báo `"use server"` và export hàm `quickSearchAction(query: string)`.
- **Lý do kỹ thuật phản biện:**
  - Toàn bộ giao diện tìm kiếm người dùng (`components/client/NavSearchBar.tsx:66`) đã được chuyển đổi sang gọi Route Handler `GET /api/search?q=...` để tận dụng HTTP Caching và `AbortController`.
  - Quét toàn bộ mã nguồn: **Không có bất kỳ component, trang hay hook nào import hoặc gọi hàm `quickSearchAction`**. Hàm này là **Dead Code (Mã chết)** 100%, nhưng vẫn được giữ lại và tạo hàm mock clone trong `scripts/test-suite.mjs` nhằm đối phó bài kiểm tra an ninh đầu vào. Cần xóa bỏ tệp này ngay lập tức.

### 4.3. Các component bỏ hoang và Alias rác (`components/server/Header.tsx`, `MovieSection.tsx`)
- **`components/server/Header.tsx` (dòng 1-2):** Chỉ chứa đúng 1 dòng:
  ```typescript
  export { default } from "@/components/client/Header";
  ```
  Trong khi đó, `app/layout.tsx:4` đã trực tiếp import `@/components/client/Header`. Tệp re-export này hoàn toàn vô dụng, tạo ra sự nhầm lẫn tai hại rằng Header là Server Component.
- **`components/server/MovieSection.tsx` (dòng 1-49):** Component hiển thị lưới phim dạng CSS Grid (49 dòng). Toàn bộ trang chủ `app/page.tsx` đã chuyển sang dùng `MovieRow` thanh trượt cuộn ngang phong cách Netflix. Tệp này bị bỏ hoang, không được import ở bất kỳ đâu trong repo.

### 4.4. Kỹ thuật ép lấy 24 items gây nhân đôi/ba số lượng request upstream TMDB (`services/discover.ts`, `services/movies.ts`)
- **Hiện tượng:** TMDB API quy định trả về cố định 20 kết quả/trang. Để ép giao diện hiển thị lưới đẹp 4 hàng x 6 cột (24 phim) hoặc 2 hàng x 12 cột, tại `services/discover.ts:48-75` và `services/movies.ts:9-44`, nhóm viết logic tính toán phân trang phức tạp:
  ```typescript
  // services/discover.ts:55-56
  const firstTmdbPage = Math.min(Math.floor(startIdx / 20) + 1, 500);
  const secondTmdbPage = Math.min(Math.floor((endIdx - 1) / 20) + 1, 500);
  // Thực hiện Promise.all gọi cả firstTmdbPage và secondTmdbPage, rồi deduplicate và slice!
  ```
- **Lý do kỹ thuật phản biện:**
  - Đây là biểu hiện rõ rệt của **Over-engineering (quá đà về mặt kỹ thuật)**.
  - Tại trang chủ `app/page.tsx:21-27`, việc gọi 5 hàng phim với tham số `limit = 24` đã phát sinh từ **9 đến 10 HTTP requests đồng thời tới TMDB** chỉ để render một trang tĩnh, làm tăng gấp đôi độ trễ mạng và tiêu tốn hạn ngạch API một cách vô ích chỉ vì muốn hiển thị thêm 4 bộ phim.
  - Giải pháp đúng đắn: Giữ nguyên giới hạn chuẩn 20 phim của TMDB, thiết kế CSS Grid đáp ứng linh hoạt theo số lượng phần tử tự nhiên.

### 4.5. Kiến trúc "Cookie-as-Database" và vi phạm ranh giới Server Component tại trang chi tiết (`app/movie/[id]/page.tsx`)
- **Hiện tượng:** Thay vì sử dụng một giải pháp lưu trữ dữ liệu bền vững hoặc Client LocalStorage đơn giản, nhóm biến HTTP Cookie thành một cơ sở dữ liệu lưu danh sách ID phim yêu thích với các hàm tính byte phức tạp (`MAX_WATCHLIST_COOKIE_BYTES = 3800`, `MAX_WATCHLIST_ITEMS = 200`).
- **Hậu quả kiến trúc nghiêm trọng:**
  - Tại `app/movie/[id]/page.tsx:94-97`:
    ```tsx
    const [isSaved, videos] = await Promise.all([
      isMovieSaved(movie.id),
      getMovieVideos(movie.id.toString()),
    ]);
    ```
  - Hàm `isMovieSaved` (`app/actions/watchlist.ts:98`) gọi `await cookies()`.
  - Trong Next.js App Router, việc gọi `cookies()` trong quá trình render Server Component sẽ **ngay lập tức de-opt (hủy bỏ) cơ chế Static Caching / ISR của route đó**, ép toàn bộ trang `/movie/[id]` trở thành Dynamic Server-Rendered on demand (`ƒ /movie/[id]`).
  - Hơn nữa, việc này trực tiếp vi phạm tuyên bố trong `log.md:71` và `ORIGINAL_REQUEST.md:15` rằng *"Chỉ duy nhất trang `/watchlist` và Server Action đọc cookie"*.
  - Giải pháp chuẩn mực: Trang chi tiết `/movie/[id]` chỉ nên render nội dung phim tĩnh; việc kiểm tra trạng thái yêu thích của người dùng phải được đẩy xuống Client Component `WatchlistButton` thông qua React Context hoặc Client State sau khi mount.

### 4.6. Tính năng nửa vời và thiếu đồng bộ dữ liệu của phân hệ TV Series (`app/tv/page.tsx`)
- Phân hệ TV Series được nhóm phát triển thêm nhằm tăng số lượng tính năng, nhưng:
  1. Không có trang chi tiết `app/tv/[id]/page.tsx`, bấm vào thẻ phim trên trang `/tv` bị dẫn sang `/movie/[id]` và sinh lỗi HTTP 404 từ TMDB.
  2. Báo cáo `baocao.tex:715` (Bảng 2.1, FR06) tuyên bố có "thông tin số mùa phát sóng", nhưng trong mã nguồn thực tế không có bất kỳ dòng code nào hiển thị số mùa.
  3. Sơ đồ luồng Hình 2.2 của báo cáo hoàn toàn bỏ quên sự tồn tại của route `/tv`.
- Kiến nghị: Cắt bỏ phân hệ `/tv` hoặc hoàn thiện đầy đủ route `app/tv/[id]` theo đúng nguyên tắc kỹ nghệ phần mềm.

---

## 5. ĐỐI SOÁT & THẨM ĐỊNH BÁO CÁO HỌC THUẬT (BAOCAO.TEX) VÀ PHẢN BIỆN (PROPLEM.MD)

### 5.1. Các tuyên bố sai lệch, phóng đại hoặc mâu thuẫn còn tồn đọng trong `baocao.tex`

Qua đối soát chéo giữa tệp bản thảo `baocao/baocao.tex` và mã nguồn thực tế, chuyên viên giám định ghi nhận nhóm tác giả đã rất cầu thị sửa chữa nhiều điểm lớn sau phản biện của `PROPLEM.md` (rút các bảng số liệu giả lập, sửa lỗi HttpOnly, đính chính Promise params). Tuy nhiên, văn bản báo cáo vẫn còn tồn đọng **5 sai sót và mâu thuẫn học thuật**:

1. **Yêu cầu chức năng FR06 không khớp mã nguồn (`baocao.tex:715`):**  
   - *Báo cáo viết:* Bảng 2.1 ghi FR06: *"Cung cấp phân hệ duyệt danh sách phim truyền hình nhiều tập (TV Series) thịnh hành với thông tin số mùa phát sóng."*  
   - *Thực tế mã nguồn:* `app/tv/page.tsx:126-128` chỉ render `MovieCard`. Trong `components/server/MovieCard.tsx:49-55`, thẻ chỉ hiển thị `matchPercent` và `releaseYear`. Hoàn toàn không có thuộc tính `number_of_seasons`. Đây là tuyên bố tính năng chưa hiện thực.
2. **Sơ đồ điều hướng hệ thống bỏ sót phân hệ chính (`baocao.tex:868`, Hình 2.2):**  
   - *Báo cáo vẽ:* Sơ đồ luồng Hình 2.2 liệt kê: Home, Detail `/movie/[id]`, Watchlist `/watchlist`, Browse `/browse`, Trailer Modal, Search `/search`.  
   - *Thực tế:* Tuyến `/tv` (Phim bộ) hoàn toàn biến mất trong sơ đồ kiến trúc tổng thể, dù trong báo cáo dành riêng mục 3.4.5 để thuyết minh về nó.
3. **Mâu thuẫn về ranh giới đọc `cookies()` (`baocao.tex:1185` vs `log.md:71`):**  
   - *Tài liệu ghi:* `log.md:71` khẳng định: *"Chỉ duy nhất trang `app/watchlist/page.tsx` và Server Action đọc cookie; Header và MovieCard không đọc cookie."*  
   - *Thực tế mã nguồn:* Bảng 4.3 của báo cáo (`baocao.tex:1185`) ghi rõ route `/movie/[id]` là Dynamic vì *"Đọc tham số id và cookie Watchlist"*. Sự mâu thuẫn này chứng minh nhóm nhận thức được việc gọi `isMovieSaved` trong `app/movie/[id]/page.tsx:95` đọc cookie, nhưng tài liệu log và cam kết ban đầu lại khẳng định ngược lại.
4. **Bản chất của suite kiểm thử 24/24 (`baocao.tex:1164`):**  
   - Bảng 4.1 của báo cáo vẫn tiếp tục duy trì dòng khẳng định: *"node scripts/test-suite.mjs: 24 ca kiểm thử tự động xác minh: kiểm thực đầu vào Live Search, giới hạn dung lượng Cookie Watchlist..."*. Như đã phân tích tại Mục 3.1, đây là sự che giấu bản chất kiểm thử mô phỏng nội bộ và đọc chuỗi tĩnh.
5. **Tính bất đồng bộ của Zero-Bundle ranh giới:**  
   - Báo cáo (dòng 1195, 1214) tự hào khẳng định giải pháp Zero-Bundle cho thanh trượt slider: `MovieRow` và `SimilarMoviesSlider` nhận `cards={...}` qua props.  
   - Tuy nhiên, `components/client/CastSlider.tsx:8` vẫn nhận mảng dữ liệu thô `cast: CastMember[]` và render toàn bộ markup ở phía client. Kiểm thử `tests/server-client-boundary.test.mjs` đã cố tình bỏ qua `CastSlider.tsx` để bảo đảm test pass.

---

### 5.2. Thẩm định chi tiết 8 nhận xét phản biện P1 – P8 trong `PROPLEM.md`

Dưới đây là bảng đối soát chi tiết tính xác thực và mức độ khắc phục đối với toàn bộ 8 vấn đề cốt lõi trong `PROPLEM.md`:

| Mã | Nội Dung Phê Bình Cốt Lõi Trong PROPLEM.md | Bằng Chứng Thực Chứng & Phân Tích Mã Nguồn | Thẩm Định Độ Chuẩn Xác | Trạng Thái Khắc Phục Hiện Tại |
|:---:|:---|:---|:---:|:---:|
| **P1** | `fetch(url, {next: {revalidate}})` vẫn là API cache hợp lệ; cần nêu bản Next.js, `cacheComponents: false`, và bảng route từ `next build`. | `services/client.ts:63` duy trì `next: { revalidate }`. `next.config.ts:8-18` tắt cờ thực nghiệm (`cacheComponents: false`). Output `npm run build` hiển thị bảng route chuẩn. Báo cáo Bảng 4.3 đã trích xuất nguyên văn từ build log. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** |
| **P2** | Kiểm tra route nào đọc `cookies()`; `Header`/`MovieCard` không đọc cookie; Streaming và ISR không loại trừ nhau tuyệt đối. | `Header.tsx` chỉ dùng `window.scrollY`. `MovieCard.tsx` chỉ nhận props. `watchlist/page.tsx` và `movie/[id]/page.tsx` đọc `cookies()`. Streaming truyền chunk HTML trong khi Data Cache lưu kết quả fetch TMDB. Báo cáo Mục 2.1 và 4.2 đã làm rõ sự tương hỗ này. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** |
| **P3** | Thử nghiệm TTFB thiếu cơ sở: đồng thời 150/450/600ms không thể ra 750ms; kịch bản B 180ms thiếu minh chứng; lẫn lộn TTFB và FCP. | Về toán học: $\max(150, 450, 600) = 600$ms khi song song hoặc 1200ms khi tuần tự; con số 750ms là phi lý. TTFB (nhận byte đầu) khác FCP (vẽ pixel đầu). Báo cáo `baocao.tex:1150` đã rút toàn bộ bảng đo bịa đặt và phân biệt rạch ròi hai chỉ số này. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** (Rút số liệu sai) |
| **P4** | Số liệu hiệu năng không nhất quán/không nguồn (Lighthouse 98-100, FCP 0.6s vs 220ms, giảm 72% JS không có đối chứng). Next 16 bỏ cột First Load JS. | Build output xác nhận Turbopack không còn cột First Load JS. Repo không có app React SPA đối chứng để đo giảm 72%. Nhóm tác giả đã rút toàn bộ tuyên bố số liệu hiệu năng khỏi `baocao.tex:1150`. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** (Rút số liệu sai) |
| **P5** | Server Action cho tìm kiếm là bất hợp lý (POST, tuần tự, không cache); HttpOnly không ngăn chặn hoàn toàn XSS; thiếu kiểm thực đầu vào Server Action; giới hạn 4KB cookie. | UI đã chuyển sang Route Handler GET `/api/search` có Cache-Control và AbortController. `app/actions/watchlist.ts:40, 66` đã thêm kiểm tra số nguyên dương và giới hạn 3800 bytes. Báo cáo dòng 655 và 1202 đã đính chính chính xác nguyên lý HttpOnly. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** (Còn sót dead code `search.ts`) |
| **P6** | DNS Fallback Resolver là xử lý hạ tầng, không phải cơ chế Next.js; `dns.setServers()` không ảnh hưởng `dns.lookup`/`fetch`; chỉ chạy trên Node, không chạy trên Edge. | `services/client.ts:6-37` đã monkey-patch `dns.lookup`. Nhóm đã thừa nhận tại `baocao.tex:1070` rằng đây không phải cơ chế của Next.js và loại bỏ khỏi danh mục tính năng Tầng 1B. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ VỀ LÝ THUYẾT** (Code vẫn còn monkey-patch) |
| **P7** | Sai sót học thuật: FR04 ghi IMDb thay vì TMDB `vote_average`; WCAG AAA chỉ dựa vào màu chữ; Promise params từ Next 15 và bắt buộc ở 16; trích dẫn [7] sai tác giả L. Clark. | Điểm số là TMDB `vote_average`. Màu chữ 18.4:1 chỉ đạt WCAG AA. `params` Promise bắt đầu từ Next 15. Trích dẫn [7] đã sửa thành D. Abramov, L. Tan, S. Markbåge, J. Savona (`baocao.tex:1273`). Báo cáo đã sửa lại toàn bộ các điểm này. | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** |
| **P8** | Thiếu so sánh công nghệ ngoài Next.js (React+Vite, Nuxt 4, Astro) và thiếu phân tích "Khi nào KHÔNG nên dùng Next.js". | Báo cáo đã bổ sung Bảng 1.2 (`baocao.tex:453-468`) so sánh toàn diện với Vite, Nuxt, Astro; và bổ sung Mục 1.1.4 (`baocao.tex:470-484`) phân tích chuyên sâu 3 kịch bản không nên dùng Next.js cùng các thách thức kỹ thuật cố hữu (Cold starts, Vendor lock-in, Caching đa tầng). | **100% CHÍNH XÁC** | **ĐÃ XỬ LÝ TRIỆT ĐỂ** |

---

## 6. LỘ TRÌNH CẢI TIẾN & KHẮC PHỤC TOÀN DIỆN (ACTIONABLE REMEDIATION ROADMAP)

Để đưa dự án MovieHub đạt chuẩn mực hoàn hảo trước khi hội đồng chấm thi đánh giá, nhóm phát triển cần thực thi lộ trình hành động 3 giai đoạn được ưu tiên nghiêm ngặt theo mức độ rủi ro:

```
                   LỘ TRÌNH CẢI TIẾN 3 GIAI ĐOẠN
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: Vá Lỗi Khẩn Cấp & Tinh Giản Hệ Thống (Zero-Waste)        │
│ 1. Xóa mã chết app/actions/search.ts, MovieSection.tsx, Header.tsx    │
│ 2. Gỡ bỏ DNS monkey-patching trong services/client.ts                  │
│ 3. Sửa dứt điểm lỗi liên kết 404 trên trang /tv                        │
├────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 2: Hoàn Thiện Cấu Trúc Ứng Dụng Chuẩn Mực                    │
│ 1. Bổ sung app/error.tsx, app/global-error.tsx, app/not-found.tsx      │
│ 2. Bổ sung app/sitemap.ts và app/robots.ts (Chuẩn SEO Tầng 3)          │
│ 3. Cấu hình Content-Security-Policy & Security Headers trong config   │
│ 4. Sửa lỗi thẻ ngữ nghĩa Accessibility (Footer.tsx, Header.tsx)        │
│ 5. Tách isMovieSaved khỏi Server Component /movie/[id]                 │
├────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 3: Chuẩn Hóa Kiểm Thử Thực Chất & Đồng Bộ Tài Liệu          │
│ 1. Tái cấu trúc bộ test: Xóa hàm clone trong test-suite.mjs            │
│ 2. Bổ sung test Component/DOM hoặc đưa adversarial-probe vào CI        │
│ 3. Hiệu đính baocao.tex (sửa FR06, cập nhật hình 2.2, giải trình test) │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Giai đoạn 1: Vá lỗi khẩn cấp, loại bỏ mã chết và tinh giản hệ thống (Zero-Waste Refactoring)
*Thời hạn thực hiện: Ngay lập tức — Đánh giá rủi ro: Cực kỳ nguy cấp.*

1. **Xóa bỏ các tệp mã chết và thành phần bỏ hoang:**
   - Xóa tệp `app/actions/search.ts` vì thanh tìm kiếm đã dùng hoàn toàn Route Handler GET `/api/search`.
   - Xóa tệp `components/server/Header.tsx` (re-export alias rác).
   - Xóa tệp `components/server/MovieSection.tsx` (component CSS grid bị bỏ rơi).
2. **Loại bỏ DNS Monkey-Patching khỏi `services/client.ts`:**
   - Xóa bỏ toàn bộ khối mã ghi đè `dns.lookup` từ dòng 6 đến 37 trong `services/client.ts`.
   - Chuyển giải pháp này thành tài liệu hướng dẫn trong `README.md`: Hướng dẫn lập trình viên đổi DNS máy sang `8.8.8.8` hoặc dùng biến `TMDB_BASE_URL` trỏ qua proxy nếu ISP chặn TMDB. Không can thiệp mã nguồn ứng dụng để giải quyết sự cố mạng cục bộ.
3. **Khắc phục triệt để lỗi gãy luồng tại phân hệ Phim bộ (`/tv`):**
   - *Phương án A (Khuyến nghị cao nhất):* Loại bỏ hoàn toàn route `app/tv/page.tsx` và menu "Phim T.hình" trên Header. Thu gọn toàn bộ phạm vi đồ án vào duy nhất đối tượng "Phim ảnh" (Movie) theo đúng tinh thần Checklist 8 của `REQUIRE.md`.
   - *Phương án B:* Nếu giữ lại, bắt buộc tạo `app/tv/[id]/page.tsx` và cập nhật `MovieCard` để nhận diện liên kết động: `href={movie.first_air_date ? '/tv/' + movie.id : '/movie/' + movie.id}`.
4. **Tinh giản số lượng request lấy phim (Bỏ ép 24 items):**
   - Sửa `limit = 20` mặc định trong `services/discover.ts` và `services/movies.ts`. Xóa bỏ thuật toán gọi song song 2-3 trang TMDB, giúp giảm 50% số lượng request mạng khi tải trang chủ.

---

### 6.2. Giai đoạn 2: Hoàn thiện cấu trúc ứng dụng chuẩn mực (Structural Completion)
*Thời hạn thực hiện: Ưu tiên cao — Hoàn thiện kiến trúc Next.js App Router.*

1. **Bổ sung hệ thống Error Boundaries và 404 cấp Root:**
   - Tạo `app/error.tsx` (Client Component): Bắt mọi lỗi runtime cấp cao với giao diện chuẩn Netflix Dark Cinema, nút "Thử Lại" và nút "Về Trang Chủ".
   - Tạo `app/global-error.tsx`: Bắt lỗi tại Root Layout.
   - Tạo `app/not-found.tsx`: Giao diện 404 thân thiện cho toàn bộ ứng dụng khi truy cập URL không tồn tại.
2. **Hoàn thiện 100% tiêu chí SEO Tầng 3:**
   - Tạo `app/sitemap.ts`: Trả về danh sách URL tĩnh và các ID phim phổ biến từ TMDB.
   - Tạo `app/robots.ts`: Thiết lập `User-Agent: *`, `Allow: /`, `Disallow: /api/`, trỏ đường dẫn tới `sitemap.xml`.
3. **Thiết lập Tiêu đề An ninh Mạng (Security Headers & CSP):**
   - Bổ sung hàm async `headers()` trong `next.config.ts` với các tiêu đề bảo vệ:
     - `Content-Security-Policy: default-src 'self'; img-src 'self' https://image.tmdb.org data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...`
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
4. **Khắc phục các vi phạm Accessibility (a11y):**
   - Sửa `components/server/Footer.tsx:16-24`: Chuyển các thẻ `<span className="cursor-pointer">` thành thẻ `<a>` có liên kết hợp lệ.
   - Sửa `components/client/Header.tsx:165`: Thêm `aria-label="Thông báo"` cho nút chuông.
   - Sửa `components/client/Header.tsx:177`: Thêm `role="button"`, `tabIndex={0}`, và xử lý phím `Enter` cho Avatar profile.
   - Bổ sung lắng nghe phím `Escape` để đóng `NavbarDropdown.tsx`.
5. **Giải phóng ranh giới Server Component tại `/movie/[id]`:**
   - Loại bỏ lời gọi `isMovieSaved` khỏi Server Component `app/movie/[id]/page.tsx:95`.
   - Chuyển việc kiểm tra trạng thái lưu Watchlist vào bên trong Client Component `WatchlistButton.tsx` (đọc qua action hoặc cookie client sau khi mount), giúp trang `/movie/[id]` có thể áp dụng Static Pre-rendering hoặc Caching trọn vẹn.

---

### 6.3. Giai đoạn 3: Chuẩn hóa kiểm thử tự động thực chất & Đo lường định lượng (Genuine Testing & Metrics)
*Thời hạn thực hiện: Hoàn thiện hồ sơ nghiệm thu học thuật.*

1. **Chuẩn hóa bộ kiểm thử tự động:**
   - Xóa bỏ logic tự clone hàm trong `scripts/test-suite.mjs`. Chuyển các ca kiểm thử kiểm thực đầu vào vào thư mục `tests/` chính thức (ví dụ: `tests/watchlist-validation.test.mjs`, `tests/search-route.test.mjs`) bằng cách **import trực tiếp** từ `app/actions/watchlist.ts` và `app/api/search/route.ts`.
   - Đưa kịch bản kiểm thử fuzzing thực thụ `scripts/adversarial-probe.mjs` vào quy trình chạy của GitHub Actions `.github/workflows/check.yml`.
2. **Đồng bộ hóa văn bản Báo cáo (`baocao/baocao.tex`):**
   - Sửa Bảng 2.1 (FR06): Xóa bỏ cụm từ "với thông tin số mùa phát sóng".
   - Bổ sung tuyến `/tv` vào Sơ đồ luồng Hình 2.2 (hoặc gỡ bỏ nếu đã xóa `/tv`).
   - Cập nhật Bảng 4.1 và Bảng 4.5: Trình bày trung thực số lượng test case đơn vị thực tế, giải thích rõ các kịch bản kiểm tra an ninh đầu vào.
3. **Thu thập dữ liệu định lượng thực nghiệm (Nếu muốn nghiệm thu Tầng 3):**
   - Chạy Google Lighthouse trên Chrome DevTools ở chế độ ẩn danh (Incognito) trên bản production (`npm run start`), lưu tệp JSON/HTML xuất ra vào `baocao/evidence/lighthouse-report.json`.
   - Lưu ảnh chụp Network tab của trình duyệt chứng minh 2 khối Suspense hiển thị Fallback trước khi nội dung thật được stream về.

---

## 7. PHƯƠNG PHÁP XÁC MINH ĐỘC LẬP (INDEPENDENT VERIFICATION METHODOLOGY)

Hội đồng chấm thi, giảng viên phản biện hoặc bất kỳ chuyên viên kiểm định độc lập nào đều có thể tái lập và xác minh 100% các kết luận trong báo cáo này thông qua các bước thực nghiệm sau tại thư mục gốc của dự án:

### 1. Kiểm tra tĩnh & Quy chuẩn biên dịch
```bash
# 1. Kiểm tra Linter ESLint 9 (Kỳ vọng: 0 errors, 0 warnings)
npm run lint

# 2. Kiểm tra kiểu dữ liệu TypeScript Strict Mode (Kỳ vọng: exit code 0)
npx tsc --noEmit

# 3. Quét kiểm tra việc sử dụng 'any' hoặc '@ts-ignore' trong mã nguồn
grep -rn "as any" app/ components/ services/ types/
grep -rn "@ts-ignore" app/ components/ services/ types/
# Kỳ vọng: 0 kết quả
```

### 2. Xác minh tính hình thức của bộ kiểm thử `scripts/test-suite.mjs`
```bash
# Xem các dòng tự định nghĩa lại hàm mock bên trong file test thay vì import
sed -n '28,38p' scripts/test-suite.mjs
sed -n '65,75p' scripts/test-suite.mjs

# Xem các bài test kiểm tra chuỗi tĩnh bằng fs.readFileSync
sed -n '135,153p' scripts/test-suite.mjs
```

### 3. Xác minh sự thiếu hụt của Root Error, SEO và Security Headers
```bash
# Kiểm tra Root Error Boundary và Root 404
ls -la app/error.tsx app/global-error.tsx app/not-found.tsx
# Kỳ vọng: ls thông báo 'No such file or directory'

# Kiểm tra Sitemap và Robots
find app public -name "*sitemap*"
find app public -name "*robots*"
# Kỳ vọng: Không có file nào được tìm thấy trong app/ hoặc public/

# Kiểm tra cấu hình Security Headers
cat next.config.ts
# Kỳ vọng: Không có hàm headers() hay cấu hình Content-Security-Policy
```

### 4. Xác minh mã chết và các thành phần bỏ hoang
```bash
# Kiểm tra mã chết quickSearchAction
grep -rn "quickSearchAction" app/ components/
# Kỳ vọng: Chỉ xuất hiện duy nhất tại app/actions/search.ts:11

# Kiểm tra component bị bỏ rơi MovieSection
grep -rn "MovieSection" app/ components/
# Kỳ vọng: Không có bất kỳ tệp nào import MovieSection

# Kiểm tra alias rác Header.tsx
cat components/server/Header.tsx
# Kỳ vọng: Chỉ có duy nhất 1 dòng export từ components/client/Header
```

### 5. Xác minh lỗi gãy luồng TV Series và đọc Cookie tại trang chi tiết
```bash
# Kiểm tra thẻ MovieCard trong app/tv/page.tsx dẫn link về /movie/[id]
grep -rn "href=" components/server/MovieCard.tsx
# Kỳ vọng: href={'/movie/' + movie.id}

# Xác nhận app/movie/[id]/page.tsx gọi isMovieSaved kích hoạt cookies()
grep -rn "isMovieSaved" app/movie/\[id\]/page.tsx
grep -rn "cookies()" app/actions/watchlist.ts
```

### 6. Xác minh việc gỡ bỏ Vitest trong lịch sử Git
```bash
git show 20b5175e5a226a257e60c142a9838617ec11d0f5 --stat
# Kỳ vọng: Hiển thị việc xóa __tests__/ và vitest.config.mts
```

---
*Báo cáo được hoàn thành và xác nhận chữ ký số kỹ thuật bởi Senior Software Quality & Architecture Specialist.*
