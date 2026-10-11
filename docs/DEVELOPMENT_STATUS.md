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
