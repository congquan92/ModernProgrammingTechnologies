# Phiếu thực hành — Streaming và Data Cache

Điền bằng kết quả của chính nhóm thực hành. Ô trống và chỗ vẽ sơ đồ dành cho người học; không chép số liệu mẫu thành lần chạy của mình.

## Thông tin

| Mục | Kết quả |
| --- | --- |
| Nhóm, thành viên, lớp | |
| Ngày chạy, hệ điều hành | |
| Node.js / npm / Next.js | |
| Git HEAD, thay đổi trong working tree | |
| Thời gian bắt đầu/kết thúc thực hành, không tính cài dependency | |
| Công cụ AI đã dùng, phần hỗ trợ và phần tự kiểm tra | |

## Bài 1 — Luồng dữ liệu và dự đoán

Vẽ luồng request tới trang phim, helper fetch, hai component phụ và các component tương tác. Đánh dấu Server/Client boundary và nơi giữ API key.

**Sơ đồ của nhóm:**

1. Dữ liệu nào cần trước `return` để dựng thông tin phim chính?
2. Hai lời gọi nào của starter không cần chặn phần chính? Vì sao hai Suspense chưa giúp được?
3. Có nên chuyển trang sang Client Component hoặc đưa API key vào `NEXT_PUBLIC_` để sửa không? Giải thích.

## Bài 2 — Starter và lời giải

| Mục | Starter | Solution |
| --- | --- | --- |
| Thư mục kết quả được in | | |
| `run_id` | | |
| `source_sha256` | | |
| `verification`, `status`, exit code | | |
| Kết quả lint/test/build/typecheck/route | | |
| Nguyên văn lỗi nếu có | | |

**Diff so với `work/page.starter.txt`:** đính kèm output `git diff --no-index`. Exit code 1 của lệnh diff nghĩa là có khác biệt.

Giải thích bản sửa và vì sao `Promise.all` vẫn có thể chặn nội dung chính:

Ghi các marker từ **một** `streaming-mock.json` của solution:

| Marker | Nhận sau (ms) | Chunk |
| --- | --- | --- |
| `main` | | |
| `cast_fallback` | | |
| `similar_fallback` | | |
| `cast_result` | | |
| `similar_result` | | |

Tính khoảng cách từ `main` đến mỗi kết quả phụ. Vì sao nhiều chunk chưa đủ chứng minh streaming hữu ích? Những số đo này có chứng minh thời điểm trình duyệt vẽ không?

## Bài 3 — Data Cache

**Dự đoán trước khi đọc kết quả:** counter cho một endpoint ở năm mốc trước tải / miss / hit / sau refresh / hit mới:

Đường dẫn ID đo, TTL và trạng thái `cache_components`:

| Endpoint | `before` | `miss` | `hit` | `after_expiry` | `warm_after_refresh` |
| --- | --- | --- | --- | --- | --- |
| `/movie/<id>` | | | | | |
| `/movie/<id>/videos` | | | | | |
| `/movie/<id>/credits` | | | | | |
| `/movie/<id>/similar` | | | | | |

| Kiểm tra nội dung | Kết quả |
| --- | --- |
| `content_before` | |
| `content_after` | |
| Nguồn chứng minh refresh hoàn tất: assertion nội dung hoặc log `END` | |
| Dự đoán nào cần sửa, vì sao | |

1. Request đầu sau TTL có bắt buộc nhận nội dung mới không? Hết TTL có tự sinh request khi không có người truy cập không?
2. Counter tăng tại `START` hay `END`? Vì sao cần kiểm tra cả nội dung sau refresh?
3. Phân biệt Data Cache, request memoization và cache trình duyệt. `AbortSignal` ảnh hưởng gì trong helper hiện tại?
4. Giải thích SSR kết hợp Data Cache của route này. Có thể suy tốc độ TMDB thật, Core Web Vitals hoặc cache CDN từ phép đo không?

## Checklist bài nộp

- [ ] Ba bài đã điền; sơ đồ và diff so với snapshot starter được đính kèm.
- [ ] Starter thất bại đúng tại streaming, có lỗi và exit code; các bước trước đó đạt.
- [ ] Solution có `verification=lab`, `status=passed`, exit code 0.
- [ ] Có `streaming-mock.json`, `cache-mock.json` và log lint/test/build/typecheck của solution.
- [ ] Mỗi lượt khớp `run_id` và `source_sha256`; starter/solution tách riêng.
- [ ] Đã ghi rõ Next production chạy thật, TMDB dùng mock loopback và giới hạn phép đo.
- [ ] Đã khai AI hỗ trợ nếu có; không nộp khóa thật, cookie hoặc `.env.local`.
