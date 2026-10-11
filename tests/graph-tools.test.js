import test from 'node:test';
import assert from 'node:assert/strict';
import { scientificCsv, zoomBounds } from '../src/engines/graph-tools.js';
test('graph zoom preserves the center, clamps viewport, and rejects invalid domains', () => {
  assert.deepEqual(zoomBounds(0, 10, 2), { min: 2.5, max: 7.5 });
  assert.deepEqual(zoomBounds(0, 10, 2, 100), { min: 5, max: 10 });
  assert.throws(() => zoomBounds(1, 1, 2));
  assert.throws(() => zoomBounds(0, 10, Infinity));
});
test('graph CSV retains real finite samples and escapes column labels', () => {
  const csv = scientificCsv([{ t: 0, F: 1.2 }, { t: 0.1, F: -0.5 }], 't', 'F', 't (s)', 'Lực "N"');
  assert.match(csv, /"Lực ""N"""/);
  assert.match(csv, /"0.1","-0.5"/);
  assert.throws(() => scientificCsv([{t:0,F:NaN}], 't','F','t','F'));
});
