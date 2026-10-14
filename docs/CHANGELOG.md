**2026-10-14 · 2.4.0-dev Learning 3.0 QA Hardening:** chấm đáp án số cả đơn vị, không ghi điểm toàn bài từ một câu luyện, tương thích practiceWrong với Learning v1 cũ, trộn đề theo nhiều lesson/level, giải thích từng mệnh đề và reset khi đổi chế độ. Unit 275/275 PASS, build/browser/offline chờ Windows. [Chi tiết](LEARNING_3_0_QA_HARDENING.md).

## 2.4.0-dev — Learning 3.0 Full Curriculum Content checkpoint (2026-10-14)

- Biên soạn 30 mục còn thiếu cho lớp 11 và 12, tổng 49 Lesson Reader, 98 ví dụ và 245 câu hỏi; giữ 16 bài khám phá cũ.
- Điều hướng chương trình học đủ ba lớp, bài trước/bài sau; mục lục không thay đổi hash route; liên kết trạm thực nghiệm có thật.
- 30 bài số mới được tính lại độc lập; unit tests 269/269 PASS. Build/browser/offline cần QA trên Windows, không chốt Stable.

## [2.4.0-dev] — Learning 3.0 checkpoint (2026-10-14)

- Hoàn thành 17/17 bài lớp 10: 34 ví dụ giải từng bước và 85 câu hỏi; bài không có mô phỏng dùng hoạt động không màn hình, không tạo link giả.
- Thêm Revision Home theo lớp/chủ đề, công thức trọng tâm, đề tối đa 10 câu không trùng, luyện câu sai và lưu/khôi phục điểm bằng `physicslab.learning.v1`.
- Mở rộng tổng số lên 19 bài Complete, 38 ví dụ, 95 câu hỏi; unit test tính lại độc lập đáp án số lớp 10 từ dữ kiện.
- Khởi tạo ba Lesson Reader đại diện lớp 10/11/12 trước khi mở rộng toàn bộ lớp 10.
- Thêm deep-link bài học, chế độ Luyện tập/Kiểm tra, ôn câu sai và ghi chú ở `physicslab.learning.v1`; giữ nguyên `physicslab.progress.v1`.
- Phân biệt rõ Complete/Discovery/Outline trên giao diện và Coverage Matrix; không gọi 49 curriculum items là 49 bài hoàn chỉnh.
- Sửa bộ lọc Lab để Hooke xuất hiện ở cả lớp 10 và 11, reset bộ lọc đúng và deep-link chọn đúng lớp; tăng vùng chạm nam châm trạm nâng cao trên mobile.
- Bổ sung unit/browser regression cho content schema, question scoring, numeric tolerance, kho Learning, deep-link/reload và Lab đa lớp.
- `npm run check:release` PASS: 266/266 unit tests, Vite build, Browser QA 320–1920 px, accessibility/animation cleanup và Offline/PWA.

## [2.4.0-dev] — Gộp 2.3 + 2.4 (2026-10-13)

- Virtual Lab 3.0: 3 trạm chuyên sâu, mô hình đo SI và thu mẫu vào Experiment Store.
- THPT Learning 10–12: 49 đơn vị học/chủ đề, tab theo lớp ở Học tập/Thí nghiệm; ghi rõ nội dung chưa có học liệu.
- UI/UX: trang lộ trình, FAQ và pricing toggle có nhãn chưa công bố giá.
- Thêm unit tests Vật lí và curriculum mapping; cần Windows full QA trước stable.

## 2.1.0-dev — Next Generation 3D Explorer (2026-10-13)

