import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTrajectoryPoint,pickTrajectorySample,markerSeparation } from '../src/core/trajectory-probe.js';
import { createHelix,HELIX_DEFAULTS } from '../src/core/helix.js';
import { createProjectile } from '../src/core/projectile.js';
test('3D picking snaps to an actual sample within a 44px target, resolving overlaps near current time',()=>{
  const points=[{x:10,y:0,z:0,t:0},{x:10,y:0,z:10,t:2}];
  const project=p=>({x:p.x,y:p.y});
  assert.deepEqual(pickTrajectorySample(points,project,{x:10,y:2},1.9),points[1]);
  assert.equal(pickTrajectorySample(points,project,{x:33,y:0}),null);
  const picked=pickTrajectorySample(points,project,{x:10,y:0});picked.t=99;assert.equal(points[0].t,0);
});
test('3D ruler measures SI straight-line separation and elapsed time without projection distortion',()=>{
  const helix=createHelix(HELIX_DEFAULTS),a=helix.at(0),b=helix.at(helix.period);
  assert.ok(Math.abs(markerSeparation(a,b).distance-Math.abs(helix.pitch))<1e-9);
  const model=createProjectile({v0:20,angle:45,height:0,g:9.8});
  const world=t=>{const p=model.at(t);return {x:p.x,y:0,z:p.y,t:p.t};};
  assert.ok(Math.abs(markerSeparation(world(0),world(model.duration)).distance-model.range)<1e-9);
  assert.equal(markerSeparation(world(model.duration),world(0)).elapsed,model.duration);
  assert.throws(()=>markerSeparation(a,{...b,z:NaN}));
});

test('helix time and projectile t normalize to the same SI timeline during picking and marking', () => {
  const helix = createHelix(HELIX_DEFAULTS);
  const source = [helix.at(0), helix.at(2)];
  const project = () => ({x: 25, y: 25}); // overlapping points from different turns / camera angles
  const hit = pickTrajectorySample(source, project, {x: 25, y: 25}, 1.9);
  assert.equal(hit.t, 2);
  assert.equal(hit.time, 2);
  assert.equal(source[1].t, undefined); // source scientific model is unchanged
  assert.equal(markerSeparation(source[0], hit).elapsed, 2);
  const normalized = normalizeTrajectoryPoint(source[0]);
  assert.equal(normalized.t, 0);
  assert.equal(normalized.x, source[0].x);
  assert.equal(normalizeTrajectoryPoint({x: 1,y: 2,z: 3,t: 0}).t, 0);
});
test('trajectory measurement rejects missing, nonfinite times and coordinates', () => {
  assert.throws(() => normalizeTrajectoryPoint({x: 1,y: 2,z: 3}), TypeError);
  assert.throws(() => markerSeparation({x:0,y:0,z:0,time:0},{x:1,y:0,z:Infinity,t:1}), TypeError);
  assert.equal(pickTrajectorySample([{x: 0,y: 0,z: 0,t: NaN}], p => p, {x: 0,y: 0}), null);
});
