# 🎬 HƯỚNG DẪN THIẾT KẾ & QUY CHUẨN MÃ NGUỒN CHUNG (DESIGN SYSTEM & CODING RULES)
> **Dành cho tất cả AI Agents và Lập trình viên:** Đọc file này TRƯỚC KHI tạo mới bất kỳ trang (page), component hoặc chỉnh sửa giao diện nào. Mọi thành viên bắt buộc phải tuân theo 100% style gốc và kiến trúc bên dưới để đảm bảo tính đồng nhất tuyệt đối cho toàn bộ dự án mà không cần hỏi lại.

---

## 🎨 1. HỆ THỐNG MÀU SẮC & GIAO DIỆN (NETFLIX CINEMA THEME)

Toàn bộ ứng dụng sử dụng phong cách **Dark Cinema của Netflix**:

| Thành phần | Mã màu / Class Tailwind | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Nền chính (Background)** | `#141414` (`bg-[#141414]`) | Màu nền đen xám thương hiệu Netflix (tránh màu đen tuyền `#000000` chống bóng mờ OLED) |
| **Nền thứ cấp (Surface)** | `#181818`, `#232323` | Nền của modal, card mở rộng, popup menu |
| **Màu thương hiệu (Brand Red)** | `#E50914` (`bg-[#E50914]`, `text-[#E50914]`) | Màu đỏ biểu tượng Netflix: Logo, badge TOP 10, nút tiêu điểm |
| **Màu chữ chính (Text Primary)**| `#FFFFFF` (`text-white`) | Tiêu đề phim, menu đang chọn |
| **Màu chữ phụ (Text Muted)** | `#A3A3A3`, `#737373` (`text-gray-400`, `text-gray-500`) | Mô tả phim, năm phát hành, phụ đề |
| **Nút "Phát" (Play Button)** | `bg-white text-black hover:bg-white/80` | Nút hành động chính chuẩn Netflix |
| **Nút "Thông tin" (Info Button)**| `bg-white/30 text-white backdrop-blur-md hover:bg-white/20` | Nút hành động phụ kính mờ |

---

## 🧩 2. QUY CHUẨN COMPONENT GIAO DIỆN (UI PATTERNS)

### 2.1. Header Điều Hướng (Netflix Navbar):
* Phải có Logo **MOVIEHUB** đỏ in hoa đậm: `<span className="text-2xl font-black text-[#E50914] tracking-tighter">MOVIEHUB</span>`.
* Header dính cố định (`sticky top-0 z-50`), có lớp gradient chuyển tiếp từ đen xuống trong suốt: `bg-gradient-to-b from-black/90 via-black/50 to-transparent`.
* Bên phải gồm: Nút Tìm kiếm (`/search`), Chuông thông báo, và Avatar Profile vuông bo góc nhẹ `rounded` kinh điển.

### 2.2. Billboard Hero Banner:
* Chiều cao lớn (`h-[75vh]` đến `h-[85vh]`).
* Ảnh nền Backdrop phải dùng thẻ `<Image priority fill className="object-cover" />` để tối ưu chỉ số **LCP (Largest Contentful Paint)**.
* Lớp phủ chuyển sắc mềm mại ở đáy: `bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent`.
* Bộ đôi nút bấm: Nút Phát trắng chữ đen (`▶ Phát`) và Nút Thông tin khác kính mờ (`ℹ Thông tin khác`).

### 2.3. Hàng Phim Cuộn Ngang (Netflix Rows):
* **BẮT BUỘC dạng cuộn ngang (Horizontal Slider):** Các danh mục phim ở trang chủ không dùng Grid tĩnh mà dùng hàng cuộn ngang mượt mà (`overflow-x-auto scrollbar-none`).
* Có 2 nút mũi tên cuộn trái/phải (`‹` và `›`) tự động hiện ra khi người dùng rê chuột vào hàng (`group-hover:opacity-100`).
* **Hàng TOP 10 Đặc Biệt:** Có các chữ số thứ tự khổng lồ nét viền `1, 2, 3... 10` xếp lồng bên cạnh poster.

### 2.4. Card Phim (MovieCard) & Tối Ưu Hình Ảnh:
* Tỷ lệ poster chuẩn điện ảnh: `aspect-[2/3]`.
* **Quy tắc chống nhảy giao diện (CLS = 0):** Luôn bọc `<Image />` trong thẻ cha có `relative aspect-[2/3] w-full`.
* **Hiệu ứng hover Netflix:** Khi hover chuột vào card, thẻ phóng to mượt mà (`group-hover:scale-105`), tăng độ nổi khối (`group-hover:shadow-2xl`) và không vỡ layout.

---

## ⚙️ 3. QUY TẮC KIẾN TRÚC NEXT.JS 16 & REACT 19

Khi viết hoặc thêm code mới, tất cả AI và lập trình viên phải tuân theo 4 nguyên tắc cốt lõi:

1. **Server Component Mặc Định:**
   * Mọi Page (`page.tsx`), Layout (`layout.tsx`), và Component chỉ hiển thị tĩnh (như `MovieCard`, `HeroBanner`, `Header`, `Footer`) **KHÔNG ĐƯỢC thêm `"use client"`**.
   * Chỉ thêm `"use client"` cho các component thực sự cần tương tác DOM/State trình duyệt: `MovieRow` (cuộn ngang, nút trượt), `SearchBar` (nhập liệu, URL params), `WatchlistButton` (sự kiện click).
2. **Bảo Mật API Tuyệt Đối:**
   * Không bao giờ gọi API trực tiếp có kèm `TMDB_API_KEY` từ Client Component. Toàn bộ logic fetch dữ liệu phải nằm trong `services/tmdb.ts` chạy trên Server.
3. **Cơ Chế Caching (ISR):**
   * Mọi hàm fetch dữ liệu trong `services/tmdb.ts` đều phải truyền `{ next: { revalidate: N } }` để giữ tốc độ phản hồi mili-giây.
4. **Xử Lý Trạng Thái Tải (Skeleton Loading):**
   * Mọi màn hình hoặc khối dữ liệu nạp chậm phải có component Skeleton tương ứng với kích thước bằng 100% kích thước thật để tránh giật khung hình.

---

## 📁 4. BẢN ĐỒ THƯ MỤC CHUẨN (FOLDER CONVENTIONS)

```text
├── app/
│   ├── layout.tsx              # Root Layout chia sẻ toàn app
│   ├── page.tsx                # Trang chủ (Server Component)
│   ├── loading.tsx             # Skeleton loading cho toàn trang
│   ├── globals.css             # Định nghĩa màu #141414, Tailwind v4
│   ├── movie/[id]/             # Luồng Chi tiết phim (Đại)
│   ├── search/                 # Luồng Tìm kiếm phim (Thái)
│   └── watchlist/              # Luồng Phim yêu thích (Thái)
├── components/
│   ├── server/                 # Các Server Components (HeroBanner, Header, Footer, MovieCard)
│   └── client/                 # Các Client Components (MovieRow, SearchBar, WatchlistBtn)
├── services/
│   └── tmdb.ts                 # Service gọi TMDB trên server kèm ISR cache
└── types/
    └── tmdb.d.ts               # Định nghĩa kiểu dữ liệu TMDB
```

---

> 📌 **Lời nhắc cho AI tiếp theo:** Khi nhận yêu cầu viết thêm trang hoặc tính năng mới, hãy tái sử dụng các component có sẵn trong `components/server` và `components/client`, giữ nguyên màu nền `#141414` và nút bấm phong cách Netflix như đã quy định ở trên.
