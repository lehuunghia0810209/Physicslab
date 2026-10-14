# PhysicsLab 1.3 Remake R2 — Circuit Workbench

## Cách sử dụng

1. Vào **Phòng thí nghiệm**, thẻ **Lắp mạch điện tương tác** (mặc định được mở).
2. Dùng bố trí **Nối tiếp** để quan sát đèn sáng với nguồn 9 V và bóng 12 Ω, dòng 0,75 A. Bấm công tắc để ngắt/đóng.
3. Chuyển **Song song** để quan sát hai bóng 12 Ω được cấp chung 9 V: mỗi bóng nhận 0,75 A, tổng dòng nguồn 1,5 A.
4. Chọn **Bàn trống**. Nhấn hoặc kéo dụng cụ từ khay vào bàn; di chuyển linh kiện bằng kéo thả.
5. Chạm **đầu nối tròn A** của linh kiện thứ nhất, rồi **đầu nối tròn B** của linh kiện thứ hai. Cũng có thể kéo từ đầu này sang đầu kia. Mỗi dây chỉ liên hệ hai đầu, không suy ra kết nối tại giao nhau về mặt hình học.
6. Chạm thân công tắc để đóng/ngắt; chạm linh kiện để sửa thông số, xoay 90°, bỏ linh kiện; chạm dây để tháo.
7. Đặt ampe kế nối tiếp, vôn kế song song; kiểm tra trị số rồi **Ghi phép đo** và **Xuất CSV**.

## Tính khoa học

Dùng đồ thị kết nối dựa trên các đầu cực, hợp nhất dây và công tắc đóng theo giả định lí tưởng. Hệ DC tuyến tính thuần trở được giải bằng modified nodal analysis có pivoting, hỗ trợ nhiều nút và nguồn DC; chập trực tiếp hai cực nguồn hoặc đấu nguồn lý tưởng mâu thuẫn được đưa về trạng thái cảnh báo thay vì trả vô cực. Mạng không có nguồn hoặc mạch hở không có dòng. Các nhánh dẫn nối với đầu hở không ảnh hưởng các nhánh có dòng. Với dây dẫn lý tưởng có vòng, phân bố dòng trên **từng đoạn dây** không xác định duy nhất: animation hiển thị một phân bố hợp lệ theo cây bao trùm, không phải giá trị đo thật.

Bóng đèn dùng điện trở không đổi nên công suất P=I²R điều khiển độ sáng định tính, không mô phỏng dây tóc, nhiệt hay màu phổ. Ampe kế có R=0,02 Ω và vôn kế R=10 MΩ để tránh phần tử lý tưởng vô hạn trong ma trận.

## Thay đổi dự án

- `src/core/circuit-workbench.js`: mô hình và giải mạch.
- `src/pages/circuit-workbench.js`: render SVG, palette, thao tác pointer/touch, nhập giá trị, lưu/CSV.
- `src/styles/circuit-workbench.css`: bàn thí nghiệm responsive và theme.
- `src/pages/lab.js` và `src/pages/lab-discovery.js`: vào mục phòng thí nghiệm, giữ các mục cũ.
- `tests/circuit-workbench.test.js`: các bài kiểm thử toán và đầu vào bất thường.
- `scripts/browser-check.cjs`: bổ sung nghiệm thu mạch mới, giữ nghiệm thu Hooke/15 phòng thí nghiệm trước đó.

## Kiểm chứng và giới hạn

Đã chạy Node unit tests và JS static verifier trên toàn source. Thử một **bản dựng mô phỏng standalone** của bàn mạch trong Chromium headless: đổi nối tiếp/song song, đóng công tắc, lắp dây bằng chuột/chạm, thay điện trở, xem console, kiểm tra tràn ngang tại 390px. Đây **không phải** browser test của website nguyên khối; localhost bị policy chặn và Vite không được cài thành công trong môi trường này.

Trước khi triển khai Cloudflare, chạy trên VS Code Windows:

```
npm ci
npm run check
npm run dev -- --port 5188
# terminal khác
npm run check:browser
```

Kiểm tra bàn mạch tối/sáng, máy tính/điện thoại, kết quả các mạch mẫu, CSV, đóng/ngắt, tải lại trang sau lưu. Không xóa localStorage hoặc `.git`.

Không dùng, sao chép hoặc che mã nguồn/logo PhET. Chỉ tham khảo nguyên tắc tương tác trực quan và khám phá tự do.
