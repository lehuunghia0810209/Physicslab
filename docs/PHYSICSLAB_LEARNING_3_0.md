**CẬP NHẬT CHECKPOINT TIẾP THEO (2026-10-14):** 49/49 bài đã được biên soạn thành Lesson Reader; tổng 98 ví dụ và 245 câu hỏi, gồm 30 bài mới lớp 11–12. Số liệu kiểm thử mới, giới hạn và kiểm chứng học thuật xem [LEARNING_3_0_CONTINUATION.md](LEARNING_3_0_CONTINUATION.md). **Phần bên dưới là trạng thái lịch sử của checkpoint A**, không phải số liệu hiện tại.

---

# PhysicsLab Learning 3.0 — checkpoint 2026-10-14

## Trạng thái

Đây là checkpoint triển khai thực tế trên `2.4.0-dev`, **chưa phải Learning 3.0 hoàn chỉnh hoặc Stable**. Bản đồ có 49 đơn vị; lớp 10 đã hoàn thành 17/17 bài, lớp 11 và 12 hiện có một bài hoàn chỉnh mỗi lớp.

## Phần đã triển khai

- Deep-link bài học: `#/learning/<lesson-id>` hỗ trợ reload, Back/Forward và giữ bài gần nhất.
- Lesson Reader có mục tiêu, kiến thức cần có, đại lượng–đơn vị, khởi động, lý thuyết, điều kiện áp dụng, sai lầm thường gặp, hai ví dụ giải từng bước, hoạt động thực nghiệm, luyện tập, tổng kết và ghi chú.
- 19 bài hoàn chỉnh: lớp 10 có 17/17, lớp 11 có `wave-discovery`, lớp 12 có `ideal-gas-discovery`; tổng 38 ví dụ và 95 câu hỏi.
- Question Engine hỗ trợ trắc nghiệm một đáp án, đúng/sai nhiều mệnh đề, đáp án số có dấu phẩy/dấu chấm và tolerance công khai, trả lời ngắn chuẩn hóa tiếng Việt.
- Hai chế độ: Luyện tập phản hồi theo từng câu và Kiểm tra chỉ hiện lời giải sau khi nộp.
- Ôn lại câu sai gần nhất và ghi chú được lưu trong `physicslab.learning.v1`; không thay đổi `physicslab.progress.v1`.
- Mỗi bài hoàn chỉnh mở đúng Simulation và Virtual Lab hiện có; dữ liệu thí nghiệm tiếp tục dùng Notebook/Experiment Store hiện hành.
- Bộ lọc Lab hỗ trợ một bàn thuộc nhiều lớp, có đặt lại tìm kiếm/chủ đề và không chặn deep-link workspace.
- Revision Home `#/learning/revision` lọc lớp/chủ đề, hiển thị công thức, tạo đề 10 câu không trùng, luyện câu sai và lưu kết quả trong kho Learning hiện có.

## Kiến trúc

- `src/data/thpt-program.js`: bản đồ 49 đơn vị, core/elective, tài nguyên và khoảng trống.
- `src/data/learning/lesson-content.js`: nội dung bài hoàn chỉnh, tách khỏi page.
- `src/data/learning/question-bank.js`: câu hỏi và metadata độc lập.
- `src/core/lesson-content.js`: kiểm tra hợp đồng bài học.
- `src/core/question-engine.js`: validation và chấm điểm thuần, không phụ thuộc DOM.
- `src/core/learning-store.js`: kho local version 1, giới hạn ghi chú/kết quả và từ chối ghi đè kho lỗi.
- `src/app/lesson-reader.js`, `src/app/lesson-assessment.js`: UI bài đọc và đánh giá dùng lại.
- `src/pages/learning.js`: điều phối catalog, deep-link, progress và bài khám phá cũ.

## Bảo toàn dữ liệu

`physicslab.progress.v1`, Notebook và Experiment Store không đổi schema. Learning 3.0 chỉ thêm `physicslab.learning.v1`. Nếu JSON kho mới bị hỏng, ứng dụng báo lỗi và từ chối ghi đè dữ liệu gốc; các tiến độ cũ vẫn độc lập.

## Kết quả kiểm thử checkpoint

- `npm run check:release`: **PASS** ngày 2026-10-14.
- Unit: **266/266 PASS**; production build: **PASS**, 159 modules.
- Browser QA: **PASS** cho 13 mô phỏng và các route Learning/Lab/Tools/3D ở 320/360/390/768/1024/1440/1920 px.
- Deep-link Lesson Reader, chấm câu sai, ôn lại, ghi chú qua reload, bộ lọc Lab đa lớp, target 44 px, tên truy cập, cleanup animation và Offline/PWA: **PASS**.

## Chưa hoàn thành

- 30/49 đơn vị lớp 11–12 chưa đạt cấu trúc bài học hoàn chỉnh; các luồng Discovery cũ vẫn được giữ để không mất tiến độ.
- Revision Home hoạt động trên ngân hàng hiện có nhưng lớp 11 và 12 mới có 5 câu mỗi lớp, chưa đủ độ phủ cho đề tổng hợp đa chương.
- Mỗi bài lớp 10 hiện có 5 câu đa dạng; yêu cầu tách riêng 3 câu kiểm tra nhanh và 5 bài luyện tập/bài chưa được mở rộng thành 8 câu.
- Chưa rà soát sư phạm độc lập bởi giáo viên cho toàn bộ nội dung; kiểm thử tự động không thay thế bước này.
- Firefox, thiết bị cảm ứng thật, screen reader và profiling dài hạn vẫn là nghiệm thu thủ công trước Stable.
