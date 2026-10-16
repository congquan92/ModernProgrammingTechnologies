# BẢNG KỊCH BẢN VẤN ĐÁP BẢO VỆ ĐỒ ÁN (VIVA VOCE SCENARIOS)

> **Dự án:** MovieHub – Hệ sinh thái ứng dụng Web điện ảnh (Next.js 16 + React 19)  
> **Môn học:** Các công nghệ lập trình hiện đại  
> **Mục đích:** Bộ câu hỏi và câu trả lời bảo vệ chuyên sâu trước Hội đồng chuyên môn / Giảng viên hướng dẫn.

---

## 1. BẢNG TỔNG HỢP CÂU HỎI VÀ CÂU TRẢ LỜI BẢO VỆ

| STT | Câu hỏi tình huống của GVHD / Hội đồng | Trọng tâm kỹ thuật | Câu trả lời bảo vệ của nhóm sinh viên |
|:---:|:---|:---|:---|
| **1** | *Tại sao nhóm lại sử dụng Server Component làm mặc định mà không dùng Client Component cho toàn bộ trang web?* | React Server Components (RSC), Zero-bundle, Bảo mật | **Server Component giúp loại bỏ hoàn toàn mã JavaScript của component khỏi gói tải về trình duyệt (Zero-bundle)**, cho phép truy xuất trực tiếp các biến môi trường bí mật trên máy chủ (`TMDB_API_KEY`) mà không sợ lộ khóa API, đồng thời tạo ra tài liệu HTML hoàn chỉnh giúp tăng tốc độ hiển thị (FCP/LCP) và tối ưu hóa SEO tối đa. Nhóm chỉ chuyển sang Client Component (`"use client"`) ở các nút lá cần tương tác sự kiện (`onClick`, `useState`, `Modal`). |
| **2** | *Cơ chế Streaming Suspense hoạt động như thế nào qua giao thức HTTP?* | React 19 Suspense, HTTP Chunked Transfer Encoding | **Next.js tận dụng cơ chế phân đoạn HTTP Chunked Transfer Encoding**. Máy chủ gửi ngay phần HTML ban đầu chứa khung sườn giao diện (Header, Billboard, Skeletons); kết nối TCP vẫn được giữ mở. Khi các truy vấn dữ liệu chậm (như danh sách diễn viên `MovieCastSection`) hoàn tất, máy chủ tiếp tục đẩy các khối HTML và đoạn script tự động thay thế phần Skeleton mà không cần nạp lại toàn bộ trang. Cơ chế này tối ưu hóa cảm nhận người dùng (FCP) bằng cách hiển thị khung sườn ngay lập tức trong khi chờ dữ liệu hoàn tất ở server. |
| **3** | *Server Action khác gì so với việc viết một API Route truyền thống?* | RPC vs RESTful, CSRF, Revalidation | **Server Action là lời gọi hàm từ xa (RPC - Remote Procedure Call)** tích hợp sẵn trong React 19 và Next.js. Nó loại bỏ nhu cầu khởi tạo các endpoint URL trung gian, thiết lập headers, phương thức POST và giải mã JSON thủ công. Bản chất là lời gọi POST an toàn, có thể gọi trực tiếp từ sự kiện client (`form action` hoặc hàm handler), đồng thời tự động tích hợp cơ chế tái tạo bộ nhớ đệm `revalidatePath('/watchlist')`. |
| **4** | *Tại sao Next.js 16 vẫn hỗ trợ `fetch(..., { next: { revalidate } })` và khi nào cần chuyển sang cờ thực nghiệm `cacheComponents` với `use cache`?* | Data Cache, ISR, Cache Components | **`fetch(url, { next: { revalidate } })` là API ổn định (Stable API)** được đặc tả chính thức trong tài liệu Next.js, hoạt động tin cậy trong môi trường sản xuất mà không yêu cầu bật cờ thực nghiệm. Nhóm duy trì cấu hình mặc định `cacheComponents: false` để đảm bảo tính ổn định tối đa. Khi kiến trúc ứng dụng mở rộng cần lưu đệm toàn bộ component phức tạp hoặc các tính toán CPU nặng độc lập với `fetch`, lập trình viên có thể kích hoạt `cacheComponents: true` kết hợp chỉ thị `use cache` và các hồ sơ thời gian sống `cacheLife` theo chuẩn React 19 Canary. |
| **5** | *Làm thế nào để ứng dụng đạt chỉ số CLS = 0.000 tuyệt đối?* | Cumulative Layout Shift (CLS), Core Web Vitals | **Nhóm sử dụng component `next/image` bọc trong các khung chứa có tỉ lệ khung hình cố định** thông qua lớp tiện ích Tailwind `aspect-[2/3]` (cho Poster) và `aspect-video` (cho Billboard/Backdrop). Nhờ đó, trình duyệt luôn tính toán trước và giữ chỗ sẵn không gian hiển thị của ảnh trước khi tệp ảnh thực tế được tải xong qua mạng, ngăn chặn hoàn toàn hiện tượng xô lệch bố cục trang. |
| **6** | *Giải pháp DNS Fallback Resolver giải quyết bài toán gì trong thực tế?* | Node.js Network Socket, `dns.lookup`, TMDB API | Một số nhà mạng tại Việt Nam thỉnh thoảng gặp lỗi phân giải tên miền đối với máy chủ `api.themoviedb.org`. Cơ chế này can thiệp trực tiếp vào hàm phân giải mạng `dns.lookup` của Node.js runtime, tự động chuyển hướng truy vấn sang DNS công cộng của Google (`8.8.8.8`) và Cloudflare (`1.1.1.1`) thông qua `dns.promises.Resolver` khi phát hiện mã lỗi `ENOTFOUND`, đảm bảo ứng dụng luôn kết nối thông suốt với TMDB API. |
| **7** | *Khi nào thì KHÔNG nên sử dụng Next.js, và hãy so sánh kiến trúc Next.js 16 với React+Vite, Nuxt 4, Astro?* | Công nghệ đối sánh, Cold Starts, Vendor Lock-in | **Không nên dùng Next.js** cho: (1) Dashboard nội bộ sau đăng nhập không cần SEO (nên dùng React+Vite để tránh overhead SSR và hydration); (2) Website tài liệu/blog tĩnh (nên dùng Astro để đạt 0 KB JS); (3) Ứng dụng real-time WebSocket liên tục. Next.js 16 vượt trội ở khả năng kết xuất hỗn hợp (RSC + ISR + Actions) nhưng có thách thức cố hữu: Cold starts trên Serverless, Vendor lock-in với hạ tầng Vercel khi self-host, và độ phức tạp cao của bộ nhớ đệm 4 tầng. |
| **8** | *Tại sao nhóm chuẩn hóa thuật ngữ điểm TMDB `vote_average`, chuẩn WCAG 2.1 AA, và Promise params ở Next.js 15/16?* | Chuẩn hóa thuật ngữ học thuật | **(1) Điểm TMDB `vote_average`:** TMDB API chỉ cung cấp điểm trung bình bình chọn nội bộ (thang 0–10) kết hợp lọc `vote_count.gte=100`, không cung cấp điểm IMDb; **(2) WCAG 2.1 AA:** Nền `#141414` và chữ `#FFFFFF` đạt tỉ lệ tương phản ~18.4:1, đáp ứng chuẩn AA (ngưỡng 4.5:1). Điểm Lighthouse 100 chỉ kiểm tra tự động, không đủ chứng nhận mức AAA; **(3) Promise params:** Từ Next.js 15 và bắt buộc ở 16, `params` trong Page, Layout và Route Handler đều là Promise bất đồng bộ (`params: Promise<{ id: string }>`) để hỗ trợ Partial Prerendering. |

