# HỒ SƠ PHÂN CÔNG CÔNG VIỆC CÁ NHÂN & ĐỀ CƯƠNG BÁO CÁO 10 TRANG
## THÀNH VIÊN: NGUYỄN QUỐC ĐẠI

* **Họ và tên:** Nguyễn Quốc Đại
* **Mã số sinh viên:** 3123560013
* **Vai trò trong nhóm:** Kỹ sư Đảm bảo Chất lượng & Kiến trúc Hệ thống (QA & System Resilience Engineer)
* **Chủ đề chuyên môn phụ trách:** **KIỂM TOÁN KIẾN TRÚC, XỬ LÝ LỖI HỆ THỐNG, TIÊU CHUẨN KỸ NGHỆ, SEO METADATA & BỘ KIỂM THỬ TỰ ĐỘNG**
* **Mục tiêu tài liệu:** Cung cấp đầy đủ cơ sở kỹ thuật, mã nguồn, minh chứng Git và cấu trúc chi tiết để sinh viên biên soạn **Báo cáo cá nhân môn học (khoảng 10 trang $\LaTeX$)**.

---

## 📌 PHẦN 1: MÔ TẢ TRỌNG TÂM CÔNG VIỆC VÀ TÍNH KẾT NỐI HỆ THỐNG

### 1.1. Bối cảnh & Lý do phân công (Cohesive Technical Focus)
Để một đồ án công nghệ không dừng lại ở mức "làm cho chạy được" (Toy App) mà đạt chuẩn mực kỹ nghệ phần mềm chuyên nghiệp (Software Engineering Standards - Tầng 2 & Tầng 3 theo `REQUIRE.md`), Nguyễn Quốc Đại đảm nhiệm vai trò **Kỹ sư Giám sát & Đảm bảo Chất lượng Hệ thống**:
1. **Kiểm toán kiến trúc chuyên sâu:** Biên soạn hồ sơ phản biện [`baocao/DANH_GIA_REQUIRE.md`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/baocao/DANH_GIA_REQUIRE.md) đối soát 34 tiêu chí môn học theo mô hình tam giác độc lập (Triangulation Audit: Codebase vs Báo cáo vs Phản biện).
2. **Xây dựng hệ sinh thái bắt lỗi và tự phục hồi (Fault-Tolerance & Resilience):** Hiện thực bộ ba phòng vệ cấp Root gồm `app/error.tsx` (Root Error Boundary), `app/global-error.tsx` (bảo vệ RootLayout) và `app/not-found.tsx` (Root 404 Component).
3. **Chuẩn hóa SEO Metadata Conventions:** Xây dựng `app/sitemap.ts` (sinh XML Sitemap động kèm cơ chế phục hồi tĩnh) và `app/robots.ts` (kiểm soát crawler truy cập).
4. **An ninh mạng và Cấu hình HTTP Security Headers:** Thiết lập các tiêu đề bảo vệ cấp độ ứng dụng trong `next.config.ts` chống Clickjacking, MIME sniffing.
5. **Thiết kế và mở rộng bộ kiểm thử tự động chuẩn Node.js (43 test cases):** Chuyển đổi và mở rộng toàn bộ hệ thống test sang Node.js Native Test Runner (`tests/*.test.mjs`), bao phủ kiểm tra ranh giới mạng, tính toàn vẹn kiểu dữ liệu, các ca kiểm thử biên (Unicode, URL encoding, capacity limits).
6. **Xử lý dứt điểm các lỗi mã nguồn và rủi ro hạ tầng (commit `953db35`, `66ba616`):** Loại bỏ đoạn mã can thiệp `dns.lookup` toàn cục gây ô nhiễm socket Node.js và xóa bỏ phân hệ TV Series `/tv` gãy luồng dẫn tới lỗi TMDB 404.

### 1.2. Danh sách các tệp mã nguồn phụ trách chính
* [`app/error.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/error.tsx): Root Error Boundary bắt lỗi runtime toàn trang, tích hợp nút `retry()`.
* [`app/global-error.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/global-error.tsx): Bẫy lỗi nghiêm trọng phát sinh trong chính `RootLayout` (tự định nghĩa `<html>` và `<body>`).
* [`app/not-found.tsx`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/not-found.tsx): Giao diện 404 tầng Root chuẩn tông màu Netflix Dark Cinema.
* [`app/sitemap.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/sitemap.ts): Metadata Route sinh sitemap tự động kết hợp SSR và Data Cache.
* [`app/robots.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/app/robots.ts): Metadata Route quản lý quy tắc thu thập dữ liệu của công cụ tìm kiếm.
* [`next.config.ts`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/next.config.ts): Thiết lập HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) và cấu hình `cacheComponents: false`.
* [`tests/*.test.mjs`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/tests/): Toàn bộ 11 tệp kiểm thử tự động với 43 test cases (kiểm tra kiến trúc, ranh giới module, deduplicate, watchlist, metadata, search Unicode...).
* [`baocao/DANH_GIA_REQUIRE.md`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/baocao/DANH_GIA_REQUIRE.md): Tài liệu giám định và đối soát chất lượng độc lập.

