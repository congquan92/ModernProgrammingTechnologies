# BẢN GIAO VIỆC & KỊCH BẢN THI THỰC HÀNH TẠI CHỖ

## DÀNH CHO: NGUYỄN QUÂN
### VAI TRÒ: KIẾN TRÚC TRANG CHỦ, CƠ CHẾ CACHING (ISR), TỐI ƯU HÓA HÌNH ẢNH & WEB VITALS
> **Khối lượng công việc & Độ khó:** ⭐⭐⭐☆☆ (Đồng đều 33.3% toàn đồ án — Nắm mảng Caching dữ liệu, Tối ưu hóa tài nguyên và Hiệu năng hiển thị).

---

## 1. TỔNG QUAN PHẠM VI TRÁCH NHIỆM

Quân đảm nhiệm toàn bộ khâu xây dựng nền tảng ban đầu, luồng hiển thị trang chủ và tối ưu hóa tài nguyên:
1. **Khởi tạo & Cấu hình Hệ thống (Tầng 1A & Tầng 2):**
   * Khởi tạo dự án Next.js (App Router, TypeScript, Tailwind CSS).
   * Viết module gọi API tập trung từ Server: `src/services/tmdb.ts` (các hàm: `getTrendingMovies`, `getNowPlayingMovies`, `getTopRatedMovies`).
   * Cấu hình biến môi trường an toàn: `.env.local` và file mẫu `.env.example`.
2. **Giao diện & Bố cục (Layout & Home):**
   * Xây dựng **Root Layout (`src/app/layout.tsx`)**: Header điều hướng (Logo, Navlinks, Dark/Light Mode), Footer. Tích hợp `next/font` để tối ưu font chữ.
   * Xây dựng **Trang chủ (`src/app/page.tsx`)**: Hero Banner phim nổi bật, các hàng danh sách phim (Trending, Now Playing, Top Rated) dạng Carousel/Grid.
3. **Kỹ thuật Next.js chứng minh (Tầng 1A & Tầng 1B):**
   * **Server Component Data Fetching:** Fetch toàn bộ dữ liệu TMDB ở Server, bảo mật tuyệt đối `TMDB_API_KEY` (không lộ ra trình duyệt).
   * **Caching & Revalidation (ISR):** Áp dụng chiến lược Caching với thời gian sống (TTL): `fetch(url, { next: { revalidate: 3600 } })` (cache 1 giờ cho danh sách Trending).
   * **Tối ưu hình ảnh (`next/image`):** Cấu hình `remotePatterns` trong `next.config.js`; dùng thẻ `<Image />` tự nén WebP, responsive kích thước qua thuộc tính `sizes`, chống giật layout (CLS).
4. **Kỹ nghệ phần mềm & Đo lường chuyên sâu (Tầng 2 & Tầng 3):**
   * **Tầng 2:** Viết tài liệu kỹ thuật `README.md` chuẩn mực (hướng dẫn cài đặt, chạy dev, build production, giải thích các biến môi trường).
   * **Tầng 3:** Sử dụng **Google Lighthouse** đo lường các chỉ số **Core Web Vitals (LCP, CLS, FCP)**: So sánh đối chứng hiệu năng giữa việc dùng thẻ `<Image />` của Next.js so với thẻ `<img>` HTML thông thường.

---

## 2. FILE CODE QUÂN ĐẢM NHIỆM & CODE MẪU THAM KHẢO

### File 1: `src/services/tmdb.ts` (Tầng gọi dữ liệu Server)
```typescript
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Hàm dùng chung fetch dữ liệu có cấu hình Caching/ISR (Tầng 1B)
async function fetchTMDB(endpoint: string, revalidateTime: number = 3600) {
  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=vi-VN`, {
    next: { revalidate: revalidateTime }, // Cache dữ liệu theo số giây chỉ định
  });
  if (!res.ok) throw new Error(`Lỗi gọi API TMDB: ${res.statusText}`);
  return res.json();
}

export async function getTrendingMovies() {
  const data = await fetchTMDB('/trending/movie/week', 3600); // Cache 1 giờ
  return data.results || [];
}

export async function getNowPlayingMovies() {
  const data = await fetchTMDB('/movie/now_playing', 1800); // Cache 30 phút
  return data.results || [];
}

export async function getTopRatedMovies() {
  const data = await fetchTMDB('/movie/top_rated', 86400); // Cache 24 giờ
  return data.results || [];
}
```

### File 2: `src/components/server/MovieCard.tsx` (Component thẻ phim tối ưu ảnh)
```tsx
import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function MovieCard({ id, title, poster_path, vote_average, release_date }: MovieCardProps) {
  const imageUrl = poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}` 
    : '/no-poster.png';

  return (
    <Link href={`/movie/${id}`} className="group block overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition hover:scale-105 hover:border-yellow-400">
      <div className="relative aspect-[2/3] w-full bg-gray-800">
        {/* Điểm kỹ thuật: next/image responsive và WebP */}
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-bold text-yellow-400 shadow">
          ⭐ {vote_average.toFixed(1)}
        </div>
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold text-white group-hover:text-yellow-400">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{release_date ? release_date.split('-')[0] : 'Chưa có năm'}</p>
      </div>
    </Link>
  );
}
```

