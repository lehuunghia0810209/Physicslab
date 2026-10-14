# PhysicsLab 2.1.0-dev — Phase B: Advanced Interactive Laboratory

Ngày checkpoint: 2026-10-13. Trạng thái: development, chưa phải Stable.

## Kết quả

Phase B tiếp tục trực tiếp trên working tree của checkpoint 3D, không reset hoặc đổi schema `physicslab.progress.v1`. Năm mô phỏng ưu tiên đã có chuỗi thao tác hoàn chỉnh hơn: chỉnh thiết bị trực tiếp → chạy/tua model → đọc đại lượng → ghi mẫu → xuất CSV.

### Tương tác trực tiếp

- Newton: tay nắm lực hai chiều, kéo vật để đọc lại thời gian, bàn phím, Play/Pause/Reset, tốc độ và timeline đều điều khiển cùng một model. Hợp lực, ma sát, gia tốc, vận tốc và vị trí đồng bộ.
- Ma sát: kéo vật để tăng/giảm lực thực; trạng thái ma sát nghỉ/trượt và bề mặt nhẵn–gỗ–thô thay đổi theo hệ số của model.
- Công–năng lượng: kéo vật để đặt quãng đường và kéo tay nắm lực; đồ thị công/động năng, energy bars và readout lấy từ cùng `createWorkEnergyMotion`.
- Va chạm: kéo từng xe để đặt vận tốc đầu; thêm tay nắm trực tiếp cho khoảng cách ban đầu. Bảng trước/sau hiển thị tổng động lượng và động năng thật của model.
- Quang học: giữ cơ chế kéo vật/màn không nhảy vị trí; hoàn thiện cleanup khi mất pointer capture để graph/model không bị lệch sau gián đoạn touch.

Tất cả gesture ưu tiên đều có `pointercancel`, `lostpointercapture`, điều khiển bàn phím và vùng tương tác tối thiểu 44 CSS px.

### Đầu dò và sổ đo dùng chung

- `MeasurementSystem` hiện nhận schema cột tùy theo mô hình nhưng vẫn giữ nguyên API/default CSV của Ném xiên.
- `mountMeasurementPanel` là một panel dùng chung cho Newton, Ma sát, Công–năng lượng, Va chạm, Dao động và Thấu kính.
- Mỗi lần ghi sao chép đúng trạng thái hữu hạn tại thời điểm/tọa độ hiện tại của model; không nội suy số liệu trang trí và không tự ghi khi học sinh chưa bấm nút.
- Bảng có giới hạn 100 mẫu, trạng thái trợ năng, xóa dữ liệu phiên và xuất CSV UTF-8. Dữ liệu mới chỉ tồn tại trong phiên trang; dữ liệu tiến độ/Notebook cũ không bị sửa.
- Nút ghi mẫu được tính là một tương tác học tập thực trong cơ chế kiểm chứng của Learning.

### Luồng học tập và tình huống

Phase B tái sử dụng thay vì nhân đôi các lớp đã có:

1. Dự đoán và ba tình huống tái lập: `EXPLORATION_MISSIONS`/Simulation Studio.
2. Bố trí: preset và tay nắm thiết bị thay đổi control/model thật.
3. Thực nghiệm: Timeline dùng chung cho scene, readout và graph.
4. Đo lường: measurement panel mới hoặc phòng Lab có dụng cụ/độ không đảm bảo.
5. Đối chiếu: graph đồng bộ; va chạm có bảng trước/sau; Learning kiểm tra tương tác thực.
6. Kết luận: Student Lab Notebook tiếp tục dùng schema và dữ liệu cũ trong phòng Lab.

## File trọng tâm

- `src/engines/measurements.js`
- `src/app/measurement-panel.js`
- `src/styles/measurement-panel.css`
- `src/simulations/newton/index.js`
- `src/simulations/mechanics-view.js`
- `src/simulations/optics/index.js`
- `src/styles/mechanics.css`
- `src/main.js`
- `tests/physics.test.js`
- `tests/phase-b-interaction.test.js`
- `scripts/browser-check.cjs`

## Kiểm thử

- Baseline trước Phase B: `npm run check:release` PASS, 225/225 unit tests, build, browser và offline.
- Sau triển khai: 228/228 unit tests PASS; Vite production build PASS.
- Browser QA PASS cho ghi số đo thật, CSV, tay nắm Newton, Ma sát, Công–năng lượng, Va chạm/điều chỉnh khoảng cách, Dao động và Quang học; toàn bộ route vẫn được kiểm tra tại 1920/1440/1024/768/390/360/320 px, target 44 px và animation cleanup.
- Offline QA được chạy lại trong release gate cuối của checkpoint.

## Hiệu năng và giới hạn còn mở

- Không thêm dependency; measurement UI được lazy-load cùng các route dùng nó.
- Timeline/RAF vẫn destroy khi rời route; pointer/resize listeners dùng `AbortController` hoặc observer cleanup.
- Browser QA kiểm tra không có page error, console error, failed request, overflow và RAF còn sót.
- Chưa thực hiện profiler dài hạn cho FPS/CPU/heap trên máy cấu hình thấp; chưa nghiệm thu Firefox hoặc thiết bị cảm ứng thật.
- Measurement panel là sổ đo trong phiên, chưa tự đồng bộ vào Student Notebook. Muốn dùng làm bằng chứng báo cáo lâu dài, học sinh tiếp tục vào Lab tương ứng.

Không commit, push, tag hoặc deploy trong checkpoint này.
