import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectile, DEFAULTS } from '../src/core/projectile.js';
import { compareProjectiles } from '../src/core/projectile-comparison.js';

test('Thay góc ném vẫn giữ được mô hình so sánh ban đầu', () => {
  const baseline = createProjectile(DEFAULTS);
  const current = createProjectile({ ...DEFAULTS, angle: 30 });
  const delta = compareProjectiles(current, baseline);
  assert.ok(delta.range < 0);
  assert.ok(delta.maxHeight < 0);
  assert.deepEqual(baseline.parameters, DEFAULTS);
});

test('Mô hình đồng nhất có độ chênh đúng bằng 0', () => {
  const model = createProjectile(DEFAULTS);
  assert.deepEqual(compareProjectiles(model, model), { range: 0, maxHeight: 0, duration: 0 });
});

test('Mô hình thiếu số đo không được dùng để so sánh', () => {
  assert.throws(() => compareProjectiles({ range: Infinity, duration: 1, maxHeight: 2 }, createProjectile(DEFAULTS)), /hợp lệ/);
});
