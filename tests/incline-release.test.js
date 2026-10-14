import test from 'node:test';
import assert from 'node:assert/strict';
import { createInclinedPlane } from '../src/core/inclined.js';
import { createInclineRelease, TRACK_LENGTH } from '../src/core/incline-release.js';

test('Release cart from mid-track: position, velocity, and end stop derive from the SAME acceleration',()=>{
 const model=createInclinedPlane({angle:45,mass:4,gravity:9.81,mu:0});
 const run=createInclineRelease(model,4);
 const s=run.at(.5);
 assert.ok(Math.abs(s.distance-.5*model.acceleration*.25)<1e-9);
 assert.ok(Math.abs(s.position-(4+s.distance))<1e-9);
 assert.ok(Math.abs(s.velocity-model.acceleration*.5)<1e-9);
 const end=run.at(run.duration+99);
 assert.ok(end.atEnd);assert.equal(end.position,TRACK_LENGTH);assert.equal(end.velocity,0);
});
test('Static friction prevents the cart from moving after release',()=>{
 const model=createInclinedPlane({angle:10,mass:4,gravity:9.81,mu:.8});
 const run=createInclineRelease(model,3);
 assert.equal(run.at(4).position,3);assert.equal(run.at(4).distance,0);
});
test('Release cart never leaves the track and invalid inputs are rejected',()=>{
 const model=createInclinedPlane({angle:35,mass:4,gravity:9.81,mu:.1});
 for(const initial of [0,3,8,10]){
  const run=createInclineRelease(model,initial);
  for(const t of [0,.1,1,100]) { const state=run.at(t);assert.ok(state.position>=initial && state.position<=10);assert.ok(Number.isFinite(state.velocity)); }
 }
 assert.throws(()=>createInclineRelease(model,-.1),RangeError);
 assert.throws(()=>createInclineRelease(model,10.1),RangeError);
 assert.throws(()=>createInclineRelease(model,NaN),RangeError);
});
