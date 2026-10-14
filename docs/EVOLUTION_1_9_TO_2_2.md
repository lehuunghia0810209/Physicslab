# PhysicsLab 1.9 → 2.2 — Audit and delivery plan

Status: started from the current `1.8.0-preview.1` working tree. This document is a release plan, not a claim that 2.2 is complete.

## Verified baseline

- Independent Vite/vanilla-JS application with hash routing and lazy-loaded pages/simulations.
- 13 available simulations from `src/data/registry.js`.
- 15 laboratory experiments from `src/core/lab-experiments.js`: 3 dedicated workbenches (DC circuits, Hooke, ideal gas) and 12 shared equipment workbenches, including 4 deeper 1.6 benches.
- 16 curriculum lessons, local versioned progress, CSV export, progress backup/restore, teacher presentation mode, 2D Canvas-based 3D Explorer, vector and measurement tools.
- Scientific models are isolated in `src/core`; graph/vector/timeline/measurement rendering is in `src/engines`; UI lifecycle is owned by route `mount()` cleanup functions.
- Current checkpoint on 2026-10-12: 189 unit tests passed, Vite production build passed, and the full Playwright browser suite passed after the regression fixes, classroom additions, and first two deep simulation remakes recorded below.

## Product risks found in the audit

1. A completed projectile run advanced a Learning lesson even when it was not launched from that lesson. This bypassed the required prediction and evidence gate.
2. Browser acceptance still described older SVG/generic-lab UI and therefore did not exercise the current Canvas workbenches or collapsed advanced controls.
3. Hooke zero-point compensation changed measurements without a dedicated live status message.
4. Several circuit-workbench controls and the 3D time scrubber were below the 44 px target size.
5. Four vector-tool sliders had no explicit accessible name.
6. Existing release documents disagree about 15/16/17 labs and contain obsolete “browser/build not verified” statements. The runtime catalog is the source of truth: 15 experiments.

## Delivery gates

### 1.9 — Simulation and Virtual Lab completion

- Audit every direct-manipulation lifecycle: pointer capture/cancel, resize during drag, route cleanup, reset validity.
- Keep the current 13-model registry; deepen weak models instead of adding more simulations.
- Bring the 12 shared lab benches to the apparatus → action → observation → measurement → analysis workflow already used by circuits, Hooke, gas, optics, ramp, and waves.
- Add regression coverage for label collisions, drag coordinate jumps, route animation cleanup, and invalid reset states.

Exit gate: all 13 simulations and all 15 labs are usable at the tested widths, use the same model for scene/readout/graph, and pass unit/build/browser checks.

### 2.0 — Classroom workflow

- Extend the existing teacher presentation mode and per-simulation scenario/share facilities; do not introduce accounts.
- Build one local Student Lab Notebook schema around the measurements already stored by Hooke and the generic lab. Add hypothesis, setup, observations, conclusion, CSV, print/PDF-friendly output, and validated JSON backup/restore.
- Keep lesson completion tied to saved prediction plus a tracked interaction/measurement launched from the lesson.

Exit gate: a student can complete learn → predict → experiment → record → explain → self-check without server storage.

### 2.1 — Scientific tools and 3D

- Reuse `GraphRenderer`, measurement analysis, vector workspace, and existing equipment definitions.
- Add only analysis that consumes real model samples: multi-run comparison, probe coordinates, SI export, fit-to-view, and layer toggles.
- Keep Canvas projection until a scene demonstrably requires WebGL; adding Three.js is not justified by the current two scenes.

### 2.2 — performance, accessibility, offline, release

- Measure animation FPS/CPU and verify cleanup on every animated route.
- Keep the acceptance matrix at 320, 360, 390, 768, 1024, and 1440 px; add 1920 px and device/browser manual checks before Stable.
- Add a minimal versioned service worker only after cache update and rollback behavior is tested. Preserve `physicslab.progress.v1` and provide export before any schema migration.
- Reconcile README, changelog, architecture, test report, and known issues with the runtime catalogs before release.

## Current milestone result

The first stabilization slice is complete: Learning evidence can no longer be bypassed by an unrelated simulation completion; Hooke calibration has explicit live feedback; current Canvas labs are covered by browser acceptance; interactive controls meet the automated 44 px target; vector sliders have accessible names; and the complete automated acceptance suite passes.

The first Classroom 2.0 slice is also complete:

- Student Lab Notebook covers all 15 experiments with objective, hypothesis, observations, conclusion and self-assessment; it autosaves to the validated progress schema and supports JSON import/export plus print/PDF output.
- Notebook evidence follows the selected experiment and reads the existing instrumented measurement sessions instead of creating a second measurement source.
- Teacher Studio is shared by all 13 simulations. A teacher can save/restore the current model controls locally, pause a running model at an analysis point, and reveal or hide measurements, vectors, graphs and explanations without mutating the physical state.
- Browser acceptance now instruments `requestAnimationFrame`: Projectile, Newton, Waves, Electromagnetism, Ideal Gas and 3D Explorer all produce frames while active and leave no animation loop after route cleanup.
- The browser report at `docs/browser-report.json` is regenerated by the acceptance command so it cannot silently describe an obsolete UI.
- Production builds now generate a content-hashed service worker without a runtime dependency. It precaches the complete Vite output (including lazy simulation/Lab/Tools/3D chunks), retains the previous cache when installation is incomplete, and removes obsolete PhysicsLab caches only after successful activation.
- `npm run check:offline` verifies the production shell and a lazy simulation under real browser offline mode, asserts that Learning/Lab/Tools/3D bundles are precached, and checks cache replacement cleanup.

The first Simulation Engine 5.0 remake slices are complete:

- Waves uses the same causal pulse/reflection physics as Virtual Lab, with a hand-operated source, fixed/free end, movable probe, keyboard controls, and graphs synchronized to the probe state; analytic traveling/standing/interference modes remain available.
- Electric Circuits now mounts the existing construction workbench and Kirchhoff solver instead of the former independent fixed-topology scene. Students can place components, wire terminals, operate a switch, observe lamps, add meters, diagnose open/short circuits, edit/delete the circuit, and record measurements.
- Browser acceptance now includes 1920 px and explicit 44 px checks for SVG/scene sliders. The audit fixed hit targets in Projectile, Inclined Plane, Waves, Magnetic Field, Gas, and the vector playground without visually inflating the apparatus.

Not yet complete: deep remakes of the remaining 11 simulations, the full 1.9 usability review of weaker shared lab benches, full CPU/FPS profiling, installable-PWA metadata, and real-device/cross-browser manual usability testing.
