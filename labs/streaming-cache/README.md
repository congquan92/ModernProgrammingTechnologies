# Hands-on lab: Streaming và Data Cache trên MovieHub

**Thời lượng:** 75 phút sau khi cài dependency. **Đối tượng:** sinh viên biết React, TypeScript và `async`/`await` cơ bản. **Công nghệ:** Next.js 16.4.5, React 19.2.8; `cacheComponents: false`.

**Bộ tài liệu:** hướng dẫn này, [starter patch](starter.patch), [phiếu nộp bài](WORKSHEET.md), [đáp án và minh chứng](SOLUTION.md). Bắt đầu bằng bước 2 để làm bài; sau khi sửa xong, `npm run lab` nghiệm thu trên cả Bash/PowerShell. Lệnh ghi đè `evidence/latest/`; giữ riêng lượt cần nộp trước khi chạy lại.

## 1. Mục tiêu và lý do chọn

Sau lab, người học có thể:

- Chỉ ra server/client boundary của route `/movie/[id]` và nơi gọi TMDB.
- Giải thích vì sao `await` ở component cha có thể chặn nội dung chính dù component con nằm trong Suspense.
- Sửa chỗ chờ dữ liệu phụ và kiểm chứng HTML được gửi dần qua HTTP.
- Phân biệt Data Cache, request memoization, cache trình duyệt và ISR toàn trang bằng log thực tế.
- Chứng minh cache miss/hit/background revalidation bằng số request origin và nội dung thay đổi.

Lab đáp ứng phần Server Components, server fetching, Suspense và caching trong [REQUIRE.md](../../REQUIRE.md), cùng yêu cầu starter/bài tập/đáp án trong [PROBLEM.md](../../PROBLEM.md). Streaming + Data Cache tận dụng mock có độ trễ và bộ đếm origin sẵn có, cho kết quả kiểm tra được trong một buổi. Watchlist và tìm kiếm phù hợp cho lab tiếp theo về mutation hoặc state; lab này tập trung mô hình render của Next.js.

**Phạm vi đo:** Next production và Data Cache chạy thật; TMDB được thay bằng mock loopback. Credits bị trì hoãn 2,5 giây, similar 4 giây, TTL mock 15 giây. Thời điểm nhận HTML không đồng nghĩa thời điểm trình duyệt vẽ hay tương tác; không suy ra Lighthouse/Core Web Vitals, hiệu năng TMDB thật hoặc cache CDN.

| Chặng | Phút | Đầu ra |
| --- | ---: | --- |
| Chuẩn bị | 10 | Starter, mock và production server |
| Đọc luồng render | 10 | Sơ đồ luồng và dự đoán |
| Sửa streaming | 25 | Kiểm chứng trước/sau sửa |
| Đo Data Cache | 20 | Counter và hai phiên bản nội dung |
| Hoàn thiện bài nộp | 10 | Phiếu kết quả, giải thích, minh chứng |

## 2. Chuẩn bị starter — 10 phút

### Môi trường và bản làm bài

Cần Node.js **>=24**, npm, Git và Internet cho `npm ci`/Google Fonts khi build. Chặng thủ công cần ba terminal; Bash dùng `curl`, PowerShell dùng `Invoke-WebRequest`/`Invoke-RestMethod`. Bộ nghiệm thu cuối cần Chrome/Chromium.

Thực hành trên **bản sao project riêng có thư mục `.git`**, giữ cả thư mục lab này. Có thể sao chép checkout hiện tại bằng công cụ hệ điều hành, bỏ `node_modules`, `.next` và `.next-evidence`, rồi chạy `npm ci` trong bản sao. Cách này giữ được lab chưa commit; `git clone` chỉ lấy nội dung đã commit. Mọi lệnh bên dưới chạy từ gốc bản sao đó. Trước khi áp dụng patch, bảo đảm trang chi tiết phim không có thay đổi riêng cần giữ.

