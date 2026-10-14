# PhysicsLab Remake R1 — Technical release notes

## Design principle
PhysicsLab is an original Vietnamese educational physics website. These changes use no PhET source code, icons, trademarks or assets. They adopt the general educational principles of direct manipulation, low initial complexity and exploratory measurement.

## Implemented
- **All 13 original simulation routes remain present**. New shared simulation-studio bar provides reversible `Tập trung quan sát`, `Xem đồ thị`, `Hướng dẫn`, with Escape exit and no mutation of underlying physics models/sessions. Existing sliders remain reachable when focus mode is off.
- **DC circuit**: the original correct series/parallel calculation remains. Drag resistor values horizontally or source vertically, and read model-derived A and V on the diagram. Charge dots remain qualitative rather than physically speed-calibrated.
- **Tools / force-vector playground**: new SVG direct-manipulation workbench with two draggable vectors, parallelogram construction, model-derived resultant magnitude, angle, and x/y components. Range/keyboard alternatives; pure physics unit tests.
- **Lab directory**: discover by experiment name (Vietnamese accent-insensitive), filter by subject, browse original apparatus SVG thumbnails for each of 16 labs, and open a separate workbench with a dominant scene. All original measurement, calibrated-device selection, graphs, CSV and reports remain.
- **Lab on-scene reading**: 'dự đoán từ mô hình' computed live from the original verified `measureLabExperiment`; visually and semantically distinct from actual quantized measurement capture, with an immediate 'Ghi một phép đo' button.
- **3D Explorer**: camera visuals (grid and contrast), playback near stage, advanced inputs in collapsible groups, large viewport and responsive layout. Physics equations and existing 3D projection are unchanged.
- **Mobile navigation**: six equally sized nav items to avoid the old 5-column wrapping issue.

## Not yet complete
- This is a significant original *remake foundation*, **not** a pixel-for-pixel replacement of PhET or a fully reauthored simulation engine for all 13 individual models.
- Generic lab equipment is still a fixed collection of scenes: there is no free-form arbitrary wire construction, collision engine or physical calibration hardware.
- `npm run build`/Playwright automated browser checks could not run on this isolated runtime because the Vite 8.3.4 package is missing from the offline npm cache and Chromium navigation is blocked by administrator. Run them on Windows before deploying.

## Acceptance checklist on Windows
```
npm ci
npm run check
npm run dev -- --port 5188
# another terminal
npm run check:browser
```
Additionally verify interactive vector dragging; lab subject filter; Hooke capture; Ohm capture; source voltage interaction; 3D zoom/fitting and presets; simulation focus + Escape; dark/light; 320,360,390,768,1024,1440 widths.

## Data preservation
Key `physicslab.progress.v1` and its schema are unchanged. The source ZIP excludes `.git`, `node_modules` and `dist`. Retain `.git` and do not clear localStorage during replacement.
