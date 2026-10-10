/** Numerical helpers shared by scientific graphs. No browser dependencies. */
export function sampleSeries(model, xKey, yKey, count = 120) {
  if (!model || typeof model.sample !== 'function') throw new TypeError('Thiếu mô hình đồ thị.');
  if (!Number.isInteger(count) || count < 2 || count > 5000) throw new RangeError('Số mẫu đồ thị phải từ 2 đến 5000.');
  const points = model.sample(count);
  if (!Array.isArray(points) || points.length < 2 || points.some(point => !point || !Number.isFinite(point[xKey]) || !Number.isFinite(point[yKey]))) {
    throw new RangeError('Mô hình cung cấp dữ liệu đồ thị không hợp lệ.');
  }
  return points;
}

/** Plot limits include zero and both traces. Avoid Math.min(...largeArray). */
export function seriesBounds(series, xKey, yKey) {
  let xMin = Infinity, xMax = -Infinity, yMin = 0, yMax = 0, count = 0;
  for (const points of series) {
    for (const point of points) {
      const x = point[xKey], y = point[yKey];
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('Giá trị đồ thị phải hữu hạn.');
      xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); count++;
    }
  }
  if (!count) throw new RangeError('Đồ thị chưa có dữ liệu.');
  const span = yMax - yMin || Math.max(Math.abs(yMax), 1);
  return { xMin, xMax, low: yMin - span * 0.12, high: yMax + span * 0.12 };
}

/** Works with increasing or decreasing and even non-monotone x. */
export function nearestSeriesPoint(points, xKey, xValue) {
  if (!Array.isArray(points) || !points.length || !Number.isFinite(xValue)) return null;
  let nearest = null, best = Infinity;
  for (const point of points) {
    const distance = Math.abs(point[xKey] - xValue);
    if (Number.isFinite(distance) && distance < best) { best = distance; nearest = point; }
  }
  return nearest;
}
