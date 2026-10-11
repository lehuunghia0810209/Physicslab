## 1.2.1-beta.1 — Interactive Experience (PhET-inspired)

- Cảnh khí lí tưởng có phân tử minh họa chuyển động và phản xạ; piston điều khiển qua ánh xạ logarit có thể đảo.
- Bàn mạch điện hiển thị nối tiếp/song song riêng, chuyển topology trực tiếp, điểm dòng điện quy ước và điện trở điều khiển bằng chuột/phím.
- Danh mục 16 bàn thí nghiệm, sơ đồ theo thí nghiệm và điểm kéo trên sơ đồ; bảo toàn số đo, hiệu chuẩn và các thiết bị đo trước đây.
- 3D Explorer cải thiện căn khung bảng điều khiển, nhãn và số liệu dễ đọc hơn ở màn hẹp.
- 5 bài unit tests bổ sung cho hình minh họa khí/piston và lab; tổng 127 bài PASS.

## 1.2.0 — Interactive Science Experience (2026-10-11)

- Gộp β2 + RC thành một đợt nâng cấp phát hành 1.2, kế thừa mọi nội dung của β1 UX Rework.
- Hướng dẫn thực hành ba bước riêng cho 13 mô phỏng, tích hợp tương tự tại bước thử nghiệm trong 16 bài học liên quan.
- Công cụ đồ thị toàn hệ thống: phóng/thu/vừa khung trục ngang, giới hạn clip, đọc từng mẫu bằng chuột/bàn phím, CSV có BOM UTF-8. Không sửa kết quả tính toán Vật lý.
- Lab Hooke: mô phỏng lệch điểm 0 xác định trước, bật/tắt bù lệch; bổ sung u(k) từ truyền độ không đảm bảo chuẩn (phân bố đều độc lập trong ±½ độ chia F, Δx); sao lưu cấu hình trong schema tiến độ v1. Lệnh Đặt lại cấu hình không còn xóa phép đo.
- 3D Explorer: camera presets, tùy chọn vectơ, giữ phép chiếu và mô hình khoa học gốc.
- Bổ sung kiểm tra liên kết named exports, regression tests, kiểm thử trình duyệt các tính năng mới; chỉnh sửa UI/CSS responsive và giảm chuyển động.
- Kiểm thử lõi và kiểm tra cú pháp đã thực thi trong môi trường này. **Vite build, browser tests và thiết bị thật cần chạy trên Windows trước khi chốt Stable/deploy.**

## 1.2.0-beta.1-ux.1 — Simulation Experience Rework

- Sửa SVG GraphRenderer path không có fill:none ở những route không tải projectile.css.
- Sửa bảng phương trình ở Hero bằng overlay HTML responsive.
- Nâng ngôn ngữ thiết kế chung của chart, workbench, dark-mode và thiết bị di động.
- Kéo mũi tên ném, lực và vật theo model thật; tương tác trực tiếp tại Inclined, Waves, Circuits, Magnetic, Optics, Thermal, Lab Hooke.
- Sửa tỉ lệ chuyển động khối Cơ học, đầu dò sóng x=λ/4 và piston chiều nén.
- Thêm domain/regression tests, cập nhật check:browser cho lỗi mảng đen.
- 116 unit tests PASS; Vite/Playwright chưa xác minh do thiếu dependency Linux và trình duyệt.

## 1.2.0-beta.1 (Build Fix — 10/10/2026)

- Khôi phục `updateNavigation(route, label)` trong `src/app/shell.js` để router có thể import và Vite không còn vướng `MISSING_EXPORT` cho hàm này.
- Giữ nguyên thanh điều hướng 6 mục, nhãn active, breadcrumb, `aria-current`, số mô phỏng tự tính theo Registry và phiên bản ứng dụng.
- Không đưa lại hai nút xuất/nhập dữ liệu lên topbar; các tiện ích vẫn nằm trong trang Công cụ.
- Thêm `tests/shell-navigation.test.js` với hai bài kiểm thử hồi quy cho cấu trúc shell và trạng thái điều hướng.
- `npm run check:core`: 111/111 PASS tại môi trường bàn giao. Vite/Playwright cần kiểm chứng trên máy có đủ dependency.

## 1.2.0-beta.1 — Balanced / Simulation UI refresh & workflow polish

- Sửa thẻ công thức ở hero dashboard: bố cục SVG ổn định hơn, không bị chật/cắt nội dung như trước.
- Làm mới toàn bộ phần minh họa thẻ mô phỏng bằng SVG theo từng chủ đề/mô phỏng; dark mode tăng tương phản, badge “Sẵn sàng khám phá” dễ đọc hơn.
- Bỏ 2 nút xuất/nhập dữ liệu khỏi topbar để giao diện gọn hơn; chức năng **không mất** mà được chuyển sang trang Công cụ với khu vực sao lưu/khôi phục rõ ràng hơn.
- Mở rộng trang Công cụ: thêm quản lý sao lưu dữ liệu và điều khiển nhanh cho chế độ giáo viên / trình chiếu.
- Giữ nguyên toàn bộ chức năng đang có của 1.2 Alpha 1 và 1.0 RC2. `npm run check:core`: **109/109 PASS**. `npm run build` chưa xác minh trong môi trường bàn giao do thiếu vite trong node_modules/cache.

## 1.2.0-alpha.1 — Balanced / Graph & Classroom Interaction

- Biểu đồ mô phỏng: thanh inspect dữ liệu bằng chuột hoặc phím trái/phải, Escape đóng, hỗ trợ aria; không thay đổi con trỏ timeline.
- Graph engine có đường tham chiếu nét đứt và miền vẽ tự vừa cả hai lượt chạy, xử lý dữ liệu không hữu hạn an toàn.
- Projectile Motion: lưu một lần ném làm mốc, so sánh trên scene SVG và 4 đồ thị, hiển thị ΔR, ΔH, ΔT. Không thay đổi công thức ném xiên.
- Cấu hình bài giảng: tạo link chia sẻ 4 tham số ném xiên, kiểm tra lại dữ liệu URL trước khi áp dụng; không chia sẻ tiến độ người dùng.
- UI/UX: cải thiện khoảng trống, kích thước đồ thị và chú giải; bổ sung token `--surface-alt` cho light/dark, tối ưu trên mobile.
- Thêm regression tests cho graph, so sánh, link chia sẻ; tổng **109/109 PASS** ở `npm run check:core`. Cập nhật browser checks cho tính năng mới (cần chạy trên máy có Vite/Playwright).
- Build/browser **chưa xác minh tại môi trường tạo bản bàn giao** vì thiếu dependency Vite offline và trình duyệt bị hạn chế điều hướng.

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
