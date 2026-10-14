# PhysicsLab — Simulation Remake · Phần 2/2 (2026-10-12)

**Trạng thái:** Full source preview để người dùng kiểm tra. Chưa phải Stable.
**Nguồn:** Kế thừa đúng mã nguồn phần 1/2, không tạo ứng dụng mới và không thay engine Virtual Lab.
**Phạm vi 13 mô phỏng:** Phần 1/2 đã làm 7 mô phỏng Cơ học; phần 2 tập trung vào 6 mô phỏng Sóng, Mạch điện, Điện trường, Từ trường, Thấu kính, Khí lí tưởng và bố cục chung.

## Thay đổi có thể kiểm tra được

- **Điện trường:** Tạo module tích phân đường sức theo chính hàm `measureElectricField` (Coulomb) hiện có; hiển thị đường sức và vectơ đầu dò, bật/tắt lớp quan sát, presets lưỡng cực/cùng dấu, giữ các tay nắm SVG ổn định và bổ sung điều khiển bàn phím. Không tạo solver điện trường thứ hai. Đường sức là đường tích phân được lấy mẫu để minh họa hình dạng, không được đọc mật độ nét như phép đo định lượng.
- **Từ trường:** Thêm tình huống góc 0°/90°, đổi dấu điện tích và chuyển sang cảm ứng Faraday; thêm bộ điều khiển góc/số vòng dây dạng HTML được giữ nguyên DOM trong mọi frame (tránh mất focus do vẽ lại SVG); hiệu chỉnh ánh xạ con trỏ qua hệ tọa độ SVG và giữ thời gian phân tích khi thay tham số. Tiếp tục dùng engine Lorentz/Faraday hiện có.
- **Quang học:** Vẽ đốm ảnh trên màn từ độ phân kỳ của hai tia cơ bản; ảnh thật lấy nét sẽ hội tụ, lệch màn cho vệt mờ; ảnh ảo/vô cực không tạo đốm trên màn. Có lớp tia tùy chọn. Dùng cùng thấu kính mỏng và neo tỉ lệ kéo khi pointerdown.
- **Khí lí tưởng:** Có tình huống nén, giãn và gia nhiệt đẳng tích; thêm vị trí mục tiêu piston (nét đứt) để học sinh phân biệt điều kiện cuối với trạng thái tức thời. Áp suất, nhiệt độ, công và nội năng vẫn lấy từ `createIdealGas`, hạt chỉ minh họa định tính.
- **Sóng, Mạch điện:** Giữ nguyên deep remake đã có từ checkpoint Codex: sóng nguồn kéo tay/probe/phản xạ, mạch linh kiện-dây/đồng hồ/công tắc với solver Kirchhoff duy nhất. Không thay bằng widget đơn giản hơn.
- **Toàn bộ 13 mô phỏng:** Router bố trí mô phỏng thực tế trước nhóm hướng dẫn 3 bước/Teacher Studio/tình huống khám phá. Phần giải thích dài đóng mặc định, có thể mở khi cần. Virtual Lab và notebook được giữ nguyên.

## Kiểm thử đã thực hiện

- Baseline phần 1: 206/206 unit tests PASS.
- Sau thay đổi phần 2: 212/212 unit tests PASS (kiểm tra cú pháp, named exports, relative imports, Registry).
- 159 JS modules, 343 relative imports, 439 named exports PASS.
- 32 stylesheet CSS: 0 parse error với tinycss2.
- Bổ sung test tích phân đường sức, các trường hợp ảnh thật/ảo/vô cực trên màn, 13/13 tuyến stage-first.

## Chưa xác minh trong môi trường bàn giao này

- **Vite production build:** rolldown Linux native binding vắng mặt trong node_modules khả dụng; `vite build` dừng trước khi bundling. Không được coi là PASS.
- **Browser E2E:** Chromium có thể khởi chạy nhưng chính sách môi trường chặn truy cập cả localhost và file (`ERR_BLOCKED_BY_ADMINISTRATOR`). Không tuyên bố đã thử tương tác thật trên trình duyệt.
- **Thiết bị thật/Firefox:** chưa thử. Những yếu tố như hit testing trên cảm ứng, overflow/nhãn va chạm và long-run FPS cần được nghiệm thu trên Windows.

## Nghiệm thu trên máy Windows

1. Sao lưu `D:\EduLab\physicslab`; giữ `.git`, dữ liệu cá nhân và tiến độ đang lưu trong trình duyệt.
2. Chép toàn bộ nội dung ZIP ở cấp gốc vào `D:\EduLab\physicslab` (không copy thư mục cha lồng nhau). Không chép `node_modules` từ ZIP.
3. Chạy `npm run check`, `npm run check:browser`, `npm run check:offline`, `npm run dev -- --port 5188`.
4. Mở cả 13 mô phỏng. Kiểm tra trực tiếp **Điện trường** (kéo 2 nguồn/đầu dò, preset cùng dấu, keyboard), **Từ trường** (0°, 90°, đảo dấu, Faraday, kéo nút), **Thấu kính** (màn đúng/sai nét, ảnh ảo), **Khí** (nén/giãn/đẳng tích và marker thể tích đích), **Sóng**, **Mạch điện**.
5. Kiểm tra chuyển trang khi animation còn chạy, Teacher Studio, Notebook và Virtual Lab để xác nhận không hồi quy.
6. Gửi ảnh/log nếu có lỗi; không push/deploy khi build hoặc kiểm thử còn FAIL.

**Lưu ý bản quyền:** Tham khảo nguyên tắc tương tác giáo dục của PhET; mã nguồn phần cải tiến này độc lập, không chép tài sản hoặc mã PhET.
