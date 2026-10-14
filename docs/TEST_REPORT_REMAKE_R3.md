# PhysicsLab Remake R3 — Hooke Workbench QA

Base: `PhysicsLab_1.3_Remake_R2_Circuit_Workbench_Full_Source.zip` / equivalent extracted R2 tree, preserving circuit workbench and other pages.

## In scope

1. Users can click or drag different weights from a tray and detach them.
2. Directly pull the hanging mass then release to set initial extension/velocity for a damped harmonic solution; force arrows update from `P = mg`, `F_spring = kx` at the current position.
3. Graph F–Δx uses same-spring recorded equilibrium values only, without conflating data for spring changes. Manual "Về cân bằng" allows immediate classroom measurement, and recording during motion is disabled.
4. Original Hooke instrument calibration options, progress session, measurement schema and CSV are preserved; Learning Hooke deep links to the bench.
5. Existing R2 circuit entry and 15 other generic labs are preserved.

## Verified

- `node scripts/check.mjs`: JS syntax, relative module imports, named exports, lazy registry checks.
- `node --test tests/*.test.js` including `tests/hooke-motion.test.js` for SI consistency, underdamped dynamics, drag geometry, invalid inputs.
- `tinycss2` parse of authored CSS.

## Not verified in this environment

- Vite build because binary is not present in environment node_modules.
- Full Playwright/Chromium runtime: local headless Chromium timed out, and no Playwright dependency was installed.
- Visual check on real Windows, multi-browser or touchscreen hardware. Treat as Beta and verify before deployment.

## Manual acceptance

- Navigate from **Học tập → Định luật Hooke** to the new Hooke stage.
- Press/touch the 100g weight, then drag another weight into the spring area; confirm combined mass updates and **no addition** when dropped outside.
- Pull the hanging weight; confirm the spring follows your pointer, moves with gradually diminishing oscillations on release, and force vectors match position.
- Verify **Ghi phép đo** is disabled during movement, enabled after "Về cân bằng"; record two different masses and verify graph/slope k and CSV.
- Change to Moon, soft spring and rulers, confirm SI readings and saved data when returning to page.
- Test 390px / 768px / 1440px in light and dark themes, verify horizontal panning is confined to stage only.
- Test R2 electric circuit, generic experiment, 3D Explorer and learning routes for regressions.
