# PhysicsLab 1.3 Remake R2 — QA report (2026-10-11)

## Bản nguồn

Based directly on `PhysicsLab_1.3_Remake_R1_Full_Source.zip`, preserving 13 existing simulation routes, 16 original virtual labs (Hooke + 15), learning/progress data and 3D/tools. Adds one independent DC circuit assembly workbench (now 17 lab entries).

## What passed

- Static JavaScript syntax, relative imports, named exports and lazy registry via `node scripts/check.mjs`.
- Node physics/unit regression tests, including 9 new electrical circuit tests: **141/141 PASS**.
- `tinycss2` parsed 24 source stylesheets with 0 top-level parser errors.
- Standalone Chromium smoke of the actual circuit workbench and core solver (without Vite): render, series 9 V / 12 Ω => 0.75 A, parallel => 1.5 A, switch opened => 0 A, selecting/changing bulb 12 Ω to 24 Ω => 0.375 A, click-to-connect 2 wires, add/remove parts, log one measurement. No JS page errors.
- Chromium touch-mode 390 px viewport: tapping terminals to complete loop => 0.75 A; stage scroll container 338 px visible of 700 px work area; no global horizontal overflow.
- Source ZIP extracted for completeness and tests rerun from its unpacked contents.

## What has NOT passed/NOT verified

- **Full Vite production build**: `npm run build` failed with `sh: vite: not found`. The `npm ci` attempt did not complete due lack of network access/cache. This is an environment limitation, not evidence of a passing build.
- **Full-site Playwright**: local HTTP navigation blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Standalone Chromium checks exercised the circuit component, **not** all of PhysicsLab's routes.
- Empirical correctness for AC, semiconductor and nonlinear lamp physics: not implemented. Workbench is deliberately DC resistive with finite impedance meters and ideal wires.
- Teacher/student usability study on actual phones or Windows browsers: still required.

## Windows acceptance commands

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check
npm run dev -- --port 5188
# separate terminal
npm run check:browser
```

Manual: enter Lab and confirm circuit is default; test from empty workbench, connect terminals by dragging and two taps, open/close switch, move/rotate/remove a component, place an ammeter in series and voltmeter in parallel, check short-circuit notice, 390px horizontal lab stage panning, dark/light, CSV, reload saved circuit, existing Hooke and other experiment sessions.

No third-party PhET files or trademarks are copied or obscured.
