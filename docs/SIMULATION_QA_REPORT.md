# Simulation remake QA report

Status: live checkpoint, not a Stable release report.

## Baseline — 2026-10-12

- `npm run check`: PASS — 149 JavaScript modules, 186 unit tests, Vite production build.
- `npm run check:browser`: PASS — all application routes, all 13 simulations reachable, responsive matrix 320/360/390/768/1024/1440, accessible names, real model assertions, light/dark persistence, and animation-loop cleanup.
- Browser runtime: no page exceptions, console errors, or failed requests.
- Official PhET research performed on Forces and Motion: Basics, Wave on a String, and Circuit Construction Kit: DC; findings are recorded in `SIMULATION_PHET_UX_AUDIT.md`.

## Remake status

| Simulation | Status | Evidence still required |
| --- | --- | --- |
| Waves | Deep remake complete for this checkpoint | Shared pulse/reflection physics, hand-source drag, fixed/free boundary, movable probe, keyboard, synced graphs, desktop/mobile screenshots, full regression |
| Electric Circuits | Deep remake complete for this checkpoint | Simulation now mounts the existing construction workbench and Kirchhoff solver; component placement, terminal wiring, switch/open circuit, parallel preset, meters, warnings and persistence are browser-tested |
| Projectile, Newton, Inclined, Friction, Work/Energy, Collision, Oscillation, Electric Field, Magnetic Field, Optics, Gas | Audited; not yet claimed remade | Per-simulation interaction and visual acceptance |

## Current automated evidence

- `npm run check`: PASS — 149 JavaScript modules, 189 unit tests, and the Vite production build.
- `npm run check:browser`: PASS after the Waves and Circuits slices — all 13 simulation routes, 1920/1440/1024/768/390/360/320 px, no page overflow, explicit controls at least 44 px, named controls, real scene gestures, and no runtime/console/request failures.
- Screenshots: `work/wave-remake-desktop.png`, `work/wave-remake-mobile.png`, and `work/circuit-construction-desktop.png`.
- `npm run check:offline`: PASS — production shell, lazy simulation, Learning, Lab, Tools, and 3D bundles remain available from the versioned precache; obsolete cache replacement remains safe.
- The wider hit-target audit fixed undersized direct controls in Projectile, Inclined Plane, Waves, Magnetic Field, Gas, and the vector playground without enlarging their visible artwork.

## Release checks still open

- Add deeper primary-gesture and special-state checks for the remaining 11 simulations.
- Capture representative before/after screenshots and inspect label/handle collisions.
- Edge/Chromium automation is passing; Firefox and real touch-device checks remain when those runtimes are available.
- Profile long-running animation FPS/CPU on representative low-power hardware.

Virtual Lab, Student Lab Notebook, Teacher Studio, Learning, Scientific Tools, 3D Explorer, progress backup, and offline behavior remain regression scope and are not being replaced.
