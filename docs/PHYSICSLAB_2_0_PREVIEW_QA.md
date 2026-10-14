# PhysicsLab 2.0 — Final Polish & QA (Preview)

## Nguồn và phạm vi

Bắt đầu từ **PhysicsLab Simulation Remake Part 2 (13/13)**, không thay thế project bằng demo khác. Giữ nguyên catalog 13 mô phỏng, 15 thí nghiệm, Student Lab Notebook, Teacher Studio, các workbench, tiến độ `physicslab.progress.v1`, cấu hình mạch và offline worker.

Đây là **lượt hardening chất lượng đầu tiên của 2.0**. Không có chứng cứ đủ để tuyên bố toàn bộ ứng dụng đã được nghiệm thu Stable trên Windows/thiết bị thật.

## Thay đổi đã thực hiện

1. **Hồi quy hiển thị số đo**: Chuẩn hóa âm không thành `0,00`, giữ dấu của các giá trị âm hữu hạn và dùng ký hiệu `—` cho số không hữu hạn. Tránh các trường hợp `-0,00` gây nhầm lẫn trong gia tốc/vận tốc/đồ thị.
2. **Cơ học — semantic và tương tác**: Sân mô phỏng đổi từ `role=slider` lồng nhiều slider con sang `role=group`. Thước thời gian vẫn là input range riêng. Cải thiện pointer capture / cancellation, giữ bề rộng hệ quy chiếu khi kéo xe hoặc lực, loại bỏ render frame thừa trong thao tác tua.
3. **Hủy thao tác không được phát chuyển động**: `pointercancel`/`lostpointercapture` không gọi `timeline.play()`; chỉ thả thành công (`pointerup`) mới có thể khởi động lại mô hình. Ngăn trường hợp chạm nhầm, chuyển tab và chuyển tác vụ lại kích hoạt animation.
4. **Newton**: Dọn drag state khi mất pointer capture để tránh điểm kéo tiếp tục bị kẹt. Các số đo dùng formatter đã chuẩn hóa.
5. **UI/UX responsive**: CSS scoped cho các bảng số đo trên 13 mô phỏng, tay nắm focus, HUD của Cơ học, góc nhìn Newton trên mobile, cảnh báo/nhãn không tràn và prefers-reduced-motion.
6. **PWA**: Manifest tiếng Việt, biểu tượng PNG 192/512 từ favicon có sẵn, UI thông báo bản mới. Service Worker không tự cưỡng bức activate hoặc reload trang đang làm việc; người dùng có thể chọn Để sau / Cập nhật.
7. **Tài liệu và regression tests**: 6 bài test mới về số đo, semantic & lifecycle, icons/manifest, thông báo cập nhật và registry.

## Những gì đã kiểm chứng trong môi trường bàn giao

- `npm run check:core`: **PASS 218/218 tests**.
- Syntax/import/export/lazy registry: **PASS** (xem output chạy lại khi nghiệm thu).
- PNG icons: kiểm tra magic signature trong tests; manifest parse JSON.
- CSS: kiểm tra tất cả stylesheets bằng parser `tinycss2` trong môi trường hiện tại.
- **Vite production build**: chưa xác minh được tại đây do Linux Rolldown native binding bị thiếu. Không tuyên bố PASS.
- **Playwright / Chromium browser acceptance**: không hoàn thành tại đây vì Chromium báo `ERR_BLOCKED_BY_ADMINISTRATOR` khi mở `127.0.0.1`; không tuyên bố PASS. Cần chạy lại trên Windows.
- **Offline production check**: chưa xác minh bản thay đổi mới do không build được; cần chạy lại trên Windows.

## Checklist thực hành bắt buộc tại máy Windows

```powershell
cd D:\EduLab\physicslab
npm run check
npm run check:browser
npm run check:offline
npm run dev
```

Mở và thao tác từng mô phỏng ở viewport desktop, mobile và bảng điều khiển. Ưu tiên: Newton, Ma sát, Công và động năng, Va chạm, Quang học, Mạch điện, Sóng. Kiểm tra:

- Chọn, kéo, thả, hủy kéo, kéo ra ngoài khung, thay đổi góc/cấu hình, reset.
- Đồ thị, đơn vị, các trạng thái đứng yên và chuyển động.
- Không nhân đôi đơn vị hoặc hiển thị `-0,00`; không dùng số vô hạn như phép đo hợp lệ.
- Chuyển route sau khi đang chạy không để lại RAF.
- 320/360/390/768/1024/1440/1920 px; sáng/tối, giảm chuyển động, keyboard và cảm ứng.
- Student Notebook không mất dữ liệu khi refresh; Teacher Studio lưu/khôi phục.
- Production PWA cập nhật sau khi nhấn **Cập nhật**, chọn **Để sau** không tự reload; offline lazy route sau cập nhật.

## Những việc còn cần xử lý trước Stable

- Build và browser acceptance/visual screenshots trên máy Windows với dependency đầy đủ.
- Kiểm thử kéo thả trên thiết bị cảm ứng thật, Firefox và Chromium/Edge.
- Profiling FPS/CPU/bộ nhớ khi chạy lâu, đặc biệt là điện trường, 3D Explorer và circuit bench.
- Rà soát thủ công toàn bộ 13 mô phỏng và 15 bàn thí nghiệm; không coi kiểm thử công thức là chứng minh hoàn thành UX.
- Kiểm tra update-worker trên website triển khai thực tế, một tab mở và nhiều tab cùng lúc.

**Phát hành:** Preview, không tự động push/deploy.
