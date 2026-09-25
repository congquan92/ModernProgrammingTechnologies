# BẢN GIAO VIỆC & KỊCH BẢN THI THỰC HÀNH TẠI CHỖ

## DÀNH CHO: ĐẠI
### VAI TRÒ: ROUTING ĐỘNG, STREAMING VỚI SUSPENSE, XỬ LÝ NGOẠI LỆ & DYNAMIC SEO
> **Khối lượng công việc & Độ khó:** ⭐⭐⭐☆☆ (Đồng đều 33.3% toàn đồ án — Nắm mảng Điều hướng động, Streaming bất đồng bộ và Kiểm thử tự động).

---

## 1. TỔNG QUAN PHẠM VI TRÁCH NHIỆM

Đại chịu trách nhiệm xây dựng toàn bộ **Luồng Chi tiết phim**, màn hình thể hiện rõ rệt nhất các cơ chế render và streaming dữ liệu hiện đại của Next.js:
1. **Dynamic Route (`src/app/movie/[id]/page.tsx`):**
   * Bắt tham số `params.id` từ URL động để fetch chi tiết bộ phim từ TMDB API.
   * Xây dựng giao diện chi tiết: Backdrop banner, Poster phim, Điểm đánh giá, Thể loại, Thời lượng, Ngày chiếu, Tóm tắt nội dung.
2. **Kỹ thuật Đinh — Streaming với React Suspense (Tầng 1B):**
   * Chia nhỏ luồng tải dữ liệu của trang: Thông tin phim chính hiển thị ngay lập tức (không bắt người dùng chờ màn hình trắng).
   * Khối Diễn viên (`CastList`) và Phim tương tự (`SimilarMovies`) được bọc trong `<Suspense fallback={<CastSkeleton />}>` để stream về sau khi API hoàn thành.
3. **Xử lý trạng thái điều hướng & Ngoại lệ (Tầng 1B):**
   * `loading.tsx`: Khung xương Skeleton hiển thị tức thì khi người dùng bấm chuyển sang trang chi tiết.
   * `error.tsx`: Error boundary bắt lỗi mất mạng hoặc sự cố TMDB sập, có nút "Thử lại" (`reset()`).
   * `not-found.tsx`: Giao diện 404 thân thiện, được kích hoạt tự động bằng hàm `notFound()` khi ID phim không tồn tại.
4. **Dynamic Metadata & SEO (Tầng 1B):**
   * Viết hàm `generateMetadata({ params })` để tự động sinh thẻ `<title>`, `<meta description>`, OpenGraph Image theo từng bộ phim cụ thể.
5. **Kỹ nghệ phần mềm & Đo lường chuyên sâu (Tầng 2 & Tầng 3):**
   * **Tầng 2:** Cài đặt **Vitest** (hoặc Jest), viết ít nhất 2 unit/component test kiểm tra hàm format thời lượng phim và test render đúng dữ liệu phim.
   * **Tầng 3:** Đo lường và so sánh thời gian người dùng nhìn thấy nội dung đầu tiên (TTFB / FCP) giữa trang có áp dụng Streaming Suspense so với khi tắt Suspense (chờ tải hết toàn bộ API).

---

## 2. FILE CODE ĐẠI ĐẢM NHIỆM & CODE MẪU THAM KHẢO

### File 1: `src/app/movie/[id]/page.tsx` (Trang chi tiết kết hợp Suspense)
```tsx
import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/services/tmdb';
import CastList from '@/components/server/CastList';
import SimilarMovies from '@/components/server/SimilarMovies';
import CastSkeleton from '@/components/server/CastSkeleton';

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

// 1. Dynamic SEO Metadata (Tầng 1B)
export async function generateMetadata({ params }: MovieDetailPageProps) {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
    return {
      title: `${movie.title} (${movie.release_date?.split('-')[0]}) - MovieApp`,
      description: movie.overview || 'Xem thông tin chi tiết phim.',
      openGraph: {
        images: [`https://image.tmdb.org/t/p/w500${movie.poster_path}`],
      },
    };
  } catch {
    return { title: 'Không tìm thấy phim - MovieApp' };
  }
}

// 2. Server Component chính
export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch (error) {
    notFound(); // Kích hoạt file not-found.tsx nếu ID không tồn tại
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Khối thông tin chính: Render ngay lập tức */}
      <section className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-80 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-white">{movie.title}</h1>
          <p className="italic text-gray-400">{movie.tagline}</p>
          <div className="flex gap-4 items-center">
            <span className="bg-yellow-500 text-black font-bold px-3 py-1 rounded">⭐ {movie.vote_average.toFixed(1)}</span>
            <span className="text-gray-300">{movie.runtime} phút</span>
            <span className="text-gray-300">{movie.release_date}</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
        </div>
      </section>

      {/* Khối Dàn Diễn Viên: Bọc trong Suspense để Stream về sau */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">🎭 Dàn Diễn Viên</h2>
        <Suspense fallback={<CastSkeleton />}>
          <CastList movieId={id} />
        </Suspense>
      </section>

      {/* Khối Phim Tương Tự: Stream về sau */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">🍿 Phim Tương Tự</h2>
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-800 rounded-lg" />}>
          <SimilarMovies movieId={id} />
        </Suspense>
      </section>
    </div>
  );
}
```

### File 2: `src/components/server/CastList.tsx` (Component con nạp chậm)
```tsx
import Image from 'next/image';
import { getMovieCredits } from '@/services/tmdb';

