# Hệ thống giao diện MovieHub

[DESIGN.md](./DESIGN.md) là đặc tả chính thức cho token, bố cục và hợp đồng component. Tài liệu này là bản tham chiếu tiếng Việt; khi có khác biệt, thực hiện theo `DESIGN.md`.

- Nền chính `#141414`, màu thương hiệu `#E50914`, chữ chính `#FFFFFF`.
- Header trong suốt ở đầu trang, chuyển mượt sang nền `#141414` khi cuộn.
- Giữ nguyên các biến thể nút, MovieCard tỷ lệ `2/3`, MovieRow cuộn ngang và các badge theo đặc tả chính.
- Dùng Server Components mặc định; các nút tương tác là Client Components nhỏ.
- Khóa TMDB chỉ ở server. `next.revalidate` điều khiển Data Cache; không suy ra mọi route đều có ISR.
- Dùng `next/image` với kích thước hoặc khung tỷ lệ cố định để hạn chế dịch chuyển bố cục. CLS thực tế cần được đo bằng trình duyệt.
- Watchlist lưu cookie qua Server Action, giới hạn 200 ID và 3800 byte sau khi mã hóa giá trị cookie. Thông báo lỗi phải hiển thị bằng `role="alert"`; nút biểu thị trạng thái bằng `aria-pressed`.
- Các thuộc tính `data-stream` và `data-movie-id` hỗ trợ kiểm tra HTML streaming, không thay đổi giao diện.
