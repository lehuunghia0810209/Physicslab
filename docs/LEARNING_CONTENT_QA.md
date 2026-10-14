**CHECKPOINT MỚI:** 49 bài trên bản đồ đã có nội dung theo cấu trúc; 98 ví dụ và 245 câu hỏi. Unit 269/269 PASS và 30 bài số mới đã được tính lại độc lập. **Chưa có phản biện sư phạm độc lập**. Chi tiết: [LEARNING_3_0_CONTINUATION.md](LEARNING_3_0_CONTINUATION.md). Các số liệu 19 bài/95 câu dưới đây chỉ mô tả checkpoint A lịch sử.

---

# Learning 3.0 — QA nội dung

## Phạm vi đã kiểm chứng

- 19 bài hoàn chỉnh được biên soạn bằng tiếng Việt, không sao chép nguyên văn SGK; lớp 10 đạt 17/17.
- 38 ví dụ có dữ kiện, phân tích, công thức, thay số, đáp số, đơn vị và ý nghĩa kết quả.
- 95 câu hỏi có ID, lớp, bài, loại, mức độ, đáp án, lời giải và kiến thức ôn lại. Toàn bộ 16 đáp án số của các bài lớp 10 mới được tính lại từ dữ kiện bằng unit test; 6 đáp án số của ba bài checkpoint cũ tiếp tục có kiểm tra riêng.
- Công thức đã kiểm: `ΣF = ma`, `v = fλ`, `pV = nRT`, đẳng tích và Boyle. Điều kiện áp dụng được hiển thị cạnh công thức.
- Lesson validator bắt buộc ít nhất hai ví dụ, năm câu, hoạt động thực nghiệm và phần tổng kết trước khi một bài được đưa vào danh sách `Complete`.
- Question validator phát hiện ID trùng, liên kết bài sai, đáp án ngoài lựa chọn, thiếu lời giải, numeric thiếu đơn vị/công thức, tolerance âm hoặc không hữu hạn.

## Không được suy diễn từ kiểm thử

Unit tests chỉ chứng minh schema và những phép tính cụ thể đã mã hóa. Chúng không chứng minh toàn bộ 49 đơn vị đúng về sư phạm, không thay thế phản biện của giáo viên và không xác nhận tương thích nguyên văn với ba bộ SGK.

## Kết quả hiện tại

- Bài hoàn chỉnh: **19** — lớp 10: 17, lớp 11: 1, lớp 12: 1.
- Ví dụ giải đầy đủ: **38**.
- Câu hỏi biên soạn/kiểm chứng: **95**.
- Bài hoàn chỉnh có hoạt động thực nghiệm/quan sát: **19/19**; bài chưa có mô phỏng dùng quy trình không màn hình và không tạo link giả.
- Bản đồ đã phân loại cấu trúc: **49/49**; rà soát nội dung bài học hoàn chỉnh: **19/49**.

## Bước QA học thuật tiếp theo

1. Giáo viên Vật lí rà soát từng yêu cầu cần đạt với phụ lục môn Vật lí chính thức.
2. Kiểm tra ngôn ngữ, độ khó và nhiễu sai của câu hỏi với học sinh lớp tương ứng.
3. Mỗi bài mới phải qua validator, kiểm tra phép tính độc lập và review thủ công trước khi đổi trạng thái `Complete`.
