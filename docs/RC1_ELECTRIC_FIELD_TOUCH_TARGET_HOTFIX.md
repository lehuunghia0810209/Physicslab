# PhysicsLab 2.0 RC1 — Electric-field pointer target hotfix

## Regression reported from Windows browser QA

`simulation/electric-field @1440 has small targets`: SVG slider `<g>` hit boxes for two charges were ~41.63 px, and the probe ~39.96 px, below the browser suite's 44 px minimum.

## Fix

- Preserve the visible marker/artwork and the existing electrostatic model.
- Compute **transparent SVG hit radius** from the current `getScreenCTM()` physical screen scale so hit areas remain at least 48 CSS pixels across responsive widths.
- Update on ResizeObserver changes and window resize, and disconnect observer/listener on simulation unmount.
- Add two unit tests for simulated desktop/tablet/phone scales and invalid geometries.
- Preserve the previous Projectile slider fix (`min-height:48px`).

## Verification

`node scripts/check.mjs`: PASS (165 modules, 353 relative imports, 450 named exports).
`node --test tests/*.test.js`: PASS (224/224).

Vite production and browser/offline QA are **not rerun in this environment**. Confirm on Windows:

```powershell
cd D:\EduLab\physicslab
npm run check:release
```

If further browser failures occur, share the next log. Do not label the release Stable until the full check is green.
