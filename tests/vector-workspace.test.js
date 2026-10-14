import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveForceVectors,forceFromPointer} from '../src/core/vector-workspace.js';
test('Hai lực vuông góc tạo tam giác 3-4-5 N',()=>{
 const v=resolveForceVectors({f1:3,a1:0,f2:4,a2:90});
 assert.ok(Math.abs(v.resultant.magnitude-5)<1e-10);
 assert.ok(Math.abs(v.resultant.x-3)<1e-10);
 assert.ok(Math.abs(v.resultant.y-4)<1e-10);
});
test('Hai lực cùng giá ngược chiều triệt tiêu đúng',()=>{
 const v=resolveForceVectors({f1:10,a1:0,f2:10,a2:180});
 assert.ok(v.resultant.magnitude<1e-10);assert.equal(v.resultant.angle,null);
});
test('Tọa độ kéo thành độ lớn lực và góc',()=>{
 assert.deepEqual(forceFromPointer(380,184),{magnitude:10,angle:0});
 assert.deepEqual(forceFromPointer(280,84),{magnitude:10,angle:90});
});
test('Dữ liệu lực không hợp lệ bị từ chối',()=>{
 assert.throws(()=>resolveForceVectors({f1:NaN,a1:0,f2:1,a2:0}));
 assert.throws(()=>resolveForceVectors({f1:-1,a1:0,f2:1,a2:0}));
});
