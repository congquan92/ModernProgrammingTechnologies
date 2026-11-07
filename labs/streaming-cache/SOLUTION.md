# Đáp án: Streaming và Data Cache

Đọc sau khi hoàn thành [bài thực hành](README.md). Starter là biến thể cố ý chặn để học; bản sản phẩm gốc đã có hai Suspense đúng vị trí.

## 1. Bản sửa tối thiểu

Trong `app/movie/[id]/page.tsx`, bỏ hai lời gọi dữ liệu phụ khỏi `Promise.all` trước `return`, cùng hai import thừa:

```diff
-import { getMovieDetails, getMovieVideos, selectBestTrailer, TMDBError, getMovieCredits, getSimilarMovies } from "@/services/tmdb";
+import { getMovieDetails, getMovieVideos, selectBestTrailer, TMDBError } from "@/services/tmdb";
@@
   const [isSaved, videos] = await Promise.all([
     isMovieSaved(movie.id),
     getMovieVideos(movie.id.toString()),
-    // Lab starter: dữ liệu phụ bị chờ trước khi render các ranh giới Suspense.
-    getMovieCredits(id),
-    getSimilarMovies(id),
   ]);
```

Đây là diff giải thích; để áp dụng tự động **chỉ khi trang vẫn đúng starter và chưa có sửa riêng**, dùng patch ngược đầy đủ:

```sh
git apply --reverse --check labs/streaming-cache/starter.patch
git apply --reverse labs/streaming-cache/starter.patch
```

Nếu đã tự sửa đúng, `git apply --reverse --check` có thể thất bại vì patch không còn ở trạng thái starter; không ép áp dụng. So sánh với diff trên. Sau khi sửa, dừng server production, build và start lại với cấu hình lab.

## 2. Giải thích streaming và boundary

`MovieDetailPage`, `CastList`, `SimilarMovies` là Server Components. Trang cần chi tiết phim, trạng thái Watchlist và video trước khi dựng nội dung chính. `CastSlider`, `SimilarMoviesSlider`, nút Watchlist và modal trailer xử lý tương tác phía client.

Trong starter, `Promise.all` khởi động các tác vụ song song, nhưng `await` vẫn chờ **tác vụ chậm nhất** trước khi trang trả JSX. Hai Suspense bên dưới chưa được render nên không thể giúp `<main>` đến sớm. `loading.tsx` có thể xuất hiện trước, nhưng skeleton cấp route đó không chứng minh thông tin phim chính đã đến.

Sau sửa, `CastList` và `SimilarMovies` vẫn tự fetch trong hai Suspense riêng. Server gửi phần chính/fallback rồi gửi kết quả phụ khi chúng sẵn sàng. Không cần chuyển trang thành Client Component, thêm fetch trình duyệt hay thay skeleton.

Trình duyệt gọi Next.js; request TMDB nằm phía server, quan sát bằng log mock. Khóa không được đưa vào `NEXT_PUBLIC_`, props hoặc log/ảnh. `HttpOnly` của Watchlist không liên quan đến việc giữ khóa TMDB ở server.

Một response hoàn chỉnh có thể bị transport chia nhiều chunk cùng lúc. Vì vậy verifier kiểm tra cả thứ tự marker HTML thật và khoảng cách ít nhất 1.000 ms trong điều kiện độ trễ mock. Không dùng thời gian nhận HTML để suy ra FCP/LCP hoặc thời điểm hydration.

## 3. Giải thích cache

`next: { revalidate: revalidateTime }` opt-in Data Cache phía server; không mặc định mọi fetch đều được cache. TTL mock 15 giây chỉ hoạt động với HTTP `127.0.0.1`, giữ nguyên TTL dịch vụ khi dùng TMDB thật.

| Mốc | Counter mỗi endpoint | Nội dung |
| --- | ---: | --- |
| Before, ID mới | 0 | Chưa tải |
| Cold miss hoàn tất | 1 | Phiên bản 1 |
| Hit trong TTL | 1 | Phiên bản 1 |
| Sau hết TTL, kích hoạt và đợi refresh | 2 | Request kích hoạt có thể còn nhận phiên bản 1 |
| Hit sau refresh hoàn tất | 2 | Phiên bản 2 |

Bốn endpoint là `/movie/<id>`, `/videos`, `/credits`, `/similar` của cùng ID. Mock tăng counter ngay khi nhận request; phải xem `END` hoặc đợi response xong trước khi kết luận dữ liệu mới sẵn sàng.

Revalidation theo thời gian có thể dùng stale-while-revalidate: request đầu sau TTL nhận dữ liệu cũ và kích hoạt refresh nền. TTL hết hạn không tự tạo một request khi không có người truy cập.

Request memoization chỉ có phạm vi một lượt render; Data Cache tồn tại giữa các request. Helper truyền `AbortSignal.timeout(10000)`, nên không được quy việc gộp request ở đây cho memoization mặc định của React. Metadata và page gọi cùng endpoint không tự chứng minh origin nhận hai request; counter mới là bằng chứng. Cache trình duyệt cũng không giải thích việc một HTTP client mới gọi Next mà upstream không tăng.

Route đọc Watchlist qua `cookies()` nên có dữ liệu theo request, trong khi các fetch TMDB vẫn có Data Cache. Vì vậy mô tả đúng là **SSR kết hợp Data Cache**, không suy ra ISR của toàn trang từ một `next.revalidate`.

## 4. Minh chứng bàn giao và cách chạy lại

