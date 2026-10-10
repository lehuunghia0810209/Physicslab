# Báo cáo kiểm thử — 1.0.0-rc.2

## Đã xác minh trong môi trường hiện tại

- `npm run check:core`: **99/99 Node unit tests PASS** (bao gồm camera tự căn quỹ đạo, lọc lesson, checklist, lưu/khôi phục tiến độ).
- Kiểm tra JavaScript syntax và đường dẫn import bằng `scripts/check.mjs`: PASS.
- Tất cả CSS được parse bằng tinycss2: **0 parser errors**.
- Bộ Playwright đã sửa selector `a[href="#/explorer3d"]` quá rộng, và thêm phép kiểm tra pixel của vật màu cam/quỹ đạo xanh.

## Chưa thể xác minh tại môi trường này

- `npm ci --offline` thất bại `ENOTCACHED` vì thiếu tarball Vite 8.3.4, nên **Vite production build CHƯA CHẠY LẠI**.
- Đã thử Chromium qua Playwright Python với HTTP server riêng, nhưng trình duyệt trả `net::ERR_BLOCKED_BY_ADMINISTRATOR` khi truy cập `127.0.0.1:5188`; vì vậy **browser checks CHƯA PASS độc lập**.
- Các phép thử Playwright mới cần được chạy trên máy Windows với `npm run check:browser`; không suy diễn từ unit tests sang kết quả UI thật.

## Trên Windows

Tại thư mục PhysicsLab (giữ nguyên localStorage và sao lưu dự án trước khi giải nén):

```powershell
npm ci
npm run check
npm run dev -- --port 5188
```

Ở terminal thứ hai:

```powershell
npm run check:browser
```

Bộ test giờ xác nhận hạt cam và đường xanh thực sự được vẽ trong canvas, nút vừa khung, vai trò giáo viên và các điều kiện học tập. Nếu fail, gửi `work/browser-report.json` cùng log để sửa tiếp.

## Nguyên tắc nghiệm thu

- PASS 90 unit tests **không đồng nghĩa** mọi mô phỏng đều đúng dưới mọi tham số.
- 3D Explorer dùng Canvas 2D chiếu cảnh không gian; không nói thành WebGL/Three.js.
- Giữ an toàn dữ liệu học, khả năng nhập số hữu hạn, mô hình Vật lý có giả định và sự khác biệt giữa mô phỏng và thí nghiệm thực.
- Giữ trạng thái RC đến khi xác minh Vite build và Playwright/browser trên máy Windows.
