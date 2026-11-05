# HỒ SƠ PHÂN CÔNG CÔNG VIỆC CÁ NHÂN & ĐỀ CƯƠNG BÁO CÁO 10 TRANG
## THÀNH VIÊN: NGUYỄN CÔNG QUÂN (TRƯỞNG NHÓM)

* **Họ và tên:** Nguyễn Công Quân
* **Mã số sinh viên:** 3123560070
* **Vai trò trong nhóm:** Trưởng nhóm (Team Leader) & Kiến trúc sư hệ thống (System Architect)
* **Chủ đề chuyên môn phụ trách:** **KIẾN TRÚC NỀN TẢNG APP ROUTER, SERVER-DRIVEN UI & DATA FETCHING SONG SONG TRANG CHỦ**
* **Mục tiêu tài liệu:** Cung cấp đầy đủ cơ sở kỹ thuật, mã nguồn, minh chứng Git và cấu trúc chi tiết để sinh viên biên soạn **Báo cáo cá nhân môn học (khoảng 10 trang $\LaTeX$)**.

---

## 📌 PHẦN 1: MÔ TẢ TRỌNG TÂM CÔNG VIỆC VÀ TÍNH KẾT NỐI HỆ THỐNG

### 1.1. Bối cảnh & Lý do phân công (Cohesive Technical Focus)
Là Trưởng nhóm và Kiến trúc sư hệ thống, Nguyễn Công Quân chịu trách nhiệm thiết lập "xương sống" công nghệ của dự án MovieHub, bảo đảm hệ thống tuân thủ nghiêm ngặt các nguyên lý cốt lõi của **Next.js 16 (App Router)** và **React 19**:
1. **Thiết lập nền tảng dự án:** Cấu hình TypeScript Strict Mode, Tailwind CSS v4 với Oxide Engine, font chữ tối ưu qua `next/font` và tích hợp hệ thống thiết kế Netflix Dark Cinema (`DESIGN.md`).
2. **Kiến trúc tầng dịch vụ TMDB:** Thiết kế hàm lõi `fetchTMDB<T>()`, xử lý khóa bảo mật phía máy chủ (`TMDB_API_KEY`) và quản lý tầng Data Cache với cơ chế Revalidation.
3. **Hiện thực Trang chủ (`app/page.tsx`):** Trọng tâm nghiên cứu mô hình Server Components, kỹ thuật gọi `await connection()` để SSR theo yêu cầu (không phụ thuộc kết nối TMDB lúc build), song song hóa 4 luồng dữ liệu lớn bằng `Promise.all`.
4. **Phân định ranh giới Server/Client (Network Boundary):** Thiết kế giải pháp truyền thẻ `MovieCard` đã render ở server vào thanh trượt client `MovieRow` dưới dạng `cards: ReactNode[]`, đạt hiệu quả Zero-Bundle JavaScript phía máy khách.
5. **Giao diện trải nghiệm điện ảnh chuẩn Netflix:** Hiện thực `HeroBanner.tsx` tối ưu LCP và `TrailerModal.tsx` nhúng YouTube Trailer qua thẻ `<dialog>` chuẩn HTML5.

