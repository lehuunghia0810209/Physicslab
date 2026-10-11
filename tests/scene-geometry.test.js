import test from 'node:test';
import assert from 'node:assert/strict';
import {volumeToPistonX, pistonXToVolume} from '../src/core/scene-geometry.js';
test('Piston có ánh xạ thuận-nghịch đúng trên miền hợp lệ',()=>{
 for(const v of [.001,.004,.02,.04,.13,.4]) assert.ok(Math.abs(pistonXToVolume(volumeToPistonX(v))-v)<1e-12);
 assert.ok(volumeToPistonX(.02)<volumeToPistonX(.04));
});
test('Piston từ chối NaN và ngoài miền',()=>{
 assert.throws(()=>volumeToPistonX(-1)); assert.throws(()=>pistonXToVolume(NaN));
});
