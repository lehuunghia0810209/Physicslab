# Learning 3.0 — Full Curriculum Content checkpoint (2026-10-14)

## Phạm vi thay đổi

- Bắt đầu từ source ZIP `physicslab(2).zip`, **không làm lại** ứng dụng; giữ nguyên các mô phỏng, phòng thí nghiệm, Notebook, Teacher Studio và schemas dữ liệu đã có.
- Biên soạn **15 mục lớp 11 + 15 mục lớp 12** theo chính 30 mã hiện có của `src/data/thpt-program.js`.
- Tất cả 49/49 mục hiện có Lesson Reader với tối thiểu hai ví dụ giải 3 bước và năm câu hỏi có đáp án/lời giải; 98 ví dụ và 245 câu hỏi trên toàn dự án.
- Mỗi bài mới: bài đọc theo chủ đề, công thức kèm điều kiện áp dụng, lỗi phổ biến, bài thực nghiệm có số liệu cần ghi và kết luận cần đối chiếu.
- Hệ thống chưa có một số mô phỏng chuyên dụng; không dựng liên kết giả. Trạm induction / interference / calorimetry được hiển thị khi phù hợp.
- Sửa lỗi UX: danh mục 16 thẻ không còn che bài đọc sâu; điều hướng bài trước/sau theo **thứ tự THPT Program**, mục lục cuộn trực tiếp thay vì dùng hash khiến SPA thay trang.
- Sửa hành trình `THPT Navigator`: mỗi đơn vị mới hiện liên kết đến Lesson Reader qua `programId`, kể cả khi `lessonId` trong metadata cũ còn `null`.
- Giữ tên phiên bản `2.4.0-dev`; đây là checkpoint nội dung, **không phải Stable**.

## Kiến trúc và bảo toàn dữ liệu

- `src/data/learning/advanced-builder.js`: định dạng dữ liệu chung cho lớp 11–12, sinh lesson + câu hỏi theo mã đã tồn tại.
- `src/data/learning/grade11.js`, `grade12.js`: dữ liệu biên soạn riêng theo bài.
- `src/data/learning/lesson-content.js` và `question-bank.js`: hợp nhất vào hệ thống học tập cũ.
- Không thay đổi `physicslab.progress.v1`, `physicslab.learning.v1`, `physicslab.experiments.v1` hoặc schema backup.
- `src/app/lesson-reader.js` có phím chuyển mục và liên kết các trạm thật; `src/pages/learning.js` điều hướng lộ trình và bài.

## Kiểm thử ở môi trường đóng gói

- `node scripts/check.mjs`: PASS (201 modules JS; các liên kết import và export hợp lệ).
- `node --test tests/*.test.js`: PASS 269/269. Bổ sung bài kiểm tra Coverage Matrix 49 mục, schema Lessons + Questions, số ví dụ/câu hỏi và **30 phép tính số độc lập** theo dữ kiện (với tolerance được kiểm soát).
- Không chạy được `vite build`, `npm run check:browser`, `npm run check:offline` trong môi trường biên soạn do không có cache npm Vite và native Rolldown Linux. Đừng tự suy diễn các bước này PASS.
- Sau khi chép Patch trên Windows, bắt buộc chạy `npm ci` (nếu cần) và `npm run check:release`, kiểm tra trực quan các route sâu `#/learning/11-osc`, `#/learning/12-thermal`, `#/learning/revision` và tương tác qua bài trước/sau.

## Giới hạn bắt buộc ghi nhận

1. Mặc dù tất cả 49 đơn vị đã có bài đọc theo schema, **chưa qua phản biện giáo viên**. Tính chính xác của từng câu hỏi/lời giải cần thẩm định ngoài các bài kiểm thử công thức cụ thể.
2. 5 câu mỗi bài không phải ngân hàng đề quy mô lớn hay đề kiểm tra chuẩn hóa; Revision Home hiện dùng câu đã có, không trùng trong cùng đề.
3. Nhóm hạt nhân, tụ điện, chuyển pha, nguồn có r và các chuyên đề tự chọn là hoạt động giấy/bảng số liệu khi chưa có mô phỏng thật.
4. Mở bài 11–12 mới phải test mouse/touch, screen reader, Firefox và tình huống PWA offline đa tab trên thiết bị người dùng.
