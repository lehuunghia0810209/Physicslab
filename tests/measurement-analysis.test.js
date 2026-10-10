import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMeasurements } from '../src/core/measurement-analysis.js';

test('Measurement analysis computes sample spread, standard error, and combined instrument uncertainty', () => {
  const result = analyzeMeasurements([1, 2, 3], 0.01);
  assert.equal(result.count, 3);
  assert.equal(result.mean, 2);
  assert.equal(result.standardDeviation, 1);
  assert.ok(Math.abs(result.standardError - 1 / Math.sqrt(3)) < 1e-12);
  assert.ok(Math.abs(result.resolutionUncertainty - 0.01 / Math.sqrt(12)) < 1e-12);
  assert.ok(result.combinedUncertainty > result.standardError);
});

test('Measurement analysis rejects undersized, nonfinite, and invalid-resolution inputs', () => {
  assert.throws(() => analyzeMeasurements([1]), TypeError);
  assert.throws(() => analyzeMeasurements([1, Number.NaN]), TypeError);
  assert.throws(() => analyzeMeasurements([1, 2], -0.1), RangeError);
});
