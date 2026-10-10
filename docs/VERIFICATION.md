# Báo cáo kiểm chứng — PhysicsLab 0.1

Ngày: **09/10/2026**, múi giờ Asia/Saigon. Mã nguồn bàn giao là bản sau các sửa lỗi tìm được khi kiểm thử trình duyệt.

## Đã làm và đạt

| Kiểm chứng | Kết quả |
| --- | --- |
| Đọc yêu cầu gốc | Đã đọc đầy đủ tệp đính kèm `Pasted text.txt`; lưu nguyên văn tại `MASTER-CONTEXT.txt` |
| `npm run check` cuối cùng | PASS; Node 24.21.0, Vite 8.3.4 |
| Syntax | 28 JS/CJS modules hợp lệ qua `node --check` |
| Imports | 52 relative import tồn tại; registry không static-import simulation |
| Test tự động | 12/12 PASS; không skip |
| Production build | PASS; 33 modules, chunk riêng projectile JS/CSS và các pages |
| Runtime development | PASS sau sửa lỗi default route và nút playback bị thay DOM khi click |
| Runtime production | PASS trên `vite preview`, HTTP localhost |
| Browser smoke | 19 nhóm kiểm tra PASS; xem `browser-report.json` |
| Responsive | 6 route × 6 widths = 36 cấu hình: 1440, 1024, 768, 390, 360, 320 px |
| Tràn ngang | Không tràn ngang document trong 36 cấu hình; bảng đo có vùng cuộn riêng |
| Touch targets | Button/select/range không bị disabled: width/height ≥ 44px trong các cấu hình đã đo |
| Visual QA | Đã xem screenshot Home và Ném xiên ở desktop 1440px và mobile 390px |
| Console/runtime | Không pageerror, console error hoặc failed request trong lần kiểm tra production |

## Kiểm tra vật lý cụ thể

- Earth θ = 45°, v0 = 20, h0 = 0: đối chiếu T, R, H với công thức giải tích.
- θ = 30°/60°: tầm xa bằng nhau ở h0 = 0; không giả định bằng nhau khi h0 khác 0.
- Moon g = 1,62: đối chiếu tỷ lệ T/R theo g với h0 = 0.
- Ném ngang từ độ cao: T = sqrt(2h/g).
- v0 = 0, h0 = 0, θ = 0°, θ = 90°: các trạng thái hữu hạn; endpoint y = 0; time bị chặn đúng.
- Quét g = 0,1/1,62/9,81/25; θ = 0/30/45/90; h0 = 0/15/30 với v0 = 37,5: bảo toàn cơ năng trên đơn vị khối lượng và đối chiếu đạo hàm x/y với vx/vy.
- Từ chối NaN, Infinity, g = 0 và các tham số ngoài giới hạn.
- Kiểm tra đổi đơn vị SI và số đo/CSV có giá trị từ mô hình.
- Timeline chạm đất đúng thời gian T, không đi tiếp dưới mặt đất, cleanup listener.

## Kiểm tra browser cụ thể

- Mở URL gốc vào Home, không tải projectile implementation; mở mô phỏng mới tải chunk.
- Library: tìm không dấu, bộ lọc lĩnh vực/trạng thái, empty state và xóa lọc.
- Play làm thời gian tăng, Pause giữ nguyên, Reset trả về 0.
- Preset Moon đổi g đúng; kéo đến đỉnh cho vy ≈ 0; cả bốn cursor cùng đúng thời điểm.
- Ghi mẫu, bật xuất CSV, tải file thật có header SI.
- Đổi tham số reset time và xóa dữ liệu cũ; nhập g = 0 báo lỗi và giữ mô hình hợp lệ.
- Chạy đến chạm đất: playback dừng, y = 0, lượt ném được ghi vào progress.
- Reload khôi phục progress/time/parameters; không tự phát lại.
- Toggle quỹ đạo đổi SVG layer thực.
- Quiz phản hồi đúng và lưu tiến độ; đổi 20 m/s → 72 km/h.
- Cấu hình không có thời gian bay và cấu hình cực đại không tạo NaN/Infinity trong scene/graph.
- Mở simulation id không tồn tại được thông báo rõ.

## Chưa kiểm chứng / giới hạn

- Chưa chạy trên thiết bị iOS/Android thực; mobile được kiểm tra bằng viewport trình duyệt.
- Chưa chạy Safari/Firefox; chưa đo screen reader, contrast bằng công cụ audit hoặc chứng nhận đầy đủ WCAG.
- Chưa kiểm tra performance dài hạn, nhiều giờ animation, điều kiện mạng yếu hoặc stress localStorage.
- Chưa triển khai lên hosting công khai; production chỉ được kiểm tra ở localhost.
- Chưa kiểm tra lại cài đặt bằng `npm ci` trên máy hoàn toàn mới. Có package-lock để tái lập dependency; installation và build trên máy hiện tại đã thành công.
- Sổ đo không persistent; session/progress thuộc cùng browser origin, không đồng bộ giữa thiết bị.
- Các lĩnh vực ngoài Ném xiên là metadata/lộ trình. Virtual Lab chưa có Equipment System.

`scripts/browser-check.cjs` chứa kịch bản tái lập browser smoke; Playwright cài tùy chọn theo README. Báo cáo JSON đi kèm là kết quả production, không phải ảnh hoặc dữ liệu được dựng giả.
