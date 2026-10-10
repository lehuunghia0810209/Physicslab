import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorkEnergyMotion } from '../src/core/work-energy.js';

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Work equals force displacement cosine and net work equals kinetic energy change', () => {
  const model = createWorkEnergyMotion({ mass: 4, force: 24, distance: 12, angle: 0, friction: 0, initialSpeed: 2, gravity: 9.81 });
  const end = model.at(model.duration);
  near(end.appliedWork, 288);
  near(end.frictionWork, 0);
  near(end.netWork, end.energyChange);
  near(end.kineticEnergy, 296);
});

test('Friction contributes negative work and stops a decelerating body at zero speed', () => {
  const model = createWorkEnergyMotion({ mass: 2, force: 0, distance: 20, angle: 0, friction: 0.5, initialSpeed: 4, gravity: 10 });
  const end = model.at(model.duration);
  near(end.velocity, 0);
  near(end.kineticEnergy, 0);
  assert.ok(end.frictionWork < 0);
  near(end.position, 1.6);
});

test('Work-energy validation rejects invalid angles and non-finite input', () => {
  assert.throws(() => createWorkEnergyMotion({ mass: 1, force: 1, distance: 1, angle: 91, friction: 0, initialSpeed: 0, gravity: 9.81 }), RangeError);
  assert.throws(() => createWorkEnergyMotion({ mass: NaN, force: 1, distance: 1, angle: 0, friction: 0, initialSpeed: 0, gravity: 9.81 }), RangeError);
});

test('Angled upward pulling force reduces the normal and kinetic friction', () => {
  const model=createWorkEnergyMotion({ mass: 4, force: 20, distance: 10, angle: 30, friction: 0.2, initialSpeed: 2, gravity: 10 });
  near(model.normalForce, 30);
  near(model.frictionForce, 6);
  near(model.at(0).netForce, 20*Math.cos(Math.PI/6)-6);
  assert.throws(() => createWorkEnergyMotion({ mass: 1, force: 40, distance: 3, angle: 90, friction: .2, initialSpeed: 1, gravity: 9.81 }), /rời mặt phẳng/);
});
test('At rest, static friction balances a subthreshold pull rather than accelerating backward', () => {
  const model=createWorkEnergyMotion({ mass: 3, force: 2, distance: 4, angle: 0, friction: .4, initialSpeed: 0, gravity: 10 });
  assert.equal(model.atRest,true);
  near(model.netForce,0);
  near(model.frictionForce,2);
  near(model.at(3).position,0);
});

test('Short high-acceleration runs stop at the physical distance without creating extra kinetic energy', () => {
  const model=createWorkEnergyMotion({ mass: 0.5, force: 100, distance: 0.5, angle: 0, friction: 0, initialSpeed: 20, gravity: 10 });
  assert.ok(model.duration < .2);
  const end=model.at(model.duration);
  near(end.position, 0.5, 1e-8);
  near(end.netWork, end.energyChange, 1e-7);
});