- Phase B: mở rộng `MeasurementSystem` thành sổ đo theo schema và dùng chung panel ghi mẫu/CSV cho Newton, Ma sát, Công–năng lượng, Va chạm, Dao động và Thấu kính; mọi mẫu lấy tại trạng thái thật của model.
- Bổ sung tay nắm khoảng cách ban đầu và bảng động lượng/động năng trước–sau cho Va chạm; hoàn thiện cleanup mất pointer capture ở Quang học/Cơ học và tính hành động ghi mẫu vào Learning evidence.
- Browser QA kiểm chứng tay nắm vật lý, ghi mẫu, CSV, responsive 1920–320 px và cleanup; chi tiết tại `PHYSICSLAB_2_1_PHASE_B.md`.
- Replaced the Explorer's fixed eight-second animation pacing with the shared `Timeline`, so 1× playback advances real model seconds and the scrubber, particle, HUD and analytic model stay synchronized.
- Added camera-fitted SI `x/y/z` axes and reference grids to both the Lorentz helix and projectile views without adding a 3D dependency or duplicating either physics model.
- Added independent Axes/Grid/Trajectory/Vector layers, active camera state, full reset behavior and real projectile presets for horizontal launch, 45° range comparison and Moon gravity.
- Added model-derived Lorentz-force direction and gravitational-acceleration vectors plus live time, 3D position, speed and acceleration readouts.
- Extended unit and browser regression coverage for fitted reference geometry, layer toggles, presets, real-time playback, responsive targets and animation cleanup.
- Version moved to `2.1.0-dev`. This checkpoint is not a Stable release; Firefox, real touch hardware, multi-tab service-worker updates and long-run CPU/FPS remain manual release gates.

## 2.0.0-rc.1 — Final Release Candidate (2026-10-13)

- Giữ toàn bộ 13 mô phỏng, 15 thí nghiệm, Teacher Studio, Notebook và khóa lưu tiến độ hiện có.
- Student Notebook hiển thị bảng số đo thực được lấy từ measurement session (không tự tạo số liệu), bao gồm số đọc của Hooke; in/PDF xuất đầy đủ ghi chú nhiều dòng và bảng số đo, kể cả khi trên giao diện bảng đang cuộn.
- JSON import trong Notebook giới hạn 2 MB, kiểm tra cấu trúc và đúng thí nghiệm trước khi ghi; cập nhật offline kích hoạt lưu đồng bộ phần ghi chú đang chờ debounce.
- `npm run check:browser` giờ có thể tự mở Vite dev server nếu chưa chạy, không đòi hỏi hai Terminal.
- Bổ sung 4 kiểm thử Notebook; 222/222 unit tests PASS. Môi trường bàn giao chưa thể chạy production Vite/browser/offline; cần kiểm chứng trên Windows trước khi chốt Stable.

## 2.0.0-preview.1 — Simulation UX & release hardening (2026-10-12)

- Normalized scientific number formatting to avoid negative zero at displayed precision.
- Improved shared Mechanics drag cancellation, fixed-origin gesture mapping, pointer-capture cleanup and scene accessibility roles.
- Added responsive HUD/readout/focus refinements without changing the physical models or Virtual Lab.
- Added PWA manifest and generated install icons; the offline update message requires explicit user action before activating a waiting worker.
- Added six new regression tests: 218/218 core tests pass; Vite production/browser/offline acceptance still pending environment-compatible execution. See `PHYSICSLAB_2_0_PREVIEW_QA.md`.

## Simulation remake phần 2/2 — preview (2026-10-12)

- Coulomb field streamlines + field presets + keyboard-operable stable charges/probe.
- Lorentz/Faraday direct control and presets, SVG coordinate mapping and stable analysis time.
- Thin-lens real-screen sharp/blur footprint from ray geometry, virtual image suppression.
- Gas compression/expansion/heating presets and a separate target-volume marker.
- Scene-first layout for all 13 routes; existing Waves/Circuits deep workbenches preserved.
- 212/212 unit tests PASS; Linux production/browser acceptance pending (see SIMULATION_FULL_REMAKE_PART_2.md).

## 2.0 development — first classroom workflow slice (2026-10-12)

- Added a local Student Lab Notebook for all 15 experiments with autosaved hypothesis/observations/conclusion/self-assessment, existing measurement evidence, validated JSON import/export, and print/PDF layout.
- Added a shared Teacher Studio to all 13 simulations: local setup save/restore, pause-for-analysis, and reversible measurement/vector/graph/explanation layers.
- Added real browser coverage for notebook isolation/persistence, Teacher Studio model controls, and animation-frame lifecycle cleanup across five animated simulations plus 3D Explorer.
- Added a dependency-free, content-versioned production service worker that precaches every lazy chunk and safely replaces only PhysicsLab caches after a complete install; added a real offline browser check for the shell/lazy simulation plus cached Learning, Lab, Tools and 3D bundles.
- The acceptance run now refreshes `docs/browser-report.json`; verified 186/186 unit tests, Vite production build, and the complete browser suite.
- PhysicsLab 2.2 is still in development; this checkpoint does not claim installable-PWA metadata, full performance profiling, or real-device release validation.

