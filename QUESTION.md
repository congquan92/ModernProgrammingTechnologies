# BẢNG KỊCH BẢN VẤN ĐÁP BẢO VỆ ĐỒ ÁN (VIVA VOCE SCENARIOS)

> **Dự án:** MovieHub – Hệ sinh thái ứng dụng Web điện ảnh (Next.js 16 + React 19)  
> **Môn học:** Các công nghệ lập trình hiện đại  
> **Mục đích:** Bộ câu hỏi và câu trả lời bảo vệ chuyên sâu trước Hội đồng chuyên môn / Giảng viên hướng dẫn.

---

## 1. BẢNG TỔNG HỢP CÂU HỎI VÀ CÂU TRẢ LỜI BẢO VỆ

| STT | Câu hỏi tình huống của GVHD / Hội đồng | Trọng tâm kỹ thuật | Câu trả lời bảo vệ của nhóm sinh viên |
|:---:|:---|:---|:---|
| **1** | *Tại sao nhóm lại sử dụng Server Component làm mặc định mà không dùng Client Component cho toàn bộ trang web?* | React Server Components (RSC), Bảo mật | **Server Components lấy dữ liệu và dựng nội dung phía server**; module server không được gửi vào bundle client. `TMDB_API_KEY` chỉ được dùng ở server và không truyền qua props hay response. Client Components đảm nhiệm tương tác như tìm kiếm, slider và modal. HTML có dữ liệu hỗ trợ khả năng lập chỉ mục; FCP/LCP và kích thước bundle cần được đo trước khi kết luận hiệu năng. |
| **2** | *Cơ chế Streaming Suspense hoạt động như thế nào qua giao thức HTTP?* | React 19 Suspense, HTML streaming | **Next.js gửi HTML theo từng phần khi dữ liệu sẵn sàng**. Trang phim đợi chi tiết phim, video và trạng thái Watchlist trước khi dựng nội dung chính. Hai khối `CastList` và `SimilarMovies` có Suspense riêng: fallback được gửi trước, kết quả phụ được gửi sau khi truy vấn tương ứng hoàn tất. `scripts/verify-stream-evidence.mjs` kiểm tra thứ tự và thời điểm nhận HTML; FCP cần đo riêng trong trình duyệt. |
| **3** | *Server Action khác gì so với việc viết một API Route truyền thống?* | RPC vs RESTful, CSRF, Revalidation | **Server Action là lời gọi hàm từ xa (RPC - Remote Procedure Call)** tích hợp sẵn trong React 19 và Next.js. Nó loại bỏ nhu cầu khởi tạo các endpoint URL trung gian, thiết lập headers, phương thức POST và giải mã JSON thủ công. Bản chất là lời gọi POST an toàn, có thể gọi trực tiếp từ sự kiện client (`form action` hoặc hàm handler), đồng thời tự động tích hợp cơ chế tái tạo bộ nhớ đệm `revalidatePath('/watchlist')`. |
| **4** | *Tại sao dùng `fetch(..., { next: { revalidate } })` và khi nào cần Cache Components?* | Data Cache, ISR, Cache Components | **Dự án dùng `cacheComponents: false` và Data Cache có TTL qua `next.revalidate`**. Trang chủ gọi `await connection()` nên render khi có request; cache của từng fetch không biến toàn trang thành ISR. Cache Components là lựa chọn khác khi cần cache hàm/component bằng `use cache` và `cacheLife`; hiện dự án chưa sử dụng. |
| **5** | *Ứng dụng hạn chế dịch chuyển bố cục ảnh như thế nào?* | Cumulative Layout Shift (CLS), Core Web Vitals | **`next/image` có kích thước hoặc khung chứa cố định**, như poster `aspect-[2/3]`, để giữ chỗ trước khi ảnh tải xong. Cách này hạn chế dịch chuyển do ảnh, không chứng minh CLS toàn trang bằng không. Chưa có phép đo Web Vitals để công bố chỉ số CLS. |
| **6** | *Ứng dụng xử lý lỗi kết nối TMDB như thế nào?* | Timeout, error boundary, TMDB API | **Source hiện tại không ghi đè `dns.lookup` và không có DNS fallback**. `fetchTMDB` trong `services/client.ts` dùng timeout 10 giây, log ngữ cảnh an toàn và trả lỗi cho luồng gọi xử lý. Các trang có error boundary; khối dữ liệu phụ có thông báo lỗi riêng. Mock chỉ được bật bằng cấu hình chủ động để kiểm thử, không tự thay dữ liệu thật khi lỗi mạng. |
| **7** | *Khi nào thì KHÔNG nên sử dụng Next.js, và hãy so sánh kiến trúc Next.js 16 với React+Vite, Nuxt 4, Astro?* | Công nghệ đối sánh, Cold Starts, Vendor Lock-in | **Không nên dùng Next.js** cho: (1) Dashboard nội bộ sau đăng nhập không cần SEO (nên dùng React+Vite để tránh overhead SSR và hydration); (2) Website tài liệu/blog tĩnh (nên dùng Astro để đạt 0 KB JS); (3) Ứng dụng real-time WebSocket liên tục. Next.js 16 vượt trội ở khả năng kết xuất hỗn hợp (RSC + ISR + Actions) nhưng có thách thức cố hữu: Cold starts trên Serverless, Vendor lock-in với hạ tầng Vercel khi self-host, và độ phức tạp cao của bộ nhớ đệm 4 tầng. |
| **8** | *Tại sao nhóm chuẩn hóa thuật ngữ điểm TMDB `vote_average`, chuẩn WCAG 2.1 AA, và Promise params ở Next.js 15/16?* | Chuẩn hóa thuật ngữ học thuật | **(1) Điểm TMDB `vote_average`:** TMDB API chỉ cung cấp điểm trung bình bình chọn nội bộ (thang 0–10) kết hợp lọc `vote_count.gte=50`, không cung cấp điểm IMDb; **(2) WCAG 2.1 AA:** Nền `#141414` và chữ `#FFFFFF` đạt tỉ lệ tương phản ~18.4:1, đáp ứng chuẩn AA (ngưỡng 4.5:1). Điểm Lighthouse 100 chỉ kiểm tra tự động, không đủ chứng nhận mức AAA; **(3) Promise params:** Từ Next.js 15 và bắt buộc ở 16, `params` trong Page, Layout và Route Handler đều là Promise bất đồng bộ (`params: Promise<{ id: string }>`) để hỗ trợ Partial Prerendering. |

