1. Chuyển từ bổ sung từng chương sang hoàn chỉnh một báo cáo thống nhất
Một số bài có chương kỹ thuật rất dài nhưng phần thiết kế, tích hợp, đánh giá và tổng kết vẫn còn mỏng hoặc chỉ có tiêu đề. Có bài vẫn mang hình thức nhật ký cập nhật, tập hợp các bài thực hành hoặc trả lời từng góp ý.
Bản nộp cuối cần giúp người đọc hiểu được:
Nhóm giải quyết bài toán gì → chọn công nghệ vì sao → triển khai thế nào → đã kiểm chứng được gì → còn giới hạn nào.
Các bài thực hành riêng vẫn có giá trị, nhưng cần phân biệt với phần đã ứng dụng vào sản phẩm. Lịch sử sửa đổi dài nên đưa vào phụ lục; phần chính trình bày hệ thống và kết quả cuối.
2. Làm chắc một luồng nghiệp vụ từ đầu đến cuối
Các nhóm đã có nhiều thành phần riêng lẻ nên ưu tiên nối chúng thành một luồng hoàn chỉnh, có đầu vào, xử lý, dữ liệu lưu và kết quả người dùng nhận được.
Chọn thêm tình huống lỗi phù hợp với chính luồng đó, chẳng hạn:
Người A đọc hoặc sửa dữ liệu của người B.
Hai yêu cầu tranh cùng tài nguyên hoặc cùng cập nhật dữ liệu.
Gửi lại yêu cầu sau lỗi, nhận sự kiện trùng.
Một bước thất bại sau khi bước trước đã ghi dữ liệu.
Cache hết hạn, dữ liệu thay đổi hoặc tiến trình khởi động lại.
Không cần làm tất cả tình huống cho mọi đề tài. Ưu tiên những trường hợp ảnh hưởng trực tiếp đến tính đúng đắn của sản phẩm.
3. Gắn kết quả với đúng mã nguồn, dữ liệu và lần chạy
Tuần này, vấn đề ở nhiều bài không còn đơn thuần là thiếu minh chứng, mà là có nhiều minh chứng nhưng chưa rõ chúng thuộc phiên bản nào.
Các nhóm cần làm rõ:
Kết quả thuộc commit hoặc bản mã nguồn nào.
Chạy trên môi trường, cơ sở dữ liệu và cấu hình nào.
Là test đơn vị, test tích hợp, thao tác thủ công hay phép đo hiệu năng.
Thành phần nào dùng thật, thành phần nào được mock hoặc dùng fixture.
Số liệu nào là lịch sử, số liệu nào đại diện cho bản bàn giao.
Không cộng các bộ test chồng nhau, lấy số lớn nhất làm đại diện hoặc sửa mọi kết quả cũ thành cùng một con số. Build thành công, container khởi động và workflow đã cấu hình cũng cần được phân biệt với chức năng đã chạy đúng hoặc CI đã chạy đạt.
4. Thống nhất mô tả với hiện trạng sản phẩm
Một số báo cáo còn đặt cạnh nhau thiết kế cũ và mã mới: khác schema, route, thư viện, cách xác thực, nơi lưu dữ liệu hoặc cấu hình cache. Có phần đã sửa nhưng kết luận vẫn ghi “chưa làm”; ngược lại, có phần mới thiết kế nhưng bảng tổng kết đã ghi “hoàn thành”.
Các nhóm cần đối chiếu:
Mục tiêu/phạm vi ↔ thiết kế ↔ mã nguồn ↔ kết quả ↔ bảng phủ ↔ tổng kết.
Nếu giữ phương án cũ để giải thích quá trình lựa chọn, hãy ghi rõ đó là phương án ban đầu. Các phiên bản mới cần được kiểm tra bằng tài liệu chính thức và cấu hình thực tế; không kết luận sai chỉ vì số phiên bản khác tài liệu cũ.
5. Diễn giải số đo và chất lượng trong đúng phạm vi
Một phép đo trên máy cá nhân, một endpoint hoặc một bộ dữ liệu nhỏ vẫn có ích nếu trình bày rõ cách thực hiện và giới hạn.Cần phân biệt:
Số truy vấn với thời gian phản hồi.
Số lần render với thời gian xử lý giao diện.
Thời gian một thành phần với thời gian toàn luồng.
Kết quả trên dữ liệu dùng chỉnh cấu hình với kết quả trên tập kiểm tra độc lập.
Hoàn tất kỹ thuật với đúng nghiệp vụ hoặc đúng nội dung.
Với đề tài AI, HTTP 200, JSON hợp lệ hoặc có trích dẫn chưa đủ chứng minh câu trả lời đúng. Cần kiểm tra nguồn, nội dung, trường hợp thiếu dữ liệu và các ca từ chối. Nhãn do AI chấm cũng cần được nhóm đối chiếu, không tự coi là đáp án chuẩn độc lập.
Khi chưa giải thích được số liệu chênh lệch, hãy truy lại dữ liệu và lần chạy; không chọn số thuận lợi hoặc dùng các từ “tuyệt đối”, “triệt để”, “100% chất lượng” vượt quá minh chứng.
6. Hoàn thiện hồ sơ để người khác có thể chạy và kiểm tra lại
Trước khi nộp, cần rà:
Hướng dẫn cài đặt, phiên bản, dependency, biến môi trường và lệnh chạy.
Migration/schema, dữ liệu mẫu hoặc model/index cần thiết theo đề tài.
Bảng phủ trỏ đúng file, commit, minh chứng và trạng thái.
Hands-on lab có mục tiêu, starter, bước làm, bài tập và đáp án phù hợp. Lab đã có thì hoàn thiện và gửi kèm.
Nhật ký, đóng góp thành viên và AI Disclosure phản ánh đúng thực tế.
Bìa, mục lục, hình/bảng, tham chiếu, nguồn tài liệu và các placeholder còn sót.
Các thành viên cần hiểu, giải thích chỉnh sửa được phần mã nhóm mình thực hiện. Nếu chưa có đủ tình huống AI trả lời sai thực tế, hãy khai rõ; không tạo lỗi hoặc minh chứng để đủ số lượng.