---

## 🛠️ PHẦN 2: CHI TIẾT KỸ THUẬT VÀ ĐOẠN MÃ CỐT LÕI

### 2.1. Cấu trúc Xử lý lỗi Đa tầng trong Next.js 16 App Router
* **Vấn đề kỹ thuật:** Khi có lỗi mạng, lỗi máy chủ TMDB hoặc lỗi cú pháp bất ngờ, nếu không có Error Boundary thì ứng dụng sẽ rơi vào màn hình sập trắng (unhandled exception). Đặc biệt, nếu chính `RootLayout` bị lỗi thì `error.tsx` thông thường không thể bắt được.
* **Giải pháp kiến trúc:**
  1. `app/error.tsx`: Bắt lỗi của các trang con, vẫn giữ nguyên thanh Header và Footer để người dùng tiếp tục điều hướng hoặc bấm "Thử Lại" (`retry()`).
  2. `app/global-error.tsx`: Bắt lỗi nếu `layout.tsx` bị sập. Theo quy chuẩn Next.js, component này bắt buộc phải tự định nghĩa lại thẻ `<html>` và `<body>`:
```typescript
// app/global-error.tsx
"use client";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalErrorBoundary({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError] Lỗi layout toàn cục:", error);
    }, [error]);

    return (
        <html lang="vi">
            <body className="bg-[#141414] text-white min-h-screen flex items-center justify-center font-sans antialiased">
                <main className="w-full max-w-md px-6 py-12 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                        <svg className="w-10 h-10 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">Sự Cố Hệ Thống Toàn Cục</h1>
                    <p className="text-gray-400 text-sm">Ứng dụng không thể khởi tạo cấu trúc giao diện chính.</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={retry} className="bg-[#E50914] text-white font-bold px-6 py-2.5 rounded-md">
                            Khôi Phục Trạng Thái
                        </button>
                    </div>
                </main>
            </body>
        </html>
    );
}
```