### File 3: `src/app/page.tsx` (Trang chủ thuần Server Component)
```tsx
import { getTrendingMovies, getNowPlayingMovies, getTopRatedMovies } from '@/services/tmdb';
import MovieCard from '@/components/server/MovieCard';

export default async function HomePage() {
  // Fetch dữ liệu song song trực tiếp ở Server Component (Tầng 1A)
  const [trending, nowPlaying, topRated] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getTopRatedMovies(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-12">
      {/* Section Phim Thịnh Hành */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-yellow-400 pl-3">
          🔥 Phim Thịnh Hành Trong Tuần
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trending.slice(0, 10).map((movie: any) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      </section>

      {/* Section Phim Đang Chiếu */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-500 pl-3">
          🎬 Phim Đang Chiếu Rạp
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {nowPlaying.slice(0, 10).map((movie: any) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      </section>
    </main>
  );
}
```

---

## 3. KỊCH BẢN THI THỰC HÀNH TẠI CHỖ & VẤN ĐÁP CỦA QUÂN

### 🎯 Phần 1: Câu hỏi lý thuyết vấn đáp (Thuộc lòng để ăn trọn điểm)

* **Thầy cô hỏi:** *"Tại sao ở trang chủ em không dùng `useEffect` + `useState` để gọi API như làm ở môn React thông thường?"*
  * **Quân trả lời:**  
    *"Dạ thưa thầy/cô, trang chủ của em là **Server Component**. Việc fetch dữ liệu ở Server mang lại 3 lợi ích cốt lõi vượt trội so với React SPA thông thường:*
    1. *Hiệu năng và SEO:* HTML được server tạo sẵn kèm đầy đủ dữ liệu phim, trình duyệt tải về là hiển thị ngay (cải thiện chỉ số FCP và các bot tìm kiếm Google đọc được nội dung đầy đủ).
    2. *Tải nhẹ cho Client:* Giảm dung lượng Javascript bundle gửi về trình duyệt vì code fetch và xử lý dữ liệu chạy hoàn toàn trên server.
    3. *Bảo mật:* API Key của TMDB nằm an toàn trong biến môi trường server. Thầy/cô có thể kiểm tra tab Network trên F12 trình duyệt, hoàn toàn không có request nào gọi thẳng đến TMDB để lộ key ạ."*

* **Thầy cô hỏi:** *"Chiến lược Caching ở trang chủ em đang dùng là gì? Cơ chế Revalidate hoạt động ra sao?"*
  * **Quân trả lời:**  
    *"Dạ, em dùng cơ chế **ISR (Incremental Static Regeneration)** thông qua `next: { revalidate: 3600 }`. Next.js sẽ lưu trang tĩnh đã render vào cache trong 1 giờ. Trong khoảng thời gian này, tất cả người dùng truy cập đều nhận được trang tĩnh với tốc độ phản hồi tính bằng mili-giây. Sau 1 giờ, khi có request mới, Next.js vẫn trả trang cache cũ cho user trước, đồng thời kích hoạt ngầm một tiến trình fetch dữ liệu mới từ TMDB để cập nhật bản cache cho các lần truy cập tiếp theo."*

* **Thầy cô hỏi:** *"Thẻ `<Image />` của Next.js tối ưu những gì so với thẻ `<img>` thường?"*
  * **Quân trả lời:**  
    *"Dạ, thẻ `<Image />` của Next.js thực hiện tự động 3 việc:*
    1. *Tự động nén ảnh sang định dạng WebP/AVIF nhẹ hơn 30-50% so với ảnh gốc JPEG/PNG.*
    2. *Tự động sinh `srcset` theo màn hình (điện thoại tải ảnh nhỏ, máy tính tải ảnh to).*
    3. *Giữ chỗ kích thước trước khi ảnh tải xong, ngăn chặn hoàn toàn lỗi nhảy khung hình (CLS - Cumulative Layout Shift)."*

---

### 💻 Phần 2: Thử thách Live-coding tại chỗ (Thao tác trong 1 - 2 phút)

#### ⚡ Tình huống 1: *"Thầy muốn trang chủ không lưu cache nữa, mỗi lần người dùng F5 đều phải gọi TMDB lấy dữ liệu mới nhất (Dynamic Rendering), em sửa thế nào?"*
* **Cách Quân xử lý:**
  1. Mở file `src/app/page.tsx`.
  2. Thêm đúng 1 dòng này lên đầu file:
     ```typescript
     export const dynamic = 'force-dynamic';
     ```
  3. Hoặc vào `src/services/tmdb.ts`, sửa `{ next: { revalidate: 3600 } }` thành:
     ```typescript
     { cache: 'no-store' }
     ```
  4. Bật terminal chạy `npm run build` hoặc reload trang web để chứng minh: Mỗi lần F5 trang web, server đều gọi lại API.

#### ⚡ Tình huống 2: *"Hãy thêm một hàng danh sách phim 'Top Rated' vào trang chủ ngay bây giờ."*
* **Cách Quân xử lý:**
  1. Mở `src/app/page.tsx`.
  2. Thêm `getTopRatedMovies()` vào lời gọi `Promise.all`:
     ```typescript
     const [trending, nowPlaying, topRated] = await Promise.all([
       getTrendingMovies(),
       getNowPlayingMovies(),
       getTopRatedMovies(),
     ]);
     ```
  3. Thêm một block JSX hiển thị:
     ```tsx
     <section>
       <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
         ⭐ Phim Đánh Giá Cao Nhất
       </h2>
       <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
         {topRated.slice(0, 10).map((movie: any) => (
           <MovieCard key={movie.id} {...movie} />
         ))}
       </div>
     </section>
     ```
  4. Lưu file và mở trình duyệt cho thầy cô xem kết quả hiển thị ngay lập tức.
