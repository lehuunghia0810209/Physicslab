> 2.4 Learning 3.0: `thpt-program.js` chỉ là coverage map. Nội dung hoàn chỉnh và ngân hàng câu hỏi nằm trong `src/data/learning/`; validation/chấm điểm/kho Learning v1 ở `src/core/`; UI đọc và đánh giá ở `src/app/`. Experiment Store và progress v1 giữ nguyên.

# Kiến trúc PhysicsLab — baseline 1.8, hướng tới 2.2

Kế hoạch nâng cấp và các release gate được theo dõi tại `EVOLUTION_1_9_TO_2_2.md`.

PhysicsLab là **một website Vật lý độc lập**. Không có tích hợp hệ sinh thái EduLab ở phiên bản này.

## Entry / routes

- `index.html` và `src/main.js` tạo app shell, theme, progress và router.
- `src/app/shell.js`: menu, thanh tiêu đề, quick search, phiên bản và footer.
- `src/app/router.js`: hash routes, quản lý lifecycle `mount()` / cleanup và lazy `import()` cho mỗi trang/mô phỏng.
- `src/data/registry.js`: metadata mô phỏng (danh mục, lớp, công thức, hàm load động); đây là **nguồn sự thật** cho số lượng mô phỏng.
- `src/data/curriculum.js`: 16 bài khám phá kế thừa; `src/data/learning/lesson-content.js` chứa bài đọc hoàn chỉnh và `question-bank.js` chứa câu hỏi có metadata.

## Lớp tính toán

- `src/core/*.js`: mô hình khoa học, validation SI, thiết bị đo, progress và phân tích thực nghiệm. Không phụ thuộc vào DOM.
- `src/engines/*.js`: timeline, graph, vector, measurement theo schema và các tiện ích SVG dùng lại.
- `src/simulations/**`: giao diện điều khiển, SVG/Canvas riêng cho từng mô phỏng; xử lý lifecycle, callback và đồ thị.
- `src/pages/*.js`: Home, Library, Learning, Lab, Tools và 3D Explorer.
- Virtual Lab hiện có 15 thí nghiệm từ một catalog duy nhất: mạch DC, Hooke và khí lí tưởng dùng workbench chuyên dụng; 12 mục còn lại dùng workbench thiết bị chung, trong đó mặt phẳng nghiêng, thấu kính và hai bàn sóng có cảnh chuyên sâu riêng.
- `src/styles/`: design tokens, layout, CSS theo nhóm; `polish.css` bổ sung lớp thống nhất UI 1.0.
- `src/app/quick-search.js`: điều hướng toàn cục có thể tìm tiếng Việt không dấu.
- `src/app/simulation-studio.js`: lớp khám phá dùng chung và Teacher Studio của 13 mô phỏng; lưu cấu hình lớp học qua progress, chỉ ẩn/hiện lớp trình bày và không sửa kết quả mô hình.
- `src/app/measurement-panel.js`: đầu dò/bảng ghi dùng chung cho các mô phỏng Phase B; chỉ nhận snapshot hữu hạn từ model, giới hạn 100 mẫu và xuất CSV trong phiên.
- `vite.config.js`: sau production build, tạo `dist/sw.js` và phiên bản cache từ hash của toàn bộ output. Service worker chỉ đăng ký ở production; install chỉ thành công khi precache hoàn tất, activation mới xóa cache PhysicsLab cũ.

## Nguyên tắc khoa học

Tách mô hình vật lý khỏi UI. Không đóng giả dữ liệu mô phỏng. Ghi rõ giả định (không lực cản, giới hạn đàn hồi tuyến tính, mạch DC đơn giản...). Dùng phép kiểm tra hữu hạn và xử lý biên (vận tốc bằng không, singularity, mẫu đo thiếu, lực không đủ thắng ma sát). Đồ thị và kết quả đo lấy từ cùng model.

Đối với thí nghiệm Hooke, mỗi lò xo có ID riêng; đồ thị và phép hồi quy `F = kΔx` chỉ dùng mẫu thuộc **cùng lò xo**. Dữ liệu cũ không rõ ID được giữ lại nhưng không gộp để tính độ cứng thực nghiệm.

## Quản lý trạng thái

- `src/core/progress.js` giữ localStorage, vệ sinh dữ liệu và lớp versioned state của PhysicsLab.
- Schema tiến độ v1 giữ thêm `notebooks` theo mã thí nghiệm. Nội dung văn bản bị giới hạn độ dài, tự đánh giá giới hạn 1–5 và đi cùng cơ chế sao lưu/khôi phục hiện có.
- Storage là thiết bị của học sinh, không liên thông Lab khác.
- Router thu hồi listeners/animation khi rời trang, nơi có mount cleanup. Dữ liệu session định lượng và validated.
- Tiến độ bài học chỉ được tăng theo luồng Learning. Việc hoàn thành một mô phỏng độc lập không được tự đánh dấu bước thử nghiệm của bài học; bước này cần dự đoán, baseline khi mở từ bài học và tương tác/đo đạc thực tế.
- Teacher Studio lưu mỗi cấu hình vào session `teacher-<simulation-id>` đã được vệ sinh; không ghi đè session mô phỏng hay sổ đo của học sinh.
- Learning 3.0 lưu ghi chú và lần làm gần nhất ở khóa riêng `physicslab.learning.v1`; kho lỗi bị khóa ghi để tránh ghi đè. Điểm tốt nhất tương thích ngược vẫn đi qua API `progress.quiz()`.

## Giới hạn thực tế

- 3D Explorer dùng phép chiếu không gian Canvas 2D camera-fit, **không phải Three.js/WebGL**. Hai cảnh Lorentz và Ném xiên dùng trực tiếp `createHelix`/`createProjectile`; hệ trục, lưới, quỹ đạo, vectơ và HUD cùng lấy từ state SI đó. Playback dùng `Timeline` theo giây mô hình và được cleanup khi rời route. Cách này giữ bundle nhẹ nhưng không cung cấp scene graph hay vật liệu/ánh sáng của engine WebGL đầy đủ.
- Các lớp giao diện giữa các simulation còn mức tái sử dụng không đồng đều. Sẽ cần tiếp tục gom UI/control logic khi mở rộng quy mô lớn.
- Chưa có backend, đồng bộ tài khoản, kiểm tra nhiều trình duyệt thực hiện trong môi trường phân tích hiện tại.
- Offline dùng cache đầy đủ của production build; chưa có Web App Manifest hoặc UI thông báo khi service worker mới đang chờ đóng tab cũ.

## Learning 3.0 — 2.4.0-dev full-curriculum content checkpoint

- `advanced-builder.js` tạo cấu trúc bài đọc và 5 câu hỏi hợp lệ cho mỗi mã chương trình từ `thpt-program.js`.
- `grade11.js` và `grade12.js` chứa dữ liệu bài học theo từng chủ đề, không sửa registry cũ.
- `lesson-content.js`/`question-bank.js` hợp nhất 30 mục mới với 19 mục của checkpoint A. Deep-link và Revision Home dùng cùng ngân hàng 245 câu.
- Lesson Reader dùng `button[data-lesson-anchor]` để cuộn nội bộ, không đổi hash route; catalog theo programId, không chỉ theo metadata `lessonId` cũ.
- Có thể thêm bài mới bằng dữ liệu mà không đổi Question Engine, Progress, Notebook hay Experiment Store. Vẫn cần quy trình xác minh học thuật độc lập và các bước e2e browser/PWA.
