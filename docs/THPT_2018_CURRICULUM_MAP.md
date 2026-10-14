# Bản đồ Vật lí THPT 10–12 theo GDPT 2018

Nguồn khung kiến thức: Bộ GD&ĐT, Chương trình môn Vật lí, ban hành theo Thông tư **32/2018/TT-BGDĐT** ngày 26/12/2018. Bản đăng kèm văn bản tại trường công lập: https://thcsandong.haiphong.edu.vn/van-ban-bo-gddt/chuong-trinh-giao-duc-pho-thong-mon-vat-ly-ban-hanh-kem-theo-thong-tu-so-322018/vbct/20343/91436

**Khác biệt sách giáo khoa:** Đây là danh mục tự xây theo yêu cầu cần đạt, không khẳng định số thứ tự hoặc nội dung cụ thể của từng bộ sách. Chủ đề Vật lí 11 của bản 2018 gồm dao động, sóng, trường điện, dòng điện–mạch điện. Học liệu thấu kính của hệ thống 2.2 được giữ là **mở rộng**, không mạo nhận là mạch chính. Lớp 10 gồm động học, động lực học, công–năng lượng, động lượng, chuyển động tròn, biến dạng vật rắn. Lớp 12 gồm vật lí nhiệt, khí lí tưởng, trường từ, hạt nhân–phóng xạ. Các chuyên đề tự chọn được phân biệt rõ.

File nguồn lập trình `src/data/thpt-program.js` là danh sách chi tiết 49 đơn vị với trường `grade`, `theme`, `title`, `objective`, `question`, `simulationId`, `labId`, `lessonId`, `status`, `note`, `elective`. Trường `status` và ghi chú giúp giáo viên biết điều gì chạy được; các hoạt động chưa có mô phỏng không được vẽ nút giả.

### Minh họa kế hoạch học theo mô hình

1. **Lớp 10 – Định luật Newton:** dự đoán a khi thay đổi m và F → chọn bàn Định luật II Newton → kéo lực → ghi lực và gia tốc → đối chiếu a = ΣF/m.
2. **Lớp 11 – Giao thoa sóng:** dự đoán kết quả tại một điểm khi độ lệch pha thay đổi → đặt hai nguồn trên trạm Giao thoa → kéo đầu dò → theo dõi u1, u2, u và biên độ → ghi CSV.
3. **Lớp 12 – Faraday–Lenz:** dự đoán emf khi nam châm đứng yên → kéo nam châm qua cuộn dây → so sánh dấu và độ lớn suất điện động → ghi lần chạy → so sánh khi tăng số vòng.
4. **Lớp 12 – Nhiệt lượng:** đặt m1,m2,c1,c2,T1,T2 → dự đoán T_eq → chạy trạm trao đổi nhiệt → đọc nhiệt kế và đồ thị → kiểm tra Q1+Q2≈0.

### Các mục còn thiếu cần mở rộng trước Stable

- Lớp 10: chuyển động tròn chuyên dụng, các bài đo sai số đầy đủ.
- Lớp 11: điện dung, điện trở trong của nguồn, cộng hưởng cưỡng bức, truyền sóng vô tuyến (chuyên đề).
- Lớp 12: chuyển thể, phóng xạ–bán rã, phản ứng hạt nhân, chuyên đề AC/ lượng tử/ y học.
- Phát triển bài đọc, ví dụ tự luyện và câu hỏi đánh giá riêng cho từng đơn vị; hiện hệ thống còn 16 bài học có quiz trọn vẹn được kế thừa.
