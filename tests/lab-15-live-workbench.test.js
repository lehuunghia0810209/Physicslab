import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_EXPERIMENTS, defaultLabSetup, measureLabExperiment } from '../src/core/lab-experiments.js';
import { BENCH_HANDLES, BENCH_SIZE, benchHandleFor, benchHandlePoint, benchValueFromPoint, benchGuidance, benchLocalObservation } from '../src/core/lab-workbench-model.js';

const duplicates = new Set(['hooke-law', 'ohms-law', 'gas-law']);

test('All 12 non-dedicated experiments have a live, touch-friendly handle', () => {
  assert.equal(LAB_EXPERIMENTS.length, 15);
  for (const lab of LAB_EXPERIMENTS) {
    if (duplicates.has(lab.id)) continue;
    const handle = benchHandleFor(lab.id);
    assert.ok(handle, `missing ${lab.id}`);
    assert.equal(handle.parameter.type, undefined);
    assert.ok(benchGuidance(lab.id).length >= 3);
    const setup = defaultLabSetup(lab.id);
    const point = benchHandlePoint(lab.id, setup);
    assert.ok(point.x >= 0 && point.x <= BENCH_SIZE.width, `${lab.id} x ${point.x}`);
    assert.ok(point.y >= 0 && point.y <= BENCH_SIZE.height, `${lab.id} y ${point.y}`);
  }
  assert.equal(Object.keys(BENCH_HANDLES).length, 12);
});

test('Dragging the physical handle recovers the current quantized value', () => {
  for (const lab of LAB_EXPERIMENTS) {
    if (duplicates.has(lab.id)) continue;
    const setup = defaultLabSetup(lab.id);
    const key = benchHandleFor(lab.id).key;
    const point = benchHandlePoint(lab.id, setup);
    const result = benchValueFromPoint(lab.id, point, setup[key]);
    assert.ok(Math.abs(result - setup[key]) <= benchHandleFor(lab.id).parameter.step * 1.5, `${lab.id}: ${result}, expected ${setup[key]}`);
  }
});

test('Physical dragging clamps to allowed instrument ranges', () => {
  for (const id of Object.keys(BENCH_HANDLES)) {
    const setup = defaultLabSetup(id);
    const { parameter } = benchHandleFor(id);
    for (const point of [{x:-10000,y:-10000},{x:10000,y:10000}]) {
      const value=benchValueFromPoint(id, point, setup[parameter.key]);
      assert.ok(Number.isFinite(value) && value>=parameter.min && value<=parameter.max, id);
    }
  }
});

test('Live stage readout uses scientific models for each experiment', () => {
  for (const id of Object.keys(BENCH_HANDLES)) {
    const setup = defaultLabSetup(id);
    const result=measureLabExperiment(id,setup);
    assert.ok(Number.isFinite(result.x) && Number.isFinite(result.y),id);
  }
});


test('Wave probe is local and obeys superposition; projectile probe uses the ballistic trajectory',()=>{
  const speed=defaultLabSetup('wave-speed');
  const atZero=benchLocalObservation('wave-speed',speed,{x:128},0);
  const atQuarter=benchLocalObservation('wave-speed',speed,{x:128+42*speed.wavelength/4},0);
  assert.ok(Math.abs(atZero.value)<1e-10);
  assert.ok(Math.abs(atQuarter.value-.5)<1e-10);
  const interference=defaultLabSetup('wave-interference');
  interference.phaseDifference=180;
  for(const x of [128,240,600])assert.ok(Math.abs(benchLocalObservation('wave-interference',interference,{x},0).value)<1e-9);
  const projectile=defaultLabSetup('projectile-motion');
  const left=benchLocalObservation('projectile-motion',projectile,{x:146},0);
  const high=benchLocalObservation('projectile-motion',projectile,{x:446},0);
  assert.equal(left.value,projectile.height);
  assert.ok(high.value>left.value);
});
