import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleSeries, seriesBounds, nearestSeriesPoint } from '../src/engines/graph-series.js';
import { createProjectile, DEFAULTS } from '../src/core/projectile.js';

test('Đồ thị ném xiên lấy mẫu hữu hạn với đơn vị thời gian đồng nhất', () => {
  const model = createProjectile(DEFAULTS);
  const points = sampleSeries(model, 't', 'y', 120);
  assert.equal(points.length, 121);
  assert.equal(points[0].t, 0);
  assert.ok(Math.abs(points.at(-1).t - model.duration) < 1e-9);
  assert.ok(points.every(point => Number.isFinite(point.y) && point.y >= 0));
});

test('Hai lần chạy khác trọng trường đều nằm trong miền đồ thị so sánh', () => {
  const earth = createProjectile(DEFAULTS);
  const moon = createProjectile({ ...DEFAULTS, g: 1.62 });
  const series = [sampleSeries(earth, 't', 'y'), sampleSeries(moon, 't', 'y')];
  const bounds = seriesBounds(series, 't', 'y');
  assert.equal(bounds.xMin, 0);
  assert.ok(bounds.xMax >= moon.duration);
  assert.ok(bounds.high > moon.maxHeight);
  assert.ok(bounds.low < 0);
});

test('Đầu dò chọn điểm gần nhất, không tự bịa giá trị ngoài tập mẫu', () => {
  const series = [{ t: 0, x: 0 }, { t: 1, x: 2 }, { t: 2, x: 4 }];
  assert.strictEqual(nearestSeriesPoint(series, 't', 1.3), series[1]);
  assert.strictEqual(nearestSeriesPoint(series, 't', 1.7), series[2]);
  assert.equal(nearestSeriesPoint([], 't', 1), null);
  assert.equal(nearestSeriesPoint(series, 't', Infinity), null);
});

test('Lõi đồ thị từ chối NaN/Infinity thay vì vẽ kết quả sai', () => {
  assert.throws(() => sampleSeries({ sample: () => [{ t: 0, y: 1 }, { t: 1, y: Infinity }] }, 't', 'y'), /không hợp lệ/);
  assert.throws(() => seriesBounds([[{ t: NaN, y: 3 }]], 't', 'y'), /hữu hạn/);
  assert.throws(() => sampleSeries({ sample: () => [] }, 't', 'x'), /không hợp lệ/);
});
