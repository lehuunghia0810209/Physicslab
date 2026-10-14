# PhysicsLab 2.4.0-dev — Learning 3.0 QA Hardening

## Nguồn và phạm vi

Tiếp tục **trực tiếp trên Full Source 2.4 Learning 3.0** của checkpoint 49/49 bài, 98 ví dụ và 245 câu hỏi. Đây là bản ổn định hóa logic, **không thay thế chương trình học, không thêm nội dung giả**. Mọi kết quả dưới đây chỉ áp dụng cho gói mã nguồn này.

## Những vấn đề được xác định và sửa

1. **Chấm kết quả số bằng tiền tố:** trước đây người học có thể gõ `2 m/s` hoặc `2 abc` khi bài yêu cầu `2 m/s²` mà vẫn được chấm đúng vì trình chấm chỉ đọc phần đầu `2`. Hiện đã phân tích toàn bộ chuỗi số/đơn vị, chấp nhận dấu phẩy thập phân và cách viết `m/s2` tương đương `m/s²`, đồng thời từ chối ký tự thừa, đơn vị sai, chuỗi có hai giá trị hoặc sai ngưỡng. Không bắt buộc học sinh gõ lại đơn vị vì ô nhập đã hiển thị đơn vị yêu cầu.
2. **Dung sai điểm số không hữu hạn:** validator trước đây có thể chấp nhận một tolerance `NaN` nếu trường tolerance kia hữu hạn. Đã yêu cầu từng giá trị được khai báo đều hữu hạn và không âm.
3. **Luyện một câu bị ghi thành điểm toàn bài:** lúc trước kiểm tra một câu trong chế độ Luyện tập có thể lưu `100%` hoặc `0%` như một lượt kiểm tra đã hoàn thành. Đã tách lỗi làm bài thực hành vào `practiceWrong` tùy chọn; chỉ một lượt làm đủ câu mới ghi `attempts` và tiến độ quiz. Không thay đổi khóa `physicslab.learning.v1` hoặc phiên bản dữ liệu; bản v1 cũ tự đọc được vì trường bổ sung không bắt buộc.
4. **Ôn câu sai làm hỏng điểm của bài hoàn chỉnh:** lượt chỉ ôn những câu bị sai hiện không ghi đè điểm toàn bài. Trả lời đúng một câu trong chế độ Luyện tập sẽ bỏ câu đó khỏi danh sách cần ôn, nhưng giữ điểm kiểm tra lịch sử.
5. **Đề tổng hợp thiên lệch các bài đầu danh mục:** chọn câu bằng cách trộn và ưu tiên bài học chưa xuất hiện, đồng thời luân phiên mức độ nhận biết/thông hiểu/vận dụng/vận dụng cao. Vẫn không chọn trùng ID. Có thể tiêm nguồn ngẫu nhiên cố định cho các unit tests; trên UI sử dụng nguồn ngẫu nhiên mặc định.
6. **Giải thích đúng/sai nhiều mệnh đề:** bổ sung phản hồi riêng cho từng mệnh đề, thay vì chỉ một thông báo chung. Chuyển từ Luyện tập sang Kiểm tra đặt lại câu trả lời/feedback để tránh kéo theo lời giải từ chế độ cũ.

## Bảo toàn tương thích

- Giữ các khóa `physicslab.progress.v1`, `physicslab.learning.v1`, `physicslab.experiments.v1`.
- Không thay `package.json`, dependencies, Simulation/Lab/3D/Teacher Studio.
- Kho Learning v1: thêm trường **tùy chọn** `practiceWrong` bên cạnh `attempts` và `notes`, có sanitation khi tải. Không ghi đè dữ liệu Learning đang lỗi; người dùng giữ được bản gốc để khôi phục.
- `tests/learning-store.test.js` xác minh dữ liệu v1 cũ vẫn đọc được, điểm kiểm tra không biến mất khi ôn lại và lỗi từng câu vẫn khôi phục sau tải lại.
- `scripts/browser-check.cjs` thêm assertion: làm sai một câu ở chế độ thực hành không tự tạo điểm toàn bài.

## Kết quả tại môi trường đóng gói

- `npm run check:core` → **275/275 PASS**, gồm những regression tests mới.
- `node --check scripts/browser-check.cjs` → **PASS**.
- `npm ci --offline` → **không hoàn thành**, do tarball Vite 8.3.4 không nằm trong cache npm của môi trường Linux này.
- Production build, Chromium browser QA, Offline/PWA QA → **CHƯA CHẠY** trên checkpoint hiện tại. Không được trích kết quả PASS từ lần chạy phiên bản trước để khẳng định checkpoint này đã qua nghiệm thu.

## Cách nghiệm thu trên máy Windows

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check:release
npm run dev -- --port 5188
```

Thử thủ công trên `#/learning/newton-discovery` và `#/learning/revision`:

- Kiểm tra **một** câu bằng chế độ Luyện tập, reload. Câu sai phải được nhớ, nhưng không được hiển thị điểm kiểm tra toàn bài giả.
- Làm đủ đề trong chế độ Kiểm tra, nộp và xem giải thích.
- Chọn Chỉ ôn câu sai; làm lại câu sai rồi kiểm tra điểm toàn bài vẫn giữ nguyên.
- Ở câu số yêu cầu gia tốc `m/s²`, gõ `2 m/s`: phải sai; `2 m/s²` hoặc `2 m/s2` phải đúng khi đáp án là 2.
- Ôn tập tổng hợp phải lấy câu từ nhiều bài học khác nhau, không chỉ những bài xuất hiện trước trong catalog.
- Reload và kiểm tra tiến độ/ghi chú/Experiment Studio không mất dữ liệu.

## Trước khi phát hành Stable

Chưa có phản biện độc lập của giáo viên Vật lí cho 49 bài, chưa đo Firefox/thiết bị cảm ứng thật/screen reader/PWA đa tab và hiệu năng dài hạn. Mỗi bài hiện có 5 câu, chưa phải ngân hàng đề thi chuẩn hóa. Không gọi checkpoint này là Stable.