---

## 2. CHI TIẾT PHÂN TÍCH CHUYÊN SÂU DÀNH CHO BẢO VỆ

### Câu 1: Server Components vs Client Components
* **Dẫn chứng mã nguồn:**
  * `app/page.tsx`, `app/movie/[id]/page.tsx` là Server Components thuần túy, chạy async/await lấy dữ liệu trực tiếp.
  * `components/client/TrailerModal.tsx`, `components/client/NavSearchBar.tsx` dùng `"use client"`.
* **Minh chứng ranh giới module:** `tests/server-client-boundary.test.mjs` xác nhận các slider client (`MovieRow`, `SimilarMoviesSlider`) không import `MovieCard`. Module `MovieCard` được dựng ở server và truyền nội dung qua props `cards`; các thành phần client bên trong như `next/image` vẫn có JavaScript. `routes-http.json` của lượt `npm run evidence` kiểm tra bốn hàng phim trong HTML server; số liệu ở log cũ chỉ áp dụng cho source của lượt đó. Chưa có analyzer đối chứng để công bố mức giảm bundle.

### Câu 2: Streaming Suspense & TTFB vs FCP
* **Dẫn chứng mã nguồn:** `app/movie/[id]/page.tsx` bọc `<CastList movieId={id} />` và `<SimilarMovies movieId={id} />` trong hai Suspense với fallback riêng.
* **Cơ sở khoa học và kiểm chứng:** 
  * Phân định rõ ràng: TTFB (Time to First Byte) là thời điểm socket nhận byte đầu tiên từ máy chủ; FCP (First Contentful Paint) là thời điểm trình duyệt vẽ nội dung đầu tiên lên màn hình.
  * Trong kịch bản không Streaming (SSR chặn toàn phần), TTFB bị kéo dài vì server phải đợi toàn bộ các truy vấn chậm (Cast, Similar) hoàn tất mới bắt đầu gửi response.
  * Server gửi phần chính khi dữ liệu của nó sẵn sàng; hai khối phụ có thể tiếp tục tải sau. Chưa đo FCP để kết luận mức cải thiện.
  * Thứ tự và thời điểm nhận HTML được kiểm chứng qua `scripts/verify-stream-evidence.mjs`; không suy ra mọi phiên bản HTTP đều dùng chunked transfer encoding.

### Câu 3: Server Action vs Route Handler
* **Dẫn chứng mã nguồn:**
  * Server Action: `app/actions/watchlist.ts` (thao tác Cookie HTTP-only, giới hạn RFC 6265 200 items / 4KB).
  * Route Handler: `app/api/search/route.ts` (GET RESTful, hỗ trợ header `Cache-Control: public, s-maxage=120`, hủy truy vấn bằng `AbortController` phía client).
