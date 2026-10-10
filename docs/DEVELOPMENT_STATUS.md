# PhysicsLab 1.2.0-beta.1-ux.1 — Trạng thái đã kiểm chứng

- Nguồn nâng cấp: tệp `Lab.zip` người dùng cung cấp, không thay đổi kiến trúc; đây là bản Beta 1 UX Rework, chưa phải Stable.
- Có hai lỗi gốc đã xác định và vá: đồ thị tô đen và công thức Hero cố định bị tràn.
- Có thiết kế thống nhất cho mô phỏng, thêm thao tác trực tiếp vào 12/13 mô phỏng (1 mô phỏng Electric Field đã có kéo thả, tức 13/13 đều có ít nhất một loại tương tác trực tiếp), cùng kéo quả nặng Hooke. Từng tính năng mô tả tại `UX_REWORK_1_2.md`.
- `node scripts/check.mjs`: **PASS**.
- `node --test tests/*.test.js`: **116/116 PASS**.
- CSS parse: **21 files, 0 errors**.
- `npm run build`: CHƯA ĐƯỢC XÁC MINH (Linux thiếu `@rolldown/binding-linux-x64-gnu` vì ZIP chứa dependency native Windows).
- `npm run check:browser`: CHƯA ĐƯỢC XÁC MINH (thiếu Chromium Headless Shell).
- Vẫn dùng `physicslab.progress.v1`; 13 registry simulations, 16 learning lessons, Lab & 3D giữ nguyên.
- Bắt buộc chạy `npm run check` & `npm run check:browser` trên Windows và kiểm tra thủ công desktop/mobile trước khi push lên Cloudflare.

