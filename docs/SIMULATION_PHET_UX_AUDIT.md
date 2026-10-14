# Simulation UX audit — PhET principles and PhysicsLab baseline

Status: audit checkpoint, 2026-10-12. This is an implementation input, not a claim that the remake is complete.

## Research observations

The official PhET HTML simulations were opened and exercised where browser access allowed, with particular attention to [Forces and Motion: Basics](https://phet.colorado.edu/en/simulations/forces-and-motion-basics), [Wave on a String](https://phet.colorado.edu/en/simulations/wave-on-a-string), and [Circuit Construction Kit: DC](https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc). No PhET code, artwork, branding, or assets are used by PhysicsLab.

Reusable interaction principles:

- The first screen presents a small number of large, recognizable things to manipulate, not a parameter form.
- A direct action produces an immediate visible consequence: a puller changes the force balance, a hand creates a wave, and a connected component changes the circuit state.
- Screens are task-oriented. Advanced tools, labels, values, vectors, and graphs are optional layers instead of permanent visual noise.
- Reset, play/pause/step, and special states are visually explicit. The model remains understandable without reading equations first.
- Handles are part of the apparatus and retain a stable frame of reference during a gesture. Measurement tools are movable objects, not disconnected numeric inputs.
- Color and motion encode a physical role. They do not replace the model or add decorative motion unrelated to cause and effect.

PhysicsLab should therefore optimize the first 10–20 seconds around one obvious action, then reveal measurement and explanation as a second layer. Teacher Studio already supplies reversible visibility controls and must remain an overlay on the same physical state.

## Current 13-simulation audit

| Simulation | Current strength | Main acceptance gap | Priority |
| --- | --- | --- | --- |
| Projectile Motion | Direct launch vector, real flight, trail, vectors, comparison, four synced graphs | Complete the apparatus/readability pass and validate fast/slow/end-limit drags | Medium |
| Newton's Laws | Draggable force/block scene with timeline and graphs | Make balanced/unbalanced forces self-evident before the numeric controls | Medium |
| Inclined Plane | Stable direct angle control and correct force model | Reuse the Virtual Lab draggable release cart, force-layer toggles, ruler, and clock | High |
| Friction | Direct force interaction; static/kinetic model and graphs | Add recognizable surfaces and an instrument-like force gauge; clarify the breakaway threshold | High |
| Work & Energy | Direct force/object interaction and synchronized model | Add a readable energy bar and two-run comparison without inventing a second data source | High |
| Collision Lab | Two-body collision model, timeline, graphs, direct vehicle controls | Add spatial placement, momentum arrows, collision-type affordance, and overlap checks | High |
| Oscillation | Draggable mass, timeline, x/v graphs, energy model | Add ruler/period measurement, force-velocity-acceleration layers, and clearer energy exchange | Medium |
| Waves | Deep-remake slice complete: analytic modes plus shared causal pulse/reflection model, hand source, fixed/free end, movable probe and synced graphs | Continue visual/special-state regression while other scenes are remade | Completed slice |
| Electric Circuits | Deep-remake slice complete: the Simulation route now uses the existing construction workbench and Kirchhoff solver with components, wiring, switch, lamps, meters and warnings | Add more automated drag-placement and short-circuit visual cases | Completed slice |
| Electric Field | Charges and probe are movable; Coulomb superposition is correct | Add field-line/grid layers and clearer distinction between source charges and probe | Medium |
| Magnetic Field | Lorentz and Faraday models, timeline, direct parameter gesture | Make launch/field direction spatial; for induction, manipulate magnet/coil and show changing flux | High |
| Optics | Correct thin-lens rays and draggable object | Reuse the Virtual Lab object/screen bench, stable scale, focus state, and virtual-image treatment | Highest |
| Gas Properties | Piston, particles, pump/vent/heat/cool, analytic thermodynamics | Apparatus/readout polish and pressure/temperature instruments; keep particles illustrative only | Medium |

## Shared findings

- Physics, graphs, timelines, progress, Teacher Studio, and lifecycle cleanup are already separated well enough to evolve incrementally; a wholesale framework rewrite is not justified.
- The highest-value reuse path is from the current Virtual Lab: rope reflection/probe, ramp cart/release geometry, optical screen/focus, and Circuit Workbench.
- Pointer code is duplicated. Every touched scene must store the pointer-down state, use pointer capture, clamp in model coordinates, handle `pointercancel`, avoid replacing the active node, and expose a keyboard equivalent.
- The default scene should show 2–4 key measurements. Equations, graphs, vectors, and explanations remain available through progressive disclosure and Teacher Studio.
- The automated suite already verifies route cleanup and 320–1440 px behavior. The remake must add 1920 px and deeper per-scene gestures, screenshots, and special-state assertions.

## Baseline evidence

At this checkpoint: 149 JavaScript modules passed syntax/import validation, 186 unit tests passed, the Vite production build passed, and the full browser suite passed with no runtime exceptions, console errors, failed requests, or leaked animation loops in the sampled animated routes.
