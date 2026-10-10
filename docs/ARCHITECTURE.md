# Kiến trúc PhysicsLab 1.0 RC1

PhysicsLab là **một website Vật lý độc lập**. Không có tích hợp hệ sinh thái EduLab ở phiên bản này.

## Entry / routes

- `index.html` và `src/main.js` tạo app shell, theme, progress và router.
- `src/app/shell.js`: menu, thanh tiêu đề, quick search, phiên bản và footer.
- `src/app/router.js`: hash routes, quản lý lifecycle `mount()` / cleanup và lazy `import()` cho mỗi trang/mô phỏng.
- `src/data/registry.js`: metadata mô phỏng (danh mục, lớp, công thức, hàm load động); đây là **nguồn sự thật** cho số lượng mô phỏng.
- `src/data/curriculum.js`: dữ liệu bài học tách rời UI.

## Lớp tính toán

- `src/core/*.js`: mô hình khoa học, validation SI, thiết bị đo, progress và phân tích thực nghiệm. Không phụ thuộc vào DOM.
- `src/engines/*.js`: timeline, graph, vector, measurement và các tiện ích SVG dùng lại.
- `src/simulations/**`: giao diện điều khiển, SVG/Canvas riêng cho từng mô phỏng; xử lý lifecycle, callback và đồ thị.
- `src/pages/*.js`: Home, Library, Learning, Lab, Tools và 3D Explorer.
- `src/styles/`: design tokens, layout, CSS theo nhóm; `polish.css` bổ sung lớp thống nhất UI 1.0.
- `src/app/quick-search.js`: điều hướng toàn cục có thể tìm tiếng Việt không dấu.

## Nguyên tắc khoa học

Tách mô hình vật lý khỏi UI. Không đóng giả dữ liệu mô phỏng. Ghi rõ giả định (không lực cản, giới hạn đàn hồi tuyến tính, mạch DC đơn giản...). Dùng phép kiểm tra hữu hạn và xử lý biên (vận tốc bằng không, singularity, mẫu đo thiếu, lực không đủ thắng ma sát). Đồ thị và kết quả đo lấy từ cùng model.

Đối với thí nghiệm Hooke, mỗi lò xo có ID riêng; đồ thị và phép hồi quy `F = kΔx` chỉ dùng mẫu thuộc **cùng lò xo**. Dữ liệu cũ không rõ ID được giữ lại nhưng không gộp để tính độ cứng thực nghiệm.

## Quản lý trạng thái

- `src/core/progress.js` giữ localStorage, vệ sinh dữ liệu và lớp versioned state của PhysicsLab.
- Storage là thiết bị của học sinh, không liên thông Lab khác.
- Router thu hồi listeners/animation khi rời trang, nơi có mount cleanup. Dữ liệu session định lượng và validated.

## Giới hạn thực tế

- 3D Explorer dùng phép chiếu không gian Canvas 2D, **không phải Three.js/WebGL**. Điều này giúp chạy trên nhiều thiết bị nhưng không đạt chất lượng hình khối chuyên sâu của công cụ 3D đầy đủ.
- Các lớp giao diện giữa các simulation còn mức tái sử dụng không đồng đều. Sẽ cần tiếp tục gom UI/control logic khi mở rộng quy mô lớn.
- Chưa có backend, đồng bộ tài khoản, kiểm tra nhiều trình duyệt thực hiện trong môi trường phân tích hiện tại.
