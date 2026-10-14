import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRopeWave, createTravelingWave, createWaveExperiment } from '../src/core/waves.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Traveling-wave speed, frequency, wavelength, and period are consistent', () => {
  const model = createTravelingWave({ amplitude: 0.5, frequency: 2, wavelength: 3, phase: 0 });
  near(model.speed, 6);
  near(model.period, 0.5);
  near(model.angularFrequency, 4 * Math.PI);
  near(model.waveNumber, 2 * Math.PI / 3);
});

test('A wave particle oscillates while the spatial profile translates', () => {
  const model = createTravelingWave({ amplitude: 0.5, frequency: 1, wavelength: 4, phase: 0 });
  near(model.at(0).displacement, 0.5);
  near(model.at(model.period / 4).displacement, 0);
  near(model.at(model.period / 4).particleVelocity, -Math.PI);
  near(model.profile(0)[16].y, 0.5);
  assert.notEqual(model.profile(0)[16].y, model.profile(model.period / 4)[16].y);
});

test('Standing-wave nodes remain fixed and antinodes reach twice component amplitude', () => {
  const model = createTravelingWave({ amplitude: 0.5, frequency: 1, wavelength: 4, phase: 0, mode: 'standing' });
  near(model.profile(0, 160, 4)[0].y, 0);
  near(model.profile(0, 160, 4)[80].y, 0);
  near(model.at(0).displacement, 1);
  near(model.at(model.period / 4).displacement, 0);
});

test('Two coherent waves add constructively and cancel at opposite phase', () => {
  const constructive = createTravelingWave({ amplitude: 0.5, frequency: 1, wavelength: 4, phase: 0, phaseDifference: 0, mode: 'interference' });
  near(constructive.at(0).displacement, 1);
  const destructive = createTravelingWave({ amplitude: 0.5, frequency: 1, wavelength: 4, phase: 0, phaseDifference: 180, mode: 'interference' });
  near(destructive.at(0).displacement, 0);
  assert.ok(destructive.profile(0).every(point => Math.abs(point.y) < 1e-12));
});

test('Wave model clamps time and rejects nonphysical values', () => {
  const model = createTravelingWave({ amplitude: 0.5, frequency: 1, wavelength: 4, phase: 0 });
  assert.equal(model.at(-1).time, 0);
  assert.equal(model.at(100).time, model.duration);
  assert.throws(() => createTravelingWave({ amplitude: 0, frequency: 1, wavelength: 4, phase: 0 }), RangeError);
  assert.throws(() => createTravelingWave({ amplitude: 1, frequency: 1, wavelength: Infinity, phase: 0 }), RangeError);
  assert.throws(() => model.at(NaN), RangeError);
  assert.throws(() => model.profile(0, 0), RangeError);
  assert.throws(() => createTravelingWave({ amplitude: 1, frequency: 1, wavelength: 4, phase: 0, mode: 'bad' }), RangeError);
});

test('Rope pulse uses the shared propagation model and movable probe', () => {
  const model = createRopeWave({ amplitude: 0.5, frequency: 2, wavelength: 3, phase: 0, mode: 'pulse', boundary: 'fixed', probePosition: 4 });
  near(model.speed, 6);
  near(model.at(0).displacement, 0, 1e-4);
  assert.ok(model.at(4 / 6 + 0.35).displacement > 0.49);
  assert.equal(model.at(0).probePosition, 4);
  assert.equal(model.length, 8);
});

test('Rope fixed and free ends reflect with opposite displacement', () => {
  const setup = { amplitude: 0.5, frequency: 2, wavelength: 3, phase: 0, mode: 'pulse', probePosition: 0 };
  const fixed = createWaveExperiment({ ...setup, boundary: 'fixed' });
  const free = createWaveExperiment({ ...setup, boundary: 'free' });
  const reflected = 2 * fixed.length / fixed.speed + 0.35;
  assert.ok(fixed.at(reflected).displacement < -0.49);
  assert.ok(free.at(reflected).displacement > 0.49);
  assert.throws(() => createRopeWave({ ...setup, probePosition: 9, boundary: 'fixed' }), RangeError);
});
