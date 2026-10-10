// Uniform magnetic field along +z. Non-relativistic, no electric field or drag.
// Coordinates choose x(0) = r, y(0) = 0, v_perp(0) = -sgn(q) * v_perp.
export const HELIX_DEFAULTS = Object.freeze({ mass: 1, charge: 1, speed: 8, field: 0.5, angle: 35 });
export function createHelix(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Cần thông số quỹ đạo từ trường.');
  const p = Object.fromEntries(Object.keys(HELIX_DEFAULTS).map(key => [key, Number(input[key]) ]));
  if (![p.mass, p.charge, p.speed, p.field, p.angle].every(Number.isFinite)) throw new RangeError('Thông số quỹ đạo phải hữu hạn.');
  if (p.mass <= 0 || p.mass > 20 || Math.abs(p.charge) < 1e-6 || Math.abs(p.charge) > 10 || p.field <= 0 || p.field > 5 || p.speed < 0 || p.speed > 100 || p.angle < 0 || p.angle > 90)
    throw new RangeError('Thông số quỹ đạo nằm ngoài miền mô phỏng.');
  const radians = p.angle * Math.PI / 180;
  const parallel = p.speed * Math.cos(radians);
  const perpendicular = p.speed * Math.sin(radians);
  const omega = p.charge * p.field / p.mass;
  const absoluteOmega = Math.abs(omega);
  const radius = perpendicular / absoluteOmega;
  const period = 2 * Math.PI / absoluteOmega;
  const pitch = parallel * period;
  function at(t) {
    if (!Number.isFinite(t)) throw new RangeError('Thời gian phải hữu hạn.');
    const phase = absoluteOmega * t;
    const direction = Math.sign(p.charge);
    const x = radius * Math.cos(phase);
    const y = -direction * radius * Math.sin(phase);
    const z = parallel * t;
    const vx = -perpendicular * Math.sin(phase);
    const vy = -direction * perpendicular * Math.cos(phase);
    const vz = parallel;
    return Object.freeze({ time: t, x, y, z, vx, vy, vz,
      ax: omega * vy, ay: -omega * vx, az: 0 });
  }
  return Object.freeze({ parameters: Object.freeze(p), parallel, perpendicular,
    radius, period, pitch, omega, at });
}
