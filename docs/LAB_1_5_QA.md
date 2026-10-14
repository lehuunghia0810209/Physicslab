# PhysicsLab 1.5 — Virtual Lab Remake · Báo cáo phát triển và kiểm thử

## Thay đổi có trong bản bàn giao

- Xây tiếp trên đầy đủ mã nguồn PhysicsLab 1.3 R4, không xóa các trang Learning, Simulations, Tools, 3D, progress.
- Danh mục hiện có **15 bàn thực hành không trùng lặp**: Mạch điện, Hooke, Khí lí tưởng chuyên dụng từ R2/R3/R4 + **12 cảnh tương tác Canvas** xây mới.
- Không còn trang generic "sơ đồ SVG tĩnh + nút kéo trên đáy hình". Thay thế bằng Canvas với các vật thể, tay nắm thao tác thực, đồng hồ thời gian, điều khiển chạy/dừng/thử lại, vị trí quan sát, hướng dẫn Thử → Quan sát → Ghi số đo.
- Mỗi cảnh trong 12 cảnh dùng hình vẽ riêng (xe-lực, va chạm, mặt phẳng nghiêng, quỹ đạo đạn, lò xo, sóng, quang học, trường từ, cảm ứng điện từ); có tương tác gắn vào thông số vật lý phù hợp.
- Các bài trùng *Ohm, Hooke, khí lí tưởng* được bỏ khỏi danh mục generic để mở đúng bàn thực hành chuyên dụng, tránh tồn tại bản kém tương tác song song.
- Phần chọn độ chia dụng cụ và thông số phụ đã chuyển vào `details` (mở rộng) để học sinh tập trung vào cảnh.
- Mô hình đo, độ chia thiết bị, đồ thị phép đo, CSV, báo cáo, dữ liệu lưu tại máy và bài học liên kết được giữ.
- Đầu dò tính độ cao đạn ở tọa độ dọc trục x và li độ sóng ở tọa độ dọc dây; ở các cảnh khác nó chỉ là mốc quan sát và giá trị lý thuyết toàn thí nghiệm (không giả là cảm biến cục bộ).
- Điều kiện ma sát: tự đảm bảo hệ số ma sát trượt không vượt hệ số ma sát nghỉ để tránh mô hình bị invalid khi học sinh chỉnh độc lập.
- Nhãn bàn, chế độ bàn phím, vị trí cuộn trên mobile, trường hợp ảnh thấu kính ở vô cực đã có xử lý.

## Chính xác khoa học và giới hạn

- Số liệu ghi vào sổ và giá trị hai trục đều do `measureLabExperiment` và `measureWithInstrument` tính (mô hình khoa học sẵn có), **không lấy từ pixel**.
- Quỹ đạo ném xiên và xe Newton/ma sát/va chạm/dao động bám các hàm giải tích hiện có và thời gian mô phỏng.
- Sóng và từ trường được minh họa bằng phương trình lý tưởng đơn giản; các vị trí/hình khối là hình giải thích, không phải thiết bị đo vật lý hoàn chỉnh.
- Bản này **không** đồng nghĩa đã xây mới cả 13 mô phỏng trang Simulations, Tools và 3D. Các mục đó kế thừa R4.
- Các bàn mới chưa có lắp ráp thiết bị tự do như mạch điện R2; chúng có *tương tác trực tiếp ở đối tượng vật lý* nhưng không phải bản sao PhET. Không dùng mã nguồn/hình có bản quyền PhET.
- Sổ phép đo generic là snapshot theo trạng thái thiết lập thí nghiệm, chưa hỗ trợ lấy mẫu tức thời ở mọi thời điểm mô phỏng của tất cả 12 cảnh.
- Không hỗ trợ phỏng đoán quá trình hay sai số ngẫu nhiên chưa xác minh; chỉ dùng độ chia từ thiết bị định nghĩa trong mã nguồn.

## Kiểm thử đã chạy

- `npm run check:core`: test theo Node, syntax và import checks; xem file test `tests/lab-15-live-workbench.test.js`.
- Test riêng bao gồm đầy đủ 12 tay nắm, đối chiếu tọa độ → thông số, giới hạn tham số, số liệu khoa học hữu hạn, đầu dò sóng giao thoa và đạn.
- Smoke Chromium thực tế dùng in-memory module map (thay import CSS bằng CSS inject, thay import package version); kiểm tra vào Lab, mở Projectile và Lens, nhấn Chạy/Tạm dừng, đầu dò, Ghi phép đo, desktop và viewport 390px, mở lại R2 Circuit / R3 Hooke. Đây là **smoke test tích hợp trong trình duyệt, không phải kiểm thử Vite production**.
- `npm run build`/`npm run check:browser` cần chạy lại trên Windows có đủ Vite + Playwright. Không công bố Stable trước khi PASS.

## Cài đặt / nghiệm thu trên máy

Giữ lại `.git`, sao lưu dự án và thư mục tiến độ trình duyệt; chép ZIP full source vào dự án. Sau đó:

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check
npm run dev -- --port 5188
```

Mở `http://127.0.0.1:5188/#/lab`. Thử kéo trực tiếp bàn Ném xiên, lực ma sát, thấu kính, mặt phẳng nghiêng; chạy/dừng; đặt đầu dò; ghi 3 phép đo; so sánh đồ thị; test mạch điện và Hooke không hồi quy. Với Playwright cài sẵn, chạy `npm run check:browser` ở terminal riêng và kiểm tra kích thước mobile.