export default async function CastList({ movieId }: { movieId: string }) {
  const credits = await getMovieCredits(movieId);
  const cast = credits.cast?.slice(0, 10) || [];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {cast.map((actor: any) => (
        <div key={actor.id} className="w-28 shrink-0 text-center">
          <div className="relative w-28 h-36 rounded-lg overflow-hidden bg-gray-800 mb-2">
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                alt={actor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">No Image</div>
            )}
          </div>
          <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{actor.character}</p>
        </div>
      ))}
    </div>
  );
}
```

### File 3: `src/app/movie/[id]/not-found.tsx` (Xử lý 404 thân thiện)
```tsx
import Link from 'next/link';

export default function MovieNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-4xl font-extrabold text-red-500 mb-4">404 - Không Tìm Thấy Phim</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Bộ phim với ID này không tồn tại hoặc đã bị xóa khỏi hệ thống TMDB.
      </p>
      <Link href="/" className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition">
        Quay lại Trang Chủ
      </Link>
    </div>
  );
}
```

---

## 3. KỊCH BẢN THI THỰC HÀNH TẠI CHỖ & VẤN ĐÁP CỦA ĐẠI

### 🎯 Phần 1: Câu hỏi lý thuyết vấn đáp (Thuộc lòng để ăn trọn điểm)

* **Thầy cô hỏi:** *"Streaming với React Suspense ở trang chi tiết phim hoạt động như thế nào? Nó giải quyết vấn đề gì?"*
  * **Đại trả lời:**  
    *"Dạ thưa thầy/cô, ở trang chi tiết phim, chúng em cần lấy dữ liệu từ 3 endpoint: Thông tin phim, Dàn diễn viên và Phim tương tự. Nếu dùng SSR thông thường, người dùng phải chờ cả 3 API phản hồi xong thì trang web mới bắt đầu hiển thị (trải nghiệm màn hình trắng rất lâu).*  
    *Nhờ cơ chế **Streaming kết hợp với Suspense** của Next.js App Router, server sẽ render và gửi ngay khối thông tin chính (poster, mô tả) về cho trình duyệt. Còn phần Diễn viên được bọc trong `<Suspense fallback={<CastSkeleton />}>`, server sẽ gửi trước khung xương Skeleton, sau đó khi TMDB trả về dữ liệu diễn viên thì server stream tiếp đoạn HTML đó chèn vào vị trí skeleton mà không cần tải lại trang."*

* **Thầy cô hỏi:** *"Khi người dùng gõ URL lung tung (ví dụ `/movie/9999999999` hoặc `/movie/abc`), hệ thống của em xử lý thế nào?"*
  * **Đại trả lời:**  
    *"Dạ, trong hàm `MovieDetailPage`, em bọc đoạn fetch API trong khối `try/catch`. Nếu TMDB trả về mã lỗi 404 (phim không tồn tại), em sẽ gọi hàm `notFound()` từ `next/navigation`. Hàm này sẽ ngắt luồng render bình thường và chuyển ngay sang hiển thị file `not-found.tsx` đã được em thiết kế riêng cho module phim ạ."*

* **Thầy cô hỏi:** *"Hàm `generateMetadata` chạy ở đâu? Lợi ích của nó là gì?"*
  * **Đại trả lời:**  
    *"Dạ, hàm `generateMetadata` chạy hoàn toàn ở phía **Server** trước khi trả HTML về. Nó lấy `params.id`, gọi TMDB lấy tên phim và ảnh poster để chèn vào các thẻ `<title>`, `<meta name='description'>` và các thẻ OpenGraph (`og:image`, `og:title`). Nhờ vậy khi người dùng copy link phim gửi qua Facebook, Zalo hay Discord, ứng dụng sẽ hiển thị khung preview ảnh và tóm tắt phim chuẩn SEO ạ."*

---

### 💻 Phần 2: Thử thách Live-coding tại chỗ (Thao tác trong 1 - 2 phút)

#### ⚡ Tình huống 1: *"Thầy muốn em tạo thêm một file bắt lỗi `error.tsx` cho trang chi tiết phòng trường hợp API sập hoặc mất mạng."*
* **Cách Đại xử lý (1 phút):**
  1. Tạo file mới: `src/app/movie/[id]/error.tsx`.
  2. Viết đoạn code chuẩn:
     ```tsx
     'use client'; // Bắt buộc phải có vì Error Component trong Next.js là Client Component

     export default function MovieError({ error, reset }: { error: Error; reset: () => void }) {
       return (
         <div className="text-center py-20">
           <h2 className="text-2xl font-bold text-red-500 mb-4">Đã xảy ra sự cố khi tải phim!</h2>
           <p className="text-gray-400 mb-6">{error.message}</p>
           <button onClick={() => reset()} className="px-4 py-2 bg-yellow-400 text-black font-bold rounded">
             Thử lại
           </button>
         </div>
       );
     }
     ```
  3. Giải thích với thầy cô: File này bắt buộc phải có `'use client'` vì chứa sự kiện nút bấm `onClick={() => reset()}`.

#### ⚡ Tình huống 2: *"Em hãy sửa lại title SEO để hiển thị thêm điểm đánh giá của bộ phim (Ví dụ: '[8.5⭐] Oppenheimer')."*
* **Cách Đại xử lý (1 phút):**
  1. Mở file `src/app/movie/[id]/page.tsx`.
  2. Tìm đến hàm `generateMetadata`.
  3. Sửa lại dòng return title:
     ```typescript
     return {
       title: `[${movie.vote_average.toFixed(1)}⭐] ${movie.title} - MovieApp`,
       // ...
     };
     ```
  4. F5 lại trình duyệt và chỉ cho thầy cô thấy tiêu đề trên tab trình duyệt đổi ngay lập tức.
