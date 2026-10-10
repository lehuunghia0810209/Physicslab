import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHookeRows } from '../src/core/hooke-analysis.js';
import { sanitizeHookeMeasurements } from '../src/core/equipment.js';
import { toCsv } from '../src/core/hooke.js';
test('Hooke regression uses actual measured points from only the selected spring',()=>{
  const rows=[
    {springId:'standard',extension:0.1,force:2.5},
    {springId:'standard',extension:0.2,force:5},
    {springId:'stiff',extension:0.1,force:4},
    {extension:0.3,force:99}
  ];
  const standard=analyzeHookeRows(rows,'standard');
  assert.equal(standard.points.length,2);
  assert.ok(Math.abs(standard.fit.stiffness-25)<1e-9);
  assert.equal(analyzeHookeRows(rows,'stiff').fit,null);
});
test('Hooke saved measurements and CSV preserve the spring identity and legacy measurements',()=>{
  const row={springId:'standard',mass:1,force:9.81,extension:.3924,springConstant:25,rulerId:'ruler-1mm',forceGaugeId:'force-sensor-0.01n'};
  const clean=sanitizeHookeMeasurements([row,{...row,springId:'unrecognized'}]);
  assert.equal(clean[0].springId,'standard');
  assert.equal(clean[1].springId,undefined);
  assert.ok(toCsv(clean).startsWith('mass_kg,force_n,extension_m,stiffness_n_m,spring_id,'));
  assert.ok(toCsv(clean).includes(',standard,'));
});
