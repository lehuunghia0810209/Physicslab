## PhysicsLab Beta 1 UX Rework — kiểm chứng hiện tại

- Unit / structural test: 116 PASS, 0 FAIL.
- Syntax/import validation: PASS (100 JS modules, 224 relative imports).
- CSS parser: 21 CSS files, 0 errors.
- Vite build: chưa xác minh trên Linux (native Rolldown binding Windows); cần build trên Windows.
- Chromium/Playwright: không có browser binary trong môi trường nên chưa chạy.
- Browser regression được bổ sung kiểm tra `.graph-line` fill:none trên route Work & Energy, và sửa assertion Inclined cho bố cục mới.

# Kiểm tra PhysicsLab 1.2.0-alpha.1

## Đã thực hiện độc lập
- Xác nhận nền tảng RC2: 99/99 unit tests PASS.
- Sau nâng cấp: 109/109 unit tests PASS; scripts/check.mjs kiểm tra cú pháp, imports và lazy registry PASS.
- CSS: 20 stylesheet parse thành công (0 parser errors) bằng tinycss2.
- Test cases: số liệu ném xiên hữu hạn, miền vẽ hai lần chạy chung trục, đầu dò chọn mẫu thật, từ chối NaN/Infinity, số đo ΔR/ΔH/ΔT, tạo/đọc/loại bỏ link chia sẻ cấu hình.
- Browser-check.cjs đã thêm kịch bản thử reference, đồ thị điều khiển bằng bàn phím và giao diện chia sẻ; **chưa chạy độc lập**.

## Chưa thể kiểm tra tại môi trường này
- npm ci offline lỗi ENOTCACHED (`vite-8.3.4.tgz` không có trong cache); do vậy production build Vite chưa được thực hiện ở đây.
- Playwright Chromium gặp `ERR_BLOCKED_BY_ADMINISTRATOR` khi điều hướng ngay cả tới data URL; không thể xác nhận 6 breakpoint hoặc vẽ SVG thực tế.
- Cần chạy bản mới trên môi trường Windows đã từng kiểm thử RC2, đảm bảo `npm run check` + `npm run check:browser` đều PASS trước khi triển khai lên Cloudflare.

## Cần xác nhận bằng mắt thường
1. Lưu mốc ném xiên → đổi g Trái Đất/Mặt Trăng → hai quỹ đạo cùng hiển thị đúng tỷ lệ và 4 đồ thị có nét đứt.
2. Tab vào đồ thị → mũi tên → hiện số đo → Escape thoát, con trỏ timeline không mất đồng bộ.
3. Tạo link chia sẻ tham số, mở trong trình duyệt riêng → các tham số đúng; không chia sẻ điểm quiz.
4. Đổi theme; kiểm tra desktop/mobile, không tràn ngang hoặc nút nhỏ hơn 44px.
5. Các route cũ, Lab, 3D, Learning và export không hồi quy.
