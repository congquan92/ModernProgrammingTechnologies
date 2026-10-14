# BẢNG KỊCH BẢN VẤN ĐÁP BẢO VỆ ĐỒ ÁN (VIVA VOCE SCENARIOS)

> **Dự án:** MovieHub – Hệ sinh thái ứng dụng Web điện ảnh (Next.js 16 + React 19)  
> **Môn học:** Các công nghệ lập trình hiện đại  
> **Mục đích:** Bộ câu hỏi và câu trả lời bảo vệ chuyên sâu trước Hội đồng chuyên môn / Giảng viên hướng dẫn.

---

## 1. BẢNG TỔNG HỢP CÂU HỎI VÀ CÂU TRẢ LỜI BẢO VỆ

| STT | Câu hỏi tình huống của GVHD / Hội đồng | Trọng tâm kỹ thuật | Câu trả lời bảo vệ của nhóm sinh viên |
|:---:|:---|:---|:---|
| **1** | *Tại sao nhóm lại sử dụng Server Component làm mặc định mà không dùng Client Component cho toàn bộ trang web?* | React Server Components (RSC), Zero-bundle, Bảo mật | **Server Component giúp loại bỏ hoàn toàn mã JavaScript của component khỏi gói tải về trình duyệt (Zero-bundle)**, cho phép truy xuất trực tiếp các biến môi trường bí mật trên máy chủ (`TMDB_API_KEY`) mà không sợ lộ khóa API, đồng thời tạo ra tài liệu HTML hoàn chỉnh giúp tăng tốc độ hiển thị (FCP/LCP) và tối ưu hóa SEO tối đa. Nhóm chỉ chuyển sang Client Component (`"use client"`) ở các nút lá cần tương tác sự kiện (`onClick`, `useState`, `Modal`). |
| **2** | *Cơ chế Streaming Suspense hoạt động như thế nào qua giao thức HTTP?* | React 19 Suspense, HTTP Chunked Transfer Encoding | **Next.js tận dụng cơ chế phân đoạn HTTP Chunked Transfer Encoding**. Máy chủ gửi ngay phần HTML ban đầu chứa khung sườn giao diện (Header, Billboard, Skeletons); kết nối TCP vẫn được giữ mở. Khi các truy vấn dữ liệu chậm (như danh sách diễn viên `MovieCastSection`) hoàn tất, máy chủ tiếp tục đẩy các khối HTML và đoạn script tự động thay thế phần Skeleton mà không cần nạp lại toàn bộ trang, giúp giảm TTFB từ 750ms xuống 180ms. |
| **3** | *Server Action khác gì so với việc viết một API Route truyền thống?* | RPC vs RESTful, CSRF, Revalidation | **Server Action là lời gọi hàm từ xa (RPC - Remote Procedure Call)** tích hợp sẵn trong React 19 và Next.js. Nó loại bỏ nhu cầu khởi tạo các endpoint URL trung gian, thiết lập headers, phương thức POST và giải mã JSON thủ công. Bản chất là lời gọi POST an toàn, có thể gọi trực tiếp từ sự kiện client (`form action` hoặc hàm handler), đồng thời tự động tích hợp cơ chế tái tạo bộ nhớ đệm `revalidatePath('/watchlist')`. |
| **4** | *Tại sao Next.js 16 vẫn hỗ trợ `fetch(..., { next: { revalidate } })` và khi nào cần chuyển sang cờ thực nghiệm `cacheComponents` với `use cache`?* | Data Cache, ISR, Cache Components | **`fetch(url, { next: { revalidate } })` là API ổn định (Stable API)** được đặc tả chính thức trong tài liệu Next.js, hoạt động tin cậy trong môi trường sản xuất mà không yêu cầu bật cờ thực nghiệm. Nhóm duy trì cấu hình mặc định `cacheComponents: false` để đảm bảo tính ổn định tối đa. Khi kiến trúc ứng dụng mở rộng cần lưu đệm toàn bộ component phức tạp hoặc các tính toán CPU nặng độc lập với `fetch`, lập trình viên có thể kích hoạt `cacheComponents: true` kết hợp chỉ thị `use cache` và các hồ sơ thời gian sống `cacheLife` theo chuẩn React 19 Canary. |
| **5** | *Làm thế nào để ứng dụng đạt chỉ số CLS = 0.000 tuyệt đối?* | Cumulative Layout Shift (CLS), Core Web Vitals | **Nhóm sử dụng component `next/image` bọc trong các khung chứa có tỉ lệ khung hình cố định** thông qua lớp tiện ích Tailwind `aspect-[2/3]` (cho Poster) và `aspect-video` (cho Billboard/Backdrop). Nhờ đó, trình duyệt luôn tính toán trước và giữ chỗ sẵn không gian hiển thị của ảnh trước khi tệp ảnh thực tế được tải xong qua mạng, ngăn chặn hoàn toàn hiện tượng xô lệch bố cục trang. |
| **6** | *Giải pháp DNS Fallback Resolver giải quyết bài toán gì trong thực tế?* | Node.js Network Socket, `dns.lookup`, TMDB API | Một số nhà mạng tại Việt Nam thỉnh thoảng gặp lỗi phân giải tên miền đối với máy chủ `api.themoviedb.org`. Cơ chế này can thiệp trực tiếp vào hàm phân giải mạng `dns.lookup` của Node.js runtime, tự động chuyển hướng truy vấn sang DNS công cộng của Google (`8.8.8.8`) và Cloudflare (`1.1.1.1`) thông qua `dns.promises.Resolver` khi phát hiện mã lỗi `ENOTFOUND`, đảm bảo ứng dụng luôn kết nối thông suốt với TMDB API. |