## 1.9 development — first stabilization slice (2026-10-12)

- Fixed Learning evidence integrity: completing Projectile independently no longer marks lesson experiment step 2.
- Added live Hooke zero-point compensation feedback and made uncompensated readings explicit in the measurement status.
- Updated Playwright acceptance to follow current progressive-disclosure controls and Canvas lab workbenches, using the 15-item runtime catalog as its source of truth.
- Raised circuit-workbench controls and the 3D timeline to the 44 px interaction target; added explicit accessible names to vector force sliders.
- Verified 185/185 unit tests, production build, all-route responsive checks at 1440/1024/768/390/360/320 px, accessible control names, and the full browser suite.
- Added `EVOLUTION_1_9_TO_2_2.md`; PhysicsLab 2.2 is not yet declared complete.

## 1.6.0-virtual-lab.1 — Virtual Lab 3.0 · Đào sâu Cơ học, Quang học, Sóng

- Bàn nghiêng: nâng hạ máng và xe bằng thao tác kéo; thả xe thực theo mô hình, lực/đồng hồ/sổ đo liên kết.
- Bàn quang học: kéo vật + màn độc lập, ảnh thật/ảo/vô cực, trạng thái lấy nét và dựng tia theo phương trình thấu kính mỏng.
- Bàn dây sóng: xung và tuần hoàn với phản xạ biên cố định/tự do, đầu dò di chuyển được; giao thoa hai nguồn điều chỉnh pha, quan sát sóng thành phần/tổng.
- Chế độ chậm, hướng dẫn theo hành động, bảng số đọc rõ, tương tác chuột/touch/bàn phím, cuộn vùng cảnh trên mobile.
- Giữ sổ đo, export, learning, 13 mô phỏng, 3D, R2/R3/R4 và dữ liệu tiến độ. 15 bài test vật lý chuyên sâu mới. Chi tiết tại `LAB_1_6_QA.md`.
- Chưa xác minh Vite production build; không gọi Stable.

## 1.3.0-remake.4 — Remake R4 · Physics-first interaction & integrated lab

- Kéo trực tiếp trên cảnh Ma sát, Công–động năng, Va chạm, Dao động để thay đổi thông số Vật lý; giữ tua thời gian trên nền và hỗ trợ bàn phím.
- 3 tình huống và câu hỏi dự đoán cho từng mô phỏng trong 13 mô phỏng có sẵn.
- Bàn khí tương tác: pump/vent/heat/cool, piston, đồng hồ áp suất; truy cập độc lập tại Thí nghiệm.
- Sửa núm điều khiển Lorentz/Faraday kéo trực tiếp và không thay DOM slider mỗi lần nhập; chỉnh lực Lorentz hướng tâm theo pha hạt; bổ sung các tình huống quỹ đạo 3D, chỉnh bảng số liệu và responsive.
- Thêm unit tests cho gesture, va chạm, nhiệm vụ, khí và vectơ Lorentz; **chưa kiểm tra production/browser ở môi trường này**.

## 1.3.0-remake.3 — Remake R3 · Hooke Workbench

- Rebuild Hooke as independent interactive lab: draggable mass tray, physically damped oscillation, ruler, live forces, instrumented notebook with original progress key and graph.
- Link Hooke Learning lesson directly to its lab, retain R2 circuit workbench and generic labs.
- Add analytic spring motion geometry/model regression tests and update browser QA for both Hooke and generic lab navigation.
- No copied PhET assets/branding. Full Vite/browser acceptance pending on developer's Windows machine.

## 1.3.0-remake.1 — Remake R1 (Original interactive PhysicsLab)

