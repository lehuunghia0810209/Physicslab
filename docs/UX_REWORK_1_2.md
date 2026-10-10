# PhysicsLab 1.2 Beta 1 — Simulation Experience Rework

## Nguồn và mục tiêu

- **Nguồn thực tế:** tệp `Lab.zip` người phát triển gửi, mã nguồn version 1.2.0-beta.1.
- **Mục tiêu:** khắc phục lỗi hero formula và đồ thị SVG bị tô kín màu đen, nâng thao tác trực tiếp trên mô phỏng, thiết kế đồng bộ và dễ sử dụng cho học sinh/giáo viên.
- **Tham chiếu thiết kế:** triết lý PhET về thao tác trực tiếp, bảng điều khiển rõ ràng, phản hồi đồng bộ, hỗ trợ keyboard/touch. Đây là thiết kế và mã nguồn **của PhysicsLab**, không sao chép giao diện/tranh/âm thanh/implementation của PhET.

## Các lỗi đã xử lý trong nguồn

1. **Mảng đen dưới đồ thị:** `GraphRenderer` tạo path theo biểu thức `d` nhưng `fill: none` trước đây chỉ được khai báo đầy đủ trong `projectile.css`, gây lỗi với các mô phỏng tải CSS riêng. Bản này đặt `fill="none"` trên cả hai path trong engine, kèm stylesheet dùng chung. Có unit regression và bổ sung browser assertion.
2. **Công thức Home bị tràn:** card công thức trong SVG đặt tại tọa độ, kích thước cố định; đổi thành overlay HTML có chữ tự bọc dòng, responsive và giữ minh họa SVG gốc.
3. **Chuyển động ra ngoài khung:** sửa cơ chế vị trí của Cơ học dùng chung để sử dụng tỷ lệ vùng vẽ thay vì dịch hàng nghìn px/`vw`; khối dao động dùng li độ tương đối. Newton giới hạn di chuyển theo kích thước thực tế của scene.
4. **Sóng:** vòng tròn đầu dò theo `x = λ/4` thật, thay vì một tọa độ `cx` cố định không phù hợp khi đổi bước sóng.
5. **Khí lý tưởng:** vị trí piston nay tiến/lùi tương ứng chiều giãn hoặc nén (trước đó trường hợp nén bị đứng yên do tỉ lệ tính sai). Đây là vị trí minh họa theo tiến trình, **không phải thước tỷ lệ tuyệt đối**.
6. **Mặt phẳng nghiêng:** vẽ lại từ phương trình và hình học sin/cos đúng góc, có block di chuyển theo `s = at²/2`, đồ thị `v = at`, nút kéo góc và timeline.

## Bảng tương tác hiện tại

| Lĩnh vực / mô phỏng | Tương tác trực tiếp bổ sung hoặc giữ nguyên | Số đo/đồ thị |
|---|---|---|
| Ném xiên | Kéo đầu vector để điều chỉnh góc và vận tốc đầu, bàn phím điều chỉnh | Đã đồng bộ model gốc, đồ thị và số liệu |
| Newton | Kéo vật để tua thời gian, kéo mũi tên lực | Đồng bộ a, F, v, x và đồ thị |
| Mặt phẳng nghiêng | Kéo tay nắm đổi θ, Play/Pause/Reset, timeline | a, F, N, f, v, s và đồ thị v–t |
| Ma sát nghỉ / trượt | Kéo trực tiếp cảnh tua thời điểm, kéo lực | Đồng bộ model và đồ thị |
| Công–động năng | Kéo trực tiếp cảnh tua thời điểm, kéo lực | Đồng bộ công và động năng |
| Động lượng / va chạm | Kéo trực tiếp cảnh để quan sát từng thời điểm | Đồ thị p và Eₖ theo thời gian |
| Lò xo / dao động | Kéo theo cảnh để tua pha, không biến đổi công thức | Li độ và vận tốc, sửa độ dời hiển thị |
| Sóng trên dây | Kéo dây lên/xuống để đổi biên độ; chuyển dạng sóng | Dạng sóng và dao động đầu dò |
| Mạch điện Ohm | Kéo điện trở R1/R2 ngang để tăng/giảm giá trị | U, I, P theo định luật Ohm |
| Điện trường | Tiếp tục kéo hai điện tích và đầu dò trên bản đồ | E⃗, V theo Coulomb và chồng chất |
| Từ trường / cảm ứng | Kéo cảnh theo chiều ngang để tua thời gian | Số đo và đồ thị đồng bộ |
| Thấu kính | Kéo vật theo chiều ngang đổi khoảng cách dₒ | Ảnh thật/ảo, phóng đại và đồ thị |
| Khí lý tưởng | Kéo piston đặt thể tích cuối khi quá trình cho phép | P, V, T, W, Q, U và đồ thị |
| Lab Hooke | Kéo quả nặng thử khối lượng khác | Đo chỉ ghi khi người dùng bấm Ghi kết quả |