```sh
node --version
git rev-parse HEAD
npm ci
git diff HEAD -- "app/movie/[id]/page.tsx"
git apply --check labs/streaming-cache/starter.patch
git apply labs/streaming-cache/starter.patch
```

Nếu `git diff` có thay đổi trước khi áp dụng, dùng bản sao sạch hoặc giữ thay đổi của bạn riêng trước. Nếu `--check` thất bại, dừng và xem phần xử lý lỗi; không ép áp dụng patch.

Starter thêm hai lời gọi dữ liệu phụ vào `Promise.all` được `await` trước `return` trong trang phim. Đây là **tình huống chặn có chủ ý để thực hành**, không phải lỗi được phát hiện trong sản phẩm. Bản ứng dụng gốc đã có lời giải. Patch giữ nguyên hai Suspense, skeleton, giao diện và validation.

### Terminal A — mock TMDB

Bash:

```bash
EVIDENCE_PORT=4100 node scripts/mock-tmdb-evidence.mjs
```

PowerShell:

```powershell
$env:EVIDENCE_PORT='4100'
node scripts/mock-tmdb-evidence.mjs
```

Giữ terminal mở. Mock chỉ lắng nghe `127.0.0.1`; `http://127.0.0.1:4100/_counts` trả bộ đếm theo đường dẫn. Log `START` ghi khi request tới, `END` ghi khi response hoàn tất. Log bỏ query chứa khóa.

### Terminal B — build và chạy production

Bash:

```bash
export NEXT_TELEMETRY_DISABLED=1
export MOVIEHUB_EVIDENCE_BUILD=1
export TMDB_BASE_URL=http://127.0.0.1:4100/3
export TMDB_API_KEY=evidence-only
export TMDB_MOCK_REVALIDATE_SECONDS=15
npm run build
```

Sau khi build thành công, chạy trong **cùng terminal**:

```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

PowerShell:

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'
$env:MOVIEHUB_EVIDENCE_BUILD='1'
$env:TMDB_BASE_URL='http://127.0.0.1:4100/3'
$env:TMDB_API_KEY='evidence-only'
$env:TMDB_MOCK_REVALIDATE_SECONDS='15'
npm run build
```

Sau khi build thành công:

```powershell
npm run start -- --hostname 127.0.0.1 --port 3000
```

Build lab nằm trong `.next-evidence`; khóa `evidence-only` là giả. Không cần sửa `.env.local`. Giữ terminal B mở. Cấu hình TTL ngắn chỉ chấp nhận HTTP `127.0.0.1` và số nguyên 1–60 giây; giữ validation này.

## 3. Đọc luồng render — 10 phút

Đọc các vị trí sau, vẽ luồng request và đánh dấu nơi chạy server/client:

| Vị trí | Điều cần tìm |
| --- | --- |
| `app/movie/[id]/page.tsx` | `await params`, validation ID, metadata, chi tiết phim, chỗ chờ trước `return`, hai Suspense |
| `components/server/CastList.tsx`, `SimilarMovies.tsx` | Async Server Components; nơi fetch dữ liệu phụ và xử lý lỗi |
| `components/client/CastSlider.tsx`, `SimilarMoviesSlider.tsx` | Tương tác phía trình duyệt; dữ liệu/nội dung nhận từ server |
| `services/client.ts`, `services/movies.ts` | Khóa server, timeout, `next.revalidate` và TTL override dành cho mock |
| `scripts/mock-tmdb-evidence.mjs` | Độ trễ, counter và `tagline` đổi theo số request |

Trả lời **trước khi chạy thử**:

1. Nội dung nào cần chờ để dựng thông tin phim chính? Credits/similar có cần chặn nội dung chính không?
2. Hai Suspense còn nguyên trong starter. Vì sao chúng có thể không giúp nội dung chính đến sớm?
3. Trong DevTools trình duyệt có thấy request trực tiếp đến TMDB với API key không? Quan sát upstream ở đâu?

## 4. Bài tập sửa streaming — 25 phút

### Trước sửa

