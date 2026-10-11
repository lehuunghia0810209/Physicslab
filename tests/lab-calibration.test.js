import test from 'node:test';
import assert from 'node:assert/strict';
import { calibrateReading, hookeStiffnessUncertainty } from '../src/core/lab-calibration.js';
test('zero-offset correction cancels known deterministic bias without changing underlying model', () => {
  const raw = calibrateReading('force-sensor-0.01n', 1.23, 2, false);
  const corrected = calibrateReading('force-sensor-0.01n', 1.23, 2, true);
  assert.equal(raw.value, 1.25);
  assert.equal(corrected.value, 1.23);
  assert.equal(corrected.bound, .005);
  assert.throws(() => calibrateReading('force-sensor-0.01n', 1, 4));
});
test('Hooke measurement uncertainty propagates from force and extension reading bounds', () => {
  const result = hookeStiffnessUncertainty(1, .02, .005, .00005);
  assert.equal(result.stiffness, 50);
  assert.ok(result.uncertainty > .14 && result.uncertainty < .2);
  assert.ok(result.firstOrderLimit > result.uncertainty);
  assert.throws(() => hookeStiffnessUncertainty(0, .02, .005, .00005));
});
