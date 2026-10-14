**AUD-001 source fix (2026-10-14):** 280/280 unit tests PASS và syntax/import scan PASS trên mã nguồn hiện tại; Vite/Browser/Offline CHECKS CỦA BẢN NÀY **CHƯA XÁC NHẬN**. Những bảng PASS bên dưới là kết quả các checkpoint trước. Xem [AUD_001_RESOLUTION.md](audits/AUD_001_RESOLUTION.md).

**LATEST (Learning 3.0 QA Hardening, 2026-10-14):** `npm run check:core`: 275/275 PASS, browser-check script syntax PASS; production Vite/Chromium/Offline **chờ Windows**. Các bảng ở dưới ghi lại những checkpoint trước, không chứng minh bản hardening mới PASS release. Chi tiết [LEARNING_3_0_QA_HARDENING.md](LEARNING_3_0_QA_HARDENING.md).

**MỚI (Learning 3.0 tiếp tục):** `node scripts/check.mjs` PASS, unit tests 269/269 PASS. `vite build`, Browser QA, Offline/PWA **CHƯA CHẠY LẠI** với mã nguồn này. Bảng kiểm thử phía dưới là kết quả checkpoint A cũ trên Windows; không dùng để tuyên bố bản mới PASS.

# PhysicsLab 2.4.0-dev — kiểm thử & nghiệm thu

## Kết quả thực tế trong môi trường làm việc

| Hạng mục | Trạng thái |
|---|---|
| Syntax, relative imports, named exports | **PASS** (`node scripts/check.mjs`) |
| Toàn bộ Node unit tests | **PASS 266/266** (`npm run check:core`) |
| Mô hình điện từ, giao thoa, nhiệt lượng | **PASS** (test định luật/biên/singularities) |
| Liên kết 49 nội dung THPT tới tài nguyên thật | **PASS** (unit kiểm tra ID) |
| Lưu mẫu vào Experiment Store version 1 | **PASS** (unit kiểm tra tương thích tiến độ) |
| Vite production build | **PASS** (159 modules, Vite 8.3.4) |
| Browser QA / Responsive bằng Chromium | **PASS** (13 mô phỏng, Learning, Lab, Tools, 3D; 320/360/390/768/1024/1440/1920 px) |
| Accessibility tự động | **PASS** (tên điều khiển, target tối thiểu 44 px, light/dark) |
| Animation cleanup | **PASS** (không giữ vòng `requestAnimationFrame` khi đổi route) |
| Offline/PWA | **PASS** (shell, lazy simulation và các bundle Learning/Lab/Tools/3D trong precache) |
| Thiết bị cảm ứng, Firefox, screen reader, PWA nhiều tab, profiling | **CHƯA KIỂM CHỨNG THỦ CÔNG** |

Kết quả trên được ghi nhận ngày 2026-10-14 bằng `npm run check:release` trên Windows. Đây vẫn là `2.4.0-dev`: chưa công bố Stable và chưa đẩy production.

## Tái kiểm tra trên Windows

1. Sao lưu dự án, giải nén ZIP đè nguồn cũ, giữ nguyên `.git`, không xóa storage trình duyệt.
2. Chạy `npm ci` để cài đúng dependencies từ `package-lock.json` Windows.
3. Chạy `npm run check:release`.
4. Mở `npm run dev -- --port 5188`, thử `#/learning` tab 10, 11, 12; `#/lab` bộ lọc 10, 11, 12; `#/lab/advanced-induction`, `#/lab/advanced-interference`, `#/lab/advanced-calorimetry`.
5. Kiểm tra kéo SVG, phát/tạm dừng, đọc số đo, CSV, lưu lần chạy, reload, Notebook, Light/Dark, Tab + phím mũi tên, mobile 320 px, Firefox/touchscreen nếu có.
6. Nghiệm thu thủ công Firefox, thiết bị cảm ứng, screen reader, PWA nhiều tab và phiên chạy dài trước khi xét Stable.
7. Nếu có lỗi, lưu nguyên log và ảnh màn hình để tạo patch mới.

## Công thức mẫu

- Faraday–Lenz: `ε = −N dΦ/dt`, dùng dạng nối từ thông hiệu dụng theo trục nam châm.
- Giao thoa: `u(P,t) = u1(P,t) + u2(P,t)`; biên độ tương tác dùng khoảng cách từ hai nguồn.
- Cân bằng nhiệt: `C1 T1(t) + C2 T2(t)` không đổi, nhiệt trao đổi triệt tiêu nhau.

Không suy rộng độ chính xác của mô hình xấp xỉ thành đo đạc thực ngoài đời.
