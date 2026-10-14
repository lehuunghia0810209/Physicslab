import test from 'node:test';import assert from 'node:assert/strict';
import {orbitForceDirection} from '../src/core/lorentz-vectors.js';
import {createElectromagneticModel} from '../src/core/electromagnetism.js';
function sim(q){return createElectromagneticModel({mode:'lorentz',charge:q,mass:1,speed:8,magneticField:.5,pitchAngle:90});}
test('Lorentz force points towards actual orbit center for both polarities',()=>{
 for(const q of [-1,1]){
  const model=sim(q);
  const atZero=orbitForceDirection(model.at(0),q); assert.ok(Math.abs(atZero.x)<1e-9);assert.equal(atZero.y,q);
  const quarter=orbitForceDirection(model.at(model.period/4),q);
  assert.ok(quarter.x<-.999999);assert.ok(Math.abs(quarter.y)<1e-9);
 }
});
test('when motion parallel to B there is no misleading force arrow',()=>{
 const model=createElectromagneticModel({mode:'lorentz',charge:1,mass:1,speed:8,magneticField:.5,pitchAngle:0});
 assert.equal(orbitForceDirection(model.at(0),1),null);
});
