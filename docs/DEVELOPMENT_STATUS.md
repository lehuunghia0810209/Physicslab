# PhysicsLab 1.0.0-rc.2 — Trạng thái hiện tại

- Đã sửa Helix autofit và thêm camera reset, thêm lesson filters/checklist, vai trò GV+trình chiếu, nhập/xuất dữ liệu tiến độ, sửa selector và thêm kiểm thử pixel canvas.
- Unit tests: **99/99 PASS**; JS syntax/import: PASS; CSS parse: PASS.
- Browser verification: **CHƯA XÁC MINH** tại sandbox bị chặn điều hướng localhost. Cần chạy `npm run check:browser` trên máy Windows.
- Production build: **CHƯA XÁC MINH** trong sandbox do Vite không có sẵn ngoại tuyến. Cần chạy `npm run build` trên máy Windows.
- Bản này là RC2, chưa gắn nhãn 1.0 Stable. Không có backend, tài khoản, đồng bộ trực tuyến hay quản lý lớp.
- Không xóa localStorage; thay file nguồn không tự làm mất dữ liệu tiến độ. Nếu dùng nhập JSON, phần mềm yêu cầu xác nhận vì dữ liệu hiện tại sẽ bị thay thế.

# Tình trạng PhysicsLab

**Phiên bản nguồn:** `1.0.0-rc.1`
**Phạm vi:** Nâng cấp từ `PhysicsLab_0.8_dev1_stability_source.zip` theo yêu cầu của chủ dự án.
**Tình trạng:** **BẢN ỨNG VIÊN PHÁT HÀNH**, không phải bản 1.0 stable đã được kiểm thử đầy đủ trên trình duyệt thật.

## Đã triển khai

- UI/UX thống nhất, tăng khả năng đọc và thao tác, hiệu ứng hợp lý, light/dark, điều hướng nhanh, menu 3D, mobile responsive styles.
- Home/Learning: thống kê theo danh sách bài học thực (16), tiếp tục bài chưa hoàn thành.
- Mô hình công–động năng: sửa thời gian dừng và phản lực/ma sát dưới lực kéo hợp góc; có tests mới.
- 3D Explorer: mô hình xoắn ốc dựa trên dấu điện tích, phát/tạm dừng/đặt lại, controls và xử lý cleanup.
- Virtual Lab Hooke: phân tách lò xo trong đồ thị và hồi quy; lưu springId và xuất CSV có ID.
- Electric Field: hai điện tích kéo được, đầu dò, chồng chất Coulomb, điện thế, session persistence, bài học mới.
- Registry: 13 simulation sẵn sàng và curriculum 16 bài; test và mô tả được đồng bộ.

## Kiểm thử

| Hạng mục | Kết quả ở môi trường này |
| --- | --- |
| `npm run check:core` | **PASS**, 90/90 tests |
| JS syntax/import/lazy Registry | **PASS**, chi tiết trong console |
| CSS parsing | **PASS**, không có parser error |
| `npm run build` | **CHƯA XÁC MINH**, `vite: not found` (không cài được dependency trong môi trường ngoại tuyến) |
| `npm run check:browser` | **CHƯA XÁC MINH** cho bản này; Chromium môi trường phân tích bị giới hạn điều hướng local |
| 3D, mobile/contrast sau thay đổi UI | **CHƯA NGHIỆM THU TRÌNH DUYỆT THỰC TẾ** |

## Cần nghiệm thu trên máy người dùng

1. `npm ci` (sau khi đóng Vite/Node/OneDrive nếu bị khóa `.node`);
2. `npm run check` (có build);
3. Terminal 1: `npm run dev -- --port 5188`; Terminal 2: `npm run check:browser`;
4. Thử trực tiếp light/dark ở Home, Library, Learning, Lab, Tools, Explorer3D;
5. Kiểm tra Electric Field: thay q₁/q₂, kéo điện tích, kéo đầu dò, làm mới trang và kiểm tra phiên lưu;
6. Kiểm tra Hooke: hai lò xo khác nhau, phép đo riêng, CSV, tính k đo và R²;
7. Kiểm tra touch/mobile tại 320/360/390/768/1024/1440px và console errors.

**Chỉ nâng nhãn thành `1.0.0` stable sau khi build và browser tests PASS, UI kiểm tra thực tế và không còn lỗi nghiêm trọng.**
