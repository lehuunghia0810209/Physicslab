import test from 'node:test';
import assert from 'node:assert/strict';
import { magneticKnobValue } from '../src/core/magnetism-gestures.js';
test('Lorentz stage control maps knob location to angle 0–90',()=>{
 assert.equal(magneticKnobValue(406/620,'pitchAngle'),0);
 assert.equal(magneticKnobValue((406+82)/620,'pitchAngle'),45);
 assert.equal(magneticKnobValue(570/620,'pitchAngle'),90);
 assert.equal(magneticKnobValue(0,'pitchAngle'),0);
 assert.equal(magneticKnobValue(1,'pitchAngle'),90);
});
test('induction stage control maps turns 1–1000',()=>{
 assert.equal(magneticKnobValue(400/620,'turns'),1);
 assert.equal(magneticKnobValue(576/620,'turns'),1000);
 assert.equal(magneticKnobValue(1,'turns'),1000);
 assert.throws(()=>magneticKnobValue(NaN,'turns'),/hợp lệ/);
});
