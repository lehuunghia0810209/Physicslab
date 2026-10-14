# Simulation remake plan

Status: active. Completion is recorded per simulation only after direct interaction, scientific, responsive, lifecycle, and browser evidence all pass.

## Delivery order

1. **Waves — complete for this checkpoint** — reused the tested rope pulse/reflection model, added an apparatus-like source and movable probe, and retained standing/interference as advanced explorations.
2. **Electric Circuits — complete for this checkpoint; Optics and Inclined Plane next** — the simulation now uses the same construction workbench and Kirchhoff solver as Virtual Lab, without a second fixed-topology engine.
3. **Friction, Work & Energy, Collision** — deepen direct force/vehicle manipulation and make thresholds, conservation, and energy transfer visible.
4. **Newton, Oscillation, Electric Field, Magnetic Field** — strengthen apparatus cues, layer controls, measurement tools, and special states.
5. **Projectile and Gas** — retain their stronger interaction engines; complete readability, edge-case, responsive, and performance acceptance.

## Shared implementation rules

- Model state is the sole source for scene geometry, values, and graphs.
- Timeline owns play/pause/seek/rate and is destroyed on unmount.
- A drag starts from captured pointer and model state, uses stable scene coordinates, clamps before model update, and supports cancel plus keyboard control.
- Default UI exposes the primary action and 2–4 measurements. Secondary parameters, equations, graphs, vectors, and explanation are layers.
- Existing progress keys and stored sessions are migrated by tolerant defaults; no current notebook, measurement, or learning evidence is deleted.
- No new runtime dependency is planned. SVG remains appropriate for graph-heavy 2D scenes; Canvas workbenches are reused where apparatus density makes it clearer.

## Per-simulation completion gate

A simulation is marked deeply remade only when all are true:

1. A first-time learner can identify and perform the primary action without reading a long guide.
2. Direct manipulation has immediate, stable feedback on mouse, touch, and keyboard.
3. Scene, readouts, graph, and exported state agree with one tested physics model.
4. Play, pause, seek, reset, parameter changes during playback, and route cleanup behave predictably.
5. Important boundary/equilibrium/conservation cases are covered by unit and browser assertions.
6. Light/dark mode and 320, 360, 390, 768, 1024, 1440, and 1920 px layouts have no clipped apparatus or page overflow.
7. A representative screenshot and an honest QA entry exist in `SIMULATION_QA_REPORT.md`.

## Current milestone

The first two implementation slices are complete: Waves now reuses `ropeDisplacement` and `waveSpeed`, while Electric Circuits mounts `mountCircuitWorkbench` and `solveBench` directly. Optics and Inclined Plane are next because their stronger apparatus interactions already exist in Virtual Lab and can be integrated without replacing validated physics.
