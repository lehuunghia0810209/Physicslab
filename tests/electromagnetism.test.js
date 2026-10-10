import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElectromagneticModel } from '../src/core/electromagnetism.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('Lorentz force is perpendicular to motion and reverses for opposite charges', () => {
  const positive = createElectromagneticModel({ mode: 'lorentz', charge: 2, mass: 4, speed: 3, magneticField: 0.5, pitchAngle: 90 });
  const initial = positive.at(0);
  near(initial.force, 3);
  near(initial.acceleration, 0.75);
  near(initial.radius, 12);
  near(initial.period, 8 * Math.PI);
  near(positive.at(initial.period).x, 0);
  near(positive.at(initial.period).y, 0);
  assert.ok(positive.at(initial.period / 2).y > 0);
  assert.ok(createElectromagneticModel({ mode: 'lorentz', charge: -2, mass: 4, speed: 3, magneticField: 0.5, pitchAngle: 90 }).at(1).y < 0);
});

test('Velocity parallel to the field has no magnetic deflection', () => {
  const model = createElectromagneticModel({ mode: 'lorentz', charge: 1, mass: 1, speed: 8, magneticField: 0.5, pitchAngle: 0 });
  near(model.at(0).force, 0);
  near(model.at(model.period / 4).x, 0);
  near(model.at(model.period / 4).y, 0);
  near(model.at(model.period / 4).parallelSpeed, 8);
});

test('Faraday induction follows changing flux and Ohm current; zero-crossings are correct', () => {
  const model = createElectromagneticModel({ mode: 'induction', magneticField: 0.5, area: 0.2, turns: 100, frequency: 2, resistance: 10 });
  const initial = model.at(0);
  near(initial.flux, 0.1);
  near(initial.emf, 0);
  near(initial.current, 0);
  const quarterCycle = model.at(model.period / 4);
  near(quarterCycle.flux, 0);
  near(quarterCycle.emf, 100 * 0.5 * 0.2 * 4 * Math.PI);
  near(quarterCycle.current, quarterCycle.emf / 10);
});

test('Electromagnetic models reject invalid physical values and nonfinite time', () => {
  const model = createElectromagneticModel({ mode: 'induction', magneticField: 0.5, area: 0.2, turns: 100, frequency: 2, resistance: 10 });
  assert.throws(() => model.at(Infinity), RangeError);
  assert.throws(() => model.sample(0), RangeError);
  assert.throws(() => createElectromagneticModel({ mode: 'lorentz', charge: 0, mass: 1, speed: 1, magneticField: 1, pitchAngle: 45 }), RangeError);
  assert.throws(() => createElectromagneticModel({ mode: 'induction', magneticField: 1, area: 1, turns: 1.5, frequency: 1, resistance: 1 }), RangeError);
  assert.throws(() => createElectromagneticModel({ mode: 'induction', magneticField: 1, area: 1, turns: 1, frequency: 1, resistance: 0 }), RangeError);
});
