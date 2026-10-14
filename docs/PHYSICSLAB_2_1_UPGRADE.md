# PhysicsLab 2.1.0-dev — Next Generation Upgrade

Ngày checkpoint: 2026-10-13. Trạng thái: development, chưa phải Stable.

## Baseline 2.0 RC1

Trước khi mở lát cắt 2.1, `npm run check:release` của RC1 đã PASS trên Windows: 224/224 unit tests, Vite production build, browser QA toàn bộ route/13 mô phỏng và offline QA. Working tree đang có nhiều thay đổi staged/unstaged/untracked nên toàn bộ công việc được thực hiện tại chỗ, không reset, commit, push, tag hoặc deploy.

## Phạm vi hoàn thành trong checkpoint 2.1

### 3D Explorer dùng thời gian mô hình thật

- Bỏ nhịp phát cố định tám giây trước đây.
- Tái sử dụng `Timeline`; tốc độ 1× nay tăng đúng một giây mô hình trên mỗi giây thực, có giới hạn delta khi tab bị gián đoạn.
- Play/Pause/Reset, speed selector và scrubber dùng chung một timeline state.
- Thời gian HUD, vị trí hạt/vật, vận tốc và gia tốc được tính từ đúng `createHelix().at(t)` hoặc `createProjectile().at(t)`.
- Timeline dừng khi tab ẩn và bị destroy khi rời route; không để lại RAF.

### Hệ tọa độ và camera-fit

- `createHelixViewport` trả về mặt phẳng tham chiếu và ba trục SI `x/y/z`; toàn bộ geometry được đưa vào phép fit camera, kể cả trường hợp góc 0° hoặc 90°.
- `createProjectileViewport` trả về ba trục SI cùng ground plane/quỹ đạo; trường hợp ném thẳng đứng vẫn có trục ngang và chiều sâu dễ nhận biết.
- Ba góc nhìn Phối cảnh/Nhìn bên/Nhìn trước có trạng thái `aria-pressed`; kéo pointer, phím mũi tên, phím `+/-`, thanh zoom và Ctrl+wheel tiếp tục hoạt động.
- Không thêm Three.js, WebGL hoặc dependency mới. Canvas 2D hiện đáp ứng đủ hai scene, giữ production bundle nhẹ và offline đơn giản.

### Lớp hiển thị và vectơ vật lý

- Có thể bật/tắt độc lập Vectơ, Trục, Lưới và Quỹ đạo; mỗi control thay đổi canvas thật.
- Helix hiển thị vận tốc tiếp tuyến và hướng lực Lorentz `Fᴮ`, lấy từ `vx/vy/vz` và `ax/ay/az` của model.
- Ném xiên hiển thị vectơ vận tốc và hướng gia tốc trọng trường, cùng readout độ lớn `g`.
- HUD hiển thị thời gian, tọa độ SI, tốc độ và gia tốc tại đúng thời điểm scrubber.

### Tình huống khám phá và reset

- Helix: 0° chuyển động thẳng theo từ trường, 45° quỹ đạo xoắn, 90° quỹ đạo tròn.
- Ném xiên: ném ngang từ độ cao, 45° để so sánh tầm xa và trọng trường Mặt Trăng 1,62 m/s².
- Preset ghi vào các control thật và dựng lại model; không dùng animation hoặc số đo minh họa giả.
- Reset khôi phục tham số của scene hiện tại, timeline, camera, zoom, tốc độ phát và các layer.

## UI/UX và accessibility

- Giữ bố cục Apparatus First: canvas, playback, scrubber và HUD ở vùng chính; thông số nâng cao nằm trong `details`.
- Layer controls và camera presets có vùng tương tác tối thiểu 44 px, focus ring và trạng thái chọn không chỉ phụ thuộc màu.
- HUD chuyển từ bốn cột desktop sang hai cột mobile; toolbar và preset tự wrap ở 320–1920 px.
- Canvas có mô tả accessibility cập nhật theo model; keyboard rotation/zoom vẫn hoạt động.

## File trọng tâm

- `src/pages/explorer3d.js`
- `src/pages/explorer3d.css`
- `src/core/helix-viewport.js`
- `src/core/projectile-viewport.js`
- `tests/helix-viewport.test.js`
- `tests/viewport-18.test.js`
- `scripts/browser-check.cjs`
- `README.md`, `docs/CHANGELOG.md`, `docs/ARCHITECTURE.md`

## Kiểm thử

`npm run check:release` đã PASS với exit code 0 sau toàn bộ thay đổi:

- Static/core: 165 JS modules, 355 relative imports, 452 named exports và lazy registry PASS.
- Unit: 225/225 PASS.
- Vite production build: PASS, 138 modules transformed.
- Browser QA: PASS, 49 nhóm assertion; 13 mô phỏng và các route chính tại 1920/1440/1024/768/390/360/320 px; không overflow hoặc control target dưới 44 px.
- Runtime: 0 page error, 0 console error, 0 failed request; animation loop được thu hồi khi đổi route.
- Offline QA: shell và lazy simulation chạy offline; Learning/Lab/Tools/3D nằm trong versioned precache; cache cũ chỉ xóa sau khi bản thay thế cài hoàn chỉnh.

Browser QA có thêm assertion cho:

- SI axes/reference geometry luôn nằm trong fitted viewport.
- Camera active state và layer toggles thay đổi canvas thật.
- Preset Mặt Trăng dùng đúng 1,62 m/s².
- Scrubber 50% khớp nửa thời gian bay của shared projectile model.
- Playback 1× tăng theo giây mô hình, không theo duration trang trí.
- Readout gia tốc, responsive 320–1920 và RAF cleanup.

Ảnh kiểm tra được sinh tại `work/explorer3d-2-1-helix.png`, `work/explorer3d-2-1-projectile.png` và `work/explorer3d-2-1-mobile.png`.

## Hạng mục chưa xác minh

- Firefox và thiết bị cảm ứng thật.
- Cập nhật service worker đồng thời trên nhiều tab sau khi deploy staging.
- Profiling CPU/FPS/bộ nhớ dài hạn trên thiết bị cấu hình thấp.
- Canvas 2D vẫn là phép chiếu không gian, không phải scene graph WebGL có che khuất/ánh sáng/vật liệu đầy đủ.

Không đổi schema `physicslab.progress.v1`, không xóa Notebook/Teacher Studio và không thay storage key của Circuit Workbench.

Phase B tiếp theo được ghi tại `PHYSICSLAB_2_1_PHASE_B.md`: tương tác trực tiếp, sổ đo/CSV dùng chung và đối chiếu trước–sau cho nhóm mô phỏng ưu tiên.