- Tổng hợp lực trực tiếp bằng kéo F₁/F₂: đầu vectơ, hình bình hành, kết quả SI.
- 13 tuyến mô phỏng có chế độ tập trung quan sát, hướng dẫn và điều hướng đồ thị.
- Mạch điện có nút kéo điện áp nguồn và đồng hồ A/V ngay trên sơ đồ.
- Danh mục 16 lab có preview thiết bị SVG, tìm kiếm/lọc theo chủ đề; thông số dự đoán từ mô hình khác biệt với số đo từ dụng cụ; bố cục sân khấu lớn.
- Khám phá 3D: camera canvas nền lưới, thanh playback đặt cạnh sân khấu, thông số nâng cao có thể thu gọn.
- Sửa grid điều hướng 6 mục ở mobile; không thay physics core hoặc tiến độ cũ.
- Chưa phải Stable, kiểm tra giới hạn trong docs/REMAKE_SCOPE.md.

## 1.2.1-beta.1 — Interactive Experience (PhET-inspired)

- Cảnh khí lí tưởng có phân tử minh họa chuyển động và phản xạ; piston điều khiển qua ánh xạ logarit có thể đảo.
- Bàn mạch điện hiển thị nối tiếp/song song riêng, chuyển topology trực tiếp, điểm dòng điện quy ước và điện trở điều khiển bằng chuột/phím.
- Danh mục 16 bàn thí nghiệm, sơ đồ theo thí nghiệm và điểm kéo trên sơ đồ; bảo toàn số đo, hiệu chuẩn và các thiết bị đo trước đây.
- 3D Explorer cải thiện căn khung bảng điều khiển, nhãn và số liệu dễ đọc hơn ở màn hẹp.
- 5 bài unit tests bổ sung cho hình minh họa khí/piston và lab; tổng 127 bài PASS.

## 1.2.0 — Interactive Science Experience (2026-10-11)

- Gộp β2 + RC thành một đợt nâng cấp phát hành 1.2, kế thừa mọi nội dung của β1 UX Rework.
- Hướng dẫn thực hành ba bước riêng cho 13 mô phỏng, tích hợp tương tự tại bước thử nghiệm trong 16 bài học liên quan.
- Công cụ đồ thị toàn hệ thống: phóng/thu/vừa khung trục ngang, giới hạn clip, đọc từng mẫu bằng chuột/bàn phím, CSV có BOM UTF-8. Không sửa kết quả tính toán Vật lý.
- Lab Hooke: mô phỏng lệch điểm 0 xác định trước, bật/tắt bù lệch; bổ sung u(k) từ truyền độ không đảm bảo chuẩn (phân bố đều độc lập trong ±½ độ chia F, Δx); sao lưu cấu hình trong schema tiến độ v1. Lệnh Đặt lại cấu hình không còn xóa phép đo.
- 3D Explorer: camera presets, tùy chọn vectơ, giữ phép chiếu và mô hình khoa học gốc.
- Bổ sung kiểm tra liên kết named exports, regression tests, kiểm thử trình duyệt các tính năng mới; chỉnh sửa UI/CSS responsive và giảm chuyển động.
- Kiểm thử lõi và kiểm tra cú pháp đã thực thi trong môi trường này. **Vite build, browser tests và thiết bị thật cần chạy trên Windows trước khi chốt Stable/deploy.**

## 1.2.0-beta.1-ux.1 — Simulation Experience Rework

- Sửa SVG GraphRenderer path không có fill:none ở những route không tải projectile.css.
- Sửa bảng phương trình ở Hero bằng overlay HTML responsive.
- Nâng ngôn ngữ thiết kế chung của chart, workbench, dark-mode và thiết bị di động.
- Kéo mũi tên ném, lực và vật theo model thật; tương tác trực tiếp tại Inclined, Waves, Circuits, Magnetic, Optics, Thermal, Lab Hooke.
- Sửa tỉ lệ chuyển động khối Cơ học, đầu dò sóng x=λ/4 và piston chiều nén.
- Thêm domain/regression tests, cập nhật check:browser cho lỗi mảng đen.
- 116 unit tests PASS; Vite/Playwright chưa xác minh do thiếu dependency Linux và trình duyệt.

## 1.2.0-beta.1 (Build Fix — 10/10/2026)

