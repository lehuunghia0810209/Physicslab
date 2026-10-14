# PhysicsLab Remake R1 — Verification Report

Environment: isolated Linux container, 2026-10-11. Branch snapshot based on user-provided PhysicsLab 1.2.1 Beta 1.

- **Node.js syntax/import/named export verifier:** PASS, details printed by `node scripts/check.mjs`.
- **Pure physics and regressions:** 132/132 unit tests PASS using `npm run check:core`.
- **CSS:** 23 source CSS files parsed using tinycss2 without top-level parser errors.
- **Vite production build:** **NOT VERIFIED**. `npm ci --offline` failed with ENOTCACHED for vite@8.3.4. An online install timed out. No claim of production PASS.
- **Chromium browser QA:** **NOT VERIFIED**. Chromium launch succeeded in the environment but navigations to localhost and intercepted HTTPS origin were blocked by administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). No claim of visual regression PASS.
- **Stable release:** NOT APPROVED until Windows Vite build, browser tests and manual checks complete.

## Mandatory Windows checks

1. `npm ci` (if needed), `npm run check`, `npm run build`.
2. Terminal A: `npm run dev -- --port 5188`. Terminal B: `npm run check:browser`.
3. At 320,360,390,768,1024,1440px check each of Home, Simulations, 13 simulations, Learning, Lab, Tools, 3D Explorer; no horizontal overflow, overlays or unclipped physics figures.
4. Check Stage focus / Escape, Graph jump, tool force-vector dragging, circuit voltage source + R drag + measured A/V, lab filters and real measurement records, 3D camera presets/fitting + hiding advanced controls.
5. Test both themes and existing localStorage snapshot migration (same v1 schema). Only then commit and deploy to Cloudflare.

No PhET source code or assets were imported. No PhET logo was hidden, replaced or modified.
