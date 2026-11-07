# Hands-on lab: Streaming và Data Cache trong Next.js

**Dự án:** MovieHub. **Đối tượng:** nhóm khác đã biết React, TypeScript và `async`/`await`. **Thời lượng dự kiến:** 40 phút thực hành, sau khi chuẩn bị môi trường. Tài liệu này độc lập với báo cáo, nộp cùng bộ source.

## 1. Vì sao chọn chủ đề này? — D0

MovieHub lấy thông tin phim, diễn viên và phim tương tự từ TMDB trên server. Nếu trang cha chờ toàn bộ dữ liệu, người xem phải chờ phần chậm nhất dù hai phần phụ đã có Suspense. Nếu không hiểu Data Cache, người phát triển cũng dễ nhầm dữ liệu cũ sau TTL là lỗi hoặc gọi mọi cơ chế cache là ISR.

Lab tập trung hai kỹ thuật đã dùng trong sản phẩm: **Streaming với Server Components** và **Data Cache có revalidation**. Người học sửa vị trí chờ dữ liệu rồi kiểm tra HTML và số request thực tế; không dành buổi học để dựng CRUD hay chép lại giao diện.

Sau lab, người học có thể:

1. Vẽ luồng dữ liệu trang phim, xác định Server/Client boundary và nơi giữ API key.
2. Sửa việc chờ dữ liệu phụ làm chặn nội dung chính; chứng minh fallback và kết quả đến ở các thời điểm khác nhau.
3. Đối chiếu miss/hit/refresh bằng counter và nội dung thay đổi; phân biệt Data Cache, memoization và cache trình duyệt.

**Bộ tài liệu:** [starter](starter.patch), [phiếu thực hành](WORKSHEET.md), [đáp án](SOLUTION.md). Đọc đáp án sau khi làm ba bài.

## 2. Chuẩn bị trước buổi học

- Node.js **>=24**, npm, Git và quyền chạy server HTTP trên `127.0.0.1`.
- Source MovieHub đi kèm lab, có thư mục `.git`; không cần tài khoản hay API key TMDB thật.
- Internet để cài dependency và tải Google Fonts khi build. Mock TMDB không làm build hoàn toàn offline.
- Bash hoặc PowerShell; các lệnh thực hành bên dưới dùng chung cho cả hai. Không cần Chrome hay ba terminal.
- Next.js **16.4.5**, React **19.2.8**, `cacheComponents: false`; giữ `package-lock.json`.

Làm trên **bản sao riêng** của source; bỏ `node_modules`, `.next`, `.next-evidence` khi sao chép, giữ `.git` và thư mục lab. Nếu lab chưa commit, `git clone` không mang theo thay đổi đó. Mở terminal ở gốc bản sao, chạy trước buổi học:

```sh
node --version
git --version
npm ci
git rev-parse HEAD
git diff HEAD -- "app/movie/[id]/page.tsx"
```

Diff cuối phải trống. Nếu trang phim có sửa riêng, giữ sửa đổi đó và dùng bản sao sạch khác; không dùng `git reset --hard`. Khắc phục lỗi cài dependency/tải font trước khi tính thời gian thực hành.

## 3. Bài 1 — Đọc luồng và dự đoán, 7 phút

**Bước 1.** Tạo trạng thái starter và lưu mốc so sánh:

```sh
git apply --check labs/streaming-cache/starter.patch
git apply labs/streaming-cache/starter.patch
node -e "const fs = require('node:fs'); fs.mkdirSync('labs/streaming-cache/work', { recursive: true }); fs.copyFileSync('app/movie/[id]/page.tsx', 'labs/streaming-cache/work/page.starter.txt', fs.constants.COPYFILE_EXCL)"
```

Nếu `--check` thất bại, dừng và xem mục 7; không ép áp dụng. Nếu snapshot báo `EEXIST`, giữ bản cũ và dùng bản sao mới cho lượt khác. Snapshot `.txt` không bị TypeScript coi là một trang mới.

Starter thêm `getMovieCredits(id)` và `getSimilarMovies(id)` vào `Promise.all` trước `return`. Đây là tình huống chặn **cố ý để học**, không phải lỗi được phát hiện trong sản phẩm gốc. Không cần gõ lại giao diện hay skeleton.

**Bước 2.** Đọc các phần liên quan:

| File | Điều cần xác định |
| --- | --- |
| `app/movie/[id]/page.tsx` | Dữ liệu cần trước `return`, hai Suspense và dữ liệu bị chờ thêm |
| `components/server/CastList.tsx`, `SimilarMovies.tsx` | Nơi fetch dữ liệu phụ, xử lý lỗi và dựng nội dung |
| `components/client/CastSlider.tsx`, `SimilarMoviesSlider.tsx` | Tương tác chạy ở trình duyệt |
| `services/client.ts` | API key, timeout, `next.revalidate`, giới hạn TTL mock |

