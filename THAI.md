# HỒ SƠ PHÂN CÔNG CÔNG VIỆC CÁ NHÂN & ĐỀ CƯƠNG BÁO CÁO 10 TRANG
## THÀNH VIÊN: NGUYỄN THÁI VINH

* **Họ và tên:** Nguyễn Thái Vinh
* **Mã số sinh viên:** 3123410433
* **Vai trò trong nhóm:** Kỹ sư Trải nghiệm Người dùng & Đột biến Dữ liệu (UI/UX & Mutation Specialist)
* **Chủ đề chuyên môn phụ trách:** **TƯƠNG TÁC NGƯỜI DÙNG, BỘ LỌC ĐA TIÊU CHÍ, LIVE SEARCH ROUTE HANDLER & SERVER ACTIONS MUTATION**
* **Mục tiêu tài liệu:** Cung cấp đầy đủ cơ sở kỹ thuật, mã nguồn, minh chứng Git và cấu trúc chi tiết để sinh viên biên soạn **Báo cáo cá nhân môn học (khoảng 10 trang $\LaTeX$)**.

---

## 📌 PHẦN 1: MÔ TẢ TRỌNG TÂM CÔNG VIỆC VÀ TÍNH KẾT NỐI HỆ THỐNG

### 1.1. Bối cảnh & Lý do phân công (Cohesive Technical Focus)
Để ứng dụng MovieHub không chỉ là một trang trưng bày thông tin tĩnh mà trở thành một nền tảng khám phá phim tương tác linh hoạt như Netflix, Nguyễn Thái Vinh phụ trách toàn bộ **Luồng tương tác người dùng, Đột biến dữ liệu (Data Mutation) và Đồng bộ trạng thái URL**:
1. **Phân hệ Quản lý Danh sách yêu thích (Watchlist) qua Server Actions:** Nghiên cứu và hiện thực cơ chế lưu trữ bền vững không cần Database truyền thống thông qua Cookie `HttpOnly`. Viết Server Actions [`app/actions/watchlist.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/actions/watchlist.ts) tuân thủ tiêu chuẩn kích thước cookie RFC 6265, bảo mật đầu vào và tối ưu revalidation.
2. **Trải nghiệm tương tác Optimistic UI:** Phát triển nút lưu phim [`components/client/WatchlistButton.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/WatchlistButton.tsx) ứng dụng React 19 `useOptimistic` phản hồi trạng thái ngay lập tức trên giao diện và tự động rollback khi gặp sự cố mạng.
3. **Phân hệ Khám phá Đa tiêu chí (`/browse`):** Thiết kế thanh công cụ lọc [`components/client/FilterBar.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/FilterBar.tsx) kết hợp đồng thời 4-5 chiều dữ liệu (Thể loại, 12 Quốc gia, Năm, Sắp xếp), đồng bộ trạng thái 2 chiều với URL `searchParams` qua `useTransition`.
4. **Phân hệ Tìm kiếm trực tiếp (Live Search Preview):** Phối hợp cùng kiến trúc Route Handler, hiện thực thanh tìm kiếm mở rộng [`components/client/NavSearchBar.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/NavSearchBar.tsx) trên Header với cơ chế Debounce 300ms và `AbortController` chống nghẽn luồng mạng.
5. **Trang danh sách Watchlist (`/watchlist`):** Xây dựng Server Component [`app/watchlist/page.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/watchlist/page.tsx) đọc ID từ cookie và fetch chi tiết phim song song bằng `Promise.all`.

### 1.2. Danh sách các tệp mã nguồn phụ trách chính
* [`app/actions/watchlist.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/actions/watchlist.ts): Server Actions `toggleWatchlist`, `getWatchlistIds`, `clearAllWatchlist`, `isMovieSaved`.
* [`app/watchlist/page.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/watchlist/page.tsx): Trang Danh sách yêu thích, đọc cookie trên server, hiển thị danh mục phim đã lưu.
* [`components/client/WatchlistButton.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/WatchlistButton.tsx): Client Component nút lưu/xóa phim với Optimistic UI, 2 chế độ `default` và `compact`.
* [`components/client/ClearWatchlistButton.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/ClearWatchlistButton.tsx): Nút xóa toàn bộ danh sách phim yêu thích.
* [`app/browse/page.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/browse/page.tsx): Trang Khám phá phim với bộ lọc đa tiêu chí và phân trang số.
* [`components/client/FilterBar.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/FilterBar.tsx): Thanh công cụ lọc đa chiều, giao diện điều khiển bằng nút bấm chuẩn Netflix.
* [`components/client/NavSearchBar.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/components/client/NavSearchBar.tsx): Thanh tìm kiếm co giãn tích hợp Live Search Popover, debounce 300ms, AbortController.
* [`app/api/search/route.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/api/search/route.ts): Route Handler GET cung cấp API tìm kiếm nhanh với header `Cache-Control`.
* [`services/discover.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/services/discover.ts): Dịch vụ lọc phim đa chiều từ endpoint TMDB Discover.

