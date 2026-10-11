import test from 'node:test';
import assert from 'node:assert/strict';
import { particlePositions } from '../src/core/gas-particles.js';
test('Hạt khí minh họa chuyển động có thể tái hiện, nằm trong bình', () => {
  const one = particlePositions({ time: 2.5, temperature: 300 });
  assert.deepEqual(one, particlePositions({ time: 2.5, temperature: 300 }));
  assert.notDeepEqual(one, particlePositions({ time: 2.8, temperature: 300 }));
  assert.equal(one.length, 28);
  assert.ok(one.every(p => p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1));
});
test('Hạt minh họa từ chối điều kiện phi vật lý', () => {
  assert.throws(() => particlePositions({ temperature: -100 }), RangeError);
  assert.throws(() => particlePositions({ time: NaN }), RangeError);
});
