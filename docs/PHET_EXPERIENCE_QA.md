# PhysicsLab 1.2.1 Beta — Gói tương tác trực quan

## Tiêu chí thiết kế

- Tự tạo SVG/HTML/CSS/JS của PhysicsLab, không sao chép mã nguồn, đồ họa hoặc nhãn hiệu PhET.
- Mô hình Vật lý nguyên bản là nguồn duy nhất cho số đo; hoạt hình phân tử/dòng điện chỉ mô tả ý tưởng và được ghi chú minh họa.
- Nút/phím/bàn phím được giữ bên cạnh tương tác kéo thả; không hy sinh khả năng học tập cho hiệu ứng trang trí.

## Đã thay đổi

1. `src/core/gas-particles.js`: trạng thái hạt phản xạ trong miền chuẩn hóa theo thời gian và nhiệt độ. Chuyển động tuần hoàn có thể tái hiện, không dùng để suy ra áp suất.
2. `src/core/scene-geometry.js`: chuyển đổi vị trí piston <-> thể tích logarithmic đảo được. Chỉ làm thang thị giác, không thay PV=nRT.
3. `src/simulations/thermal`: piston có tay cầm; các hạt khí vẽ lại theo mô hình minh họa, số đo lấy từ Ideal Gas core.
4. `src/simulations/electricity`: sơ đồ có nhánh đúng khi nối tiếp/song song, điểm dòng điện quy ước chuyển động, nút chuyển topology nhanh, kéo/chỉnh phím điện trở.
5. `src/pages/lab`: 16 thí nghiệm được chọn từ thư viện. Hooke hiển thị riêng, 15 adapter mở đúng bàn; sơ đồ theo loại mô hình và tay kéo thay đổi tham số; dữ liệu đo cũ còn nguyên.
6. `src/pages/explorer3d.css`: cải thiện bảng tham số, con số, không gian xem và mobile.

## Kiểm chứng đã chạy tại môi trường tạo nguồn

- `node scripts/check.mjs`: PASS (syntax/import/export)
- `node --test tests/*.test.js`: PASS 127 bài
- CSS parse: xem `docs/DEVELOPMENT_STATUS.md`.

## Chưa kiểm chứng

- Vite production build chưa chạy được trong môi trường hiện tại do thiếu cài đặt Vite.
- Playwright browser tests / chụp màn hình chưa chạy được vì Chromium báo ERR_BLOCKED_BY_ADMINISTRATOR với localhost; đây không phải bằng chứng website bị lỗi.
- Không có bằng chứng benchmark tốc độ, audit WCAG đầy đủ hoặc nghiệm thu real-device.

## Cần chạy ở Windows

1. `npm run check` (bao gồm Vite build)
2. `npm run dev -- --port 5188` rồi `npm run check:browser`
3. Thử `#/simulation/ideal-gas`: hạt chuyển động khi tua; thay nhiệt độ, kéo piston; số Pa, K, J hữu hạn.
4. `#/simulation/electric-circuits`: chuyển nối tiếp/song song, điểm chuyển động, R1/R2 kéo được; tổng I và nhánh I đúng Ohm.
5. `#/lab`: chọn Hooke và các adapter; kéo chấm trên sơ đồ, ghi mẫu, xuất báo cáo, rời trang quay lại không mất tiến độ.
6. `#/explorer3d`: kiểm tra chữ, bảng không tràn tại 320,360,390,768,1024,1440 px.
7. Dark/Light mode, prefers-reduced-motion và phím Tab/Arrow đều dùng được.

**Không tự động push GitHub / Cloudflare.** Chỉ triển khai khi đã nghiệm thu máy thực tế.
