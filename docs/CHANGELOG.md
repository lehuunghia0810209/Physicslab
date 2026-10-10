## 1.0.0-rc.2 — Sửa theo báo cáo trải nghiệm giáo viên (10/10/2026)

- Sửa 3D Helix không thấy hạt và đường xoắn: chiếu quỹ đạo thật theo khung nhìn tự động, hiển thị 1,5 vòng, vẽ hạt sau các lớp, bổ sung nút “Vừa khung”. Không thay đổi phương trình Lorentz.
- Thêm tìm kiếm tiếng Việt không dấu, lọc lớp 10/11/12 và chủ đề cho 16 bài học.
- Thêm checklist thử nghiệm và khóa nút xác nhận cho đến khi ghi nhận có dự đoán, mở mô phỏng và tương tác thật.
- Thêm chế độ trình chiếu giáo viên, tùy chọn giao diện HS/GV được lưu cục bộ, xuất/nhập bản sao tiến độ JSON (nhập cần xác nhận và thay thế dữ liệu cũ).
- Tăng vùng bấm “Tìm nhanh” tối thiểu 44px trên thiết bị hẹp.
- Sửa bộ chọn Playwright trùng liên kết Explorer3D, thêm kiểm tra pixel canvas màu hạt/quỹ đạo và quy trình Learning mới.
- Bổ sung 9 bài unit tests (99 PASS), kiểm tra cú pháp/import và CSS; Vite build và Playwright trình duyệt vẫn cần xác nhận tại máy có đủ môi trường.

# CHANGELOG

## 1.0.0-rc.1 — 10/10/2026

### Trải nghiệm / UI
- Nâng cấp design tokens sáng/tối, typography, độ tương phản, kích thước điều khiển, spacing và hiển thị desktop/mobile.
- Thêm chuyển động giao diện có chủ đích và chế độ `prefers-reduced-motion`.
- Bổ sung thanh tìm kiếm nhanh `Ctrl/Cmd+K`, tìm trang và mô phỏng bằng tiếng Việt không dấu.
- Bổ sung menu Khám phá 3D; tự lấy số mô phỏng sẵn sàng từ Registry.
- Sửa Home hiển thị đúng tiến độ của toàn bộ 16 bài, ưu tiên tiếp tục bài chưa học xong, không chỉ bài ném xiên.

### Khoa học / tính năng
- Sửa cơ chế công–động năng với thời gian dừng vật lý (không ép thời gian tối thiểu), phản lực khi lực kéo hợp góc, ma sát và kiểm thử các trường hợp biên.
- Bổ sung `Electric Field`: hai điện tích điểm di chuyển được, đầu dò x/y, trường vector, điện thế từ nguyên lý chồng chất Coulomb, trạng thái được lưu.
- Nâng cấp 3D Explorer: tốc độ, dấu điện tích, B, khối lượng, phát/tạm dừng/đặt lại quỹ đạo, tối ưu cập nhật Canvas.
- Sửa Lab Hooke: lưu ID lò xo theo phép đo, tránh gộp đồ thị nhiều lò xo, hồi quy độ cứng từ dữ liệu đo; CSV có mã lò xo, vẫn giữ bản ghi legacy không rõ nguồn.
- Bổ sung bài học Điện trường; sửa nội dung Phòng thí nghiệm cho đúng tính độc lập của PhysicsLab.

### Chất lượng
- Thêm unit tests cho Điện trường, quỹ đạo xoắn ốc, phân tích Hooke, thống kê Home, dữ liệu nội dung và regression cho công–động năng.
- Sửa tests phụ thuộc số lượng mô phỏng/bài học cũ; browser script giờ lấy số mô phỏng từ Registry và thêm checks cho quick search/điện trường.
- `npm run check:core`: **90/90 PASS**; CSS parse: **0 lỗi**; imports và syntax PASS.
- Vite build/browser runtime **chưa thể chạy độc lập** vì môi trường không có dependency Vite đang dùng; cần chạy nghiệm thu trên Windows trước khi gỡ RC.

## 0.8.0-dev.1 — từ bản bàn giao trước
- Sửa chọn lực kế Hooke, cân bằng dấu phẩy động và vệ sinh dữ liệu thí nghiệm.
- Sửa thống kê Home/Library dựa vào Registry, bổ sung regression tests.
