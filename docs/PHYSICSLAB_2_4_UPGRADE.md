# PhysicsLab 2.4.0-dev · Virtual Lab 3.0 + Learning THPT

## Phạm vi bản build chung 2.3 + 2.4

Thay vì ra 2.3 riêng, toàn bộ phần được triển khai trong đợt này được đánh version **2.4.0-dev**, kế thừa trực tiếp mã nguồn 2.2 Recovery. Không tự nhận 2.4 Stable.

### Đã triển khai

- `src/data/thpt-program.js`: **49 đơn vị chủ đề/bài học** phân theo **lớp 10, 11, 12**, mục tiêu, câu hỏi khám phá, liên kết tới học liệu có thật, chú thích phần chưa có. Đây là cấu trúc theo **mạch kiến thức** của CTGDPT 2018, **không phải 49 tiết tương ứng một SGK cụ thể**.
- Trang Học tập: bộ ba tab lớp 10/11/12, sơ đồ nội dung, mức độ sẵn có; chọn bài học có tương tác hoặc mở trực tiếp thí nghiệm/mô phỏng. **16 bài tương tác có dự đoán + thử nghiệm + quiz từ 2.2 vẫn hoạt động**; chưa có quy trình quiz cá nhân cho toàn bộ 49 đơn vị.
- Trang Thí nghiệm: ba chương trình lớp 10/11/12 lọc bàn thực hành; danh mục 15 bàn cũ và dữ liệu lưu cũ không bị thay thế.
- **3 trạm thực nghiệm nâng cao** nối vào Virtual Lab: cuộn dây – nam châm di chuyển có ε = −N·dΦ/dt, giao thoa hai nguồn điểm với đầu dò không gian, trao đổi nhiệt hai vật trong hệ cách nhiệt; Play/Pause/Reset, đồ thị mô hình, mẫu đo, CSV, lưu nháp/lần chạy vào Experiment Store version 1.
- Tận dụng hệ thống Notebook, Experiment Store, Graph và lộ trình 2.2. Mô hình trường nam châm là phép xấp xỉ trục dọc, không phải bộ giải điện từ 3D; mô hình giao thoa là sóng điều hòa ổn định, không suy giảm biên độ; mô hình cân bằng nhiệt giả sử nhiệt dung riêng, hệ số trao đổi nhiệt không đổi và không thất thoát.
- Trang Tổng quan: pricing toggle tháng/năm và FAQ. **Không có thanh toán và chưa công bố giá**. Yêu cầu skill tên `lucian-uxui` được kiểm tra nhưng không có trong bộ kỹ năng cài đặt phiên này; các thành phần được tự viết theo design system của PhysicsLab.

### Giới hạn còn lại

1. Trạm cảm ứng điện từ dùng mô hình từ thông hiệu dụng, không dùng dữ liệu thực nghiệm hay mạng lưới Maxwell. Hai trạm chuyên sâu tương tác bằng SVG và các input; nhiệt kế hiển thị tính theo model, chưa tích hợp hiệu chuẩn dụng cụ chung cho các trạm mới.
2. 49 đơn vị là bản đồ chủ đề/bài học có mục tiêu và hoạt động; chưa phải 49 bài giảng đầy đủ hoặc các bộ SGK Cánh diều/Kết nối tri thức/Chân trời sáng tạo. Các mục thiếu được đánh dấu rõ.
3. Dữ liệu trạm nâng cao dùng khóa `physicslab.experiments.v1`; hoàn toàn giữ nguyên `physicslab.progress.v1`.
4. `npm run check:release` đã PASS trên Windows ngày 2026-10-14: 263 unit tests, Vite build, Browser QA 320–1920 px và Offline/PWA. Nghiệm thu thiết bị thật/cross-browser vẫn còn mở.
5. Firefox, cảm ứng thật, PWA nhiều tab, profiling CPU/FPS dài hạn chưa nghiệm thu.

### Kiểm thử

- `npm run check:release`: **PASS** ngày 2026-10-14; 266/266 unit tests, build, Browser QA và Offline QA.
- Browser QA bao phủ Home, 13 mô phỏng, Learning, Lab, Tools, 3D và cả 3 trạm nâng cao ở 7 độ rộng 320–1920 px.
- Kiểm thử trực tiếp: trường hợp vật đứng yên không có suất điện động; pha đối nhau triệt tiêu; nhiệt lượng tổng bằng 0.

### Cài đặt an toàn

1. Sao lưu `D:\EduLab\physicslab` và dữ liệu trình duyệt (dùng tính năng xuất JSON).
2. Giải nén full source đè mã nguồn hiện tại, **giữ `.git` và không xóa dữ liệu tiến độ**.
3. Trong PowerShell ở thư mục dự án: `npm ci`, `npm run check:release`, `npm run dev -- --port 5188`.
4. Thử bộ lọc theo 10/11/12, thí nghiệm kéo nam châm, hai nguồn sóng, nhiệt lượng, lưu lần chạy và tải lại trang.
5. Không push lên production khi chưa đủ QA trên máy đích.
