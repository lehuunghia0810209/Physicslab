# PhysicsLab 1.0 — Release Candidate 2

**PhysicsLab** là một website Vật lý tương tác, **độc lập**, bằng **tiếng Việt** dành cho học sinh THPT. Triết lý: **“Không chỉ đọc Vật lý — hãy nhìn thấy và tương tác với nó.”**

> **Trạng thái mã nguồn: `1.0.0-rc.2` (release candidate, chưa phải bản 1.0 đã nghiệm thu).** Đã qua kiểm tra mã nguồn + 99 unit tests trong môi trường hiện tại. Việc dựng Vite và kiểm thử trình duyệt thực tế cần xác nhận trên máy có đủ npm dependencies. Xem [báo cáo thử nghiệm](docs/TEST_REPORT.md).

## Chạy trên Windows 11

Yêu cầu **Node.js >= 22.12**, npm, trình duyệt Chromium hoặc Edge, và kết nối để cài dependency lần đầu. Mở terminal tại thư mục mã nguồn:

```powershell
npm ci
npm run dev
```

Mở đường dẫn Vite đưa ra, mặc định `http://127.0.0.1:5173/`.

Nếu project đặt trong OneDrive và gặp `EPERM` với file native `.node`, hãy tắt tiến trình Vite/Node đang dùng file, tạm dừng đồng bộ OneDrive rồi cài lại; lý tưởng nhất chạy project ngoài OneDrive. **Không xóa mã nguồn hoặc dữ liệu học tập.**

## Nghiệm thu trước khi sử dụng chính thức

```powershell
npm run check:core
npm run check
npm run build
```

Kiểm tra browser (dùng terminal riêng):

```powershell
npm run dev -- --port 5188
```

Sau đó terminal thứ hai:

```powershell
npx playwright install chromium
npm run check:browser
```

`npm run check` gồm syntax/import tests, Node unit tests và Vite production build. `check:browser` có thể dùng biến môi trường `PHYSICSLAB_TEST_URL` để trỏ đến server khác. Các hình chụp và báo cáo nằm trong thư mục `work/` trên máy bạn.

## Tính năng

- **Tổng quan:** hoạt động gần đây, học tiếp bài chưa hoàn thành, tiến độ thực lấy từ toàn bộ danh sách bài học và Registry.
- **Thư viện:** 13 mô phỏng có thể mở, tìm tiếng Việt không dấu, phân loại chương trình và lớp. Mỗi mô phỏng tải động khi người dùng mở.
- **Cơ học:** ném xiên, Newton, mặt phẳng nghiêng, ma sát, công–động năng, va chạm, dao động.
- **Sóng:** sóng truyền/sóng dừng/giao thoa trên dây.
- **Điện học:** mạch Ohm nối tiếp/song song; điện trường và điện thế của điện tích điểm với hai điện tích kéo thả, đầu dò, vector, phép tính Coulomb.
- **Từ–Quang–Nhiệt:** Lorentz/cảm ứng, thấu kính mỏng, khí lí tưởng.
- **Learning:** 16 bài học tương tác theo lớp 10–12; có tìm/lọc theo lớp và chủ đề, checklist điều kiện thử nghiệm trước khi xác nhận, quiz/tiến độ.
- **Virtual Lab:** Hooke với dụng cụ có độ chia, ghi số liệu theo từng lò xo, đồ thị và hồi quy từ phép đo; 15 cấu hình thực nghiệm chung, phép đo, bảng dữ liệu, CSV/báo cáo.
- **3D Explorer:** tự căn khung quỹ đạo xoắn Lorentz (có nút “Vừa khung”) và hai mô hình phép chiếu 3D Canvas (xoắn ốc Lorentz, ném xiên), xoay/zoom/phát/tạm dừng/đặt lại; không cần WebGL.
- **Công cụ:** chuyển đổi đơn vị, phân tích phép đo và công thức Vật lý.
- **Điều hướng nhanh:** `Ctrl+K` / `Cmd+K` hoặc nút “Tìm nhanh”.
- **Giao diện:** light/dark, chế độ HS/GV (chỉ tùy chọn giao diện), trình chiếu cho giáo viên, đồng nhất typography/spacing, điều khiển chạm tối thiểu 44px, responsive và hỗ trợ giảm chuyển động.
- **Dữ liệu:** hỗ trợ xuất/nhập tiến độ cục bộ qua JSON trên desktop. Trước khi nhập dữ liệu nên xuất bản sao, vì nhập sẽ thay thế tiến độ của trình duyệt hiện tại. Không có tài khoản hay đồng bộ trực tuyến.

Tính toán sử dụng SI và mô hình có giả định rõ. Các đồ thị/vật thể dùng kết quả vật lý chứ không dùng số ngẫu nhiên nhằm giả lập đúng.

## Kỹ thuật

Vite, Vanilla JavaScript, ES Modules, CSS, Canvas/SVG, Node test runner, Playwright. Không sử dụng React, backend, tài khoản, monorepo hoặc tích hợp EduLab/ChemLab/MathLab. Tiến độ người học được lưu trong `localStorage` **trên thiết bị** và có kiểm tra dữ liệu đầu vào khi phục hồi.

## Tài liệu

- [Lịch sử thay đổi](docs/CHANGELOG.md)
- [Trạng thái và phạm vi kiểm chứng](docs/DEVELOPMENT_STATUS.md)
- [Báo cáo kiểm thử / giới hạn](docs/TEST_REPORT.md)
- [Hướng dẫn kiến trúc](docs/ARCHITECTURE.md)

> **Bảo toàn tiến độ:** hãy sao lưu thư mục hiện tại trước khi thay nguồn. Thay mã nguồn không tự động xóa `localStorage` trong trình duyệt; đừng xóa dữ liệu website nếu muốn giữ điểm quiz/phiên học. Không đặt `node_modules/` của bản cũ vào ZIP mã nguồn mới.
