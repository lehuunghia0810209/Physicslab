import { clamp } from './units.js';

export const NEWTON_DEFAULTS = Object.freeze({
  mass: 5,
  force: 22,
  friction: 0.15,
  gravity: 9.81
});

export function validateNewtonInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu lực và khối lượng.');
  const mass = Number(input.mass);
  const force = Number(input.force);
  const friction = Number(input.friction);
  const gravity = Number(input.gravity);

  if (!Number.isFinite(mass) || mass <= 0 || mass > 30) throw new RangeError('Khối lượng phải là số dương và không quá 30 kg.');
  if (!Number.isFinite(force) || force < -80 || force > 80) throw new RangeError('Lực tác dụng phải nằm trong khoảng -80 đến 80 N.');
  if (!Number.isFinite(friction) || friction < 0 || friction > 1) throw new RangeError('Hệ số ma sát phải nằm trong khoảng 0 đến 1.');
  if (!Number.isFinite(gravity) || gravity <= 0 || gravity > 25) throw new RangeError('Gia tốc trọng trường phải nằm giữa 0.1 và 25 m/s².');

  return { mass, force, friction, gravity };
}

export function createNewtonMotion(input) {
  const p = validateNewtonInput(input);
  const frictionLimit = p.friction * p.mass * p.gravity;
  const staticHolding = Math.abs(p.force) <= frictionLimit + 1e-9;
  const movingDirection = staticHolding ? 0 : (p.force >= 0 ? 1 : -1);
  const frictionForce = staticHolding ? Math.abs(p.force) : frictionLimit;
  const netForce = staticHolding ? 0 : p.force - movingDirection * frictionLimit;
  const acceleration = staticHolding ? 0 : netForce / p.mass;
  const direction = staticHolding ? 'tĩnh' : (p.force >= 0 ? 'đồng hướng' : 'ngược hướng');
  const maxDistance = 5 + Math.min(18, Math.abs(p.force) * 0.26 + p.mass * 0.8);
  const duration = staticHolding ? 2.5 : clamp(Math.sqrt((2 * maxDistance) / Math.max(0.05, Math.abs(acceleration))), 1.8, 10);

  function at(time) {
    const t = clamp(Number(time), 0, duration);
    const moving = !staticHolding;
    const position = moving ? 0.5 * acceleration * t * t : 0;
    const velocity = moving ? acceleration * t : 0;
    return Object.freeze({
      t,
      time: t,
      position,
      velocity,
      acceleration,
      netForce,
      frictionForce,
      force: p.force,
      mass: p.mass,
      threshold: staticHolding,
      moving
    });
  }

  return Object.freeze({
    parameters: Object.freeze({ ...p }),
    frictionForce,
    netForce,
    acceleration,
    duration,
    direction,
    threshold: staticHolding,
    moving: !staticHolding,
    maxDistance,
    at,
    sample(count = 120) {
      return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count));
    }
  });
}
