/** Map a physical on-stage gesture into the same discretized controls as sliders.
 * The model remains the only source of simulated measurements and motion.
 */
export function quantizeParameter(fraction, { min, max, step }) {
  if (![fraction, min, max, step].every(Number.isFinite) || step <= 0 || max <= min) {
    throw new RangeError('Tham số điều khiển không hợp lệ.');
  }
  const bounded = Math.max(0, Math.min(1, fraction));
  const steps = Math.round((min + bounded * (max - min) - min) / step);
  const decimals = Math.min(10, Math.max(0, (String(step).split('.')[1] || '').length));
  return Math.max(min, Math.min(max, Number((min + steps * step).toFixed(decimals))));
}
export function normalizePointerX(clientX, bounds) {
  if (!Number.isFinite(clientX) || !bounds || !Number.isFinite(bounds.left) || !Number.isFinite(bounds.width) || bounds.width <= 0) {
    throw new RangeError('Không xác định được vùng tương tác.');
  }
  return Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
}
export function clampSceneValue(value, min, max) {
  if (![value, min, max].every(Number.isFinite) || min > max) throw new RangeError('Giới hạn cảnh không hợp lệ.');
  return Math.max(min, Math.min(max, value));
}