Minh chứng chạy thực tế được đặt trong `evidence/`, tách starter khỏi solution. Đọc metadata từng lượt; không coi `status=failed` là thành công của sản phẩm. Starter chỉ đúng bài khi lỗi thực tế thuộc kiểm chứng streaming sau khi build và kiểm tra route đã đạt.

- [Starter runtime](evidence/starter/mock-runtime.json): trạng thái cố ý chặn, lỗi verifier và fingerprint của bản starter.
- [Solution runtime](evidence/solution/mock-runtime.json): trạng thái nghiệm thu tổng hợp của bản đã sửa.
- [Streaming sau sửa](evidence/solution/streaming-mock.json): thời điểm/chunk của năm marker.
- [Data Cache sau sửa](evidence/solution/cache-mock.json): counter, các bước request và nội dung trước/sau.
- [Kiểm tra patch](evidence/patch-check.json): áp dụng/đảo ngược trên bản sao, đối chiếu SHA-256 trang.
- [Cài dependency mới](evidence/install.json) và [log npm ci](evidence/install-output.txt): cài trong checkout riêng, không dùng lại `node_modules`.
- [Lượt Bash thủ công](evidence/manual-bash.json) và [output](evidence/manual-bash-output.txt): chạy đúng khối lệnh cache trong hướng dẫn, kiểm tra nội dung mới và một warm hit bổ sung.

Log lint, test, build, typecheck, mock và production được lưu cạnh metadata tương ứng. Log build có tên `build-mock-output.txt`; tệp này thuộc bộ lab, không dùng thay minh chứng build thật trong báo cáo cũ.

Trên bản đã sửa, chạy `npm run lab` theo hướng dẫn [nghiệm thu](README.md#6-nghiệm-thu-phiếu-kết-quả--10-phút). Lệnh dùng `cross-env` đã có trong project, ghi vào `evidence/latest/` và giữ nguyên minh chứng bàn giao `starter/`, `solution/`. Muốn lưu tên riêng như `evidence/my-solution`, dùng `npm run evidence` với biến môi trường trong hướng dẫn. Bộ tự động còn kiểm tra Watchlist và Chrome vì dùng lại quy trình sẵn có; những kiểm tra này không mở rộng phạm vi bài tập.

Muốn tái tạo log starter có metadata: áp dụng patch trong bản sao riêng, dừng server thủ công rồi chạy lệnh nghiệm thu với output `evidence/my-starter`. Exit code 1 chỉ được xem là đúng tình huống lab khi build/typecheck đã đạt, `routes-http.json` được tạo và lỗi trong `mock-runtime.json` thuộc kiểm chứng streaming. Sau đó tự sửa, build lại và nghiệm thu solution như hướng dẫn.

### Kết quả đã chạy ngày 07/11/2026

Môi trường Linux, Node `v26.12.1`, npm `12.2.1`, Next `16.4.5`; Git HEAD `629d281e10a0288867f361d8757c113a1f9cc2be`. Working tree có thay đổi chưa commit; fingerprint mã nguồn được ghi riêng trong metadata. Các lượt dưới đây thay thế lượt bàn giao ban đầu để khớp script và test lab mới.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| Patch áp dụng rồi đảo ngược | Trang khôi phục đúng từng byte; SHA-256 gốc và khôi phục trùng nhau |
| Cài mới bằng `npm ci` | Exit code 0; thêm 378 package trong checkout riêng, không dùng lại `node_modules` |
| Starter, run_id `2026-11-07T08:21:13.592Z` | Lint, 44 test, build/typecheck và kiểm tra route đạt; verifier từ chối với `cast_result must arrive progressively, at least 1000ms after main HTML in this mock` |
| Solution qua `npm run lab`, run_id `2026-11-07T08:23:43.448Z` | `status=passed`; lint, 44 test, production build, typecheck và 16 kiểm tra Chrome đạt |
| Cache solution, cả bốn endpoint | Counter `0, 1, 1, 2, 2`; nội dung đổi từ Phiên bản 1 sang Phiên bản 2 |
| Khối lệnh Bash thủ công | Cả bốn counter đúng chuỗi; nội dung Phiên bản 2; warm hit bổ sung không gọi origin |

Các thời điểm dưới đây thuộc **một lượt solution tự động**, tính từ lúc bắt đầu request; không ghép với lượt Bash thủ công:

| Marker | Nhận sau (ms) | Chunk |
| --- | ---: | ---: |
| `main` | 61 | 22 |
| `cast_fallback` | 61 | 23 |
| `similar_fallback` | 61 | 23 |
| `cast_result` | 2563 | 29 |
| `similar_result` | 4076 | 55 |

Test `tests/lab-starter.test.mjs` kiểm tra patch trên thư mục tạm và chạy được ở cả trạng thái starter lẫn solution; checkout người học không bị sửa bởi test.

Lượt `npm ci` ghi nhận cảnh báo ESLint đã hết thời gian hỗ trợ và npm 12 chặn postinstall của `unrs-resolver` theo policy `allowScripts`; giữ nguyên policy. Các kiểm tra lint/build/runtime phía trên vẫn đạt sau lượt cài này. Xem nguyên văn trong log cài đặt.

Phép đo dùng mock với độ trễ chủ động. Không có phép đo Lighthouse, TMDB thật hay video giao diện trong bộ lab này. Bash và bản cài dependency mới đã được kiểm chứng trên Linux; PowerShell chưa chạy vì máy không cài PowerShell.