---

## 🛠️ PHẦN 2: CHI TIẾT KỸ THUẬT VÀ ĐOẠN MÃ CỐT LÕI

### 2.1. Server Action Quản lý Watchlist với Cookie HttpOnly an toàn
* **Vấn đề kỹ thuật:** Nhiều ứng dụng React lưu danh sách yêu thích trong `localStorage`. Nhược điểm lớn của `localStorage` là không thể đọc được từ Server Component (buộc trang phải biến thành Client Component, làm mất khả năng SSR và gây ra Hydration Mismatch). Ngược lại, nếu lưu bằng Database riêng thì lại phát sinh chi phí hạ tầng và yêu cầu người dùng phải đăng ký tài khoản.
* **Giải pháp kiến trúc:** Sử dụng Server Action đọc/ghi mảng ID phim vào Cookie `mh_watchlist` với các ràng buộc an ninh và tiêu chuẩn RFC 6265:
```typescript
// app/actions/watchlist.ts
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const WATCHLIST_COOKIE = "mh_watchlist";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày
const MAX_WATCHLIST_ITEMS = 200;
const MAX_WATCHLIST_COOKIE_BYTES = 3800; // Tiêu chuẩn RFC 6265 (~4KB)

export async function toggleWatchlist(movieId: number): Promise<{ isSaved: boolean; error?: string }> {
    // 1. Kiểm thực đầu vào nghiêm ngặt trên Server
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        throw new Error("Mã định danh phim (movieId) không hợp lệ.");
    }

    const cookieStore = await cookies();
    const currentIds = await getWatchlistIds();
    let updatedIds: number[];
    let isSaved: boolean;

    if (currentIds.includes(movieId)) {
        updatedIds = currentIds.filter((id) => id !== movieId);
        isSaved = false;
    } else {
        if (currentIds.length >= MAX_WATCHLIST_ITEMS) {
            return { isSaved: false, error: `Danh sách yêu thích đã đạt giới hạn tối đa (${MAX_WATCHLIST_ITEMS} phim).` };
        }
        updatedIds = [...currentIds, movieId];
        isSaved = true;
    }

    const serializedIds = JSON.stringify(updatedIds);
    if (Buffer.byteLength(`${WATCHLIST_COOKIE}=${encodeURIComponent(serializedIds)}`, "utf8") > MAX_WATCHLIST_COOKIE_BYTES) {
        return { isSaved: false, error: "Danh sách yêu thích đã đạt giới hạn dung lượng Cookie." };
    }

    // 2. Ghi cookie an toàn với các cờ bảo vệ
    cookieStore.set(WATCHLIST_COOKIE, serializedIds, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true, // Chặn JavaScript client đọc document.cookie
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    // 3. Làm mới dữ liệu tức thì cho trang Watchlist và trang chi tiết phim
    revalidatePath("/watchlist");
    revalidatePath(`/movie/${movieId}`);

    return { isSaved };
}
```

### 2.2. Trải nghiệm tức thì với Optimistic UI (`useOptimistic`)
* **Nguyên lý:** Khi người dùng bấm nút "Lưu vào danh sách", ứng dụng không đợi máy chủ phản hồi mà cập nhật ngay lập tức trạng thái giao diện (đổi icon từ dấu cộng sang dấu tích). Nếu mạng lỗi hoặc Server Action ném ngoại lệ, giao diện tự động hoàn tác (rollback) về trạng thái cũ:
```typescript
// components/client/WatchlistButton.tsx
"use client";
import { useOptimistic, useTransition, useState } from "react";
import { toggleWatchlist } from "@/app/actions/watchlist";

export default function WatchlistButton({ movieId, initialSaved }: { movieId: number; initialSaved: boolean }) {
    const [saved, setSaved] = useState(initialSaved);
    const [isPending, startTransition] = useTransition();
    const [optimisticSaved, setOptimisticSaved] = useOptimistic(
        saved,
        (current, update: boolean) => update
    );

    const handleToggle = () => {
        startTransition(async () => {
            const nextState = !optimisticSaved;
            setOptimisticSaved(nextState); // Cập nhật tức thì giao diện
            try {
                const res = await toggleWatchlist(movieId);
                setSaved(res.isSaved);
            } catch {
                setOptimisticSaved(saved); // Rollback nếu thất bại
            }
        });
    };
    ...
}
```

