# Phiếu nộp bài: Streaming và Data Cache

Sao chép phiếu này vào bài nộp của bạn. Các ô trống dành cho người học; điền số liệu tự chạy, không dùng số liệu mẫu trong đáp án.

## 1. Thông tin lần chạy

| Mục | Kết quả |
| --- | --- |
| Họ tên, lớp, nhóm | |
| Ngày chạy, hệ điều hành | |
| `node --version`, phiên bản Next | |
| `git rev-parse HEAD`, working tree có thay đổi gì | |
| Thư mục minh chứng của bạn | |
| `run_id`, `source_sha256` của starter nếu chạy bộ tự động; ghi “log thủ công” nếu chỉ chạy verifier | |
| `run_id`, `source_sha256` của solution | |
| Dữ liệu dùng mock hay TMDB thật | |

## 2. Dự đoán trước khi sửa

Vẽ luồng request từ `/movie/[id]` đến helper fetch, nội dung chính, hai Server Component phụ và các Client Component. Đánh dấu nơi giữ API key.

1. Những dữ liệu nào cần có trước khi dựng nội dung phim chính?
2. Dự đoán tác động của hai lời gọi credits/similar trong `Promise.all` của starter.
3. Hai Suspense vẫn tồn tại: vì sao chúng chưa giúp nội dung chính đến sớm?

## 3. Starter và bản sửa

| Mục | Kết quả |
| --- | --- |
| Lệnh kiểm tra trước sửa | |
| Exit code và nguyên văn lỗi streaming | |
| Build/typecheck/route đã đạt trước lỗi này chưa | |
| Diff sửa trang phim | |
| Lý do bỏ hai lời gọi chờ dữ liệu phụ | |
| Đã build/start lại sau khi sửa chưa | |
| Lệnh sau sửa, exit code, ID mới được dùng | |

Ghi thời điểm/chunk từ **cùng một lượt** `streaming-mock.json`:

| Marker | Nhận sau (ms) | Chunk |
| --- | --- | --- |
| `main` | | |
| `cast_fallback` | | |
| `similar_fallback` | | |
| `cast_result` | | |
| `similar_result` | | |

Tính khoảng cách từ `main` đến mỗi kết quả phụ. Giải thích vì sao số chunk riêng lẻ chưa đủ chứng minh streaming.

## 4. Data Cache

ID dùng chung trong phép đo: __________. TTL: __________ giây.

| Endpoint | Before | Miss | Hit | Sau refresh | Warm hit |
| --- | --- | --- | --- | --- | --- |
| `/movie/<id>` | | | | | |
| `/movie/<id>/videos` | | | | | |
| `/movie/<id>/credits` | | | | | |
| `/movie/<id>/similar` | | | | | |

| Nội dung | Quan sát |
| --- | --- |
| Tagline trước refresh | |
| Tagline sau refresh hoàn tất | |
| Bằng chứng `END`/response đã hoàn tất | |

1. Request đầu sau TTL có bắt buộc trả nội dung mới không? Giải thích refresh nền.
2. Counter tăng ở `START` hay `END`? Vì sao phải phân biệt?
3. Phân biệt request memoization, Data Cache và cache trình duyệt. `AbortSignal` ảnh hưởng gì trong helper hiện tại?
4. Vì sao route này được mô tả là SSR kết hợp Data Cache?

## 5. Danh sách bàn giao

- [ ] Phiếu đã điền và diff bản sửa.
- [ ] Log/ảnh lỗi starter thuộc streaming, có exit code.
- [ ] Solution có `mock-runtime.json` với `status=passed`.
- [ ] `streaming-mock.json`, `cache-mock.json` và log lint/test/build/typecheck cùng lượt.
- [ ] Các artifact của mỗi lượt khớp `run_id` và `source_sha256`; starter/solution được tách riêng.
- [ ] Khai rõ dùng mock, môi trường, phần tự làm và phần có AI hỗ trợ nếu có.
- [ ] Không đưa khóa API thật, giá trị cookie hoặc `.env.local` vào bài nộp.

Tiêu chí chấm: boundary/bảo vệ khóa **2 điểm**, sửa và chứng minh streaming **3 điểm**, cache và nội dung trước/sau **3 điểm**, giải thích/giới hạn phép đo **2 điểm**.