**Bước 3.** Điền Bài 1 trong phiếu: vẽ luồng request, đánh dấu nơi giữ khóa, dự đoán vì sao hai Suspense chưa giúp nội dung chính đến sớm. Chưa xem đáp án.

**Đạt khi:** phân biệt được nơi fetch và nơi tương tác; chỉ ra `await` ở cha diễn ra trước khi hai Suspense được render.

## 4. Bài 2 — Sửa và kiểm chứng streaming, 18 phút

**Bước 4.** Trên starter, chạy:

```sh
npm run lab
```

Lệnh tự chạy lint/test, mock TMDB, build production, typecheck và kiểm tra HTTP; tự chọn cổng và dừng server khi xong. Dòng `Evidence directory:` in thư mục kết quả **ngay đầu lượt chạy**. Mỗi lượt nằm riêng dưới `labs/streaming-cache/evidence/runs/`; ghi lại đường dẫn đó.

Starter phải kết thúc với exit code **1** vì streaming, ví dụ `cast_result must arrive progressively, at least 1000ms after main HTML in this mock`. Xem exit code ngay sau lệnh:

| Bash | PowerShell |
| --- | --- |
| `echo $?` | `$LASTEXITCODE` |

Mở `mock-runtime.json`: `verification=lab`, `status=failed`, `error` thuộc streaming. Log lint/test/build/typecheck và `routes-http.json` phải cho thấy các bước trước đó đạt. Lỗi tải font, kết nối hoặc build **không** phải thất bại mong đợi. Starter dừng trước bước cache nên chưa có `cache-mock.json` là bình thường.

**Bước 5.** Sửa `app/movie/[id]/page.tsx`:

1. Bỏ hai lời gọi dữ liệu phụ đang bị chờ trong `Promise.all` trước `return`, dọn hai import thừa.
2. Giữ fetch trong `CastList` và `SimilarMovies`, dưới hai Suspense riêng.
3. Giữ validation ID, xử lý lỗi, skeleton, `data-stream`, `data-movie-id` và Server/Client boundary. Không chuyển trang sang Client Component.

**Bước 6.** Chạy lại:

```sh
npm run lab
```

Lệnh build lại mã đã sửa, dùng ID mới và tạo thư mục kết quả mới. Cần đạt:

- Exit code **0**, `mock-runtime.json` có `verification=lab`, `status=passed`.
- `streaming-mock.json` có đủ `main`, `cast_fallback`, `similar_fallback`, `cast_result`, `similar_result` trong `events`.
- Nội dung chính/fallback đến ở chunk trước kết quả phụ; mỗi kết quả phụ cách `main` ít nhất 1.000 ms theo điều kiện mock này.

Ghi số liệu của **cùng lượt solution** vào phiếu. Không yêu cầu số chunk hay thời gian tuyệt đối giống mẫu.

**Bước 7.** Tạo diff so với snapshot starter:

```sh
git diff --no-index -- labs/streaming-cache/work/page.starter.txt "app/movie/[id]/page.tsx"
```

Lưu diff vào bài nộp. Với lệnh này, exit code **1 nghĩa là có khác biệt**, 0 là không khác biệt, lớn hơn 1 là lỗi. Snapshot cần thiết vì sửa đúng có thể trở về nguyên bản HEAD, khiến `git diff` thông thường trống.

**Đạt khi:** có lỗi streaming trước sửa, kết quả đạt sau sửa và diff giải thích được. Giữ comment starter cũng hợp lệ nếu không còn hai lời gọi chặn.

## 5. Bài 3 — Đối chiếu Data Cache, 10 phút

**Bước 8.** Trước khi đọc `cache-mock.json`, dự đoán counter cho một endpoint ở năm mốc: trước tải, cold miss, warm hit, refresh sau TTL và hit sau refresh. Điền dự đoán trong phiếu.

**Bước 9.** Mở `cache-mock.json` của **lượt solution vừa chạy**, đối chiếu bốn endpoint của cùng ID:

- `/movie/<id>` và các suffix `/videos`, `/credits`, `/similar`.
- Năm trường `before`, `miss`, `hit`, `after_expiry`, `warm_after_refresh`.
- `content_before`, `content_after`, `ttl_seconds`, `cache_components` và mô tả request trong `steps`.

Điền counter, nội dung trước/sau và dự đoán nào cần sửa. Script thực hiện HTTP request thật tới Next production; mock origin tăng counter, chờ TTL và đổi dữ liệu. Đây là kết quả lần chạy của bạn, không phải bảng số liệu dựng sẵn.

**Bước 10.** Trả lời:

1. Request đầu sau TTL có bắt buộc nhận ngay dữ liệu mới không? Vì sao?
2. Counter tăng ở `START` hay `END`? Điều gì chứng minh refresh đã sẵn sàng?
3. Vì sao không quy kết kết quả cho cache trình duyệt hoặc memoization? `AbortSignal` trong helper ảnh hưởng gì?
4. Route đọc cookie Watchlist nhưng fetch TMDB có cache: nên mô tả mô hình render/cache thế nào?

