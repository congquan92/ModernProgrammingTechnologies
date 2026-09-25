# 🎬 HỆ THỐNG THIẾT KẾ & QUY CHUẨN MÃ NGUỒN (MOVIEHUB DESIGN SYSTEM)

> **DÀNH CHO TẤT CẢ AI AGENTS VÀ LẬP TRÌNH VIÊN TRONG DỰ ÁN:**  
> Đọc kỹ tài liệu này trước khi viết bất kỳ dòng code nào. Dự án mô phỏng **100% trải nghiệm và phong cách điện ảnh của Netflix (Netflix Dark Cinema Aesthetic)** trên nền tảng **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**.  
> Mọi component, màn hình (Trang chủ, Chi tiết phim, Tìm kiếm, Danh sách yêu thích) bắt buộc phải tái sử dụng các Design Token, quy chuẩn CSS và kiến trúc kỹ thuật được quy định dưới đây.

---

## 📑 MỤC LỤC
1. [Hệ Thống Token Màu Sắc (Color Tokens)](#1-hệ-thống-token-màu-sắc-color-tokens)
2. [Hệ Thống Typography & Cỡ Chữ](#2-hệ-thống-typography--cỡ-chữ)
3. [Hiệu Ứng, Đổ Bóng & Bo Góc (Elevation & Radius)](#3-hiệu-ứng-đổ-bóng--bo-góc-elevation--radius)
4. [Thư Viện Component Chuẩn (UI Component Library)](#4-thư-viện-component-chuẩn-ui-component-library)
   * 4.1. [Hệ Thống Nút Bấm (Buttons)](#41-hệ-thống-nút-bấm-buttons)
   * 4.2. [Huy Hiệu & Nhãn Thông Số (Badges & Tags)](#42-huy-hiệu--nhãn-thông-số-badges--tags)
   * 4.3. [Thanh Điều Hướng (Navbar Header)](#43-thanh-điều-hướng-navbar-header)
   * 4.4. [Hero Billboard Banner](#44-hero-billboard-banner)
   * 4.5. [Hàng Phim Cuộn Ngang (MovieRow & Top 10)](#45-hàng-phim-cuộn-ngang-movierow--top-10)
   * 4.6. [Thẻ Phim (MovieCard) & Thẻ Diễn Viên (CastCard)](#46-thẻ-phim-moviecard--thẻ-diễn-viên-castcard)
   * 4.7. [Khung Xương Tải Trang (Skeleton Loaders)](#47-khung-xương-tải-trang-skeleton-loaders)
   * 4.8. [Màn Hình 404 & Bắt Lỗi (Error & Not-Found)](#48-màn-hình-404--bắt-lỗi-error--not-found)
5. [Quy Tắc Kiến Trúc Kỹ Thuật (Architecture Rules)](#5-quy-tắc-kiến-trúc-kỹ-thuật-architecture-rules)
6. [Bản Đồ Thư Mục & Phân Công Nhiệm Vụ](#6-bản-đồ-thư-mục--phân-công-nhiệm-vụ)
7. [Mẫu Prompt Cho Các AI Tiếp Theo](#7-mẫu-prompt-cho-các-ai-tiếp-theo)

---

## 🎨 1. HỆ THỐNG TOKEN MÀU SẮC (COLOR TOKENS)

Không sử dụng màu đen thuần `#000000` cho nền chính để tránh hiện tượng bóng mờ (smearing) trên màn hình OLED.

```css
:root {
  --bg-main:       #141414;  /* Nền chính Netflix */
  --bg-surface:    #181818;  /* Nền thẻ card, ô nhập liệu */
  --bg-elevated:   #232323;  /* Nền modal, popup, tooltip */
  --brand-red:     #E50914;  /* Đỏ thương hiệu Netflix */
  --brand-red-hover: #b80710;/* Đỏ khi hover */
  --text-primary:  #FFFFFF;  /* Chữ chính, tiêu đề */
  --text-secondary:#A3A3A3;  /* Chữ phụ, mô tả ngắn */
  --text-muted:    #737373;  /* Chữ mờ, năm phát hành, bản quyền */
  --accent-match:  #46D369;  /* Xanh lá biểu thị % độ phù hợp */
}
```

| Tên Token | Mã Hex / Tailwind Class | Áp Dụng Cho |
| :--- | :--- | :--- |
| **Main Background** | `#141414` (`bg-[#141414]`) | Toàn bộ thẻ `body`, trang chủ, trang chi tiết, trang tìm kiếm |
| **Surface** | `#181818` (`bg-[#181818]`) | Card phim, ô input tìm kiếm, dropdown menu |
| **Elevated** | `#242424` (`bg-[#242424]`) | Modal xem trailer, khung chi tiết nổi |
| **Brand Red** | `#E50914` (`bg-[#E50914]`, `text-[#E50914]`) | Logo chữ MOVIEHUB, badge TOP 10, nút yêu thích đang kích hoạt |
| **Match Score** | `#46D369` (`text-emerald-400`) | Chỉ số phần trăm phù hợp (ví dụ: `98% Phù hợp`) |
| **Star Rating** | `#FACC15` (`text-yellow-400`) | Điểm đánh giá TMDB ⭐ (ví dụ: `8.5`) |

---

## 🔤 2. HỆ THỐNG TYPOGRAPHY & CỠ CHỮ

Dự án dùng font chữ không chân **Geist Sans** (`next/font/google`), font in đậm nét phẳng:

* **Hero Title (Tiêu đề lớn nhất):** `text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white drop-shadow-xl`
* **Section Title (Tiêu đề danh mục):** `text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight`
* **Card Title (Tên phim trên thẻ):** `text-xs sm:text-sm font-bold text-white truncate`
* **Metadata/Label:** `text-[10px] sm:text-xs font-semibold text-gray-400`
* **Body/Overview:** `text-sm sm:text-base text-gray-200 leading-relaxed`

---

## 📐 3. HIỆU ỨNG, ĐỔ BÓNG & BO GÓC (ELEVATION & RADIUS)

* **Bo góc (Border Radius):**
  * Thẻ Card phim: `rounded-md` (bo nhẹ 6px chuẩn Netflix, không dùng bo tròn quá đà `rounded-2xl` cho card).
  * Nút bấm: `rounded-md` hoặc `rounded` (4px - 6px).
  * Khung nhập liệu tìm kiếm: `rounded-full` hoặc `rounded-md`.
* **Hiệu ứng Hover Phóng To (The Netflix Zoom):**
  ```css
  transition-all duration-300 ease-out hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-black/90
  ```
* **Lớp phủ Gradient (Cinematic Overlays):**
  * Đáy Hero Banner: `bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent`
  * Đỉnh Navbar: `bg-gradient-to-b from-black/80 via-black/30 to-transparent`
  * Cạnh trái Billboard: `bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent`

---

## 🧩 4. THƯ VIỆN COMPONENT CHUẨN (UI COMPONENT LIBRARY)

### 4.1. Hệ Thống Nút Bấm (Buttons)

Mọi nút bấm phải tuân theo 3 biến thể chuẩn sau:

```tsx
// 1. Nút Phát (Primary Action Button)
<button className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-md transition-colors text-base shadow-lg">
  <span className="text-xl">▶</span>
  <span>Phát</span>
</button>

// 2. Nút Thông Tin Khác (Secondary Glass Button)
<button className="flex items-center gap-2 bg-white/30 hover:bg-white/20 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md backdrop-blur-md transition-colors text-base">
  <span className="text-lg">ⓘ</span>
  <span>Thông tin khác</span>
</button>

// 3. Nút Lưu Yêu Thích / Server Action (Watchlist Button)
<button className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all border border-gray-600 bg-black/60 hover:border-white text-white">
  <span>❤️</span>
  <span>Đã lưu vào danh sách</span>
</button>
```

---

### 4.2. Huy Hiệu & Nhãn Thông Số (Badges & Tags)

```tsx
{/* Huy hiệu TOP 10 đỏ Netflix */}
<div className="flex items-center gap-1 bg-[#E50914] text-white font-black text-xs px-2 py-0.5 rounded shadow select-none">
  <span>TOP</span>
  <span>10</span>
</div>

{/* Chỉ số % phù hợp */}
<span className="text-emerald-400 font-bold text-sm">98% Phù hợp</span>

{/* Nhãn giới hạn độ tuổi */}
<span className="border border-gray-500/80 px-1.5 py-0.5 text-xs text-gray-300 rounded-sm select-none">
  16+
</span>

{/* Nhãn chất lượng hình ảnh */}
<span className="border border-gray-500/80 px-1.5 py-0.5 text-xs text-gray-300 rounded-sm font-bold select-none">
  Ultra HD 4K
</span>

{/* Điểm đánh giá sao */}
<div className="flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-yellow-400">
  <span>⭐</span>
  <span>8.5</span>
</div>
```

---

### 4.3. Thanh Điều Hướng (Navbar Header)
* **File:** `components/client/Header.tsx` (Client Component).
* **Quy chuẩn:**
  * Dùng `fixed top-0 left-0 right-0 z-50`.
  * Ở đỉnh trang (`scrollY <= 30`): Trong suốt (`bg-transparent` kèm gradient mờ nhẹ).
  * Khi cuộn trang (`scrollY > 30`): Tự động hóa đen `#141414` (`bg-[#141414] shadow-xl shadow-black/80`).
  * Logo: `MOVIEHUB` (Chữ **MOVIE** đỏ `#E50914`, chữ **HUB** trắng `#FFFFFF`).
  * Avatar Profile: Hình vuông viền gradient `from-blue-600 to-red-500`.

---

### 4.4. Hero Billboard Banner
* **File:** `components/server/HeroBanner.tsx` (Server Component).
* **Quy chuẩn:**
  * Chiều cao `h-[80vh] sm:h-[90vh]`, ảnh Backdrop dùng `<Image fill priority sizes="100vw" />`.
  * Thuộc tính `priority` là bắt buộc để tối ưu **LCP (Largest Contentful Paint)** cho Core Web Vitals.
  * Lớp dốc đen đáy hòa quyện trực tiếp vào danh sách phim phía dưới.

---

### 4.5. Hàng Phim Cuộn Ngang (MovieRow & Top 10)
* **File:** `components/client/MovieRow.tsx` (Client Component).
* **Quy chuẩn:**
  * Cuộn ngang mượt mà với thanh cuộn ẩn (`no-scrollbar`).
  * Hai nút trượt `‹` và `›` nằm ở 2 mép hàng, chỉ xuất hiện khi hover chuột vào hàng (`group-hover:opacity-100`).
  * **Chế độ Top 10 (`isTop10={true}`):** Hiển thị số thứ tự khổng lồ với class `.netflix-number` viền xám đen bên cạnh thẻ phim.

---

### 4.6. Thẻ Phim (MovieCard) & Thẻ Diễn Viên (CastCard)

#### Thẻ Phim (`components/server/MovieCard.tsx`):
* Tỷ lệ khung hình: Bắt buộc `aspect-[2/3]` với thẻ cha `relative aspect-[2/3] w-full bg-[#202020]`.
* Thuộc tính ảnh: `<Image fill sizes="..." loading="lazy" />` để **CLS luôn bằng 0.00**.
* Chữ **N** đỏ ở góc trên bên trái, điểm sao ⭐ ở góc trên bên phải.

#### Thẻ Diễn Viên (`components/server/CastCard.tsx` - dành cho Đại):
```tsx
<div className="w-28 sm:w-32 shrink-0 text-center space-y-1.5">
  <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[#202020]">
    <Image src={avatarUrl} alt={actorName} fill className="object-cover" sizes="128px" />
  </div>
  <p className="text-xs font-bold text-white truncate">{actorName}</p>
  <p className="text-[11px] text-gray-400 truncate">{characterName}</p>
</div>
```

---

### 4.7. Khung Xương Tải Trang (Skeleton Loaders)
* Mọi Skeleton (`components/server/MovieCardSkeleton.tsx`, `CastSkeleton.tsx`) phải có hiệu ứng `animate-pulse` trên nền `bg-zinc-800/80` và **kích thước hình học giống 100% component thật** để triệt tiêu hiện tượng giật màn hình (CLS).

---

### 4.8. Màn Hình 404 & Bắt Lỗi (Error & Not-Found)
* Phải có nền `#141414`, thông báo lỗi rõ ràng kèm nút bấm quay về trang chủ hoặc nút Thử lại (`reset()`) nền trắng chữ đen.

---

## ⚙️ 5. QUY TẮC KIẾN TRÚC KỸ THUẬT (ARCHITECTURE RULES)

Mọi thành viên và AI phải tuân thủ nghiêm ngặt chuẩn kiến trúc Next.js App Router:

1. **Ranh Giới Server / Client Component:**
   * **Mặc định là Server Component:** Trang chi tiết (`app/movie/[id]/page.tsx`), trang tìm kiếm kết quả (`app/search/page.tsx`), danh sách yêu thích (`app/watchlist/page.tsx`).
   * **Chỉ thêm `"use client"` khi:** Cần DOM events (`onClick`, `onChange`), State (`useState`), hoặc Hook trình duyệt (`useSearchParams`, `useRouter`, `useRef`).
2. **Bảo Mật API TMDB (Bắt Buộc):**
   * Không bao giờ gọi API TMDB trực tiếp từ Client Component hoặc để lộ `TMDB_API_KEY` ra tab Network.
   * Toàn bộ lời gọi fetch phải tập trung trong `services/tmdb.ts` chạy trên Server.
3. **Chiến Lược Caching (ISR):**
   * Mọi lời gọi API phải có tham số `{ next: { revalidate: N } }` (N = số giây).
4. **Streaming với React Suspense:**
   * Các khối dữ liệu nạp chậm (như danh sách Diễn viên, Phim tương tự) phải được bọc trong `<Suspense fallback={<SkeletonComponent />}>`.

---

## 📁 6. BẢN ĐỒ THƯ MỤC & PHÂN CÔNG NHIỆM VỤ

```text
modern-programming-technologies/
├── app/
│   ├── layout.tsx                # [Quân] Root Layout (Header fixed, Footer #141414, next/font)
│   ├── page.tsx                  # [Quân] Trang chủ (Billboard Banner + 4 Hàng MovieRow cuộn ngang)
│   ├── loading.tsx               # [Quân] Skeleton loader toàn trang chủ
│   ├── globals.css               # [Quân] Palette màu #141414, no-scrollbar, netflix-number
│   │
│   ├── movie/[id]/
│   │   ├── page.tsx              # [Đại] Chi tiết phim (Server Component + generateMetadata)
│   │   ├── loading.tsx           # [Đại] Skeleton loader chi tiết phim
│   │   ├── error.tsx             # [Đại] Bắt lỗi sự cố (Client Component có reset())
│   │   └── not-found.tsx         # [Đại] Giao diện 404 khi ID không tồn tại
│   │
│   ├── search/
│   │   └── page.tsx              # [Thái] Trang tìm kiếm (Server Component nhận searchParams)
│   │
│   ├── watchlist/
│   │   └── page.tsx              # [Thái] Danh sách yêu thích đọc từ Cookie
│   │
│   └── actions/
│       └── watchlist.ts          # [Thái] Server Actions toggleWatchlist() thao tác cookies()
│
├── components/
│   ├── server/
│   │   ├── HeroBanner.tsx        # [Quân] Billboard banner chuẩn LCP
│   │   ├── MovieCard.tsx         # [Quân] Card poster 2:3 có N-badge, % match và HD tag
│   │   ├── MovieCardSkeleton.tsx # [Quân] Skeleton card
│   │   ├── Footer.tsx            # [Quân] Footer tối giản bản quyền TMDB
│   │   ├── CastList.tsx          # [Đại] Hàng diễn viên cuộn ngang
│   │   └── SimilarMovies.tsx     # [Đại] Hàng phim tương tự
│   │
│   └── client/
│       ├── Header.tsx            # [Quân] Navbar đổi màu trong suốt khi cuộn
│       ├── MovieRow.tsx          # [Quân] Hàng phim cuộn ngang kèm nút trượt & Top 10
│       ├── SearchBar.tsx         # [Thái] Ô gõ tìm kiếm debounce cập nhật URL
│       └── WatchlistButton.tsx   # [Thái] Nút bấm Lưu phim gọi Server Action
│
├── services/
│   └── tmdb.ts                   # Module fetch TMDB tập trung có ISR Caching
│
├── types/
│   └── tmdb.d.ts                 # Kiểu dữ liệu TypeScript cho Movie, Details, Cast
│
└── DESIGN_SYSTEM.md              # 🌟 TÀI LIỆU NÀY
```

---

## 💬 7. MẪU PROMPT CHO CÁC AI TIẾP THEO

Khi chuyển giao dự án cho một AI khác hoặc mở một phiên làm việc mới, bạn chỉ cần copy đoạn prompt sau gửi cho AI đó:

```text
Bạn là lập trình viên tiếp theo của dự án. Hãy đọc kỹ file `DESIGN_SYSTEM.md` ở thư mục gốc. 
Mọi màn hình và component bạn viết bắt buộc phải tuân theo:
1. Nền #141414, phong cách giao diện Netflix Dark Cinema.
2. Tái sử dụng các button, badge, và card từ DESIGN_SYSTEM.md.
3. Tuân thủ ranh giới Server Component, Caching ISR và không lộ TMDB_API_KEY ở Client.
Bây giờ hãy thực hiện nhiệm vụ tiếp theo của bạn!
```