Ở terminal C, đặt URL IPv4 khớp server như dưới đây. Script tự chọn ID mới mỗi lượt để tránh cache cũ:

Bash:

```bash
EVIDENCE_BASE_URL=http://127.0.0.1:3000 node scripts/verify-stream-evidence.mjs
```

PowerShell:

```powershell
$env:EVIDENCE_BASE_URL='http://127.0.0.1:3000'
node scripts/verify-stream-evidence.mjs
```

Ghi lỗi và exit code (`echo $?` trong Bash; `$LASTEXITCODE` trong PowerShell). Starter phải bị từ chối bởi kiểm tra streaming, ví dụ thiếu fallback hoặc kết quả không đến đủ muộn so với `main`. Tên assertion cụ thể phụ thuộc cách Next gom chunk. Lỗi kết nối, build hoặc HTTP timeout không phải kết quả mong đợi.

Chụp/lưu lệnh, lỗi, exit code, thời điểm và Git HEAD vào phiếu. Lượt verifier thủ công này không sinh `run_id`/fingerprint; đánh dấu là log thủ công, tách khỏi bộ JSON nghiệm thu tự động cuối bài.

Để quan sát trực tiếp, mở một `/movie/<ID-số-dương-mới>` khác chưa từng dùng. Ghi nhận thông tin chính/skeleton/kết quả xuất hiện; không dùng ID đó cho phép đo HTTP lạnh.

### Sửa

1. Chỉ ra hai lời gọi dữ liệu phụ đang bị chờ trước `return` trong trang phim.
2. Bỏ việc chờ dư thừa đó và import không còn dùng. Giữ fetch trong `CastList` và `SimilarMovies`, dưới hai Suspense độc lập.
3. Giữ nguyên validation ID, xử lý lỗi, skeleton, `data-stream`, `data-movie-id` và Server/Client boundary.
4. Dừng terminal B bằng `Ctrl+C`. Chạy lại `npm run build` với cấu hình lab còn trong terminal; chỉ khi build thành công mới chạy lại lệnh `npm run start` ở trên. Production không tự cập nhật khi sửa source.
5. Chạy lại trình kiểm chứng ở terminal C với ID mới.

Sau sửa, script phải kết thúc với exit code 0 và JSON có `events.main`, hai fallback, `cast_result`, `similar_result`. Nội dung chính/fallback đến ở chunk trước kết quả phụ; mỗi kết quả phụ đến ít nhất 1.000 ms sau `main` theo điều kiện mock. Không yêu cầu số chunk hay thời gian tuyệt đối cố định.

**Câu hỏi:** Vì sao hai API chạy bằng `Promise.all` vẫn có thể chặn trang? Vì sao tăng số chunk transport chưa đủ chứng minh streaming hữu ích?

## 5. Bài tập Data Cache — 20 phút

Giữ bản đã sửa và hai server đang chạy. Thực hiện cả khối lệnh liên tục, tránh chờ nhập từng dòng quá TTL. Dùng cùng ID trong toàn bộ khối; đường dẫn chưa có trong counter được tính là 0. Không mở URL đó trong trình duyệt khi đang đo.

Bash, terminal C:

```bash
lab_id=$(node -p 'Date.now()')
lab_url="http://127.0.0.1:3000/movie/$lab_id"
# Before: tìm /movie/$lab_id và ba suffix /videos, /credits, /similar; chưa có = 0.
curl -fsS http://127.0.0.1:4100/_counts
# Cold miss: đọc hết response trước khi kiểm tra counter.
curl -fsS "$lab_url" -o /dev/null
curl -fsS http://127.0.0.1:4100/_counts
# Warm hit: bốn counter giữ nguyên.
curl -fsS "$lab_url" -o /dev/null
curl -fsS http://127.0.0.1:4100/_counts
# TTL hết hạn; request này có thể nhận bản cũ và kích hoạt refresh nền.
sleep 16
curl -fsS "$lab_url" -o /dev/null
sleep 5
curl -fsS http://127.0.0.1:4100/_counts
# Origin đã END cả bốn response; request sau dùng bản đã refresh.
curl -fsS "$lab_url" -o /dev/null
curl -fsS http://127.0.0.1:4100/_counts
echo "$lab_url"
```

