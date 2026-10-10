import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInclinedPlane, DEFAULT_INCLINED } from '../src/core/inclined.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

test('Inclined plane resolves force components and acceleration with friction', () => {
  const model = createInclinedPlane({ angle: 30, mass: 4, gravity: 9.81, mu: 0.25 });
  near(model.gravityComponent, 4 * 9.81 * Math.sin(Math.PI / 6));
  near(model.normal, 4 * 9.81 * Math.cos(Math.PI / 6));
  near(model.acceleration, 2.7810726972186632, 1e-9);
  assert.equal(model.moving, true);
});

test('Inclined plane locks at rest when static friction exceeds downhill pull', () => {
  const model = createInclinedPlane({ angle: 20, mass: 3, gravity: 9.81, mu: 0.8 });
  assert.equal(model.moving, false);
  assert.equal(model.acceleration, 0);
  assert.ok(model.threshold);
});
