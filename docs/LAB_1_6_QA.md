# PhysicsLab 1.6 — Virtual Lab 3.0: báo cáo xây dựng và nghiệm thu

## Phạm vi đã triển khai

Bản 1.6 kế thừa **toàn bộ PhysicsLab 1.5**, gồm danh mục 15 thí nghiệm, 13 mô phỏng độc lập, 16 bài học, 3D Explorer, Tools, sổ phép đo, thiết bị và lưu tiến độ. Không đổi khóa dữ liệu localStorage.

### Bốn không gian bàn thực hành chuyên sâu mới

1. **Mặt phẳng nghiêng (Cơ học):** máng 4 m, xe có thể đặt vị trí thả trên máng, kéo nâng/hạ đầu máng, thả xe và xem chuyển động theo `s = ½at²` với gia tốc và ngưỡng ma sát do core `createInclinedPlane` tính; hiện/ẩn vectơ, gợi ý ba góc dốc. Xe dừng ở chặn cuối.
2. **Thấu kính (Quang học):** kéo vật sáng, kéo màn hứng độc lập, dựng hai tia chính, xác định ảnh thật / ảnh ảo / ở vô cực theo `createThinLens`. Màn hiện lấy nét đúng khi cách ảnh không quá 0,015 m; ảnh ảo không thể hứng trên màn. Ba tình huống khám phá; nút căn màn phục vụ trình diễn giáo viên.
3. **Sóng trên dây (Vật lý sóng):** dây 8 m với đầu phát xung Gaussian hoặc sóng tuần hoàn; chọn đầu cố định (đảo dấu khi phản xạ) và đầu tự do; kéo đầu dò đặt khoảng đo, nhìn li độ tức thời. Mô hình sóng 1D không tán sắc `v=fλ`.
4. **Giao thoa hai nguồn:** hiện riêng hai sóng và sóng tổng, kéo tay nắm đổi độ lệch pha; có preset 0°/90°/180°; số đọc theo hai sóng kết hợp biên độ bằng nhau, cùng f/λ.

Các phần chung: thao tác trên Canvas bằng chuột/touch, nút lớn, điều khiển bằng bàn phím, Play/Pause/Reset, tốc độ ½×, nhiệm vụ Thử → Quan sát → Giải thích, chú thích giới hạn, dụng cụ chuyên dụng. Các thay đổi trên bàn cập nhật **cùng parameter của phòng thí nghiệm**, nên sổ đo, đồ thị, CSV và lưu tiến độ tiếp tục hoạt động. Bản 1.6 đã thêm vùng vuốt ngang riêng trên điện thoại và khởi tạo vị trí cuộn gần các dụng cụ chính, để chữ và thiết bị không bị thu quá nhỏ.

### Những phần không tự nhận đã hoàn thiện

- 8 bàn generic Canvas còn lại từ 1.5 chưa nâng lên mức xây dựng/đo đạc tự do như Mạch điện R2; chúng tiếp tục dùng studio 1.5. Các bàn chuyên dụng Mạch điện R2, Hooke R3, Khí lí tưởng R4 được **giữ nguyên**.
- Các cảnh Simulations, 3D và Tools vẫn kế thừa bản 1.5. Đây là **đợt Virtual Lab 1.6**, không phải tuyên bố viết lại 13 mô phỏng trang Simulations.
- Sóng lý tưởng bỏ qua suy hao, độ căng dây độc lập và tán sắc; phương trình phản xạ được dựng theo biên cố định/tự do. Không giả lập phép đo vi mô thực.
- Vẽ quang học dùng chiều cao vật tượng trưng có tăng cỡ cho dễ nhìn (không dùng chiều cao pixel để ghi số đo). Các tia là dựng hình paraxial, không phải truy vết quang học phi tuyến tính.
- Sổ đo dùng trạng thái thiết lập định nghĩa trong `measureLabExperiment` và độ chia `measureWithInstrument`, **không tự tạo số đo ngẫu nhiên** và không phải mẫu tức thời tại vị trí con trỏ nếu phép đo toàn thí nghiệm được định nghĩa khác.

## Kiểm thử đã thực hiện

1. `npm run check:core`: syntax/import/named export/lazy loading và **181 unit tests PASS** (gồm 15 test vật lý mới); chạy lại trước khi đóng ZIP.
2. Kiểm tra CSS bằng `tinycss2`, báo số lỗi thực tế trong đợt bàn giao.
3. Chromium chạy bằng harness **import-map in-memory** vì điều hướng `file://` và `localhost` bị môi trường Chromium chặn. Kiểm tra mở trang Lab, chọn cả bốn bàn, preset dốc, kéo đầu máng, chạy/dừng, ghi phép đo, kéo màn khỏi vị trí nét, tạo ảnh ảo, thử hai biên sóng, chỉnh pha, mở lại Circuit/Hooke. Desktop 1440 px và mobile 390 px không tràn ngang toàn trang. Kiểm tra console trong phạm vi smoke test: không có lỗi JavaScript.
4. ZIP được giải nén lại; `npm run check:core` chạy trên thư mục giải nén để đảm bảo file cuối đủ nguồn.

**Chưa xác minh:** `npm run build`, `npm run check` đầy đủ và `npm run check:browser` trên Vite thực tế vì quá trình cài Vite trong môi trường này chưa hoàn thành. In-memory harness là kiểm thử tích hợp thực tế của Chromium nhưng **không thay thế kiểm thử Vite/Playwright trên bản build**. Bản này là 1.6 Preview, **chưa phải Stable**.

## Hướng dẫn nghiệm thu trên Windows

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check
npm run dev -- --port 5188
# Terminal thứ hai:
npm run check:browser
```

Mở `http://127.0.0.1:5188/#/lab` và chọn từng thí nghiệm. Kiểm tra thao tác trực tiếp ở 1440/1024/390 px, Dark/Light, Console, các phép đo và đồ thị; sau đó thử lại Circuit, Hooke, khí lí tưởng, Learning, 3D, Tools. Chưa đẩy Cloudflare cho tới khi `npm run check` và các bước nghiệm thu trên máy bạn đạt yêu cầu.

**Giấy phép nội dung:** 1.6 chỉ sử dụng mã nguồn do PhysicsLab tự xây, không sao chép hoặc xóa logo PhET.