PowerShell, terminal C:

```powershell
$labId=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$labUrl="http://127.0.0.1:3000/movie/$labId"
# Before: tìm bốn đường dẫn của ID này; chưa có = 0.
Invoke-RestMethod 'http://127.0.0.1:4100/_counts' | ConvertTo-Json
$labFirst=Invoke-WebRequest -UseBasicParsing $labUrl
Invoke-RestMethod 'http://127.0.0.1:4100/_counts' | ConvertTo-Json
$null=Invoke-WebRequest -UseBasicParsing $labUrl
Invoke-RestMethod 'http://127.0.0.1:4100/_counts' | ConvertTo-Json
Start-Sleep -Seconds 16
$null=Invoke-WebRequest -UseBasicParsing $labUrl
Start-Sleep -Seconds 5
Invoke-RestMethod 'http://127.0.0.1:4100/_counts' | ConvertTo-Json
$labRefreshed=Invoke-WebRequest -UseBasicParsing $labUrl
Invoke-RestMethod 'http://127.0.0.1:4100/_counts' | ConvertTo-Json
$labUrl
```

Counter đếm khi request **bắt đầu**. Nếu sau 5 giây terminal A chưa có `END` cho refresh, đợi `END` rồi mới gọi lại route. Kiểm tra log thay vì coi thời gian chờ cố định là bằng chứng response đã hoàn tất.

Kỳ vọng cho từng endpoint: **0, 1, 1, 2, 2** tương ứng before/miss/hit/refresh/hit sau refresh. Sau bước cuối có thể mở URL vừa in để xem `tagline` “Phiên bản 2”. Với PowerShell có thể so `$labFirst.Content` và `$labRefreshed.Content`; bộ nghiệm thu phía dưới kiểm tra nội dung tự động trên cả hai nền tảng.

**Câu hỏi:** Request đầu sau khi hết TTL có bắt buộc trả “Phiên bản 2” không? Vì sao counter tăng chưa chứng minh refresh đã xong? Vì sao `generateMetadata` và trang cùng đọc chi tiết phim không đủ để kết luận origin nhận hai request? `AbortSignal` trong helper ảnh hưởng gì đến request memoization?

## 6. Nghiệm thu, phiếu kết quả — 10 phút

Dừng cả terminal B và A bằng `Ctrl+C`. Lệnh sau dùng được trong Bash và PowerShell:

```sh
npm run lab
```

Đây là lệnh gọi lại bộ kiểm chứng hiện có bằng `cross-env` đã cài trong project. Bộ này tự chọn cổng, build production, đo streaming/cache và chạy thêm kiểm tra Watchlist/tương tác Chrome; tự dừng server khi xong. Kết quả nằm trong `labs/streaming-cache/evidence/latest/`; không ghi đè minh chứng mẫu `starter/` và `solution/`.

Khi muốn lưu từng lượt vào tên riêng, dùng `npm run evidence` với biến môi trường như dưới đây:

Bash:

```bash
MOVIEHUB_EVIDENCE_DIR=labs/streaming-cache/evidence/my-solution npm run evidence
```

PowerShell:

```powershell
$env:MOVIEHUB_EVIDENCE_DIR='labs/streaming-cache/evidence/my-solution'
npm run evidence
```

Nếu Chrome chưa được phát hiện, đặt `CHROME_BIN` thành đường dẫn executable trước khi chạy; trên Windows, ví dụ `$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'` nếu Chrome nằm ở đó. Đọc `mock-runtime.json`: chỉ đạt khi `status=passed`; các JSON cùng lượt phải có cùng `run_id` và `source_sha256`.

Mở terminal mới sau lab để bỏ cấu hình mock. Nếu giữ terminal cũ, gỡ các biến lab trước khi chạy ứng dụng với TMDB thật. Không chia sẻ API key thật, giá trị cookie hoặc `.env.local`.

