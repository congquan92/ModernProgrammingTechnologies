# Tự ghi minh chứng Watchlist, streaming và Data Cache

Chạy các lệnh bên dưới bằng PowerShell tại thư mục gốc dự án. Ghi rõ trong bài nộp rằng dữ liệu TMDB của phần streaming/cache là **giả lập có kiểm soát**; độ trễ 2,5 giây và 4 giây được thêm để thấy thứ tự hiển thị, không phải số đo hiệu năng thật.

## Tạo lại các log kiểm tra bằng TMDB thật

Mở PowerShell mới để không giữ các biến môi trường mock, cấu hình `.env.local` với khóa TMDB của bạn rồi chạy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/refresh-evidence.ps1
```

Script chạy lint, type-check, test, production build và kiểm tra HTML; các tệp `.txt` tương ứng được ghi vào `baocao/evidence`. Chụp terminal sau khi thấy `Saved:`; mỗi log phải kết thúc bằng `exit_code: 0`. Sau đó mở terminal khác chạy `npm run start`, trở lại terminal đầu và chạy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/refresh-evidence.ps1 -RuntimeOnly
```

Lệnh thứ hai gọi các route localhost để tạo lại `runtime-http.txt`. Kiểm tra log trước khi chia sẻ để không lộ khóa hoặc thông tin riêng. Dừng production server bằng `Ctrl+C` sau khi chụp ảnh.

## 1. Khởi động môi trường thử nghiệm

Terminal A:

```powershell
node scripts/mock-tmdb-evidence.mjs
```

Giữ terminal A mở. Terminal B:

```powershell
$env:TMDB_BASE_URL='http://127.0.0.1:4100/3'
$env:TMDB_API_KEY='evidence-only'
npm run build
npm run start
```

Giữ terminal B mở. Mở `http://localhost:3000/movie/550` để xem trang phim giả. Khóa `evidence-only` không phải khóa TMDB thật.

## 2. Quay Watchlist trước và sau

1. Mở Chrome/Edge ở cửa sổ riêng tư, vào `http://localhost:3000/movie/550`, bật công cụ quay màn hình (ví dụ Snipping Tool > Record). Hiển thị đồng thời trang phim và DevTools (`F12`).
2. Trong DevTools, vào **Network**, bật **Preserve log**. Vào **Application > Storage > Cookies > http://localhost:3000**, kiểm tra chưa có cookie `mh_watchlist`. Nếu có, xóa riêng cookie này và tải lại trang.
3. Quay trạng thái nút **Lưu Xem Sau**. Nhấp nút một lần. Quay lúc nút đổi thành **Đã Lưu**, rồi sang `/watchlist` để thấy phim đã được lưu. Tải lại `/watchlist` để chứng minh trạng thái vẫn còn.
4. Trong **Network**, chọn request `POST` phát sinh khi nhấp nút (Server Action gửi về route hiện tại). Chụp cột **Method/Status** và phần **Response Headers** có `Set-Cookie`; che **giá trị cookie** trong ảnh. Ở **Application > Cookies**, chụp tên `mh_watchlist` cùng các cờ `HttpOnly`, `SameSite`, `Secure`, nhưng che cột **Value**.
5. Quay thao tác nhấp lại để nút và danh sách trở về trạng thái chưa lưu. Lưu video dưới `baocao/evidence/watchlist-demo.mp4` và ảnh liên quan trong cùng thư mục.

Có thể xuất **Network > Export HAR (sanitized)** thành `baocao/evidence/watchlist-network.har`. Bản sanitized bỏ các header nhạy cảm như `Cookie` và `Set-Cookie`, nên ảnh DevTools ở bước 4 dùng để minh họa cờ cookie. Không xuất HAR có dữ liệu nhạy cảm để nộp.

## 3. Ghi bằng chứng streaming

Ở terminal C:

```powershell
node scripts/verify-stream-evidence.mjs | Tee-Object baocao/evidence/streaming-mock.txt
```

Script chọn ID mới mỗi lượt để tránh cache cũ. Kết quả cần có `main_movie_...` và `cast_fallback` trước `cast_result` và `similar_result`. Thời gian dự kiến khoảng 2,5 giây và 4 giây vì mock chủ động trì hoãn hai API đó; thời gian máy thực tế có thể khác. Terminal A đồng thời hiện thứ tự `START`/`END` của các endpoint.

Để quay video dễ nhìn, mở một URL mới dạng `http://localhost:3000/movie/123456789` (chọn ID chưa mở). Ghi hình phần thông tin phim xuất hiện cùng skeleton, sau đó phần diễn viên và phim tương tự lần lượt xuất hiện. Trong trình duyệt, Network chỉ thấy request tới Next.js; các request TMDB chạy ở server nên quan sát ở terminal A.

## 4. Ghi bằng chứng cache miss/hit

Ở terminal C, dùng **cùng một URL** hai lượt trong vòng một giờ:

```powershell
$id = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "http://localhost:3000/movie/$id"
Invoke-WebRequest $url | Out-Null
(Invoke-RestMethod 'http://127.0.0.1:4100/_counts').PSObject.Properties | Where-Object Name -Like "/movie/$id*" | Select-Object Name,Value
Invoke-WebRequest $url | Out-Null
(Invoke-RestMethod 'http://127.0.0.1:4100/_counts').PSObject.Properties | Where-Object Name -Like "/movie/$id*" | Select-Object Name,Value
```

Sau lượt đầu, bộ đếm của `/movie/$id`, `/videos`, `/credits`, `/similar` tăng lên 1. Sau lượt hai, các giá trị giữ nguyên: Next.js trả dữ liệu từ Data Cache trong môi trường thử nghiệm này. Chụp terminal C cùng terminal A. Không bật `Disable cache` hoặc hard reload trong `next dev` khi thử Data Cache; dùng bản `npm run build` + `npm run start` như trên.

## 5. Trở lại cấu hình thật

Dừng terminal B và A bằng `Ctrl+C`, mở PowerShell **mới** để không kế thừa hai biến môi trường giả, rồi chạy `npm run build` và `npm run start` với `.env.local` của bạn. Không đưa khóa TMDB thật hoặc giá trị cookie vào video, ảnh và log nộp thầy.

Chỉ khi đã tự quay/chụp và kiểm tra tệp lưu thành công mới đổi câu “chưa được kiểm chứng trực tiếp” trong báo cáo. Với bằng chứng mock, ghi rõ phạm vi là streaming và cache trong môi trường giả lập; không suy rộng thành Core Web Vitals hay hiệu năng TMDB thật.
