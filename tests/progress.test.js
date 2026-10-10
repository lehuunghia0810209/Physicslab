import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from '../src/core/progress.js';
import { createState } from '../src/core/state.js';
const mock = raw => { let value = raw; return { getItem: () => value, setItem: (_, v) => { value = v; } }; };
test('Progress survives reload, records real actions, and returns independent snapshots', () => {
  const storage = mock(null); const p = createProgress(storage);
  p.visit('projectile-motion', 'Khám phá'); p.visit('projectile-motion', 'Khám phá'); p.complete('projectile-motion'); p.lesson('projectile-discovery', 2); p.lesson('projectile-discovery', 1); p.quiz('projectile-discovery', 100);
  const q = createProgress(storage); assert.equal(q.get().experiments['projectile-motion'], 1); assert.equal(q.get().lessons['projectile-discovery'], 2); assert.equal(q.get().activity.length, 3);
  const snapshot = q.get(); snapshot.visited = {}; assert.equal(Object.keys(q.get().visited).length, 1);
  q.clear(); assert.equal(q.get().activity.length, 0);
});
test('Corrupt, old-version, invalid and blocked storage have safe fallbacks', () => {
  for (const raw of ['not json', '{"version":2}', '{"version":1,"visited":[],"activity":[null]}']) assert.deepEqual(createProgress(mock(raw)).get().visited, {});
  const p = createProgress({ getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } }); p.visit('projectile-motion', 'Khám phá'); assert.equal(p.isPersistent(), false); assert.equal(Object.keys(p.get().visited).length, 1);
});
test('Progress write APIs reject invalid ids, lesson steps, quiz scores, and malformed sessions', () => {
  const p = createProgress(mock(null));
  assert.throws(() => p.lesson('../lesson', 1), RangeError);
  assert.throws(() => p.lesson('lesson', 4.5), RangeError);
  assert.throws(() => p.lesson('lesson', 5), RangeError);
  assert.throws(() => p.quiz('lesson', 101), RangeError);
  assert.throws(() => p.quiz('lesson', NaN), RangeError);
  assert.throws(() => p.session('bad id', { time: 2 }), TypeError);
  assert.throws(() => p.session('valid-id', { setup: { prediction: {} } }), RangeError);
  p.session('learning-lesson', { setup: { prediction: 'b' } });
  assert.deepEqual(p.get().sessions['learning-lesson'].setup, { prediction: 'b' });
  p.session('virtual-lab', {
    setup: { experimentId: 'ohms-law', parameters: { voltage: 12, topology: 'series' }, instruments: { voltage: 'voltmeter-0.01v' } },
    measurements: [{ experimentId: 'ohms-law', at: 10, xUnit: 'V', yUnit: 'A', readings: { measuredX: 12, measuredY: 0.4, imageType: 'real' }, uncertainties: { x: 0.005, y: 0.0005 }, instruments: { xId: 'voltmeter-0.01v', yId: 'ammeter-0.001a' }, setup: { topology: 'series' } }]
  });
  const lab = p.get().sessions['virtual-lab'];
  assert.equal(lab.setup.parameters.voltage, 12);
  assert.equal(lab.setup.instruments.voltage, 'voltmeter-0.01v');
  assert.equal(lab.measurements[0].readings.measuredY, 0.4);
  assert.equal(lab.measurements[0].instruments.xId, 'voltmeter-0.01v');
});
test('Shared state publishes and unsubscribes changes', () => {
  const s = createState({ time: 0 }); let count = 0; const remove = s.subscribe(() => count++);
  s.set({ time: 1 }); remove(); s.set({ time: 2 }); assert.equal(count, 1); assert.equal(s.get().time, 2); assert.ok(Object.isFrozen(s.get()));
});

test('Corrupted saved Hooke rows are removed without touching generic lab measurements', () => {
  const goodHooke = { mass: 0.5, force: 4.905, extension: 0.1962, springConstant: 25,
    rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.001n' };
  const generic = { experimentId: 'ohms-law', readings: { measuredX: 12, measuredY: 0.4 },
    uncertainties: { x: 0.005, y: 0.0005 }, instruments: { xId: 'voltmeter-0.01v', yId: 'ammeter-0.001a' } };
  const storage = mock(JSON.stringify({ version: 1, sessions: {
    'hooke-lab': { measurements: [{ title: 'broken' }, goodHooke, { ...goodHooke, extension: null }] },
    'virtual-lab': { measurements: [generic] }
  } }));
  const loaded = createProgress(storage);
  assert.equal(loaded.get().sessions['hooke-lab'].measurements.length, 1);
  assert.equal(loaded.get().sessions['hooke-lab'].measurements[0].forceGaugeId, 'force-sensor-0.001n');
  assert.equal(loaded.get().sessions['virtual-lab'].measurements.length, 1);
  loaded.session('hooke-lab', { measurements: [{ title: 'broken' }, goodHooke] });
  assert.equal(createProgress(storage).get().sessions['hooke-lab'].measurements.length, 1);
});

test('Electric field saves charge positions and probe through versioned session sanitation', () => {
  const storage=mock(null);
  const first=createProgress(storage);
  first.session('electric-field',{setup:{charge0:{x:-1.25,y:.25,charge:2},charge1:{x:1.5,y:0,charge:-2},probe:{x:0,y:.4}}});
  const restored=createProgress(storage).get().sessions['electric-field'].setup;
  assert.equal(restored.charge0.x,-1.25);
  assert.equal(restored.charge1.charge,-2);
  assert.equal(restored.probe.y,.4);
});
test('Hooke measurement rows preserve known spring identity across reloads', () => {
  const storage=mock(null);
  const first=createProgress(storage);
  first.session('hooke-lab',{ measurements:[{springId:'standard',mass:1,force:9.81,extension:.3924,springConstant:25,rulerId:'ruler-1mm',forceGaugeId:'force-sensor-0.01n'}] });
  const restored=createProgress(storage).get().sessions['hooke-lab'].measurements;
  assert.equal(restored[0].springId,'standard');
});
test('A local progress backup may be restored safely without exposing internal state', () => {
  const storage=mock(null);
  const progress=createProgress(storage);
  progress.lesson('projectile-discovery', 2);
  const backup=progress.get();
  progress.clear();
  assert.equal(progress.get().lessons['projectile-discovery'], undefined);
  progress.restore(backup);
  assert.equal(progress.get().lessons['projectile-discovery'], 2);
  assert.throws(()=>progress.restore({ version: 5 }), RangeError);
  assert.equal(progress.get().lessons['projectile-discovery'], 2);
  const hostile={ ...backup, visited:{'../bad':1, 'projectile-motion':50}};
  progress.restore(hostile);
  assert.equal(progress.get().visited['../bad'], undefined);
  assert.equal(progress.get().visited['projectile-motion'], 50);
});
