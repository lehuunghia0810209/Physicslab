import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCircuit } from '../src/core/circuits.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Series circuit obeys Ohm law, voltage division, and equivalent resistance', () => {
  const state = createCircuit({ voltage: 12, resistance1: 10, resistance2: 20, topology: 'series' }).at(12);
  near(state.equivalentResistance, 30);
  near(state.current, 0.4);
  near(state.current1, state.current2);
  near(state.voltage1, 4);
  near(state.voltage2, 8);
  near(state.voltage1 + state.voltage2, state.voltage);
});

test('Parallel circuit shares voltage and sums branch currents and powers', () => {
  const state = createCircuit({ voltage: 12, resistance1: 10, resistance2: 20, topology: 'parallel' }).at(12);
  near(state.equivalentResistance, 20 / 3);
  near(state.current1, 1.2);
  near(state.current2, 0.6);
  near(state.current, state.current1 + state.current2);
  near(state.voltage1, 12);
  near(state.voltage2, 12);
  near(state.power, state.power1 + state.power2);
});

test('Circuit characteristic curve samples are finite and invalid circuits are rejected', () => {
  const model = createCircuit({ voltage: 10, resistance1: 10, resistance2: 20, topology: 'series' });
  const samples = model.sample(24);
  assert.equal(samples.length, 25);
  assert.equal(samples[0].current, 0);
  assert.ok(samples.every(sample => Object.values(sample).filter(value => typeof value === 'number').every(Number.isFinite)));
  assert.throws(() => createCircuit({ voltage: 25, resistance1: 10, resistance2: 20, topology: 'series' }), RangeError);
  assert.throws(() => createCircuit({ voltage: 5, resistance1: 0, resistance2: 20, topology: 'parallel' }), RangeError);
  assert.throws(() => createCircuit({ voltage: 5, resistance1: 10, resistance2: 20, topology: 'wrong' }), RangeError);
});
