import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHelix, HELIX_DEFAULTS } from '../src/core/helix.js';
import { createHelixViewport } from '../src/core/helix-viewport.js';

for (const input of [
  HELIX_DEFAULTS,
  { ...HELIX_DEFAULTS, angle: 0 },
  { ...HELIX_DEFAULTS, angle: 90 },
  { ...HELIX_DEFAULTS, angle: 70, charge: -1, mass: 3, field: .2, speed: 16 },
  { ...HELIX_DEFAULTS, angle: 15, charge: 1, mass: .5, field: 2, speed: 2 }
]) {
  test(`Helix automatically fits physical trajectory angle ${input.angle}, charge ${input.charge}, field ${input.field}`, () => {
    const model = createHelix(input);
    for (const [width, height] of [[320,300],[768,380],[1440,520]]) {
      const view = createHelixViewport(model, { width, height });
      const projected = view.path.map(view.project);
      assert.ok(projected.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
      assert.ok(projected.every(p => p.x >= 20 && p.x <= width-20 && p.y >= 20 && p.y <= height-20),
        `Out of frame at ${width}x${height}`);
      const particle = view.project(model.at(view.duration * .35));
      assert.ok(particle.x >= 20 && particle.x <= width-20);
      assert.ok(particle.y >= 20 && particle.y <= height-20);
    }
  });
}
test('Helix fit rejects invalid viewport and physically tracks end of visible path', () => {
  const model = createHelix(HELIX_DEFAULTS);
  assert.throws(() => createHelixViewport(model, { width: 0, height: 300 }), RangeError);
  const view = createHelixViewport(model, { width: 600, height: 400 });
  const end = view.path.at(-1);
  assert.ok(Math.abs(end.z - model.parallel * view.duration) < 1e-8);
  assert.ok(Math.abs(view.maxPhase - 3*Math.PI) < 1e-8);
});
