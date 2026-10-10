import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOscillation } from '../src/core/oscillation.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Simple harmonic motion follows Hooke dynamics and has the expected period', () => {
  const model = createOscillation({ mass: 1, stiffness: 16, amplitude: 0.5, phase: 0 });
  near(model.angularFrequency, 4);
  near(model.period, Math.PI / 2);
  near(model.at(0).position, 0.5);
  near(model.at(0).velocity, 0);
  near(model.at(0).acceleration, -8);
});

test('Oscillator exchanges kinetic and potential energy while conserving total energy', () => {
  const model = createOscillation({ mass: 1, stiffness: 16, amplitude: 0.5, phase: 0 });
  const quarter = model.at(model.period / 4);
  near(quarter.position, 0);
  near(quarter.kineticEnergy, model.totalEnergy);
  near(quarter.potentialEnergy, 0);
  for (const sample of model.sample(40)) near(sample.totalEnergy, model.totalEnergy);
});

test('Oscillator rejects invalid mass, stiffness, and amplitude', () => {
  assert.throws(() => createOscillation({ mass: 0, stiffness: 10, amplitude: 1, phase: 0 }), RangeError);
  assert.throws(() => createOscillation({ mass: 1, stiffness: 0, amplitude: 1, phase: 0 }), RangeError);
  assert.throws(() => createOscillation({ mass: 1, stiffness: 10, amplitude: 0, phase: 0 }), RangeError);
});