**Đạt khi:** đối chiếu đủ bốn endpoint, xác nhận nội dung thay đổi và giải thích stale-while-revalidate. Không suy hiệu năng TMDB thật từ mock.

## 6. Nộp bài — 5 phút

Nộp [phiếu đã điền](WORKSHEET.md), diff so với starter và hai thư mục kết quả của chính bạn:

- **Starter:** `mock-runtime.json` báo lỗi streaming; log lint/test/build/typecheck và `routes-http.json` cho thấy các bước trước đó đạt.
- **Solution:** `mock-runtime.json`, `streaming-mock.json`, `cache-mock.json` cùng log lint/test/build/typecheck.
- Mỗi bộ phải cùng `run_id` và `source_sha256`. Starter và solution là hai trạng thái nguồn khác nhau; không ghép artifact của chúng.

Khai phần tự làm và phần có AI hỗ trợ. Không nộp API key thật, cookie hay `.env.local`. Ô trống trong phiếu dành cho người học, không phải dữ liệu nhóm đã thu thập.

## 7. Lỗi thường gặp và kinh nghiệm đã kiểm chứng

Hai lỗi sau đã được tái hiện khi hoàn thiện bản lab trước; đây là lỗi công cụ/hướng dẫn lab, không phải bằng chứng AI trả lời sai:

| Lỗi đã gặp | Nguyên nhân | Cách bản mới xử lý |
| --- | --- | --- |
| Sửa đúng nhưng test patch thất bại khi giữ comment | Test coi khớp patch là điều kiện đúng của lời giải | Tách test patch thành kiểm tra đóng gói; nghiệm thu học viên bằng streaming/cache |
| Sửa xong nhưng `git diff` trống | Source bàn giao vốn đã có lời giải | Lưu snapshot starter rồi dùng `git diff --no-index` |

Các tình huống dưới đây là hướng dẫn xử lý; không mặc định đều từng xảy ra với mọi thành viên:

| Triệu chứng | Kiểm tra và xử lý |
| --- | --- |
| Patch không áp dụng | Đúng gốc project chưa, starter đã áp dụng chưa, trang có sửa riêng không? Dùng bản sao sạch; không ép patch |
| `EEXIST` khi lưu snapshot | Giữ snapshot cũ; dùng bản sao mới cho lượt khác |
| Build không tải được Google Fonts | Kiểm tra HTTPS/Internet rồi chạy lại; không tính đây là lỗi streaming |
| `Local HTTP is blocked by the sandbox` hoặc lỗi quyền mở server | Cho phép công cụ chạy loopback trong môi trường của bạn rồi chạy lại |
| Streaming không đạt sau sửa | Kiểm tra đúng file, hai lời gọi ở cha đã bỏ chưa; chạy lại `npm run lab` để build mới |
| Đọc nhầm kết quả starter/solution | Đối chiếu đường dẫn, `run_id`, fingerprint và `status`; không lấy số từ thư mục lịch sử |

Chưa có log đủ để khẳng định nhóm đã gặp mọi lỗi chuyên môn trong bảng xử lý. Tình huống chặn của starter được tạo có chủ đích và khai riêng.

## 8. Phạm vi và nguồn

Next production, Suspense, Data Cache và HTTP chạy thật; TMDB dùng mock loopback. Credits chậm 2,5 giây, similar chậm 4 giây, TTL mock 15 giây; TTL dịch vụ thật giữ nguyên. Thời điểm nhận HTML không phải FCP/LCP hay thời điểm hydration. Counter không phải thời gian phản hồi; route SSR có Data Cache không đồng nghĩa ISR toàn trang.

Đối chiếu tài liệu đúng phiên bản trong `node_modules/next/dist/docs/` sau `npm ci`:

- [Fetching Data và Suspense](https://nextjs.org/docs/app/getting-started/fetching-data), bản local `01-app/01-getting-started/06-fetching-data.md`.
- [Server và Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), bản local `01-app/01-getting-started/05-server-and-client-components.md`.
- [fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch), bản local `01-app/03-api-reference/04-functions/fetch.md`: `next.revalidate`, memoization và `AbortSignal`.
- [Caching khi không bật Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components), bản local `01-app/02-guides/caching-without-cache-components.md`.

**Đối chiếu yêu cầu của thầy:** mục 1 nêu lý do chọn/năng lực đạt được (D0); mục 2 chuẩn bị môi trường; mục 3–5 có bước đánh số, starter và ba bài tập; [SOLUTION.md](SOLUTION.md) có đáp án; mục 7 nêu lỗi và nguồn xác nhận. Ảnh chỉ có chi tiết điểm D0; tài liệu không tự suy ra thang điểm D1–D3.
