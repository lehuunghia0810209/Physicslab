# Learning 3.0 — UI/UX QA

## Thiết kế đã triển khai

- Lesson Reader ưu tiên nội dung đọc, không dùng bố cục dashboard doanh nghiệp: mục lục ngắn, công thức lớn, ví dụ trong `details`, thực nghiệm nổi bật và một cột trên mobile.
- Trạng thái nội dung minh bạch: `Bài Learning 3.0 hoàn chỉnh`, `Có học liệu khám phá`, `Chưa có bài học hoàn chỉnh`.
- Deep-link bài học hỗ trợ reload và điều hướng trình duyệt.
- Hai chế độ Luyện tập/Kiểm tra có phản hồi khác nhau; câu sai có thể lọc để luyện lại.
- Nút, select và link hành động có chiều cao tối thiểu 44 CSS px; focus dùng token hiện có; không phụ thuộc hover.
- Công thức có vùng cuộn riêng khi hẹp; bảng và điều khiển Lab không làm tràn ngang toàn trang.
- Light/Dark dùng design tokens hiện có; không thêm dependency hoặc font mạng.

## Browser coverage tự động

`npm run check:release` **PASS ngày 2026-10-14** cho các luồng dưới đây.

- Deep-link `#/learning/newton-discovery`.
- Hiển thị 2 ví dụ và 5 câu hỏi.
- Chấm một câu sai, lưu danh sách ôn lại và ghi chú sau reload.
- Bộ lọc lớp/tìm kiếm bài cũ vẫn hoạt động.
- Lab đổi lớp 10/11/12, reset tìm kiếm và Hooke dùng chung nhiều lớp.
- Reader-only lesson không có tài nguyên vẫn reload đúng và hiển thị hoạt động không màn hình, không sinh liên kết `null`.
- Revision Home tạo đề 10 câu không trùng, mặc định chế độ kiểm tra, lưu/khôi phục điểm và đổi lớp 10/11/12.
- Toàn route được kiểm tra ở 320/360/390/768/1024/1440/1920 px về tràn ngang và target 44 px.

## Chưa kiểm chứng thủ công

- Screen reader NVDA/VoiceOver, Firefox, Safari và thiết bị cảm ứng thật.
- Usability test với học sinh THPT và giáo viên.
- Nội dung MathML hoặc công thức phức tạp hơn chưa được hỗ trợ riêng; công thức hiện dùng văn bản có vùng cuộn trên màn hình hẹp.
- Reduced-motion đã kế thừa toàn app nhưng chưa có phiên nghiệm thu riêng cho Learning Reader.

## Checkpoint Learning 3.0 — tiếp tục 2026-10-14 (mới)

- Lesson Reader lớp 11–12 không còn đặt 16 thẻ catalog trước đầu bài: nội dung ưu tiên xuất hiện trên cùng, có đường dẫn về chương trình, Ôn tập và Bài trước/tiếp theo theo thứ tự chương trình.
- Mục lục bài dùng nút cuộn trong trang để tránh ghi đè `location.hash` của SPA. Các nút có chiều cao tối thiểu 44px, hỗ trợ keyboard focus theo CSS hiện có.
- Các trạm thí nghiệm nâng cao liên kết trực tiếp tới route thật; các chủ đề chưa có thiết bị dùng hoạt động trên giấy.
- Bộ kiểm thử Playwright đã bổ sung các tình huống này **nhưng chưa chạy được trong môi trường đóng gói**. Cần chạy `npm run check:release` trên Windows và kiểm tra Firefox/cảm ứng thật trước Stable.