---

## 2. CHI TIẾT PHÂN TÍCH CHUYÊN SÂU DÀNH CHO BẢO VỆ

### Câu 1: Server Components vs Client Components
* **Dẫn chứng mã nguồn:**
  * `app/page.tsx`, `app/movie/[id]/page.tsx` là Server Components thuần túy, chạy async/await lấy dữ liệu trực tiếp.
  * `components/client/TrailerModal.tsx`, `components/client/NavSearchBar.tsx` dùng `"use client"`.
* **Minh chứng kiến trúc Zero-Bundle:** Nhóm không đưa ra số đo kích thước gói tải chưa có file log analyzer đối chứng. Cơ chế Zero-Bundle được chứng minh bằng ranh giới module: `tests/server-client-boundary.test.mjs` xác nhận các slider client (`MovieRow`, `SimilarMoviesSlider`) không bao giờ import `MovieCard`. Toàn bộ `MovieCard` được tạo ở server và truyền dưới dạng React elements (`cards={...}`) qua props, giúp loại bỏ 100% mã JS của thẻ phim khỏi gói tải client. `baocao/evidence/server-render.txt` xác nhận 107 thẻ ảnh và 5 hàng phim đã có sẵn trong HTML ban đầu.

### Câu 2: Streaming Suspense & TTFB vs FCP
* **Dẫn chứng mã nguồn:** `app/movie/[id]/page.tsx` bọc `<Suspense fallback={<CastSkeleton />}>` quanh `<CastList id={id} />` và `<SimilarMovies id={id} />`.
* **Cơ sở khoa học và kiểm chứng:** 
  * Phân định rõ ràng: TTFB (Time to First Byte) là thời điểm socket nhận byte đầu tiên từ máy chủ; FCP (First Contentful Paint) là thời điểm trình duyệt vẽ nội dung đầu tiên lên màn hình.
  * Trong kịch bản không Streaming (SSR chặn toàn phần), TTFB bị kéo dài vì server phải đợi toàn bộ các truy vấn chậm (Cast, Similar) hoàn tất mới bắt đầu gửi response.
  * Với React 19 Streaming Suspense, server gửi ngay khung HTML chính (Hero, chi tiết phim) cùng skeleton fallback, giúp tối ưu mạnh mẽ FCP mà không bị nghẽn bởi các khối dữ liệu phụ.
  * Cơ chế chunked transfer được kiểm chứng thực nghiệm qua script `scripts/verify-stream-evidence.mjs`.

