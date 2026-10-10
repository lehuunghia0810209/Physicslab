import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCollision } from '../src/core/momentum.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Elastic collision conserves both momentum and kinetic energy', () => {
  const model = createCollision({ mass1: 2, mass2: 3, velocity1: 4, velocity2: 0, restitution: 1, separation: 6 });
  const before = model.at(model.collisionTime - 1e-6);
  const after = model.at(model.collisionTime);
  near(after.momentum, before.momentum);
  near(after.kineticEnergy, before.kineticEnergy);
  near(after.v1, -0.8);
  near(after.v2, 3.2);
});

test('Perfectly inelastic collision conserves momentum and reduces kinetic energy', () => {
  const model = createCollision({ mass1: 2, mass2: 3, velocity1: 4, velocity2: 0, restitution: 0, separation: 6 });
  const before = model.at(model.collisionTime - 1e-6);
  const after = model.at(model.collisionTime);
  near(after.momentum, before.momentum);
  near(after.v1, 1.6);
  near(after.v2, 1.6);
  assert.ok(after.kineticEnergy < before.kineticEnergy);
});

test('Bodies moving apart do not produce a fictitious collision', () => {
  const model = createCollision({ mass1: 1, mass2: 1, velocity1: -2, velocity2: 1, restitution: 1, separation: 4 });
  assert.equal(model.approaching, false);
  assert.equal(model.at(model.duration).collided, false);
});
