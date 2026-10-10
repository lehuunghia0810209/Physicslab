export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const radians = degrees => degrees * Math.PI / 180;
export function format(value, digits = 2) {
  return Number.isFinite(value) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value) : '—';
}
export const UNITS = Object.freeze({ length: { m: 1, cm: 0.01, km: 1000 }, time: { s: 1, min: 60, h: 3600 }, speed: { 'm/s': 1, 'km/h': 1 / 3.6 } });
export function convert(value, family, from, to) {
  if (!Number.isFinite(value) || !UNITS[family]?.[from] || !UNITS[family]?.[to]) throw new RangeError('Đơn vị hoặc giá trị không hợp lệ.');
  return value * UNITS[family][from] / UNITS[family][to];
}