* **Điểm phân biệt:** Server Action phù hợp cho mutations/ghi dữ liệu; Route Handler GET phù hợp cho tìm kiếm có cache HTTP và hủy request khi gõ nhanh.

### Câu 4: Caching & Revalidation Next.js 16
* **Dẫn chứng mã nguồn:** `services/client.ts` với `fetch(url, { next: { revalidate: N } })`; TTL do từng dịch vụ truyền vào.
* **Trạng thái cấu hình:** `cacheComponents: false`; trang chủ và sitemap dùng `await connection()` nên là SSR với Data Cache. `cache-mock.json` kiểm tra cache miss/hit/hết hạn, dữ liệu thay đổi sau revalidation và được cache lại; không chứng minh shared cache/CDN của môi trường triển khai.

### Câu 5: Tối ưu hình ảnh & Core Web Vitals
* **Dẫn chứng mã nguồn:** `components/server/MovieCard.tsx`, cấu hình `images.remotePatterns` trong `next.config.ts`.
* **Nguyên lý thiết kế:** Poster có khung `aspect-[2/3]`; hero/backdrop có chiều cao được khai báo để giữ chỗ cho ảnh. Đây là biện pháp hạn chế layout shift, chưa phải số đo CLS. Tương phản một cặp màu không chứng nhận toàn bộ ứng dụng đạt WCAG 2.1 AA.

### Câu 6: Lỗi kết nối TMDB
* **Dẫn chứng mã nguồn:** `services/client.ts` dùng `AbortSignal.timeout(10000)`, `TMDBError` và log endpoint không kèm khóa API. Source đã bỏ DNS monkey-patching.
* **Luồng lỗi:** HTTP 404 dẫn tới not-found ở trang phim; lỗi mạng/5xx đi tới error boundary. `CastList` và `SimilarMovies` hiển thị thông báo lỗi phụ; trailer không có dữ liệu thì dùng liên kết tìm kiếm YouTube. Không cam kết kết nối TMDB luôn thành công.

### Câu 7: So sánh công nghệ & Khi nào KHÔNG nên dùng Next.js (P8)
* **Trọng tâm đối sánh:**
  * **React 19 + Vite:** Phù hợp cho ứng dụng Single Page App nội bộ, dashboard quản trị có xác thực nơi SEO không có giá trị và cần tốc độ DX tối đa, không phát sinh chi phí hay độ phức tạp SSR/Serverless.
  * **Astro:** Phù hợp tuyệt đối cho website tĩnh, blog, tài liệu nơi mặc định xuất 100% HTML với Zero JavaScript, chỉ nạp JavaScript khi cần hydrate các Island tương tác.
  * **Nuxt 4:** Giải pháp SSR/SSG tương đương trong hệ sinh thái Vue với Nitro Engine linh hoạt.
* **Thách thức cố hữu của Next.js:**
  * **Cold Starts:** Khởi động tiến trình trên Serverless có thể tăng độ trễ; cần đo trên môi trường triển khai trước khi công bố số liệu.
  * **Self-Hosting:** Có thể chạy một tiến trình Node.js với cache cục bộ; khi vận hành nhiều instance cần đánh giá việc chia sẻ cache theo hạ tầng thực tế. Dự án hiện không dùng Redis Cache Handler.
  * **Caching đa tầng:** Quản lý đan xen 4 tầng đệm (Request Memoization, Data Cache, Full Route Cache, Router Cache) và sự thay đổi API giữa các phiên bản Next.js.

### Câu 8: Chuẩn hóa thuật ngữ học thuật (P7)
* **Điểm đánh giá phim:** Chuẩn hóa thành TMDB `vote_average` (0–10) với ngưỡng lọc `vote_count.gte=50`, làm rõ TMDB không sở hữu dữ liệu xếp hạng IMDb.
* **Độ tương phản WCAG 2.1 AA:** Chữ `#FFFFFF` trên nền `#141414` có tỉ lệ tương phản ~18.4:1, vượt ngưỡng 4.5:1 cho văn bản thường. Đây chỉ là một cặp màu; điểm Lighthouse Accessibility không chứng nhận toàn bộ ứng dụng đạt WCAG AA hoặc AAA.
* **Promise params trong Next.js 15 & 16:** Áp dụng trên toàn bộ Page Component (`PageProps`), hàm sinh `generateMetadata`, và Route Handler (`{ params }: { params: Promise<{ id: string }> }`).

