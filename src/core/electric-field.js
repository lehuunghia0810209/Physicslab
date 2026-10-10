// Coulomb point charges in 3D free space, sampled on a 2D cross-section.
// Charges are in nanocoulombs, positions in metres, E in N/C, potential in volts.
export const COULOMB_K = 8.9875517923e9;
export const ELECTRIC_FIELD_DEFAULTS = Object.freeze([
  Object.freeze({ x: -1.2, y: 0, charge: 2 }),
  Object.freeze({ x: 1.2, y: 0, charge: -2 })
]);
export const FIELD_MIN_DISTANCE = 0.08;

export function measureElectricField(charges, point) {
  if (!Array.isArray(charges) || !charges.length || charges.length > 8) throw new RangeError('Cần từ một đến tám điện tích điểm.');
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new TypeError('Vị trí đầu dò không hợp lệ.');
  let ex = 0, ey = 0, potential = 0;
  for (const source of charges) {
    if (![source?.x, source?.y, source?.charge].every(Number.isFinite) || Math.abs(source.charge) > 5) throw new RangeError('Điện tích điểm không hợp lệ.');
    const dx = point.x - source.x;
    const dy = point.y - source.y;
    const distanceSquared = dx * dx + dy * dy;
    if (source.charge === 0) continue;
    if (distanceSquared < FIELD_MIN_DISTANCE ** 2) throw new RangeError('Không thể đo tại vị trí điện tích điểm (mô hình có điểm kỳ dị).');
    const distance = Math.sqrt(distanceSquared);
    const kq = COULOMB_K * source.charge * 1e-9;
    ex += kq * dx / (distanceSquared * distance);
    ey += kq * dy / (distanceSquared * distance);
    potential += kq / distance;
  }
  return Object.freeze({ ex, ey, magnitude: Math.hypot(ex, ey), potential });
}
