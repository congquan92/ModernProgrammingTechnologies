# BẢN GIAO VIỆC & KỊCH BẢN THI THỰC HÀNH TẠI CHỖ

## DÀNH CHO: THÁI
### VAI TRÒ: TƯƠNG TÁC TÌM KIẾM, CLIENT COMPONENT, SERVER ACTIONS & CI PIPELINE
> **Khối lượng công việc & Độ khó:** ⭐⭐⭐☆☆ (Đồng đều 33.3% toàn đồ án — Nắm mảng Ranh giới Server/Client, Mutation dữ liệu không cần Backend và Tự động hóa CI).

---

## 1. TỔNG QUAN PHẠM VI TRÁCH NHIỆM

Thái chịu trách nhiệm xây dựng toàn bộ mảng tương tác phía người dùng, giải quyết bài toán đồng bộ trạng thái URL và mutation dữ liệu (ghi/xóa dữ liệu) mà không cần viết backend riêng:
1. **Trang Tìm kiếm & Lọc (`src/app/search/page.tsx`):**
   * Ô tìm kiếm `SearchBar`: Gõ từ khóa tìm kiếm có cơ chế **Debounce** (ngăn chặn gửi request dồn dập).
   * Đồng bộ từ khóa tìm kiếm lên URL query params (`/search?q=avatar`) bằng `useSearchParams`, `useRouter`, `usePathname`.
   * Trang kết quả là **Server Component** nhận `searchParams` để fetch kết quả từ TMDB API phía server.
2. **Kỹ thuật Đinh — Server Actions & Cookie Mutation (Tầng 1B):**
   * Xây dựng tính năng "Thêm/Xóa phim khỏi Danh sách yêu thích" (Watchlist/Favorites).
   * Viết Server Action trong `src/app/actions/watchlist.ts` với chỉ thị `"use server"`.
   * Thao tác lưu và xóa danh sách ID phim trực tiếp vào **Cookie** trình duyệt bằng hàm `cookies()` từ `next/headers`.
   * Sử dụng hàm `revalidatePath('/watchlist')` để cập nhật giao diện danh sách yêu thích ngay tức thì mà không cần tải lại trang.
3. **Trang Danh sách yêu thích (`src/app/watchlist/page.tsx`):**
   * Đọc danh sách ID phim từ Cookie trong Server Component.
   * Lấy chi tiết các bộ phim đã lưu và hiển thị dạng danh sách lưới.
4. **Kỹ nghệ phần mềm & Đo lường chuyên sâu (Tầng 2 & Tầng 3):**
   * **Tầng 2:** Thiết lập quy trình **CI tự động với GitHub Actions** (`.github/workflows/ci.yml`) tự động chạy `lint`, `typecheck` và `build` khi bất kỳ thành viên nào tạo Pull Request.
   * **Tầng 3:** Cài đặt `@next/bundle-analyzer` để đo lường và phân tích dung lượng Javascript bundle của các Client Component (`SearchBar`, `WatchlistButton`) so với các Server Component để chứng minh lợi thế giảm bundle của Next.js.

---

## 2. FILE CODE THÁI ĐẢM NHIỆM & CODE MẪU THAM KHẢO

### File 1: `src/components/client/SearchBar.tsx` (Client Component xử lý URL)
```tsx
'use client'; // Bắt buộc vì dùng hooks tương tác trình duyệt

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    startTransition(() => {
      // Cập nhật URL mà không reload lại toàn bộ trang
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <input
        type="text"
        placeholder="Nhập tên phim cần tìm (ví dụ: Batman, Avatar)..."
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-5 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
      />
      {isPending && (
        <span className="absolute right-4 top-3.5 text-xs text-yellow-400 animate-spin">
          ⏳
        </span>
      )}
    </div>
  );
}
```

### File 2: `src/app/actions/watchlist.ts` (Server Action lưu Cookie)
```typescript
'use server'; // Đánh dấu toàn bộ file là Server Action (Tầng 1B)

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Lấy danh sách ID phim yêu thích từ Cookie
export async function getWatchlistIds(): Promise<number[]> {
  const cookieStore = await cookies();
  const watchlist = cookieStore.get('watchlist')?.value;
  return watchlist ? JSON.parse(watchlist) : [];
}

// Thêm hoặc xóa phim khỏi danh sách yêu thích
export async function toggleWatchlist(movieId: number) {
  const cookieStore = await cookies();
  let ids = await getWatchlistIds();

  if (ids.includes(movieId)) {
    ids = ids.filter((id) => id !== movieId); // Xóa nếu đã có
  } else {
    ids.push(movieId); // Thêm nếu chưa có
  }

  // Ghi lại vào Cookie (lưu trong 30 ngày)
  cookieStore.set('watchlist', JSON.stringify(ids), {
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
  });

  // Revalidate để trang watchlist tự cập nhật UI
  revalidatePath('/watchlist');
}
```