### 1.2. Danh sách các tệp mã nguồn phụ trách chính
* [`app/layout.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/layout.tsx): Root Layout, tích hợp font chữ Google Geist, cấu hình viewport và layout vỏ ngoài.
* [`app/page.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/page.tsx): Trang chủ Server Component, điều phối lấy dữ liệu song song 4 hàng phim.
* [`components/server/HeroBanner.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/server/HeroBanner.tsx): Billboard Banner tràn viền, ảnh ưu tiên tải (`priority`).
* [`components/server/MovieCard.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/server/MovieCard.tsx): Server Component thẻ phim, khung tỉ lệ 2:3 chống CLS, logo N đỏ.
* [`components/client/MovieRow.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/MovieRow.tsx): Client Component thanh cuộn ngang, thuật toán Infinite Loop (ngưỡng 80px).
* [`components/client/TrailerModal.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/TrailerModal.tsx): Client Component mở YouTube trailer bằng `<dialog>.showModal()`.
* [`services/client.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/services/client.ts): Hàm `fetchTMDB`, xử lý lỗi `TMDBError`, thuật toán khử trùng lặp `deduplicateMovies`.
* [`services/movies.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/services/movies.ts): Dịch vụ lấy phim thịnh hành, đang chiếu rạp, đánh giá cao và chi tiết.
* [`services/videos.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/services/videos.ts): Dịch vụ lấy video và thuật toán chọn trailer tối ưu `selectBestTrailer`.
* [`scripts/collect-evidence.mjs`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/scripts/collect-evidence.mjs): Pipeline tự động hóa kiểm chứng hệ thống.

---

## 🛠️ PHẦN 2: CHI TIẾT KỸ THUẬT VÀ ĐOẠN MÃ CỐT LÕI

### 2.1. Server-Side Data Fetching song song với `Promise.all` & `await connection()`
* **Vấn đề kỹ thuật:** Khi gọi 4 nhóm dữ liệu TMDB (Trending: 3600s, Now Playing: 1800s, Top Rated: 86400s, Classic: 1800s) theo cách tuần tự (`waterfall`), tổng thời gian chờ sẽ là tổng thời gian của từng request. Nếu gọi lúc build-time (`SSG`), bản build sẽ thất bại khi không có API key hoặc mạng chập chờn.
* **Giải pháp:** Sử dụng `await connection()` của Next.js 16 để ép trang render theo yêu cầu tại server (SSR), sau đó thực thi `Promise.all` song song:
```typescript
// app/page.tsx
export default async function HomePage() {
    await connection(); // Chỉ gọi TMDB khi có request thực tế
    const [trending, nowPlaying, topRated, classicData] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getTopRatedMovies(),
        discoverMovies({ genre: "classic" }),
    ]);

    const featuredMovie = trending[0] || nowPlaying[0] || topRated[0];
    return (
        <main className="min-h-screen bg-[#141414] pb-24 overflow-x-hidden">
            <HeroBanner movie={featuredMovie} />
            <div className="relative z-20 space-y-6 sm:space-y-10 -mt-10 sm:-mt-16 lg:-mt-24">
                <MovieRow 
                    title="Phim Thịnh Hành Trong Tuần" 
                    cards={trending.map((m) => <MovieCard key={m.id} movie={m} />)} 
                />
                <MovieRow 
                    title="Top 10 Phim Đánh Giá Cao Nhất" 
                    cards={topRated.slice(0, 10).map((m) => <MovieCard key={m.id} movie={m} />)} 
                    isTop10={true} 
                />
                ...
            </div>
        </main>
    );
}
```

### 2.2. Phân định ranh giới Server/Client: Zero-Bundle Slider
* **Nguyên lý:** `MovieRow.tsx` có chỉ thị `"use client"` vì cần bắt sự kiện click trượt ngang và dùng hook `useRef`. Thay vì import trực tiếp `MovieCard` vào `MovieRow` (khiến mã của MovieCard bị đóng gói vào client bundle), Quân thiết kế `MovieRow` nhận `cards: ReactNode[]`.
* **Minh chứng:** `tests/server-client-boundary.test.mjs` kiểm tra AST và xác nhận số lượng import của `MovieCard` trong `MovieRow` bằng đúng 0.

### 2.3. Thuật toán cuộn vô tận trong `MovieRow.tsx`
* **Cơ chế:** Khi người dùng click nút mũi tên trái hoặc phải:
```typescript
const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
        const el = rowRef.current;
        const { scrollLeft, clientWidth, scrollWidth } = el;
        const maxScrollLeft = scrollWidth - clientWidth;
        const scrollStep = Math.max(clientWidth * 0.55, 320);

        if (direction === "right") {
            if (scrollLeft >= maxScrollLeft - 80) {
                el.scrollTo({ left: 0, behavior: "smooth" }); // Quay lại đầu
            } else {
                el.scrollTo({ left: Math.min(scrollLeft + scrollStep, maxScrollLeft), behavior: "smooth" });
            }
        } else {
            if (scrollLeft <= 80) {
                el.scrollTo({ left: maxScrollLeft, behavior: "smooth" }); // Nhảy về cuối
            } else {
                el.scrollTo({ left: Math.max(scrollLeft - scrollStep, 0), behavior: "smooth" });
            }
        }
    }
};
```

---

## 📊 PHẦN 3: MINH CHỨNG GIT & KẾT QUẢ THỰC NGHIỆM

* **Đóng góp Git:** 41 commits, 7 merge PRs (#1, #2, #3, #4, #6, #7, #8).
  - Commit `2b04d20`: Khởi tạo kiến trúc Next.js App Router, cấu hình môi trường.
  - Commit `82c7e0e`: Xây dựng trang chủ với song song hóa dữ liệu TMDB và ISR caching.
  - Commit `6f5e663`: Hiện thực hàng phim nằm ngang, hàng Top 10 số lớn Netflix.
  - Commit `3b86fa1`: Tái cấu trúc Server/Client boundary `cards: ReactNode[]` cho `MovieRow`.
  - Commit `60ba1f3` & `136653b`: Hiện thực `TrailerModal` tối giản bằng `<dialog>` HTML5.
* **Minh chứng kiểm thử:**
  - `tests/server-client-boundary.test.mjs`: Pass xác thực ranh giới module.
  - `tests/deduplicate.test.mjs`: Pass kiểm tra thuật toán loại bỏ phim trùng lặp.
  - `tests/server-fetch.test.mjs`: Pass kiểm tra bảo mật `TMDB_API_KEY` không bị lộ xuống client.
  - `baocao/evidence/build-output.txt`: Tuyến `ƒ /` được phân loại là Dynamic SSR thành công.

---

## 📑 PHẦN 4: KHUNG ĐỀ CƯƠNG BÁO CÁO CÁ NHÂN (10 TRANG $\LaTeX$)

Dưới đây là dàn bài chuẩn 10 trang thiết kế riêng cho sinh viên **Nguyễn Công Quân**:

### TRANG 1: TRANG BÌA & THÔNG TIN ĐỒ ÁN
* Tiêu đề: **BÁO CÁO KỸ THUẬT CÁ NHÂN: THIẾT KẾ KIẾN TRÚC APP ROUTER VÀ SERVER-DRIVEN UI TRÊN NỀN TẢNG NEXT.JS 16**
* Học phần: Các Công nghệ Lập trình Hiện đại | GVHD: ThS. Phạm Thi Vương
* Sinh viên thực hiện: **Nguyễn Công Quân - MSSV: 3123560070** (Vai trò: Trưởng nhóm)
* Tóm tắt báo cáo cá nhân (Abstract: 150 từ): Nêu rõ phạm vi phụ trách về lõi kiến trúc, fetch song song, ranh giới Server/Client và trang chủ MovieHub.

### TRANG 2: LỜI MỞ ĐẦU & TỔNG QUAN PHÂN CÔNG
* **1.1. Giới thiệu tổng quan đồ án MovieHub:** Ứng dụng tra cứu điện ảnh Next.js 16 + React 19 kết nối TMDB REST API v3.
* **1.2. Trách nhiệm chuyên môn cá nhân:**
  * Lập kế hoạch kiến trúc, phân chia module và điều phối tiến độ toàn nhóm.
  * Thiết kế phân hệ Trang chủ, tầng dịch vụ `services/client.ts` và cơ chế fetch song song.
  * Tối ưu hóa ranh giới Server/Client Component và quản lý hiệu năng thị giác.
* **1.3. Bảng phân định ranh giới công việc giữa 3 thành viên:** Đối sánh trách nhiệm giữa Quân (Kiến trúc & Trang chủ), Đại (Kiểm toán, Xử lý lỗi & Test), Thái (Tương tác, Watchlist & Bộ lọc).

### TRANG 3: CƠ SỞ LÝ THUYẾT VỀ REACT SERVER COMPONENTS (RSC)
* **2.1. Bản chất và nguyên lý hoạt động của RSC trong Next.js 16:**
  * Phân biệt CSR, SSR truyền thống (Pages Router) và Server Components (App Router).
  * Khái niệm RSC Payload: Luồng dữ liệu cấu trúc dạng JSON-like serialize trên server.
* **2.2. Sự chuyển dịch cơ chế Data Fetching:**
  * Tại sao Next.js 16 đổi mặc định hàm `fetch` từ `force-cache` sang `no-store`.
  * Cơ chế lưu đệm Data Cache ở cấp độ mạng với tùy chọn `{ next: { revalidate: N } }`.
* **2.3. Tác động của `await connection()` đến quá trình Render:** Phân tích lý do tại sao không prerender trang chủ lúc build để tránh lỗi phụ thuộc TMDB upstream.

### TRANG 4: PHÂN TÍCH & THIẾT KẾ PHÂN HỆ TRANG CHỦ & TẦNG DỊCH VỤ
* **3.1. Thiết kế tầng dịch vụ kết nối TMDB (`services/client.ts`):**
  * Mô hình hàm tổng quát `fetchTMDB<T>()`.
  * Ràng buộc an toàn: Không dùng tiền tố `NEXT_PUBLIC_`, bảo vệ khóa API trên server.
* **3.2. Sơ đồ kiến trúc luồng dữ liệu trang chủ:**
  * Trực quan hóa luồng từ `app/page.tsx` -> `Promise.all` -> TMDB API -> Serialize `MovieCard` -> `MovieRow`.
* **3.3. Bảng cấu hình thời hạn Data Cache các danh mục:** Trending (3600s), Now Playing (1800s), Top Rated (86400s), Classic (1800s).

### TRANG 5: THIẾT KẾ RANH GIỚI MẠNG (SERVER/CLIENT BOUNDARY)
* **4.1. Quy tắc Composition Pattern trong Next.js:**
  * Đẩy Client Component xuống các nút lá tương tác (`MovieRow`, `TrailerModal`).
  * Giữ Server Component ở cấp cha để điều phối dữ liệu (`app/page.tsx`).
* **4.2. Giải pháp Zero-Bundle JavaScript với prop `cards: ReactNode[]`:**
  * Sơ đồ phân tách: `MovieCard` được biên dịch sẵn thành HTML tĩnh, truyền qua ranh giới mạng dưới dạng JSX nodes.
  * Chứng minh `MovieRow.tsx` không hề import `MovieCard.tsx`.

### TRANG 6: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 1)
* **5.1. Hiện thực Server Component trang chủ (`app/page.tsx`):**
  * Phân tích chi tiết đoạn mã bất đồng bộ `Promise.all`.
  * Xử lý trường hợp không có dữ liệu với `role="status"`.
* **5.2. Hiện thực tầng dịch vụ TMDB (`services/movies.ts`):**
  * Hàm `getTrendingMovies()`, `getNowPlayingMovies()` và thuật toán khử trùng lặp `deduplicateMovies()`.

### TRANG 7: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 2)
* **5.3. Hiện thực Client Component thanh cuộn ngang `MovieRow.tsx`:**
  * Kỹ thuật dùng `useRef` và thuật toán cuộn vô tận (Infinite Loop với ngưỡng 80px).
  * Cơ chế hiển thị số thứ tự khổng lồ nét rỗng cho hàng Top 10 (`.netflix-number`).
* **5.4. Hiện thực Modal xem Trailer tức thì (`TrailerModal.tsx`):**
  * Sử dụng API `<dialog>.showModal()` và `close()` của HTML5.
  * Bẫy phím `Escape`, nhấp ngoài vùng để đóng, tự động khóa cuộn nền `document.body.style.overflow = "hidden"`.

### TRANG 8: TỐI ƯU HÓA HIỆU NĂNG THỊ GIÁC & PIPELINE MINH CHỨNG
* **6.1. Tối ưu hóa hình ảnh với `next/image`:**
  * Cấu hình thuộc tính `priority` trên Billboard `HeroBanner` để tối ưu thời gian vẽ nội dung lớn nhất (LCP).
  * Quy định thuộc tính `sizes` responsive trên `MovieCard` và khung ảnh cố định `aspect-[2/3]` để triệt tiêu dịch chuyển bố cục (CLS).
* **6.2. Thiết lập hệ thống tự động thu thập minh chứng (`collect-evidence.mjs`):**
  * Khởi tạo mock server nội bộ, tính toán hash SHA-256 mã nguồn và ghi nhận `mock-runtime.json`.

### TRANG 9: KIỂM THỬ THỰC NGHIỆM & MA TRẬN ĐÓNG GÓP
* **7.1. Kết quả kiểm thử tự động trên phân hệ phụ trách:**
  * Kết quả chạy `tests/server-client-boundary.test.mjs`, `tests/server-fetch.test.mjs`, `tests/deduplicate.test.mjs`.
  * Trích xuất kết quả phân loại route từ `baocao/evidence/build-output.txt` (khẳng định `ƒ /` là SSR).
* **7.2. Bảng minh chứng Git cá nhân:**
  * Liệt kê các commit cốt lõi, mã SHA, ngày thực hiện, nội dung thay đổi và PR liên quan (#1, #2, #3, #6).

### TRANG 10: KẾT LUẬN & CÂU HỎI VẤN ĐÁP BẢO VỆ (VIVA VOCE)
* **8.1. Tổng kết kết quả cá nhân đạt được:** Làm chủ mô hình RSC, giải quyết bài toán ranh giới mạng không phình bundle, hiện thực giao diện điện ảnh Netflix hoàn chỉnh.
* **8.2. Hạn chế nhận diện và hướng phát triển:** Chưa có Network trace thực tế từ trình duyệt di động yếu, cần bổ sung Virtualization khi danh mục mở rộng trên 100 phim.
* **8.3. Bộ 3 câu hỏi vấn đáp bảo vệ cá nhân trọng tâm (có câu trả lời mẫu):**
  1. *Hỏi:* Tại sao trang chủ không dùng Streaming Suspense cho từng hàng phim?
     *Đáp:* Trang chủ sử dụng `Promise.all` để tải đồng bộ 4 danh mục và render hoàn chỉnh HTML ngay lần đầu (First Load), giúp trang có khung nội dung nhất quán và tối ưu hóa SEO. Nếu stream từng hàng, các hàng phim bên dưới sẽ xuất hiện gián đoạn, làm dịch chuyển layout khi người dùng cuộn nhanh.
  2. *Hỏi:* Làm sao chứng minh việc đặt `MovieCard` dưới `MovieRow` không đưa code của `MovieCard` vào bundle trình duyệt?
     *Đáp:* `MovieCard` được import và render bên trong `app/page.tsx` (Server Component). Kết quả của thẻ được truyền dưới dạng `ReactNode` qua prop `cards`. `MovieRow` chỉ nhận các React Elements đã serialize trong RSC payload, trong module graph của `MovieRow` số lượng import `MovieCard` bằng 0 (đã có test tự động kiểm chứng).
  3. *Hỏi:* Tại sao lại gọi `await connection()` ở đầu `app/page.tsx`?
     *Đáp:* Để đưa trang chủ về chế độ Dynamic Rendering theo từng request (SSR). Nhờ đó, quá trình `npm run build` không bị phụ thuộc vào mạng ngoài hay khóa TMDB, đồng thời khi có lỗi máy chủ TMDB thì lỗi được chuyển tới Error Boundary thay vì cache một trang rỗng.
