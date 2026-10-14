# R4 — Báo cáo kiểm tra mã nguồn (không thay thế browser QA)

Đã chạy tại thời điểm bàn giao:
- `node scripts/check.mjs`: 136 mô-đun JS hợp lệ, 283 relative imports, 350 named exports, lazy registry hợp lệ.
- `node --test tests/*.test.js`: 161/161 bài kiểm thử PASS, 0 FAIL.
- `tinycss2.parse_stylesheet`: 27 CSS files, 0 lỗi cú pháp.

Không thể chạy Vite build: môi trường offline không có bản Vite hiện diện trong npm cache. Không thể chạy Playwright browser trên localhost/file/data do policy `ERR_BLOCKED_BY_ADMINISTRATOR`. Vì vậy không chứng nhận responsive/browser/console, cần chạy lại trong VS Code của người dùng.

Danh sách nghiệm thu: Mạch điện kéo đặt linh kiện/kết nối/vôn-ampe kế; Hooke treo/thả quả nặng và đo; Khí bơm-xả-gia nhiệt và piston; Cơ học kéo vật trái/phải, nghỉ/trượt, va chạm và giữ kết quả tính; Ném xiên, điện trường, sóng, thấu kính, 3D không tràn, hoạt động cảm ứng và bàn phím; teacher mode/dark mode; không regress localStorage tiến độ.
