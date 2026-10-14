# PhysicsLab 1.8 — Interactive Science Studio (Preview)

## Phạm vi bàn giao (kế thừa nguyên dự án 1.7)

1. **Khám phá 3D:** refactor chế độ Ném xiên sang viewport fit trực giao tự thích ứng theo camera. Không gian vật lý sử dụng đơn vị SI; chiếu 2D không được tính ngược để làm số đo. Bổ sung mặt phẳng tham chiếu, đường trục, vectơ vận tốc tức thời đúng phương tiếp tuyến, đồng hồ thời gian/vị trí/tốc độ và camera thao tác pointer neo theo vị trí ban đầu. Phần quỹ đạo xoắn ốc kế thừa helix-fit sẵn có.
2. **Công cụ:** bổ sung bàn tương tác **Thước thời gian và quỹ đạo** có quỹ đạo, 2 đồ thị thời gian, điều khiển trực tiếp, 3 tình huống vật lý, play/pause, bàn phím, điều khiển trên mobile và CSV. Kết quả lấy từ `createProjectile`, không đọc từ vị trí điểm ảnh.
3. **Virtual Lab Quang học:** scale vẽ giữ cố định giữa các frame kéo, tránh vòng lặp auto-fit làm nhảy vị trí vật, màn và tia sáng. Giữ chính xác khoảng cách vật/ảnh và định luật thấu kính. Các trường hợp thiết bị ngoài khung vẫn có thể xảy ra khi người dùng nhập khoảng cách vật rất lớn, do giới hạn vùng nhìn; cần cải thiện công cụ zoom/vừa khung ở các bản sau.
4. **Bảo toàn nền tảng cũ:** giữ chức năng 13 mô phỏng, Learning, chế độ giáo viên, công cụ cũ, mạch điện R2, Hooke R3, Virtual Lab 1.6 và localStorage. Không chỉnh/sửa tên khóa tiến độ.

## Kiểm thử thực tế

- `npm run check:core`: PASS 185/185 tests. Node scripts/check.mjs: cú pháp/relative imports/named exports/lazy registry PASS.
- Thêm 4 trường hợp test mới: (1) camera không cắt đường ném với nhiều góc và điều kiện đầu, (2) quan hệ thời gian/động năng/trọng năng, (3) kiểm tra input camera invalid, (4) camera quang học không thay tỉ lệ khi thay khoảng cách vật.
- Chromium desktop 1440px và mobile 390px: chạy ứng dụng qua in-memory ES module import map khi môi trường không có Vite; thao tác bảng đo, play/pause, presets, đổi mô hình 3D, xoay bằng chuột, đổi lại helix 90°, kéo vật của bàn thấu kính. Console pageerror = 0 trong các luồng đã thử.
- **Chưa xác minh `vite build`** (thiếu package Vite có thể thực thi tại môi trường hiện tại). `npm run check` gồm Vite build cần chạy trên Windows. Smoke test import-map **không thay thế** production build hoặc full Playwright suite của dự án.

## Nguyên tắc chất lượng cho những bản sau

- Mọi `pointerdown` lưu hệ quy chiếu, pointermove cập nhật từ hệ quy chiếu gốc; pointerup/cancel/lostpointercapture phải dọn trạng thái.
- Viewport là phép biến đổi *hiển thị*, không đưa pixel vào phương trình Vật lý.
- Không auto-fit camera dựa trên một biến đổi liên tục trong khi đang kéo dụng cụ.
- Nhãn nổi cần được kiểm thử sát các đối tượng ở góc nhìn và mobile.
- Ở mỗi bản: Node/check, kiểm thử Vật lý, kiểm thử thao tác, responsive, Vite production build; không gắn Stable nếu chưa đủ.

## Checklist trên VS Code (thực hiện trước khi deploy)

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check
npm run dev -- --port 5188
# Terminal khác
npm run check:browser
```

Thử thêm bằng tay: Công cụ > Thước thời gian, chuyển Trái Đất/Ném ngang/Mặt Trăng và chạm lên hai đồ thị; 3D > Ném xiên và xoay các góc nhìn, vừa khung, thử góc 90°, sau đó 3D > Hạt trong từ trường, chọn 0°/45°/90°; Lab > Thấu kính kéo vật/màn; Mạch điện và Hooke không hồi quy.

**Giới hạn phát triển:** 1.8 không remake sâu toàn bộ 13 mô phỏng hoặc mọi thí nghiệm từ đầu. Trọng tâm hoàn thiện 3D, Công cụ, sửa kéo và chống hồi quy. Các chức năng có sẵn kế thừa 1.7 giữ nguyên.
