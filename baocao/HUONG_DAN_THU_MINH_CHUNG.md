# Hướng Dẫn Thu Minh Chứng (Evidence Collection Guide)

Tài liệu này hướng dẫn thu thập minh chứng kỹ thuật cho đồ án MovieHub (bao gồm kiểm thử, build production, HTTP streaming, Data Cache revalidation, Watchlist Server Actions và tương tác Chrome).

---

## 1. Thu Thập Minh Chứng Tự Động (Khuyến Nghị)

Toàn bộ quy trình xác minh được tự động hóa qua script chuẩn (chạy trên cả Linux/CI và Windows/macOS), không cần khóa TMDB thật:

```bash
# 1. Cài đặt dependencies đúng chuẩn package-lock.json
npm ci

# 2. Chạy toàn bộ bộ kiểm chứng tự động (Lint, Test, Build, Typecheck, Streaming, Cache, Watchlist, Chrome)
npm run evidence
```

> **Ghi chú:**
> - Nếu môi trường máy không có Google Chrome (hoặc chỉ muốn kiểm chứng lab streaming/cache): chạy `npm run lab`.
> - Mặc định output được ghi vào `baocao/evidence/`. Muốn lưu thư mục khác, set biến môi trường `MOVIEHUB_EVIDENCE_DIR`.

### Tiêu chí nghiệm thu đạt:
Mở tệp `baocao/evidence/mock-runtime.json` và kiểm tra:
- `status`: `"passed"`
- `build_errors`: `0`, `build_warnings`: `0`
- Toàn bộ artifact sinh ra có cùng `run_id` và `source_sha256`.

---

## 2. Ý Nghĩa Các Tệp Minh Chứng Sinh Ra

| Tệp Minh Chứng | Nội Dung và Tiêu Chí Xác Minh |
|---|---|
| `mock-runtime.json` | Tổng quan kết quả lượt chạy, commit hash, SHA256 mã nguồn, phiên bản Node/Next. |
| `streaming-mock.json` | Ghi nhận thứ tự chunk HTML. Phần thông tin chính (`main`) và `fallback` skeleton phải đến trước dữ liệu trì hoãn (`credits`, `similar`). |
| `cache-mock.json` | Đếm request tại mock origin qua chuỗi: miss (0→1) → hit (1) → hết TTL 15s → revalidate (1→2) → warm hit (2). Tagline phim chuyển từ "Phiên bản 1" sang "Phiên bản 2". |
| `watchlist-http.json` | Kiểm tra Server Action POST thật, cờ bảo mật cookie (`HttpOnly`, `Secure`, `SameSite=Lax`), lưu qua reload, xóa và cô lập cookie jar. |
| `browser-interactions.json` | 16 kịch bản CDP kiểm tra tương tác Chrome: debounce tìm kiếm, đồng bộ Back/Forward, focus trap của modal trailer, cuộn carousel,... |
| `routes-http.json` | Kiểm tra server-rendered HTML: 4 hàng phim trang chủ, search route handler, query lặp, route phim không hợp lệ có `noindex`. |
| Các log `.txt` | `lint-output.txt`, `typecheck-output.txt`, `test-output.txt`, `build-mock-output.txt`, `production-mock-output.txt` (đều có `exit_code: 0`). |

---

## 3. Thao Tác Thủ Công: Quay Video / Chụp Ảnh Trình Duyệt

Dành cho trường hợp cần quay video hoặc chụp ảnh DevTools để nộp kèm báo cáo.

### Bước 1: Khởi động Mock Server & Production App
Mở 2 cửa sổ dòng lệnh:

- **Terminal 1 (Mock TMDB):**
  ```bash
  node scripts/mock-tmdb-evidence.mjs
  ```
- **Terminal 2 (Next.js Production):**
  ```bash
  # Trên PowerShell:
  $env:TMDB_BASE_URL='http://127.0.0.1:4100/3'
  $env:TMDB_API_KEY='evidence-only'
  npm run build
  npm run start

  # Trên Bash / macOS / Linux:
  TMDB_BASE_URL='http://127.0.0.1:4100/3' TMDB_API_KEY='evidence-only' npm run build
  TMDB_BASE_URL='http://127.0.0.1:4100/3' TMDB_API_KEY='evidence-only' npm run start
  ```

### Bước 2: Quay Video Minh Chứng Watchlist
1. Mở Chrome/Edge ở chế độ ẩn danh (Incognito), truy cập `http://localhost:3000/movie/550`. Bật DevTools (`F12`).
2. Tab **Application > Storage > Cookies > http://localhost:3000**: Xác nhận chưa có cookie `mh_watchlist`.
3. Bấm nút **Lưu Xem Sau** trên giao diện:
   - Nút lập tức đổi trạng thái sang **Đã Lưu**.
   - Tab **Network**: Ghi nhận request `POST` gửi Server Action thành công (Status 200).
   - Tab **Application > Cookies**: Xuất hiện cookie `mh_watchlist` với các cờ `HttpOnly`, `Secure`, `SameSite=Lax` (che giá trị value khi chụp/quay).
4. Điều hướng sang `/watchlist`: Phim đã xuất hiện trong danh sách. F5 tải lại trang để chứng minh trạng thái lưu bền vững.
5. Bấm nút xóa: Phim biến mất khỏi danh sách; F5 tải lại xác nhận trạng thái xóa được duy trì.

### Bước 3: Quan Sát HTTP Streaming & Data Cache
- **Streaming:** Truy cập một phim có ID bất kỳ (ví dụ `http://localhost:3000/movie/99999`). Quan sát phần thông tin chính và skeleton diễn viên/phim tương tự hiển thị ngay lập tức; sau ~2.5s và ~4s (độ trễ mock), dữ liệu diễn viên và phim tương tự lần lượt stream vào trang.
- **Data Cache:** 
  + Lần 1 tải trang: Terminal 1 in log `START /movie/99999 ... END`.
  + Lần 2 tải lại trang ngay sau đó: Terminal 1 không in log thêm (dữ liệu được trả từ Data Cache của Next.js).

---

## 4. Nguyên Tắc An Toàn & Trung Thực Dữ Liệu

1. **Bảo mật:** Tuyệt đối không commit hoặc đưa `TMDB_API_KEY` thật, giá trị nội dung cookie người dùng vào báo cáo, ảnh chụp hay video.
2. **Phạm vi kỹ thuật:**
   - Dữ liệu mock streaming/cache dùng độ trễ giả lập có kiểm soát (2.5s và 4s) nhằm minh chứng thứ tự hiển thị của React Server Components và Suspense.
   - Các phép đo này không đại diện cho điểm Core Web Vitals (FCP, LCP, CLS) hay hiệu năng thực tế của CDN và TMDB production.
