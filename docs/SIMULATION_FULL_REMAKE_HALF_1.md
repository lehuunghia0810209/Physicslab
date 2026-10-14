# PhysicsLab — Full Simulation Remake, đợt 1/2 (7/13)

**Trạng thái: nghiệm thu trên máy Windows trước khi coi là Stable.**

## Nguồn code và giới hạn

Được phát triển tiếp từ `PhysicsLab_1.9_Direct_Remake_Phase_A_Full_Source.zip` (được xây từ checkpoint Codex do người dùng gửi). Không nhập bất kỳ asset hoặc mã nguồn PhET nào trong đợt này; chỉ vận dụng nguyên tắc tương tác trực tiếp và ưu tiên quan sát. Đã bảo toàn Virtual Lab, Student Notebook, Teacher Studio, Waves, Circuit và offline.

## Phạm vi 7/13 mô phỏng

| Mô phỏng | Thay đổi |
|---|---|
| Newton | Viết lại toàn bộ interaction scene, thước thời gian, tay nắm lực, readouts để đơn vị SI không lặp; lực âm/dương, ma sát nghỉ/trượt, các tình huống thử và đồ thị đồng bộ. |
| Ma sát | Mặt nhẵn/gỗ/thô, dừng lực, hiển thị ngưỡng ma sát và trạng thái; cải tiến tay nắm lực không giật ở pointerdown. |
| Công–động năng | Hiện hai thanh năng lượng/công theo dữ liệu model, các tình huống thay đổi ma sát/góc, cảnh chuyển động và đồ thị cập nhật theo trạng thái thực. |
| Va chạm | Dùng trục thế giới cố định mỗi lần chạy để tránh hai xe nhảy vì tự zoom theo frame; hiển thị khối lượng, vận tốc xe, động lượng trước/sau; các chế độ đàn hồi/không đàn hồi/đối đầu. |
| Dao động điều hòa | Sửa biểu diễn biên độ theo thang vật lý cố định (trước kia A nhỏ/lớn đều di chuyển như nhau); kéo vật theo delta có neo, các tình huống pha trái/phải và lò xo mềm, hiển thị năng lượng. |
| Ném xiên | Tăng diện tích quan sát, lựa chọn nhanh góc 30°/45°/60° và lưu mốc đối chiếu; giữ direct-launch, rơi đúng mô hình, CSV, đo và 4 graph trước đó. |
| Mặt phẳng nghiêng | Khung stage-first thống nhất, cải thiện vùng mô phỏng và độ tương phản; giữ chức năng kéo góc/xe, quan sát lực, dừng chặn và preset 15°/35°/55° từ Phase A. |

Điều quan trọng nhất: **bảy route này hiển thị bàn mô phỏng trước các khối hướng dẫn 3 bước, discovery mission, Teacher Studio**, giúp người học nhìn thấy và thao tác hiện tượng ngay khi mở trang. Các khối học tập vẫn giữ chức năng, chỉ được chuyển xuống dưới stage và gấp hướng dẫn mặc định.

## Kiểm chứng thực tế trong môi trường tạo bản

- `npm run check:core`: **PASS — 206/206 tests, 201 subtests; 7 test mới**.
- JavaScript syntax, relative imports, named exports: **PASS** thông qua `scripts/check.mjs`.
- CSS parsing qua tinycss2: **0 syntax errors trong 32 CSS files**.
- Vite production build: **chưa xác minh được ở môi trường này**, vì binary optional `@rolldown/binding-linux-x64-gnu` không có sẵn, trong khi thư viện đã cài có binary Windows. Đây là lỗi dependency của môi trường kiểm thử Linux, không phải bằng chứng build source PASS hay FAIL.
- Chromium visual/E2E: **chưa xác minh được**, trình duyệt được cấp bị chính sách môi trường chặn mọi điều hướng (ERR_BLOCKED_BY_ADMINISTRATOR), kể cả data URL và localhost. Tuyệt đối không xem unit tests thay cho browser QA.

## Nghiệm thu bắt buộc trên Windows

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check
npm run check:browser
npm run check:offline
npm run dev
```

Trên localhost hãy kiểm tra các route:

- `#/simulation/newton`: lực -45/0/25; giữ rồi kéo tay nắm; kéo khối xem thời gian, bật/tắt vectơ, giảm khối lượng.
- `#/simulation/friction`: mặt nhẵn/gỗ/thô; giữ tay nắm lực trước khi kéo; xem ngưỡng trượt.
- `#/simulation/work-energy`: ma sát 0/0.25; góc 30°; theo dõi Wnet và ΔEk.
- `#/simulation/momentum-collision`: e=1/0, xe đối đầu; kiểm tra v, p và K.
- `#/simulation/spring-oscillation`: pha trái/phải, biên độ nhỏ/lớn, kiểm tra thước và đồ thị.
- `#/simulation/projectile-motion`: góc 30/45/60, so sánh 2 quỹ đạo.
- `#/simulation/inclined-plane`: xe và góc 15/35/55, kéo tay nắm, xem lực.

Kiểm tra tối thiểu ở 390 và 1440 px; đặc biệt nhìn collision nhãn tại sát nhau, desktop dài và mobile nhỏ. Tránh cập nhật production khi còn lỗi tương tác nghiêm trọng.

## Phần còn lại — đợt 2/2 (6/13)

1. Sóng trên dây — nâng chất lượng và nghiệm thu bản sâu đã có.
2. Mạch điện — nâng chất lượng và nghiệm thu Circuit Workbench đã có.
3. Điện trường.
4. Từ trường.
5. Quang học.
6. Khí lí tưởng.

Sau khi 13/13 được duyệt, chạy lại ma trận browser và kiểm thử hồi quy Virtual Lab/Teacher Studio/Notebook và PWA. Không tự nhận Stable trước đó.
