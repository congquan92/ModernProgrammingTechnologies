# BẢNG PHÂN CÔNG NHIỆM VỤ & KỊCH BẢN THI THỰC HÀNH TẠI CHỖ

* **Môn học:** Các Công nghệ Lập trình Hiện đại
* **Đề tài:** Tìm hiểu công nghệ Next.js (App Router, Server Components và Streaming) qua Ứng dụng Tra cứu & Khám phá Phim ảnh
* **Backend:** The Movie Database (TMDB) REST API v3
* **Thành viên nhóm:** Nguyễn Quân, Đại, Thái
* **Tài liệu kiến trúc 3 tầng tổng quan:** 👉 [NEXTJS_PhimAnh.md](./NEXTJS_PhimAnh.md)

---

## 1. KỊCH BẢN THI THỰC HÀNH TẠI CHỖ & VẤN ĐÁP CỦA TỪNG THÀNH VIÊN

Giảng viên sẽ gọi từng bạn lên máy tính để kiểm tra trực tiếp từ code đã nộp (cổng Đạt/Không đạt):

### 👤 1. NGUYỄN QUÂN (Trang chủ, Caching ISR & `next/image`)
* **Phạm vi code:** Dựng Base Project, Root Layout, Trang chủ (`/`), fetch dữ liệu TMDB server-side, Caching ISR (`revalidate: 3600`), tối ưu ảnh `next/image` và đo Core Web Vitals.
* 📄 **File nhiệm vụ chi tiết & Code mẫu:** 👉 [NHIEM_VU_QUAN.md](./NHIEM_VU_QUAN.md)
* **Câu hỏi lý thuyết trọng tâm:**
  1. *Tại sao ở trang chủ em không dùng `useEffect` + `useState` gọi API như React thông thường?*  
     -> **Đáp:** Vì trang chủ là **Server Component**, fetch dữ liệu từ TMDB trực tiếp trên server giúp tạo sẵn HTML, tăng tốc độ hiển thị trang đầu (FCP tốt), chuẩn SEO, giảm dung lượng JS gửi về client và **bảo mật API Key TMDB không bị lộ** ở tab Network trình duyệt.
  2. *Cơ chế Caching `next: { revalidate: 3600 }` hoạt động thế nào?*  
     -> **Đáp:** Dùng cơ chế **ISR**. Next.js lưu bản cache của danh sách phim trong 1 giờ. Sau 1 giờ, request mới vẫn nhận bản cache cũ trước, đồng thời Next.js chạy ngầm một tiến trình fetch dữ liệu mới từ TMDB để cập nhật bản cache cho các lần truy cập tiếp theo.
* **Thử thách Live-coding tại chỗ (1 phút):**
  * *Tình huống 1:* Chuyển trang chủ sang Dynamic Rendering (không lưu cache).  
    -> **Xử lý:** Mở `src/app/page.tsx`, thêm `export const dynamic = 'force-dynamic';` hoặc trong `src/services/tmdb.ts` đổi thành `{ cache: 'no-store' }`.
  * *Tình huống 2:* Thêm 1 hàng danh sách phim "Top Rated" vào trang chủ.  
    -> **Xử lý:** Gọi `getTopRatedMovies()` trong `Promise.all` và tái sử dụng component `<MovieGrid />`.

---

### 👤 2. ĐẠI (Chi tiết phim, Streaming Suspense & SEO)
* **Phạm vi code:** Dynamic Route (`/movie/[id]`), kỹ thuật đinh **Streaming dữ liệu với `<Suspense>`**, xử lý ngoại lệ (`loading.tsx`, `error.tsx`, `not-found.tsx`), Dynamic SEO Metadata (`generateMetadata`), và Unit Test với Vitest.
* 📄 **File nhiệm vụ chi tiết & Code mẫu:** 👉 [NHIEM_VU_DAI.md](./NHIEM_VU_DAI.md)
* **Câu hỏi lý thuyết trọng tâm:**
  1. *Cơ chế Streaming với `<Suspense>` ở trang chi tiết giải quyết vấn đề gì?*  
     -> **Đáp:** Ngăn chặn hiện tượng màn hình trắng khi tải trang. Thông tin chính của phim được nạp và render gửi về ngay; các khối dữ liệu chậm hơn như Dàn diễn viên (Cast) được bọc trong `<Suspense fallback={<CastSkeleton />}>` để server stream về sau chèn vào mà không cần reload trang.
  2. *Khi người dùng gõ URL ID phim không tồn tại thì xử lý ra sao?*  
     -> **Đáp:** Trong khối `try/catch`, nếu API TMDB trả về lỗi 404 thì gọi hàm `notFound()` từ `next/navigation`. Next.js sẽ tự động chuyển hướng hiển thị file `not-found.tsx` đã thiết kế.