### Phiếu nộp bài

Sao chép [WORKSHEET.md](WORKSHEET.md), điền bằng số liệu của lần chạy của bạn. Phiếu có bảng năm marker, counter bốn endpoint, thông tin phiên bản, câu hỏi giải thích và checklist bài nộp. Các ô trống dành cho người học.

Nộp phiếu đã điền, diff sửa và log/ảnh liên quan. Minh chứng tự động gồm `mock-runtime.json`, `streaming-mock.json`, `cache-mock.json` cùng log build/test/typecheck/lint; giữ các tệp cùng lượt trong một thư mục. Starter và solution là hai trạng thái mã khác nhau nên có fingerprint khác nhau; không ghép chúng thành một lượt đo.

| Tiêu chí | Điểm |
| --- | ---: |
| Đúng boundary, vị trí fetch, bảo vệ khóa server | 2 |
| Sửa đúng chỗ await; có bằng chứng thất bại trước, đạt sau | 3 |
| Counter đủ bốn endpoint; nội dung thay đổi sau refresh | 3 |
| Giải thích revalidation, memoization và giới hạn mock/HTTP | 2 |

[Đáp án và minh chứng bàn giao](SOLUTION.md) dành cho đối chiếu sau khi làm bài. Không chép số liệu bàn giao vào phiếu rồi coi là lần chạy của mình.

### Xử lý lỗi

| Triệu chứng | Cách xử lý |
| --- | --- |
| Patch không áp dụng | Kiểm tra đúng thư mục, patch đã áp dụng chưa và route có sửa riêng không; dùng bản sao sạch, không dùng `git reset --hard` |
| `EADDRINUSE` | Dừng server lab cũ của mình; nếu đổi cổng, sửa đồng bộ URL mock/Next và `EVIDENCE_BASE_URL` |
| Build không tải được Google Fonts | Khôi phục kết nối HTTPS rồi build lại; mock TMDB không làm build hoàn toàn offline |
| Source đã sửa nhưng kết quả cũ | Dừng Next production, build lại với cấu hình lab rồi start lại |
| Streaming verifier thất bại trên bản sửa | Dùng ID mới, tránh prefetch/browser cùng ID; kiểm tra server production đúng bản build, marker và log mock |
| Counter không đúng kỳ vọng | Giữ một ID trong chuỗi cache; chạy các lệnh liên tục; xem TTL, request dư và `START`/`END` |
| Tổng nghiệm thu thất bại | Đọc `mock-runtime.json` và log; lỗi Chrome/lint/build không được tính là starter thất bại đúng cơ chế |
| Test `lab starter patch round-trips...` thất bại | Patch không khớp trang hiện tại hoặc thiếu Git; dùng đúng bản project đi kèm lab, giữ thay đổi riêng trước khi chỉnh lại |

## 7. Nguồn nghiên cứu

Đối chiếu tài liệu **đi kèm Next 16.4.5 trong `node_modules/next/dist/docs/`**, vì tài liệu trực tuyến có thể cập nhật sau phiên bản đang dùng:

- [Fetching Data và Suspense](https://nextjs.org/docs/app/getting-started/fetching-data), bản local `01-app/01-getting-started/06-fetching-data.md`: fetch chậm và vị trí ranh giới streaming.
- [Server và Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), bản local `01-app/01-getting-started/05-server-and-client-components.md`: boundary và dữ liệu phía server.
- [fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch), bản local `01-app/03-api-reference/04-functions/fetch.md`: `next.revalidate`, cache opt-in, memoization và `AbortSignal`.
- [Caching khi không bật Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components), bản local `01-app/02-guides/caching-without-cache-components.md`: mô hình phù hợp `cacheComponents: false` của repo.
- [Hợp đồng kiến trúc/giao diện](../../DESIGN.md) và [bản giải thích tiếng Việt](../../DESIGN_SYSTEM.md): giữ Server Components, bảo vệ khóa và diễn giải đúng Data Cache/ISR.
