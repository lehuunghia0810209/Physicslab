import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from '../src/core/progress.js';
test('Hooke calibration options round-trip through version-one local progress without data migration', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) || null, setItem: (key,value) => memory.set(key,value) };
  const progress = createProgress(storage);
  progress.session('hooke-lab', {
    setup: { springId:'standard', mass:1, forceSteps:2, rulerSteps:-1, compensated:0 },
    measurements:[{ mass:1, force:9.83, extension:.0983, springConstant:100,
      rulerId:'ruler-0.1mm', forceGaugeId:'force-sensor-0.01n' }]
  });
  const again = createProgress(storage).get().sessions['hooke-lab'];
  assert.equal(again.setup.forceSteps, 2);
  assert.equal(again.setup.rulerSteps, -1);
  assert.equal(again.setup.compensated, 0);
  assert.equal(again.measurements[0].force, 9.83);
});