- Khôi phục `updateNavigation(route, label)` trong `src/app/shell.js` để router có thể import và Vite không còn vướng `MISSING_EXPORT` cho hàm này.
- Giữ nguyên thanh điều hướng 6 mục, nhãn active, breadcrumb, `aria-current`, số mô phỏng tự tính theo Registry và phiên bản ứng dụng.
- Không đưa lại hai nút xuất/nhập dữ liệu lên topbar; các tiện ích vẫn nằm trong trang Công cụ.
- Thêm `tests/shell-navigation.test.js` với hai bài kiểm thử hồi quy cho cấu trúc shell và trạng thái điều hướng.
- `npm run check:core`: 111/111 PASS tại môi trường bàn giao. Vite/Playwright cần kiểm chứng trên máy có đủ dependency.

## 1.2.0-beta.1 — Balanced / Simulation UI refresh & workflow polish

- Sửa thẻ công thức ở hero dashboard: bố cục SVG ổn định hơn, không bị chật/cắt nội dung như trước.
- Làm mới toàn bộ phần minh họa thẻ mô phỏng bằng SVG theo từng chủ đề/mô phỏng; dark mode tăng tương phản, badge “Sẵn sàng khám phá” dễ đọc hơn.
- Bỏ 2 nút xuất/nhập dữ liệu khỏi topbar để giao diện gọn hơn; chức năng **không mất** mà được chuyển sang trang Công cụ với khu vực sao lưu/khôi phục rõ ràng hơn.
- Mở rộng trang Công cụ: thêm quản lý sao lưu dữ liệu và điều khiển nhanh cho chế độ giáo viên / trình chiếu.
- Giữ nguyên toàn bộ chức năng đang có của 1.2 Alpha 1 và 1.0 RC2. `npm run check:core`: **109/109 PASS**. `npm run build` chưa xác minh trong môi trường bàn giao do thiếu vite trong node_modules/cache.

## 1.2.0-alpha.1 — Balanced / Graph & Classroom Interaction

- Biểu đồ mô phỏng: thanh inspect dữ liệu bằng chuột hoặc phím trái/phải, Escape đóng, hỗ trợ aria; không thay đổi con trỏ timeline.
- Graph engine có đường tham chiếu nét đứt và miền vẽ tự vừa cả hai lượt chạy, xử lý dữ liệu không hữu hạn an toàn.
- Projectile Motion: lưu một lần ném làm mốc, so sánh trên scene SVG và 4 đồ thị, hiển thị ΔR, ΔH, ΔT. Không thay đổi công thức ném xiên.
- Cấu hình bài giảng: tạo link chia sẻ 4 tham số ném xiên, kiểm tra lại dữ liệu URL trước khi áp dụng; không chia sẻ tiến độ người dùng.
- UI/UX: cải thiện khoảng trống, kích thước đồ thị và chú giải; bổ sung token `--surface-alt` cho light/dark, tối ưu trên mobile.
- Thêm regression tests cho graph, so sánh, link chia sẻ; tổng **109/109 PASS** ở `npm run check:core`. Cập nhật browser checks cho tính năng mới (cần chạy trên máy có Vite/Playwright).
- Build/browser **chưa xác minh tại môi trường tạo bản bàn giao** vì thiếu dependency Vite offline và trình duyệt bị hạn chế điều hướng.

## 1.0.0-rc.2 — Sửa theo báo cáo trải nghiệm giáo viên (10/10/2026)

- Sửa 3D Helix không thấy hạt và đường xoắn: chiếu quỹ đạo thật theo khung nhìn tự động, hiển thị 1,5 vòng, vẽ hạt sau các lớp, bổ sung nút “Vừa khung”. Không thay đổi phương trình Lorentz.
- Thêm tìm kiếm tiếng Việt không dấu, lọc lớp 10/11/12 và chủ đề cho 16 bài học.
- Thêm checklist thử nghiệm và khóa nút xác nhận cho đến khi ghi nhận có dự đoán, mở mô phỏng và tương tác thật.
- Thêm chế độ trình chiếu giáo viên, tùy chọn giao diện HS/GV được lưu cục bộ, xuất/nhập bản sao tiến độ JSON (nhập cần xác nhận và thay thế dữ liệu cũ).
- Tăng vùng bấm “Tìm nhanh” tối thiểu 44px trên thiết bị hẹp.
- Sửa bộ chọn Playwright trùng liên kết Explorer3D, thêm kiểm tra pixel canvas màu hạt/quỹ đạo và quy trình Learning mới.
- Bổ sung 9 bài unit tests (99 PASS), kiểm tra cú pháp/import và CSS; Vite build và Playwright trình duyệt vẫn cần xác nhận tại máy có đủ môi trường.