## Giữ nguyên dữ liệu và tính độc lập

- Không thay đổi khoá `physicslab.progress.v1`, không thêm backend, không thay đổi curriculum Registry/URL route.
- Giữ đủ 13 mô phỏng, 16 bài học, các Lab, 3D Explorer, tools, light/dark, export/import tiến độ, chế độ giáo viên.
- Không dùng hình ảnh, mã nguồn, âm thanh hay thuật toán có bản quyền của PhET.

## Kiểm thử trong môi trường hiện tại

- `node scripts/check.mjs`: PASS.
- `node --test tests/*.test.js`: **116/116 PASS**.
- Parse CSS bằng tinycss2: **21 CSS files, 0 parse errors**.
- `vite build`: **CHƯA ĐẠT / CHƯA XÁC MINH** trên Linux vì ZIP gửi chứa dependency native Windows `@rolldown/binding-win32-x64-msvc`, thiếu thư viện Linux tương ứng. Không kết luận sản phẩm đã được nghiệm thu trình duyệt.
- Playwright Chromium: **CHƯA CHẠY** vì môi trường thiếu Chromium Headless Shell.

## Quy trình nghiệm thu Windows và Cloudflare

1. **Sao lưu thư mục và dữ liệu tiến độ trước.** Giải nén mã nguồn ZIP vào `D:\EduLab\physicslab`, giữ `.git` hiện tại (không ghi đè `.git`).
2. Nếu `node_modules` cũ còn hoạt động, không cần chạy `npm ci` khi chỉ thay source. Nếu muốn cài lại, dừng Node/Vite, tránh OneDrive rồi chạy `npm ci`.
3. `npm run check:core`
4. `npm run build` hoặc `npm run check`.
5. Terminal thứ nhất `npm run dev -- --port 5188`; terminal thứ hai `npm run check:browser`.
6. Quan sát bằng mắt: Home 390/768/1440 px; Work–Energy không còn vùng đen; Ném xiên kéo vector; Mặt phẳng nghiêng, Hooke, Sóng, Mạch điện, Thấu kính và Khí lý tưởng phản hồi đúng; Dark/Light Mode; tiến độ trước/sau reload.
7. Chỉ sau khi nghiệm thu mới `git add . && git commit ... && git push` để Cloudflare tự cập nhật.

## Giới hạn trung thực của cột mốc

Đây là bản nâng cấp **trải nghiệm và lỗi trọng điểm**, không phải bản sao PhET hay toàn bộ PhET-equivalent. Một số mô phỏng vẫn có điều khiển thanh trượt cùng chế độ hiển thị giản lược; lắp ráp thí nghiệm tự do, đo lực thực bằng drag lực/vật trên mọi cảnh và một bộ thống nhất audio/tactile vẫn là roadmap. Không gắn nhãn 1.2 Stable trước khi build, browser và kiểm thử thiết bị thực đều qua.
