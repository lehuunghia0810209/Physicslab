# PhysicsLab 1.2 — Balanced Development Plan

**Nguồn nâng cấp:** `1.0.0-rc.2` (không thay thế project khác).  
**Đối tượng:** học sinh lớp 10–12 và giáo viên Vật lý THPT Việt Nam.  
**Nguyên tắc:** PhysicsLab là website độc lập, Vite + Vanilla JS, tiếng Việt, mô hình vật lý kiểm chứng, localStorage tương thích ngược, không lạm dụng 3D.

## Phạm vi và thứ tự

| Mốc | Phần việc | Điều kiện nghiệm thu |
| --- | --- | --- |
| **1.2.0-alpha.1** | Cải thiện tương tác đồ thị; so sánh hai cú ném; liên kết giao cấu hình cho giáo viên; token giao diện bổ sung, readability và responsive | Không thay đổi model ném xiên; test pure-domain PASS; các đồ thị đồng bộ; giữ 13 mô phỏng và 16 bài học; khả dụng từ bàn phím |
| **1.2.0-alpha.2** | Simulation Workspace 2.0: chuẩn hóa controls, measurement & multi-run trong những mô phỏng có ý nghĩa, điều khiển tốc độ và vòng đời mô phỏng | Chạy/Pause/Seek/Reset và graph cursor nhất quán; SVG/Canvas dọn tài nguyên khi rời trang; các bài test Vật lý vẫn PASS |
| **1.2.0-beta.1** | Learning/Lab 2.0: bài học dự đoán–thử nghiệm–đối chiếu–quiz sâu hơn; hoàn thiện cách đo/hiệu chuẩn/sai số cho Hooke; chế độ trình chiếu GV | Không có tiến độ giả; không mất kết quả cũ; các phép đo có đơn vị và sai số rõ ràng; tương tác thực qua thiết bị |
| **1.2.0-beta.2** | 3D Explorer 2.0, camera presets, điều khiển vector, fallback 2D; sau đó chọn phát triển Doppler/RC/máy phát điện xoay chiều theo sức chứa kiểm thử | Quỹ đạo/hạt luôn nằm trong viewport; khoa học đúng; không thêm cảnh 3D chỉ để trang trí; mỗi mô phỏng có test và bài học liên quan |
| **1.2.0 stable** | Khả năng truy cập, audit mobile/laptop, QA số liệu, hiệu năng, docs, build & Cloudflare Pages deployment | npm run check; npm run check:browser ở 320/360/390/768/1024/1440px; zero critical JS console errors; không tràn ngang; thao tác >=44px |

## Checklist kỹ thuật và độ ưu tiên

### P0 — Bảo toàn chất lượng
- Không xóa key `physicslab.progress.v1`, không thay schema dữ liệu học tập khi không có migration.
- Không viết lại toàn bộ simulation codebase hoặc di chuyển site sang React/monorepo.
- Validate đầu vào số (NaN, Infinity, min/max), SI, giả định cho từng mô phỏng.
- Build và browser checks phải được chạy tại môi trường có Vite/Playwright, không gộp "unit PASS" thành "site PASS".

### P1 — UI/UX và khoa học
- Chart 2.0: interactive inspector, keyboard navigation, đồng bộ với timeline, tham chiếu có cùng scale.
- Các thao tác chỉ nên thay đổi UX; mô hình lõi là nguồn chân lý cho hình ảnh và số đo.
- Cơ chế chia sẻ cấu hình qua URL không đụng vào điểm số, thông tin học sinh hoặc dữ liệu cá nhân.
- Light/Dark tokens luôn đủ định nghĩa (bao gồm `--surface-alt`), ưu tiên bố cục desktop hai cột đồ thị lớn và mobile một cột.

### P2 — Mở rộng dựa trên bằng chứng
- Dụng cụ Lab: độ chia/độ không đảm bảo và phép đo có trạng thái hiệu chuẩn.
- Giáo viên: trình chiếu/tạo tình huống bài học, chia sẻ cấu hình bằng URL mà không cần backend.
- 3D: camera fit, nhãn đại lượng, fallback 2D, dọn tài nguyên hoạt ảnh khi thoát.
- Cân nhắc PWA và thêm 3 mô phỏng mới sau khi hệ thống hiện tại được kiểm thử trên các thiết bị phổ biến.

## Kiểm tra bắt buộc sau mỗi mốc

1. `npm run check:core` — syntax, imports, physics/regression unit tests.
2. `npm run build` — Vite production artifact `dist/`.
3. Terminal A: `npm run dev -- --port 5188`; Terminal B: `npm run check:browser` — test browser chính thức.
4. Manual desktop/mobile: đổi theme, điều hướng, mô phỏng, bản vẽ SVG/Canvas, bàn Lab, học tập, tiến độ, export.
5. Xem báo cáo thời gian tải/Bundles; chỉ kết luận hiệu năng khi có số đo thực tế và ngân sách định lượng phù hợp.
6. Commit/checkpoint từng mốc; push GitHub để Cloudflare Pages tự triển khai sau khi kiểm thử thành công.

## Trạng thái

Bản bàn giao hiện tại là **alpha.1, chưa phải PhysicsLab 1.2 stable**. Chỉ những tính năng ghi trong changelog alpha.1 đã được triển khai. Những hạng mục alpha.2/beta/stable là *kế hoạch*, không được mô tả là đã hoàn thành.
