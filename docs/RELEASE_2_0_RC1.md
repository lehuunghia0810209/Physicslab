# PhysicsLab 2.0.0-rc.1 — Release Candidate / Bản chuẩn bị phát hành

Ngày: 2026-10-13. Nguồn: PhysicsLab `2.0.0-rc.1` (đã remake 13/13 mô phỏng qua hai đợt). Gói này là **toàn bộ mã nguồn**, không phải patch; không bao gồm `.git`, `node_modules`, `dist` hay dữ liệu localStorage của người dùng.

## Phạm vi thay đổi của RC1

- Giữ đủ **13 mô phỏng**, **15 bàn thí nghiệm**, Teacher Studio, Student Lab Notebook, 3D Explorer, Learning và PWA đã có.
- Notebook giờ hiển thị lại **từng số đo thực đã lưu** trong session của thí nghiệm được chọn, bao gồm Hooke. Không dùng phép đo mô phỏng khác, không dựng giá trị giả hoặc suy ra một số đo không được ghi.
- Chế độ in/PDF sử dụng phần văn bản có ngắt dòng đầy đủ thay vì in textarea có thể bị cắt; bảng số đo in trọn nội dung thay vì chỉ vùng cuộn. In được mức tự đánh giá.
- Nhập sổ JSON giới hạn 2 MB, kiểm tra schema và experiment ID trước khi ghi dữ liệu. Dữ liệu đầu vào vẫn đi qua sanitization của `core/progress.js`.
- Người dùng chấp nhận cập nhật offline: Notebook nhận tín hiệu lưu các đoạn văn bản đang chờ autosave trước khi Service Worker thay thế.
- `npm run check:browser` tự mở và đóng Vite dev server cổng 5188 **nếu chưa có server**. Nếu đã chạy server hoặc đặt `PHYSICSLAB_TEST_URL`, dùng server đó. Các kết quả/ảnh chạy thực tế vẫn được xuất ra `work/` và báo cáo trong `docs/browser-report.json`.
- Thêm `npm run check:release` để chạy theo thứ tự Unit+Build → Browser → Offline.

## Hotfix Release QA ngày 2026-10-13

- Quang học: `#optics-screen` và `#optics-object-handle` từng co còn khoảng 38,50 px và 41,07 px tại viewport 768 px. Hai hitbox nay dùng helper chung `minimumSvgHitRadius()` với scale thực từ SVG `getScreenCTM()`, cập nhật qua `ResizeObserver`; artwork, tọa độ vật lý và cơ chế pointer capture không đổi.
- Ném xiên: vòng chạy tiếp theo phát hiện ba preset góc 30°/45°/60° chỉ rộng 38,375 px tại viewport 390 px. Nhóm quick-action dùng chung nay có `min-width: 44px` bên cạnh `min-height: 44px`.
- Browser QA tiếp tục sau từng lỗi cho đến khi toàn bộ route/viewport qua kiểm tra; không hạ ngưỡng, bỏ test hoặc hardcode dữ liệu vật lý.

## Kết quả chạy trực tiếp trong môi trường Windows

| Kiểm thử | Trạng thái | Ghi chú |
|---|---|---|
| `npm run check:release` | **PASS, exit code 0** | Chạy liên tục Unit+Build → Browser → Offline |
| Unit/static checks | **PASS 224/224** | 165 JS modules, 354 relative imports, 451 named exports và lazy registry |
| Vite production build | **PASS** | 138 modules transformed |
| Browser QA | **PASS** | 49 assertions; 13 mô phỏng và các route chính tại 1920/1440/1024/768/390/360/320 px; không target dưới 44 px |
| Runtime browser | **PASS** | 0 console errors, 0 page errors, 0 failed requests; animation loops được thu hồi khi đổi route |
| Offline QA | **PASS** | Shell/lazy simulation chạy offline; Learning/Lab/Tools/3D nằm trong precache; thay cache an toàn |
| Firefox/touch/multi-tab/CPU-FPS | **CHƯA XÁC MINH** | Cần nghiệm thu thủ công |

Kết luận: RC1 đã đạt cổng Release QA tự động trong môi trường hiện tại. **Chưa gọi là Stable** cho đến khi hoàn tất Firefox, thiết bị cảm ứng thật, multi-tab service-worker update và profiling CPU/FPS. Không tự ý đẩy GitHub/Cloudflare.

## Cách nghiệm thu trên Windows

1. Sao lưu `D:\EduLab\physicslab` và dữ liệu học tập (Xuất tiến độ). Giải nén toàn bộ ZIP trực tiếp vào project, giữ nguyên `.git` và `node_modules` nếu đang hoạt động tốt.
2. Đảm bảo không có Vite cũ chạy sai version trên cổng 5188. Không cần `npm ci` nếu các package vẫn khớp lockfile.
3. Mở Terminal trong `D:\EduLab\physicslab`, chạy **một lệnh**:

   ```powershell
   npm run check:release
   ```

   Kiểm tra `docs/browser-report.json`: `passed: true`, không có console/runtime/request errors; lưu ý Vite build và offline cũng phải PASS. Đây không phải bằng chứng thay thế hoàn toàn cho thử nghiệm người dùng thật.
4. Chạy `npm run dev`, kiểm tra nhanh: 13 mô phỏng trên desktop và điện thoại (320–1920 px), thao tác kéo/thả, Newton không lặp đơn vị, Mạch điện đóng/mở switch, Sóng tạo xung, Quang học kéo vật/màn, Notebook ghi ít nhất 3 phép đo rồi In → Lưu PDF với văn bản dài, bật/tắt Teacher Studio, Dark/Light Mode.
5. Nếu triển khai staging: mở hai tab, chỉnh ghi chú, đẩy bản cập nhật, một tab chọn **Để sau**, tab còn lại chọn **Cập nhật**, xác nhận không mất ghi chú hay bị kẹt cache. Kiểm tra offline sau cập nhật.
6. Kiểm thử một thiết bị chạm thật và ít nhất Chromium/Edge, Firefox nếu khả dụng; đo sơ bộ FPS và mức chiếm bộ nhớ khi mô phỏng chạy lâu.

Chỉ khi các bước cần thiết đạt và không còn lỗi mức nghiêm trọng mới đổi version thành `2.0.0`, tạo Git tag/release và triển khai theo quyết định của chủ dự án.