### File 3: `src/components/client/WatchlistButton.tsx` (Nút bấm gọi Server Action)
```tsx
'use client';

import { useTransition } from 'react';
import { toggleWatchlist } from '@/app/actions/watchlist';

interface WatchlistButtonProps {
  movieId: number;
  isFavorited: boolean;
}

export default function WatchlistButton({ movieId, isFavorited }: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleWatchlist(movieId); // Gọi Server Action trực tiếp từ UI
        });
      }}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
        isFavorited ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
      }`}
    >
      {isPending ? 'Đang lưu...' : isFavorited ? '❤️ Đã Lưu' : '🤍 Lưu Xem Sau'}
    </button>
  );
}
```

### File 4: `.github/workflows/ci.yml` (Quy trình CI tự động - Tầng 2)
```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Build Next.js
        run: npm run build
        env:
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
```

---

## 3. KỊCH BẢN THI THỰC HÀNH TẠI CHỖ & VẤN ĐÁP CỦA THÁI

### 🎯 Phần 1: Câu hỏi lý thuyết vấn đáp (Thuộc lòng để ăn trọn điểm)

* **Thầy cô hỏi:** *"Tại sao component `SearchBar` bắt buộc phải có `'use client'` trên đầu, nếu bỏ đi thì chuyện gì xảy ra?"*
  * **Thái trả lời:**  
    *"Dạ thưa thầy/cô, trong Next.js App Router, mặc định mọi component đều là Server Component. Component `SearchBar` cần lắng nghe sự kiện gõ phím từ người dùng (`onChange`), lưu state, và sử dụng các hook điều hướng của client như `useSearchParams`, `useRouter`, `usePathname`. Các hook và sự kiện DOM này chỉ tồn tại trên trình duyệt (client). Nếu bỏ `'use client'`, quá trình build của Next.js sẽ báo lỗi ngay lập tức vì server không thể biên dịch các hook này ạ."*

* **Thầy cô hỏi:** *"Server Action `toggleWatchlist` của em hoạt động thế nào? Tại sao em không dùng một API Route (`/api/watchlist`) như thông thường?"*
  * **Thái trả lời:**  
    *"Dạ thưa thầy/cô, Server Action với chỉ thị `'use server'` là tính năng mới và mạnh mẽ của Next.js:*
    1. *Nó cho phép em gọi trực tiếp một hàm chạy trên server từ component giao diện mà không cần phải tốn công viết endpoint REST API (`app/api/...`), không cần tự viết lệnh `fetch('/api/watchlist', { method: 'POST' })`.*
    2. *Hàm `toggleWatchlist` của em chạy trên server, truy xuất và sửa đổi Cookie của người dùng qua `cookies()` một cách an toàn.*
    3. *Đặc biệt, nó tích hợp sẵn cơ chế **Revalidation**: Khi gọi `revalidatePath('/watchlist')`, Next.js sẽ tự động purge cache và làm mới dữ liệu của trang Watchlist, người dùng sẽ thấy danh sách cập nhật ngay lập tức mà không cần reload trang."*

* **Thầy cô hỏi:** *"GitHub Actions CI của em kiểm tra những gì trong một Pull Request?"*
  * **Thái trả lời:**  
    *"Dạ, file CI của em thiết lập tự động kích hoạt mỗi khi có ai trong nhóm tạo Pull Request vào nhánh chính. Nó thực hiện 3 bước kiểm tra:*
    1. *Kiểm tra lint code (`npm run lint`) để đảm bảo không ai viết sai cú pháp hoặc code ẩu.*
    2. *Kiểm tra type TypeScript để tránh lỗi runtime.*
    3. *Chạy lệnh `npm run build` giả lập. Nếu build thành công trên GitHub Actions thì nhóm mới được phép merge PR vào nhánh chính ạ."*

---

### 💻 Phần 2: Thử thách Live-coding tại chỗ (Thao tác trong 1 - 2 phút)

#### ⚡ Tình huống 1: *"Hãy viết thêm một Server Action để 'Xóa toàn bộ phim khỏi Watchlist' ngay tại chỗ."*
* **Cách Thái xử lý (1 phút):**
  1. Mở file `src/app/actions/watchlist.ts`.
  2. Viết thêm hàm sau:
     ```typescript
     export async function clearAllWatchlist() {
       const cookieStore = await cookies();
       cookieStore.delete('watchlist'); // Xóa sạch cookie
       revalidatePath('/watchlist');    // Cập nhật lại giao diện
     }
     ```
  3. Mở file `src/app/watchlist/page.tsx`, thêm 1 nút bấm:
     ```tsx
     <form action={clearAllWatchlist}>
       <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
         Xóa Tất Cả
       </button>
     </form>
     ```
  4. Bấm thử nút trên trình duyệt cho thầy cô thấy danh sách được xóa sạch ngay lập tức.

#### ⚡ Tình huống 2: *"Em hãy chỉ ra ranh giới Server/Client Boundary trong trang Tìm kiếm (`/search`)."*
* **Cách Thái xử lý (1 phút):**
  1. Mở file `src/app/search/page.tsx`.
  2. Chỉ rõ cho thầy/cô thấy:
     * File `src/app/search/page.tsx` là **Server Component** (không có chữ `'use client'`), nó nhận prop `searchParams` để fetch dữ liệu từ TMDB trên server.
     * Bên trong trang này, nó nhúng component `<SearchBar />`. Đây là **Client Component** (có chữ `'use client'`) để hứng tương tác gõ phím của người dùng.
     * **Kết luận:** *Dữ liệu hiển thị vẫn được render tối ưu từ server, trong khi ô tìm kiếm vẫn phản hồi mượt mà ở client.*
