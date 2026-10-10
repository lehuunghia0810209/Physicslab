import { clamp } from './units.js';

export const FRICTION_DEFAULTS = Object.freeze({
  mass: 5,
  force: 22,
  staticCoefficient: 0.4,
  kineticCoefficient: 0.25,
  gravity: 9.81
});

export function createFrictionMotion(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu mô phỏng ma sát.');
  const p = Object.fromEntries(Object.keys(FRICTION_DEFAULTS).map(key => [key, Number(input[key])]));
  if (!Number.isFinite(p.mass) || p.mass <= 0 || p.mass > 30) throw new RangeError('Khối lượng phải lớn hơn 0 và không quá 30 kg.');
  if (!Number.isFinite(p.force) || Math.abs(p.force) > 80) throw new RangeError('Lực tác dụng phải nằm trong khoảng −80 đến 80 N.');
  if (![p.staticCoefficient, p.kineticCoefficient].every(value => Number.isFinite(value) && value >= 0 && value <= 1.2)) throw new RangeError('Hệ số ma sát phải nằm trong khoảng 0 đến 1,2.');
  if (p.kineticCoefficient > p.staticCoefficient) throw new RangeError('Hệ số ma sát trượt không thể lớn hơn ma sát nghỉ.');
  if (!Number.isFinite(p.gravity) || p.gravity <= 0 || p.gravity > 25) throw new RangeError('Gia tốc trọng trường không hợp lệ.');

  const normalForce = p.mass * p.gravity;
  const maxStaticFriction = p.staticCoefficient * normalForce;
  const atRest = Math.abs(p.force) <= maxStaticFriction + 1e-9;
  const direction = Math.sign(p.force);
  const frictionForce = atRest ? -p.force : -direction * p.kineticCoefficient * normalForce;
  const netForce = p.force + frictionForce;
  const acceleration = atRest ? 0 : netForce / p.mass;
  const maxDistance = 12;
  const duration = atRest ? 6 : clamp(Math.sqrt(2 * maxDistance / Math.abs(acceleration)), 2, 10);

  function at(time) {
    const t = clamp(Number(time), 0, duration);
    return Object.freeze({
      t, time: t,
      position: 0.5 * acceleration * t * t,
      velocity: acceleration * t,
      acceleration, force: p.force, normalForce,
      staticFrictionLimit: maxStaticFriction,
      frictionForce, netForce, moving: !atRest, threshold: atRest,
      frictionWork: frictionForce * (0.5 * acceleration * t * t)
    });
  }

  return Object.freeze({
    parameters: Object.freeze(p), normalForce, staticFrictionLimit: maxStaticFriction,
    frictionForce, netForce, acceleration, duration, maxDistance, moving: !atRest,
    threshold: atRest, at,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count)); }
  });
}