### 2.2. Tự động hóa SEO Metadata: `sitemap.ts` & `robots.ts`
* **Nguyên lý:** Sử dụng Next.js 16 File Conventions để sinh tài liệu XML và TXT tự động mà không cần file tĩnh cố định.
* **Cơ chế chịu lỗi của Sitemap:** Kết hợp `await connection()` để cập nhật danh sách phim mới nhất, đồng thời bọc trong khối `try...catch` để nếu TMDB upstream gặp sự cố thì sitemap vẫn trả về các liên kết tĩnh cơ bản thay vì trả về lỗi 500:
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connection();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moviehub.vn";
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ];

    try {
        const trendingMovies = await getTrendingMovies();
        const movieRoutes: MetadataRoute.Sitemap = trendingMovies
            .filter((m) => m && m.id)
            .map((movie) => ({
                url: `${baseUrl}/movie/${movie.id}`,
                lastModified: movie.release_date ? new Date(movie.release_date) : now,
                changeFrequency: "weekly",
                priority: 0.8,
            }));
        return [...staticRoutes, ...movieRoutes];
    } catch {
        return staticRoutes; // Fallback an toàn bảo vệ điểm SEO
    }
}
```

### 2.3. Cấu hình HTTP Security Headers trong `next.config.ts`
* **Mục tiêu:** Ngăn chặn các cuộc tấn công Clickjacking và MIME Sniffing:
```typescript
// next.config.ts
async headers() {
    return [
        {
            source: "/:path*",
            headers: [
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            ],
        },
    ];
}
```

### 2.4. Xây dựng bộ kiểm thử tự động Node.js Native Test Runner (43 tests)
* **Phương pháp:** Tận dụng khả năng chạy TypeScript trực tiếp của Node.js 24 (`--experimental-strip-types`) và module chuẩn `node:test` + `node:assert/strict` để tạo bộ test độc lập, chạy nhanh trong ~1.4 giây mà không cần cài đặt thêm thư viện cồng kềnh như Jest hay Vitest.
* **Các nhóm kiểm thử trọng yếu:**
  1. `tests/server-client-boundary.test.mjs`: Duyệt mã nguồn AST để kiểm tra 0 import `MovieCard` trong các thanh slider client.
  2. `tests/architecture-constraints.test.mjs`: Kiểm tra cấm dùng `as any` trong `services/client.ts`.
  3. `tests/api-search.test.mjs`: Kiểm tra chuẩn hóa chuỗi Unicode, xử lý chuỗi truy vấn dài trên 100 ký tự.
  4. `tests/watchlist.test.mjs`: Kiểm tra tính toàn vẹn dữ liệu Cookie, bẫy ID âm, kiểm tra giới hạn 200 phim và 3800 bytes.

---

## 📊 PHẦN 3: MINH CHỨNG GIT & KẾT QUẢ THỰC NGHIỆM

* **Đóng góp Git nổi bật:**
  - Commit `8c059f7`: Đợt tổng kiểm tra mã nguồn và xuất bản báo cáo giám định `baocao/DANH_GIA_REQUIRE.md`.
  - Commit `953db35`: Xử lý dứt điểm các lỗi kiến trúc: loại bỏ monkey-patch DNS Node.js, xóa bỏ route `/tv` gãy luồng, thiết lập Root Error/Global Error/Root NotFound, cấu hình Security Headers.
  - Commit `80fb08e`: Nâng cấp bộ test và thuật toán chuẩn hóa `normalizeMovieParams`.
  - Commit `66ba616`: Bổ sung các test case kiểm tra Unicode search query, bảo vệ sitemap khỏi cookie route, nâng cấp dependency lên Next.js 16.4.5.
  - Merge PR #5, #7, #8, #9, #10.
* **Minh chứng kiểm thử:**
  - Lệnh `npm test`: **43/43 tests pass (100%)** với thời gian chạy 1451ms.
  - Tệp bằng chứng: [`baocao/evidence/test-output.txt`](file:///c:/Users/Wuanz/Desktop/modern-programming-technologies/baocao/evidence/test-output.txt) ghi nhận 43 test thành công với `exit_code: 0`.
  - Lệnh `npm run lint`: 0 warning, 0 error.
  - Lệnh `npx tsc --noEmit`: 0 lỗi kiểu dữ liệu trên toàn dự án.

---

## 📑 PHẦN 4: KHUNG ĐỀ CƯƠNG BÁO CÁO CÁ NHÂN (10 TRANG $\LaTeX$)

Dưới đây là dàn bài chuẩn 10 trang thiết kế riêng cho sinh viên **Nguyễn Quốc Đại**:

### TRANG 1: TRANG BÌA & THÔNG TIN ĐỒ ÁN
* Tiêu đề: **BÁO CÁO KỸ THUẬT CÁ NHÂN: KIỂM TOÁN KIẾN TRÚC, XỬ LÝ LỖI HỆ THỐNG VÀ XÂY DỰNG BỘ KIỂM THỬ TỰ ĐỘNG CHO ỨNG DỤNG NEXT.JS 16**
* Học phần: Các Công nghệ Lập trình Hiện đại | GVHD: ThS. Phạm Thi Vương
* Sinh viên thực hiện: **Nguyễn Quốc Đại - MSSV: 3123560013** (Vai trò: QA & Resilience Engineer)
* Tóm tắt báo cáo cá nhân (Abstract: 150 từ): Tập trung vào chuẩn kỹ nghệ phần mềm (Tầng 2 & 3), cấu trúc phục hồi lỗi đa tầng, an ninh mạng, SEO tự động và bộ 43 ca kiểm thử tự động.

### TRANG 2: LỜI MỞ ĐẦU & TỔNG QUAN PHÂN CÔNG
* **1.1. Tầm quan trọng của Chuẩn kỹ nghệ phần mềm trong môn học:** Công nghệ là đối tượng đánh giá; một ứng dụng web hiện đại phải có khả năng chịu lỗi, an toàn mạng và kiểm thử tự động xác thực được.
* **1.2. Trách nhiệm chuyên môn cá nhân:**
  * Giám định và đối soát 100% tiêu chí `REQUIRE.md`.
  * Xây dựng bộ ba bắt lỗi tầng Root (`error.tsx`, `global-error.tsx`, `not-found.tsx`).
  * Tự động hóa SEO (`sitemap.ts`, `robots.ts`) và cấu hình Security Headers.
  * Thiết kế bộ 43 ca kiểm thử tự động và khắc phục các lỗ hổng kiến trúc.
* **1.3. Bảng phân công trách nhiệm 3 thành viên:** Đối chiếu vai trò giữa Đại (Chất lượng & Kiểm thử), Quân (Kiến trúc & Trang chủ), Thái (Tương tác & Bộ lọc).

### TRANG 3: CƠ SỞ LÝ THUYẾT VỀ ERROR BOUNDARY & METADATA TRONG APP ROUTER
* **2.1. Vòng đời xử lý lỗi trong Next.js App Router:**
  * Cơ chế React Error Boundary hoạt động như thế nào phía máy khách và máy chủ.
  * Phân tầng phạm vi ảnh hưởng: Tại sao `app/error.tsx` không bắt được lỗi của `app/layout.tsx` và sự cần thiết của `app/global-error.tsx`.
* **2.2. Metadata File Conventions trong Next.js 16:**
  * Cơ chế tự động nhận diện `sitemap.ts` và `robots.ts` để xuất file chuẩn XML/TXT mà không cần cấu hình router ngoài.
* **2.3. Nguyên lý bảo vệ an ninh HTTP Headers:**
  * Phân tích các rủi ro Clickjacking (giải quyết bằng `X-Frame-Options: DENY`) và MIME Sniffing (`X-Content-Type-Options: nosniff`).

### TRANG 4: PHÂN TÍCH & THIẾT KẾ HỆ THỐNG PHỤC HỒI LỖI
* **3.1. Sơ đồ cây bẫy lỗi toàn hệ thống:**
  * Mô hình cây component từ `GlobalError` -> `RootLayout` -> `RootError` -> `Page / Route` -> `Nested Error Boundary`.
* **3.2. Thiết kế giao diện lỗi theo phong cách Netflix Dark Cinema:**
  * Phối màu chuẩn `#141414`, đỏ `#E50914`, chữ trắng `#FFFFFF`, hiển thị mã digest tham chiếu lỗi an toàn.