# CHANGELOG

## Simulation Engine 5.0 remake — Waves and Circuits checkpoint (2026-10-12)

- Added the PhET-principles audit, 13-scene gap matrix, implementation plan, and live QA report without claiming the unfinished 11 scenes are complete.
- Deep-remade Waves around direct experimentation: hand-launched causal pulse, fixed/free boundary reflection, movable probe, periodic source, keyboard operation, and synchronized measurement graphs. The simulation reuses the tested Virtual Lab rope model.
- Replaced the fixed series/parallel Circuit simulation with the existing Circuit Workbench and Kirchhoff solver: component placement, terminal wiring, switch, lit bulbs, ammeter/voltmeter, open/short/conflicting-source states, editable/removable circuits, samples, and CSV.
- Extended browser acceptance to 1920 px and explicit SVG/scene slider hit targets. Fixed undersized targets in Projectile, Inclined Plane, Waves, Magnetic Field, Gas, and the vector playground while preserving visible apparatus scale.
- Current checkpoint: 189 unit tests pass, Vite build passes, all 13 simulation routes pass Edge/Chromium browser acceptance at 1920/1440/1024/768/390/360/320 px, and the new Waves/Circuits interaction checks pass.
- PhysicsLab 2.2 is still in development; the other 11 simulations remain audited work, not completed remakes.

## 1.0.0-rc.1 — 10/10/2026

### Trải nghiệm / UI
- Nâng cấp design tokens sáng/tối, typography, độ tương phản, kích thước điều khiển, spacing và hiển thị desktop/mobile.
- Thêm chuyển động giao diện có chủ đích và chế độ `prefers-reduced-motion`.
- Bổ sung thanh tìm kiếm nhanh `Ctrl/Cmd+K`, tìm trang và mô phỏng bằng tiếng Việt không dấu.
- Bổ sung menu Khám phá 3D; tự lấy số mô phỏng sẵn sàng từ Registry.
- Sửa Home hiển thị đúng tiến độ của toàn bộ 16 bài, ưu tiên tiếp tục bài chưa học xong, không chỉ bài ném xiên.

### Khoa học / tính năng
- Sửa cơ chế công–động năng với thời gian dừng vật lý (không ép thời gian tối thiểu), phản lực khi lực kéo hợp góc, ma sát và kiểm thử các trường hợp biên.
- Bổ sung `Electric Field`: hai điện tích điểm di chuyển được, đầu dò x/y, trường vector, điện thế từ nguyên lý chồng chất Coulomb, trạng thái được lưu.
- Nâng cấp 3D Explorer: tốc độ, dấu điện tích, B, khối lượng, phát/tạm dừng/đặt lại quỹ đạo, tối ưu cập nhật Canvas.
- Sửa Lab Hooke: lưu ID lò xo theo phép đo, tránh gộp đồ thị nhiều lò xo, hồi quy độ cứng từ dữ liệu đo; CSV có mã lò xo, vẫn giữ bản ghi legacy không rõ nguồn.
- Bổ sung bài học Điện trường; sửa nội dung Phòng thí nghiệm cho đúng tính độc lập của PhysicsLab.

### Chất lượng
- Thêm unit tests cho Điện trường, quỹ đạo xoắn ốc, phân tích Hooke, thống kê Home, dữ liệu nội dung và regression cho công–động năng.
- Sửa tests phụ thuộc số lượng mô phỏng/bài học cũ; browser script giờ lấy số mô phỏng từ Registry và thêm checks cho quick search/điện trường.
- `npm run check:core`: **90/90 PASS**; CSS parse: **0 lỗi**; imports và syntax PASS.
- Vite build/browser runtime **chưa thể chạy độc lập** vì môi trường không có dependency Vite đang dùng; cần chạy nghiệm thu trên Windows trước khi gỡ RC.

## 0.8.0-dev.1 — từ bản bàn giao trước
- Sửa chọn lực kế Hooke, cân bằng dấu phẩy động và vệ sinh dữ liệu thí nghiệm.
- Sửa thống kê Home/Library dựa vào Registry, bổ sung regression tests.