### 2.3. Đồng bộ trạng thái Bộ lọc đa chiều với URL SearchParams
* **Nguyên lý:** Tại trang `/browse`, toàn bộ 4 tiêu chí lọc được lưu trên URL Query String (ví dụ: `/browse?genre=28&country=KR&year=2024&sortBy=vote_average.desc`). Người dùng có thể bookmark, copy link gửi bạn bè hoặc bấm nút Back/Forward trên trình duyệt mà không mất trạng thái:
```typescript
// components/client/FilterBar.tsx
const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete("page"); // Reset về trang 1 khi đổi bộ lọc
        router.replace(`${pathname}?${params.toString()}`);
    });
};
```

### 2.4. Live Search với Route Handler GET, Debounce & `AbortController`
* **Vấn đề kỹ thuật:** Nếu gọi Server Action mỗi khi người dùng gõ 1 ký tự, hành động sẽ tạo ra một loạt yêu cầu POST dồn ứ trong React 19 Action Queue và không thể cache.
* **Giải pháp:** Sử dụng Route Handler GET `/api/search?q=...` có tiêu đề `Cache-Control: public, s-maxage=120`, kết hợp Client Component `NavSearchBar.tsx` dùng `debounce(300ms)` và hủy bỏ request cũ thông qua `AbortController`:
```typescript
// components/client/NavSearchBar.tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toWellFormed();
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort(); // Hủy request cũ

    if (val.trim().length >= 2) {
        debounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortControllerRef.current = controller;
            const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`, {
                signal: controller.signal,
            });
            if (!controller.signal.aborted && res.ok) {
                const data = await res.json();
                setResults(data.results || []);
            }
        }, 300);
    }
};
```

---

## 📊 PHẦN 3: MINH CHỨNG GIT & KẾT QUẢ THỰC NGHIỆM

* **Đóng góp Git nổi bật:**
  - Nhánh `feature/search-watchlist` (PR #4): Hiện thực module Watchlist, Server Action và trang `/watchlist`.
  - Nhánh `feature/navbar-filters-and-navigation` (PR #5, #6): Hiện thực thanh lọc `FilterBar.tsx`, trang khám phá `/browse`, thanh tìm kiếm co giãn `NavSearchBar.tsx` và Mega Menu dropdown.
  - Commit `f1e62d8`: Thêm tính năng Watchlist với Server Action và Client Components.
  - Commit `4a71f2b`: Hiện thực bộ lọc đa tiêu chí và trang `/browse`.
  - Commit `088a5b8` & `be2b6be`: Hoàn thiện thanh tìm kiếm Live Search và dropdown thể loại/quốc gia.
* **Minh chứng kiểm thử:**
  - `tests/watchlist.test.mjs`: Pass toàn bộ các kiểm thử về bẫy ID âm, giới hạn 200 phim, giới hạn 3800 bytes, kiểm tra mutation thành công.
  - `tests/api-search.test.mjs`: Pass kiểm tra Route Handler GET `/api/search`, kiểm tra tiêu đề Cache-Control, kiểm tra cắt ngắn từ khóa trên 100 ký tự.
  - `baocao/evidence/watchlist-http.json`: Xác nhận kiểm chứng POST Server Action trên môi trường production mock với cờ cookie `HttpOnly`, `SameSite=Lax`.

---

## 📑 PHẦN 4: KHUNG ĐỀ CƯƠNG BÁO CÁO CÁ NHÂN (10 TRANG $\LaTeX$)

Dưới đây là dàn bài chuẩn 10 trang thiết kế riêng cho sinh viên **Nguyễn Thái Vinh**:

### TRANG 1: TRANG BÌA & THÔNG TIN ĐỒ ÁN
* Tiêu đề: **BÁO CÁO KỸ THUẬT CÁ NHÂN: HIỆN THỰC ĐỘT BIẾN DỮ LIỆU SERVER ACTIONS, ĐỒNG BỘ TRẠNG THÁI BỘ LỌC VÀ TÌM KIẾM THỜI GIAN THỰC TRÊN NEXT.JS 16**
* Học phần: Các Công nghệ Lập trình Hiện đại | GVHD: ThS. Phạm Thi Vương
* Sinh viên thực hiện: **Nguyễn Thái Vinh - MSSV: 3123410433** (Vai trò: UI/UX & Mutation Specialist)
* Tóm tắt báo cáo cá nhân (Abstract: 150 từ): Tập trung vào cơ chế Server Actions mutation với cookie HttpOnly RFC 6265, Optimistic UI, bộ lọc URL-driven và Route Handler Live Search.

### TRANG 2: LỜI MỞ ĐẦU & TỔNG QUAN PHÂN CÔNG
* **1.1. Tầm quan trọng của Tương tác & Đột biến Dữ liệu trong Next.js:** Khám phá cách Next.js 16 xử lý mutation mà không cần tạo REST API Controller truyền thống và cách đồng bộ URL parameters.
* **1.2. Trách nhiệm chuyên môn cá nhân:**
  * Hiện thực hệ thống Watchlist thông qua Server Actions và Cookie an toàn.
  * Phát triển giao diện tương tác Optimistic UI (`WatchlistButton`).
  * Xây dựng trang Khám phá `/browse` kết hợp thanh công cụ lọc 5 chiều `FilterBar.tsx`.
  * Hiện thực Live Search Preview trên Header và Route Handler `GET /api/search`.
* **1.3. Bảng phân công trách nhiệm 3 thành viên:** Đối chiếu vai trò giữa Vinh (Tương tác & Đột biến dữ liệu), Quân (Kiến trúc & Trang chủ), Đại (Kiểm toán & Test).

### TRANG 3: CƠ SỞ LÝ THUYẾT VỀ SERVER ACTIONS & URL STATE
* **2.1. Bản chất của Server Actions trong Next.js App Router:**
  * Mô hình RPC (Remote Procedure Call) tích hợp sâu vào cây component.
  * Cách Next.js đóng gói lời gọi hàm thành POST request ngầm và tự động kích hoạt `revalidatePath`.
* **2.2. So sánh Server Actions vs RESTful Route Handler:**
  * Khi nào nên dùng Server Action (thao tác ghi/mutation theo người dùng).
  * Khi nào nên dùng Route Handler (thao tác đọc, tìm kiếm có cache hoặc phục vụ bên ngoài).
* **2.3. Nguyên lý URL-Driven State Management:**
  * Tại sao nên lưu bộ lọc trên URL SearchParams thay vì React `useState` cục bộ.

### TRANG 4: PHÂN TÍCH & THIẾT KẾ PHÂN HỆ WATCHLIST VÀ BỘ LỌC
* **3.1. Thiết kế kiến trúc "Cookie-as-Storage":**
  * Ưu điểm: Không cần tài khoản người dùng, Server Component đọc trực tiếp qua `await cookies()`, dữ liệu duy trì theo phiên trình duyệt.
  * Ràng buộc an toàn: Tuân thủ RFC 6265 (giới hạn 200 ID, 3800 bytes, `HttpOnly: true`, `SameSite=Lax`).
* **3.2. Sơ đồ luồng tương tác Optimistic UI:**
  * Mô hình tuần tự: Người dùng Click -> Giao diện đổi tức thì (`useOptimistic`) -> Gọi Server Action -> Thành công (đồng bộ) / Thất bại (Rollback).
* **3.3. Thiết kế cấu trúc tham số bộ lọc `/browse`:**
  * Các tiêu chí: `genre` (thể loại), `country` (12 quốc gia), `year` (năm), `sortBy` (sắp xếp), `page` (phân trang).

### TRANG 5: THIẾT KẾ PHÂN HỆ TÌM KIẾM LIVE SEARCH
* **4.1. Thiết kế Route Handler GET `/api/search`:**
  * Xác thực độ dài từ khóa (tối thiểu 2 ký tự, tối đa 100 ký tự).
  * Cấu hình Cache-Control Header: `public, s-maxage=120, stale-while-revalidate=60`.
* **4.2. Thiết kế thanh tìm kiếm co giãn `NavSearchBar.tsx`:**
  * Cơ chế mở rộng Slide-in Animation chuẩn Netflix.
  * Luồng Debounce 300ms và giải thuật hủy request mạng cũ bằng `AbortController`.

### TRANG 6: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 1)
* **5.1. Hiện thực Server Actions [`app/actions/watchlist.ts`]:**
  * Phân tích chi tiết hàm `toggleWatchlist()`, `getWatchlistIds()` và `clearAllWatchlist()`.
  * Đoạn mã kiểm tra dung lượng buffer bytes trước khi ghi cookie.
* **5.2. Hiện thực Client Component [`WatchlistButton.tsx`]:**
  * Cách kết hợp hook `useOptimistic` và `useTransition` của React 19.

### TRANG 7: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 2)
* **5.3. Hiện thực Trang Khám phá [`app/browse/page.tsx`] & [`FilterBar.tsx`]:**
  * Đọc `searchParams` bất đồng bộ trên Server Component.
  * Kỹ thuật cập nhật URL bằng `router.replace()` bên trong `startTransition`.
* **5.4. Hiện thực Route Handler [`app/api/search/route.ts`] & [`NavSearchBar.tsx`]:**
  * Đoạn mã xử lý `AbortController` và hiển thị kết quả Live Preview Popover.

### TRANG 8: TỐI ƯU HÓA TRẢI NGHIỆM VÀ PHÂN TRANG DỮ LIỆU
* **6.1. Tối ưu hóa phân trang trong [`services/discover.ts`]:**
  * Giữ nguyên chuẩn 20 phim/trang của TMDB, giới hạn tối đa 500 trang.
  * Xử lý trường hợp người dùng nhập số trang không hợp lệ (nhỏ hơn 1 hoặc vượt quá `totalPages`).
* **6.2. Thuật toán phân trang dạng rút gọn (Page Range):**
  * Hàm `getPageRange()` hiển thị dạng `[1, ..., 4, 5, 6, ..., 500]` trên giao diện.

### TRANG 9: THỰC NGHIỆM ĐỐI SOÁT & BẰNG CHỨNG KIỂM THỬ
* **7.1. Kết quả kiểm thử tự động trên phân hệ phụ trách:**
  * Chạy `tests/watchlist.test.mjs`: Pass 8/8 test cases về cookie và mutation.
  * Chạy `tests/api-search.test.mjs`: Pass 6/6 test cases về Route Handler và Unicode.
* **7.2. Đối soát dữ liệu thực nghiệm:**
  * Trích xuất kết quả từ `baocao/evidence/watchlist-http.json` khẳng định cookie mang đầy đủ cờ `HttpOnly`, `SameSite=Lax`, `Secure`.
* **7.3. Minh chứng Git cá nhân:**
  * Bảng liệt kê các commit thuộc nhánh `feature/search-watchlist` (PR #4) và `feature/navbar-filters-and-navigation` (PR #5, #6).

### TRANG 10: KẾT LUẬN & CÂU HỎI VẤN ĐÁP BẢO VỆ (VIVA VOCE)
* **8.1. Tổng kết đóng góp cá nhân:** Hoàn thành xuất sắc phân hệ tương tác, đột biến dữ liệu an toàn và trải nghiệm tìm kiếm/lọc phim mượt mà.
* **8.2. Hạn chế nhận diện và hướng phát triển:** Danh sách cookie bị giới hạn theo từng thiết bị/trình duyệt, hướng tới nâng cấp sang cơ sở dữ liệu PostgreSQL + NextAuth để đồng bộ tài khoản đa nền tảng.
* **8.3. Bộ 3 câu hỏi vấn đáp bảo vệ cá nhân trọng tâm (có câu trả lời mẫu):**
  1. *Hỏi:* Tại sao lại dùng Cookie để lưu Watchlist thay vì LocalStorage hay Database?
     *Đáp:* Nếu dùng LocalStorage, Server Component không thể đọc dữ liệu trong quá trình render, buộc trang phải chuyển sang Client Component và gây giật giao diện (layout shift) khi client hydrate. Lưu bằng Cookie với cờ `HttpOnly` cho phép Server Component đọc trực tiếp thông qua `await cookies()` ngay tại server, render HTML danh sách phim hoàn chỉnh mà không cần người dùng đăng nhập tài khoản.
  2. *Hỏi:* Tại sao chức năng Live Search lại dùng Route Handler GET mà không dùng Server Action?
     *Đáp:* Tìm kiếm là một thao tác đọc dữ liệu (Read/Query). Nếu dùng Server Action (luôn gửi POST request), các yêu cầu sẽ bị xếp hàng tuần tự (action queue), không thể tận dụng cơ chế HTTP Caching của trình duyệt/CDN, và dễ gây nghẽn mạng khi người dùng gõ phím liên tục. Route Handler GET hỗ trợ tiêu đề `Cache-Control: s-maxage=120` và có thể chủ động hủy bỏ request cũ bằng `AbortController`.
  3. *Hỏi:* `useOptimistic` trong nút WatchlistButton giải quyết vấn đề gì?
     *Đáp:* Giúp loại bỏ hoàn toàn độ trễ mạng đối với cảm nhận người dùng. Ngay khi bấm nút, icon chuyển trạng thái tức thì mà không cần đợi Server Action hoàn tất phản hồi qua mạng. Nếu server thực thi lỗi hoặc mạng mất kết nối, React tự động rollback về trạng thái trước đó và báo lỗi thân thiện.
