import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewtonMotion } from '../src/core/newton.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

test('Newton second law computes acceleration from net force and friction', () => {
  const model = createNewtonMotion({ mass: 5, force: 22, friction: 0.15, gravity: 9.81 });
  near(model.frictionForce, 7.3575);
  near(model.netForce, 14.6425);
  near(model.acceleration, 2.9285);
  assert.equal(model.threshold, false);
  assert.equal(model.direction, 'đồng hướng');
});

test('Newton second law locks the block when friction exceeds pull', () => {
  const model = createNewtonMotion({ mass: 4, force: 9, friction: 0.8, gravity: 9.81 });
  assert.equal(model.threshold, true);
  assert.equal(model.acceleration, 0);
  assert.equal(model.netForce, 0);
  assert.equal(model.sample(2)[1].velocity, 0);
});

test('Negative force applies kinetic friction opposite motion and respects time-based motion', () => {
  const model = createNewtonMotion({ mass: 3, force: -18, friction: 0.22, gravity: 9.81 });
  assert.equal(model.threshold, false);
  assert.equal(model.direction, 'ngược hướng');
  near(model.frictionForce, 6.4746);
  near(model.netForce, -11.5254);
  near(model.acceleration, -3.8418);
  near(model.at(model.duration).velocity, model.acceleration * model.duration, 1e-6);
  assert.ok(model.at(0.5).position <= 0);
  assert.ok(model.at(0.5).velocity < 0);
});