* **3.3. Thiết kế luồng xử lý 404 Not Found:**
  * Phân biệt giữa 404 tự động do sai URL và "soft 404" do gọi hàm `notFound()` khi ID phim không tồn tại trong TMDB.

### TRANG 5: THIẾT KẾ BỘ KIỂM THỬ TỰ ĐỘNG CHUẨN NODE.JS (43 TESTS)
* **4.1. Lựa chọn công nghệ kiểm thử:**
  * Tại sao chọn Node.js Native Test Runner (`node:test`) thay vì cài thêm Vitest/Jest (tiết kiệm tài nguyên, không phụ thuộc thư viện bên ngoài, chạy cực nhanh).
* **4.2. Phân loại 11 nhóm kiểm thử:**
  * Ranh giới Server/Client (AST check), Deduplication, TMDB Fetch an toàn, Watchlist capacity, SEO Metadata, Route Handler GET, URL Unicode sanitize.
* **4.3. Bảng ma trận 43 test cases:** Bảng thống kê file test, tên ca kiểm thử và mục đích kỹ thuật.

### TRANG 6: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 1)
* **5.1. Hiện thực `app/global-error.tsx` và `app/error.tsx`:**
  * Giải thích chi tiết cấu trúc code, cách dùng hook `useEffect` log lỗi và nút `retry()`.
* **5.2. Hiện thực `app/not-found.tsx`:**
  * Giao diện 404 lớn với icon cuộn phim điện ảnh và nút quay về trang chủ.

### TRANG 7: HIỆN THỰC MÃ NGUỒN CỐT LÕI (PHẦN 2)
* **5.3. Hiện thực `app/sitemap.ts` và `app/robots.ts`:**
  * Phân tích kỹ thuật dùng `await connection()` và khối `try...catch` fallback sitemap tĩnh khi mất kết nối mạng.
* **5.4. Thiết lập Security Headers trong `next.config.ts`:**
  * Đoạn mã cấu hình `headers()` áp dụng cho toàn bộ đường dẫn `/:path*`.

### TRANG 8: KIỂM TOÁN KIẾN TRÚC & KHẮC PHỤC CÁC SỰ CỐ KỸ THUẬT
* **6.1. Xử lý triệt để lỗi Monkey-Patching DNS toàn cục (commit `953db35`):**
  * Nguyên nhân: AI đề xuất ghi đè `dns.lookup` toàn cục làm ô nhiễm tiến trình mạng Node.js.
  * Khắc phục: Loại bỏ hoàn toàn, đưa hệ thống về cơ chế phân giải tên miền chuẩn của hệ điều hành.
