**Checkpoint QA Hardening:** 49 bài trên bản đồ, 98 ví dụ, 245 câu; các lỗi chấm đơn vị, ghi điểm khi luyện một câu, ôn câu sai và phân bố đề tổng hợp đã được sửa. `npm run check:core`: 275/275 PASS. Vite/Browser/Offline chưa nghiệm thu cho nguồn mới. Vẫn 2.4.0-dev. Xem [LEARNING_3_0_QA_HARDENING.md](LEARNING_3_0_QA_HARDENING.md).

**2026-10-14 · Learning 3.0 tiếp tục:** toàn bản đồ 49/49 mục có bài đọc, 98 ví dụ, 245 câu hỏi. JS syntax/import/export và unit tests 269/269 PASS tại môi trường đóng gói; Vite/Browser/Offline chưa kiểm thử lại, đợi Windows QA. Giữ 2.4.0-dev, chưa Stable. Xem [LEARNING_3_0_CONTINUATION.md](LEARNING_3_0_CONTINUATION.md). Dưới đây là lịch sử mốc trước.

> **2026-10-14 · Learning 3.0 checkpoint A:** lớp 10 đạt 17/17 bài Complete; toàn hệ thống có 19/49 bài, 38 ví dụ, 95 câu hỏi. Revision Home tạo đề không trùng, lọc lớp/chủ đề, luyện câu sai và lưu kết quả. `npm run check:release` PASS với 266/266 unit tests, build, Browser QA 320–1920 px và Offline/PWA. Lớp 11–12 còn 30 bài; chưa tuyên bố Learning 3.0 hoàn thành hoặc Stable.

# Trạng thái mã nguồn hiện tại — PhysicsLab 2.4.0-dev

Đã sửa hai lỗi còn lại của checkpoint Codex 2.2: chuẩn hóa mốc đo A/B 3D và loại bỏ false-positive `.import()` ở script kiểm tra. Xem `PHYSICSLAB_2_2_RECOVERY.md`; chưa hoàn tất nghiệm thu Stable trên thiết bị thật.

---

# Trạng thái mới nhất — PhysicsLab 2.1.0-dev

Checkpoint 3D Explorer và Phase B Advanced Interactive Laboratory đã hoàn thành: hai cảnh Lorentz/Ném xiên dùng thời gian thật của model; nhóm Newton–Ma sát–Công năng lượng–Va chạm–Quang học có thao tác trực tiếp và panel ghi số đo/CSV dùng chung. Va chạm có chỉnh khoảng cách và bảng trước/sau. `npm run check:release` PASS: 228/228 unit tests, Vite build, browser QA 13 mô phỏng tại 1920–320 px và offline QA. Xem `PHYSICSLAB_2_1_UPGRADE.md` và `PHYSICSLAB_2_1_PHASE_B.md`.

Chưa tuyên bố Stable: Firefox, thiết bị cảm ứng thật, cập nhật service worker nhiều tab và profiling CPU/FPS dài hạn còn cần nghiệm thu thủ công. Không commit/push/deploy tự động.

---

# Checkpoint lịch sử — PhysicsLab 1.6 Preview

Đã hoàn thành đợt Virtual Lab 3.0 cho bốn bàn thực hành (Mặt phẳng nghiêng, Thấu kính, Sóng truyền, Giao thoa). **Không** tuyên bố đã hoàn thiện toàn bộ Lab hoặc tất cả mô phỏng. `npm run check:core` 181/181 PASS và Chromium in-memory smoke desktop/mobile PASS. Vite production build và `check:browser` chính thức **chưa xác minh**, cần chạy trên Windows trước khi release. Xem `LAB_1_6_QA.md`.

---

# PhysicsLab 1.3.0-remake.1 — Kiểm chứng & giới hạn

- Xem `REMAKE_SCOPE.md` để biết chính xác chức năng đã triển khai và chưa hoàn thiện.
- Giữ nguyên 13 mô phỏng, 16 bài học, 16 không gian thí nghiệm gồm Hooke.
- Không sử dụng mã PhET, không che nguồn gốc hay thay nhãn PhET.
- Syntax/import/named exports, unit tests được kiểm tra lại trước bàn giao.
- Vite build/browser test: chờ xác nhận trên máy Windows do môi trường hiện tại thiếu gói Vite và chặn Chromium navigation.

# PhysicsLab 1.2.1-beta.1 — Trạng thái kiểm thử

- Nền: PhysicsLab 1.2.0; không đổi localStorage schema.
- Các thay đổi tương tác xem `PHET_EXPERIENCE_QA.md`.
- `npm run check:core`: PASS — 127 bài kiểm thử.
- Build Vite: NOT VERIFIED (vite unavailable in this container).
- Browser automation Chromium localhost: NOT VERIFIED (ERR_BLOCKED_BY_ADMINISTRATOR).
- Không tự tuyên bố Stable; người dùng xác minh trên Windows rồi mới deploy.

---

# PhysicsLab 1.2.0 — Acceptance status

## Scope implemented
- Foundation: Vite + vanilla ES modules + CSS, independent PhysicsLab, Vietnamese UI, 13 available simulations, 16 interactive lessons, 15 laboratory experiment configurations, 2 Canvas-projected 3D scenes.
- From 1.2 β1 UX Rework: graph fill-none fix, responsive hero formula, direct manipulation/animation improvements for 13 simulations, preserved v1 progress storage.
- New 1.2: per-simulation guidance, shared graph zoom/reset/CSV, Hooke deterministic zero-point calibration and u(k), 3D camera views/vector toggle, Learning tasks, enhanced import/export integrity check.

## Verified here
- `node scripts/check.mjs`: PASS — syntax, relative imports, named exports, lazy registry.
- `node --test tests/*.test.js`: PASS — 122 regression/domain tests.
- CSS parse: 21 CSS files, no parser errors.

## Not verified in this environment
- `npm run build`/Vite/Rolldown: native Linux binding absent in available dependency cache (last attempted build failed to start, not known application build failure).
- Browser interaction/screenshots: Chromium navigation blocked with `ERR_BLOCKED_BY_ADMINISTRATOR` on localhost, so no independent desktop/mobile acceptance.
- Production Cloudflare Pages deployment and device-specific performance: not tested.

**Release gate:** This source targets version 1.2.0 but must not be called fully verified stable until Windows `npm run check`, `npm run build`, and `npm run check:browser` all pass, followed by manual desktop/mobile review. See QA_1_2.md. Do not automatically push GitHub.

## Known limitations
- Interactive simulations use validated simplified high-school physics models, not arbitrary real-world dynamics. 3D Explorer is Canvas with software projection, not WebGL; no 3D construction kit.
- Hooke calibration simulates a **known user-selected zero-point offset**; it does not emulate random real-sensor noise. Uncertainty uses independent uniform rounding with half-division bounds; the resulting u(k) is a combined standard uncertainty, not a worst-case bound.
- Lab experiments are parameterized and instrument-based, not full free-form component wiring. Teacher mode has presentation/URL sharing but not accounts, classes, or cloud sync.
- `physicslab.progress.v1` is maintained; preserve browser data and export a JSON backup before major upgrades.