### Câu 3: Server Action vs Route Handler
* **Dẫn chứng mã nguồn:**
  * Server Action: `app/actions/watchlist.ts` (thao tác Cookie HTTP-only, giới hạn RFC 6265 200 items / 4KB).
  * Route Handler: `app/api/search/route.ts` (GET RESTful, hỗ trợ header `Cache-Control: public, s-maxage=120`, hủy truy vấn bằng `AbortController` phía client).
* **Điểm phân biệt:** Server Action phù hợp cho mutations/ghi dữ liệu; Route Handler GET phù hợp cho tìm kiếm có cache HTTP và hủy request khi gõ nhanh.

### Câu 4: Caching & Revalidation Next.js 16
* **Dẫn chứng mã nguồn:** `services/tmdb.ts` với `fetch(url, { next: { revalidate: 3600 } })`.
* **Trạng thái cấu hình:** `cacheComponents: false` (mặc định của Next.js 16), Data Cache lưu trữ ổn định trên đĩa theo cơ chế Stale-While-Revalidate.

### Câu 5: Tối ưu hình ảnh & Core Web Vitals
* **Dẫn chứng mã nguồn:** `components/server/MovieCard.tsx`, cấu hình `images.remotePatterns` trong `next.config.ts`.
* **Nguyên lý thiết kế:** Khung chứa poster sử dụng tỷ lệ cố định `aspect-[2/3]` và backdrop dùng `aspect-video` để trình duyệt cấp phát không gian tĩnh trước khi ảnh tải xong, ngăn chặn hiện tượng layout shift (CLS). Chuẩn tương phản chữ đạt tiêu chuẩn WCAG 2.1 AA.

### Câu 6: DNS Fallback Resolver
* **Dẫn chứng mã nguồn:** `services/tmdb.ts` monkey-patching `dns.lookup`.
* **Lưu ý kiến trúc:** Cơ chế này hoạt động độc quyền trên **Node.js Server Runtime**, không chạy trên Edge Runtime do hạn chế về API socket cấp thấp.

### Câu 7: So sánh công nghệ & Khi nào KHÔNG nên dùng Next.js (P8)
* **Trọng tâm đối sánh:**
  * **React 19 + Vite:** Phù hợp cho ứng dụng Single Page App nội bộ, dashboard quản trị có xác thực nơi SEO không có giá trị và cần tốc độ DX tối đa, không phát sinh chi phí hay độ phức tạp SSR/Serverless.
  * **Astro:** Phù hợp tuyệt đối cho website tĩnh, blog, tài liệu nơi mặc định xuất 100% HTML với Zero JavaScript, chỉ nạp JavaScript khi cần hydrate các Island tương tác.
  * **Nuxt 4:** Giải pháp SSR/SSG tương đương trong hệ sinh thái Vue với Nitro Engine linh hoạt.
* **Thách thức cố hữu của Next.js:**
  * **Cold Starts:** Độ trễ khởi động tiến trình Node.js trên Serverless (200ms–1500ms).
  * **Vendor Lock-in & Self-Hosting:** Cần thiết lập phức tạp Redis Cache Handler (`@neshca/cache-handler`) khi tự vận hành Docker ngoài Vercel.
  * **Caching đa tầng:** Quản lý đan xen 4 tầng đệm (Request Memoization, Data Cache, Full Route Cache, Router Cache) và sự thay đổi API giữa các phiên bản Next.js.

### Câu 8: Chuẩn hóa thuật ngữ học thuật (P7)
* **Điểm đánh giá phim:** Chuẩn hóa thành TMDB `vote_average` (0–10) với ngưỡng lọc `vote_count.gte=100`, làm rõ TMDB không sở hữu dữ liệu xếp hạng IMDb.
* **Độ tương phản WCAG 2.1 AA:** Chữ `#FFFFFF` trên nền `#141414` có tỉ lệ tương phản ~18.4:1 (theo công thức $(1.0+0.05)/(0.00705+0.05) \approx 18.405:1$), vượt ngưỡng 4.5:1 của chuẩn WCAG 2.1 AA. Điểm Lighthouse Accessibility 100 phản ánh việc đạt các bài kiểm tra tự động của chuẩn AA, không tương đương chứng nhận AAA toàn diện.
* **Promise params trong Next.js 15 & 16:** Áp dụng trên toàn bộ Page Component (`PageProps`), hàm sinh `generateMetadata`, và Route Handler (`{ params }: { params: Promise<{ id: string }> }`).