* **6.2. Xử lý lỗi gãy luồng phân hệ Phim bộ (`/tv` -> 404):**
  * Nguyên nhân: Tái sử dụng component `MovieCard` gọi API phim điện ảnh với ID phim truyền hình.
  * Khắc phục: Xóa bỏ tuyến `app/tv/page.tsx` và `services/tv.ts`, chuyển toàn bộ sang Movie-Only Cinema Flow.

### TRANG 9: THỰC NGHIỆM ĐỐI SOÁT & BẰNG CHỨNG HỌC THUẬT
* **7.1. Thực nghiệm chạy bộ test tự động:**
  * Log kết quả chạy `npm test`: 43/43 test pass (thời gian 1.45s).
  * Đối soát với tệp bằng chứng `baocao/evidence/test-output.txt`.
* **7.2. Kiểm tra chất lượng mã nguồn tĩnh:**
  * Kết quả `npm run lint`: 0 warning, 0 error.
  * Kết quả `npx tsc --noEmit`: 0 lỗi biên dịch kiểu dữ liệu.
* **7.3. Minh chứng Git cá nhân:**
  * Bảng liệt kê các commit lớn (`8fe18e6`, `8c059f7`, `953db35`, `80fb08e`, `66ba616`) và các Pull Request được hợp nhất (#5, #7, #8, #9, #10).

### TRANG 10: KẾT LUẬN & CÂU HỎI VẤN ĐÁP BẢO VỆ (VIVA VOCE)
* **8.1. Tổng kết đóng góp cá nhân:** Nâng tầm hệ thống từ mức chạy được thành sản phẩm phần mềm đạt chuẩn kỹ nghệ cao, có sức chống chịu sự cố và kiểm thử tự động nghiêm ngặt.
* **8.2. Hướng mở rộng:** Tích hợp kiểm thử E2E với Playwright để ghi video luồng người dùng thực tế.
* **8.3. Bộ 3 câu hỏi vấn đáp bảo vệ cá nhân trọng tâm (có câu trả lời mẫu):**
  1. *Hỏi:* Tại sao Next.js cần cả `app/error.tsx` và `app/global-error.tsx`?
     *Đáp:* Trong cấu trúc lồng nhau của App Router, `app/error.tsx` được bọc bên trong `app/layout.tsx`. Do đó, nếu lỗi phát sinh từ chính RootLayout (ví dụ lỗi import font hoặc lỗi render Header/Footer), `app/error.tsx` sẽ bị vô hiệu hóa. `app/global-error.tsx` thay thế toàn bộ RootLayout khi xảy ra sự cố nghiêm trọng, tự sinh ra thẻ `<html>` và `<body>` độc lập để bảo đảm ứng dụng không bị sập trắng hoàn toàn.
  2. *Hỏi:* Tại sao việc monkey-patch `dns.lookup` trong `services/client.ts` bị coi là vi phạm kỹ nghệ phần mềm nghiêm trọng?
     *Đáp:* Vì hàm `dns.lookup` của module `node:dns` can thiệp vào tầng socket toàn cục của tiến trình Node.js. Việc ghi đè hàm này làm ô nhiễm môi trường mạng của toàn bộ máy chủ, phá vỡ tính tương thích nếu ứng dụng triển khai trên môi trường Edge Runtime (nơi không hỗ trợ module Node.js), và vi phạm nguyên tắc phân tách tầng (tầng dịch vụ ứng dụng không được phép can thiệp vào hạ tầng mạng của hệ điều hành).
  3. *Hỏi:* Tại sao bộ test tự động lại dùng trực tiếp Node Test Runner thay vì Vitest?
     *Đáp:* Node.js 24 hỗ trợ chạy native module `--test` kết hợp cờ `--experimental-strip-types` cho phép biên dịch và thực thi trực tiếp các tệp `.test.mjs` có kiểu dữ liệu TypeScript mà không cần cài đặt thêm bất kỳ thư viện thứ ba nào. Điều này giúp bộ test khởi động tức thì, chạy 43 ca kiểm thử chỉ mất 1.4 giây, loại bỏ hoàn toàn nguy cơ xung đột phiên bản phụ thuộc và hoàn toàn phù hợp để tích hợp vào CI pipeline nhẹ.