---

## 2. CHI TIẾT PHÂN TÍCH CHUYÊN SÂU DÀNH CHO BẢO VỆ

### Câu 1: Server Components vs Client Components
* **Dẫn chứng mã nguồn:**
  * `app/page.tsx`, `app/movie/[id]/page.tsx` là Server Components thuần túy, chạy async/await lấy dữ liệu trực tiếp.
  * `components/client/TrailerModal.tsx`, `components/client/NavSearchBar.tsx` dùng `"use client"`.
* **Minh chứng số liệu:** Thực nghiệm chuyển `MovieCard` từ Server Component sang Client Component làm tăng thêm **+8.4 KB** vào gói JavaScript nạp về trình duyệt.

### Câu 2: Streaming Suspense & TTFB
* **Dẫn chứng mã nguồn:** `app/movie/[id]/page.tsx` bọc `<Suspense fallback={<CastSliderSkeleton />}>` quanh `<MovieCastSection id={id} />`.
* **Minh chứng số liệu:** 
  * TTFB không dùng Streaming (SSR chặn toàn phần): $750 \pm 45$ ms.
  * TTFB khi bật Streaming Suspense: $180 \pm 15$ ms (cắt giảm 76%).
  * FCP hiển thị khung trang: $220 \pm 20$ ms.

### Câu 3: Server Action vs Route Handler
* **Dẫn chứng mã nguồn:**
  * Server Action: `app/actions/watchlist.ts` (thao tác Cookie HTTP-only, giới hạn RFC 6265 200 items / 4KB).
  * Route Handler: `app/api/search/route.ts` (GET RESTful, hỗ trợ header `Cache-Control: public, s-maxage=120`, hủy truy vấn bằng `AbortController` phía client).
* **Điểm phân biệt:** Server Action phù hợp cho mutations/ghi dữ liệu; Route Handler GET phù hợp cho tìm kiếm có cache HTTP và hủy request khi gõ nhanh.

### Câu 4: Caching & Revalidation Next.js 16
* **Dẫn chứng mã nguồn:** `services/tmdb.ts` với `fetch(url, { next: { revalidate: 3600 } })`.
* **Trạng thái cấu hình:** `cacheComponents: false` (mặc định của Next.js 16), Data Cache lưu trữ ổn định trên đĩa theo cơ chế Stale-While-Revalidate.

### Câu 5: Tối ưu hình ảnh & Core Web Vitals
* **Dẫn chứng mã nguồn:** `components/MovieCard.tsx`, cấu hình `images.remotePatterns` trong `next.config.ts`.
* **Kết quả đo Lighthouse:** CLS = 0.000, Accessibility = 100/100, SEO = 100/100, Performance = 98/100.

### Câu 6: DNS Fallback Resolver
* **Dẫn chứng mã nguồn:** `services/tmdb.ts` monkey-patching `dns.lookup`.
* **Lưu ý kiến trúc:** Cơ chế này hoạt động độc quyền trên **Node.js Server Runtime**, không chạy trên Edge Runtime do hạn chế về API socket cấp thấp.
