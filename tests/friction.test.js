import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrictionMotion } from '../src/core/friction.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('Static friction balances applied force until its limiting value', () => {
  const model = createFrictionMotion({ mass: 5, force: 20, staticCoefficient: 0.5, kineticCoefficient: 0.3, gravity: 10 });
  assert.equal(model.threshold, true);
  near(model.frictionForce, -20);
  near(model.netForce, 0);
  near(model.at(4).position, 0);
});

test('Kinetic friction opposes motion in either direction and determines acceleration', () => {
  const right = createFrictionMotion({ mass: 5, force: 35, staticCoefficient: 0.5, kineticCoefficient: 0.3, gravity: 10 });
  near(right.frictionForce, -15);
  near(right.acceleration, 4);
  assert.ok(right.at(1).position > 0);
  const left = createFrictionMotion({ mass: 5, force: -35, staticCoefficient: 0.5, kineticCoefficient: 0.3, gravity: 10 });
  near(left.frictionForce, 15);
  near(left.acceleration, -4);
  assert.ok(left.at(1).position < 0);
});

test('Friction model rejects kinetic coefficient above static coefficient', () => {
  assert.throws(() => createFrictionMotion({ mass: 5, force: 20, staticCoefficient: 0.2, kineticCoefficient: 0.3, gravity: 9.81 }), RangeError);
});
