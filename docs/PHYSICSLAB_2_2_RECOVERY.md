# PhysicsLab 2.2.0-dev — Recovery checkpoint (2026-10-13)

## Nguồn gốc

Khôi phục và sửa trên `physicslab(1).zip` do người dùng gửi, không quay lại baseline 2.1. Giữ nguyên Experiment Store, Run Manager, Compare Runs, Student Notebook, 3D Explorer, 13 mô phỏng, 15 bàn thí nghiệm, PWA và `physicslab.progress.v1`.

## Sửa lỗi

1. **3D trajectory ruler:** `createHelix().at(t)` trả `time`, trong khi quỹ đạo Ném xiên dùng `t`. `normalizeTrajectoryPoint()` quy về thuộc tính `t` để điểm chọn từ quỹ đạo, hai mốc A/B, số đo Δt và điều khiển Timeline nhất quán; hàm không sửa đối tượng model ban đầu. Hàm đo tiếp tục tính **khoảng cách thẳng Euclid trong hệ SI**, không nhầm với độ dài dọc quỹ đạo. Mốc từ model Helix cũng được chuẩn hóa trước khi hiển thị.
2. **Script quét import:** trước đây mẫu regex xem lời gọi `.import('{broken')` trong unit test như dynamic import `import('{broken')`. Tách `moduleImportSpecifiers` để chỉ quét dạng import tĩnh và dynamic thực sự; đồng thời neo kiểm tra named imports vào đầu câu import, tránh nhầm chuỗi ví dụ trong test. Giữ việc từ chối import từ dependency lạ và kiểm tra named exports.
3. **Hồi quy:** thêm unit tests cho `time`/`t`, overlap picking, dữ liệu thiếu và trường hợp `.import()`, cùng browser QA cho việc đặt/xóa mốc A/B quỹ đạo Helix.

## Kết quả kiểm tra trên môi trường bàn giao

- `node scripts/check.mjs`: **PASS**, 177 JS modules, 381 relative imports, 488 named exports.
- `node --test tests/*.test.js`: **243/243 PASS**.
- Vite production build, Browser QA Chromium, Offline QA: chỉ đánh dấu khi đã chạy thực tế; trên môi trường Linux của phiên sửa cần Rolldown native Linux binding, trong khi bản ZIP của người dùng chứa dependency Windows. Chạy `npm ci` trên Windows trước khi nghiệm thu nếu cần.

## Chạy nghiệm thu trên Windows

```powershell
cd D:\EduLab\physicslab
npm run check:release
```

Khuyến nghị dùng chính bản sửa này để tiếp tục checkpoint 2.2. **Chưa phải Stable.** Không commit, push, deploy hoặc thay đổi schema lưu tiến độ tự động.
