/** Pure graph utilities — do not alter simulated measurements. */
export function zoomBounds(min, max, factor = 1, center = (min + max) / 2) {
  if (![min, max, factor, center].every(Number.isFinite) || max <= min || factor < 1 || factor > 12)
    throw new RangeError('Miền và mức phóng đồ thị phải hợp lệ.');
  const span = (max - min) / factor;
  const pivot = Math.max(min + span / 2, Math.min(max - span / 2, center));
  return Object.freeze({ min: pivot - span / 2, max: pivot + span / 2 });
}
export function scientificCsv(points, xKey, yKey, xLabel, yLabel) {
  if (!Array.isArray(points) || !points.every(p => p && Number.isFinite(p[xKey]) && Number.isFinite(p[yKey])))
    throw new TypeError('Chỉ xuất số đo hữu hạn.');
  const safeCell = value => `"${String(value).replaceAll('"', '""')}"`;
  return '\uFEFF' + [[xLabel, yLabel], ...points.map(p => [p[xKey], p[yKey]])]
    .map(row => row.map(safeCell).join(',')).join('\r\n');
}
