# PhysicsLab — Direct Remake, Phase A (Optics & Incline)

This is an **incremental simulation-only checkpoint**, not a completed PhysicsLab 1.9 release or a stable 2.2 product.

## Source baseline
- 2026-10-12 `physicslab.zip` user snapshot, based on Codex checkpoint.
- Keep package version at `1.8.0-preview.1` until all planned release gates pass.
- Keep all 15 Virtual Labs, Teacher Studio, Lab Notebook, learning progress and Service Worker unchanged.

## Optics (standalone Simulation)
- Replaced the tiny dynamic diagram with an apparatus-first optical bench.
- Independently drag the object and screen by persistent SVG handles (pointer + keyboard).
- Drag delta is derived from the pointerdown snapshot and a fixed viewport scale during the gesture. No pointerdown repositioning.
- Principal ray lines are based on the same SI model as image readout and graph.
- Virtual-image rays are visibly projected forwards, with dashed *backward extensions* to the virtual image. An image at infinity has parallel output rays.
- Real-image focus indicator, three image-type presets, Fit View and "Put Screen in Focus".
- The screen distance is stored under the existing sanitized `session.setup` contract; no data schema migration.
- Graph regeneration is deferred during drag, then synchronized on pointerup to limit frame stutter.

## Inclined plane (standalone Simulation)
- Separate angle control from the cart control; move the angle handle off the cart to prevent overlapping hit zones.
- Drag the cart along the actual track vector to choose release position, or use its keyboard arrows.
- Shared analytical acceleration is integrated from the release position; the cart stops at the physical 10 m end-stop.
- Quick 15° / 35° / 55° presets; show/hide forces; readable, distinct control labels.
- Progress storage uses the existing sanitized `session.setup.releasePosition` key.

## Evidence and limitations
- `npm run check:core`: **PASS, 199/199** in this container.
- New scientific tests: image-ray intersection for real/virtual images, infinity, focus, static friction, release motion and track stop.
- Browser acceptance now includes regression assertions for non-snapping optics drag and keyboard movement of cart; **not executed successfully in this container**.
- Production Vite build could not run in the Linux container because the uploaded Windows `node_modules` lacks `@rolldown/binding-linux-x64-gnu` and the runtime has no network access.
- Browser execution was attempted, but the sandbox's Chromium navigation policy denied all document navigations (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- User should run `npm ci && npm run check && npm run check:browser && npm run check:offline` on Windows before treating this as ready to deploy. Verify desktop and mobile physical dragging and review screenshots.

## Next order
1. Finish Optics & Incline manual/browser acceptance on Windows, fix issues uncovered.
2. Deep-remake Friction, Work/Energy, Collision.
3. Deep-remake Projectile, Newton, Oscillation.
4. Deep-remake Electric Field, Magnetic Field and Ideal Gas.
5. Finish 1.9 release criteria; do not prematurely bump version or deploy.