* **Thử thách Live-coding tại chỗ (1 phút):**
  * *Tình huống 1:* Tạo file bắt lỗi mạng `error.tsx` cho trang chi tiết.  
    -> **Xử lý:** Tạo `src/app/movie/[id]/error.tsx` có `'use client'`, hiển thị thông báo lỗi và nút bấm `onClick={() => reset()}`.
  * *Tình huống 2:* Cập nhật thẻ tiêu đề SEO có thêm năm phát hành của phim.  
    -> **Xử lý:** Mở hàm `generateMetadata`, sửa `title: `${movie.title} (${movie.release_date.split('-')[0]}) - MovieApp``.

---

### 👤 3. THÁI (Tìm kiếm, Client Component & Server Actions)
* **Phạm vi code:** Trang Tìm kiếm (`/search`) với Debounce và đồng bộ URL SearchParams, kỹ thuật đinh **Server Actions** (`actions/watchlist.ts`) lưu Cookie qua `cookies()`, `revalidatePath`, và thiết lập CI GitHub Actions.
* 📄 **File nhiệm vụ chi tiết & Code mẫu:** 👉 [NHIEM_VU_THAI.md](./NHIEM_VU_THAI.md)
* **Câu hỏi lý thuyết trọng tâm:**
  1. *Tại sao component `SearchBar` bắt buộc phải có `'use client'` trên đầu?*  
     -> **Đáp:** Vì component này tương tác trực tiếp với DOM: lắng nghe sự kiện gõ phím `onChange`, quản lý state và dùng các hook điều hướng của client như `useSearchParams`, `useRouter`. Nếu bỏ `'use client'`, server sẽ báo lỗi build vì không hỗ trợ các API trình duyệt này.
  2. *Server Action `toggleWatchlist` khác gì việc viết một API Route `/api/watchlist`?*  
     -> **Đáp:** Server Action (`"use server"`) cho phép gọi hàm trực tiếp từ giao diện mà không cần thiết lập endpoint API riêng. Hàm này thao tác trực tiếp với Cookie an toàn ở server qua `cookies()`, và dùng `revalidatePath('/watchlist')` để tự động làm mới giao diện trang yêu thích ngay tức thì.
* **Thử thách Live-coding tại chỗ (1 phút):**
  * *Tình huống 1:* Viết Server Action xóa toàn bộ danh sách Watchlist.  
    -> **Xử lý:** Trong `src/app/actions/watchlist.ts`, viết hàm `clearAllWatchlist()` gọi `cookieStore.delete('watchlist')` và `revalidatePath('/watchlist')`.
  * *Tình huống 2:* Chỉ ra ranh giới Server/Client Boundary trong trang Tìm kiếm.  
    -> **Xử lý:** Mở `src/app/search/page.tsx` chỉ ra trang cha là Server Component fetch kết quả, còn `<SearchBar />` bên trong là Client Component nhận sự kiện người dùng.

---

## 2. QUY TRÌNH PHỐI HỢP GIT ĐẠT CHUẨN KỸ NGHỆ (TẦNG 2)

Để không bị trừ điểm kỹ nghệ phần mềm, nhóm thực hiện đúng quy trình:
1. **Phân nhánh độc lập:**
   * Quân: `feature/home-and-layout`
   * Đại: `feature/movie-detail-streaming`
   * Thái: `feature/search-and-watchlist`
2. **Quy tắc Pull Request (PR):**
   * Tuyệt đối không commit thẳng vào `main`.
   * Tạo PR vào `main`, phải có **ít nhất 1 thành viên khác review và Approve**.
   * Pipeline CI GitHub Actions (`.github/workflows/ci.yml`) phải chạy qua (màu xanh lá) mới được bấm **Merge Pull Request**.
3. **Commit message có ý nghĩa:**
   * Ví dụ: `feat: implement isr caching for home page`, `feat: add suspense streaming for cast list`.

---

## 3. CHECKLIST NGHIỆM THU TRƯỚC KHI NỘP

* [ ] Tab Network trên F12 trình duyệt không để lộ `TMDB_API_KEY`.
* [ ] Đã có file `.env.example` và `README.md` hướng dẫn chạy chi tiết.
* [ ] Đã có file GitHub Actions CI tự động kiểm tra `lint` và `build`.
* [ ] Cả 3 thành viên đã đọc file nhiệm vụ riêng và tự tin làm thử thách live-coding trong 1 - 2 phút.
