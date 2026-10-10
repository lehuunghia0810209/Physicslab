import { clamp } from './units.js';

export const COLLISION_DEFAULTS = Object.freeze({
  mass1: 2,
  mass2: 3,
  velocity1: 4,
  velocity2: 0,
  restitution: 0.8,
  separation: 6
});

export function createCollision(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu va chạm.');
  const p = Object.fromEntries(Object.keys(COLLISION_DEFAULTS).map(key => [key, Number(input[key])]));
  for (const key of ['mass1', 'mass2']) if (!Number.isFinite(p[key]) || p[key] <= 0 || p[key] > 30) throw new RangeError('Khối lượng mỗi vật phải lớn hơn 0 và không quá 30 kg.');
  for (const key of ['velocity1', 'velocity2']) if (!Number.isFinite(p[key]) || Math.abs(p[key]) > 20) throw new RangeError('Vận tốc phải nằm trong khoảng −20 đến 20 m/s.');
  if (!Number.isFinite(p.restitution) || p.restitution < 0 || p.restitution > 1) throw new RangeError('Hệ số đàn hồi nằm trong khoảng 0 đến 1.');
  if (!Number.isFinite(p.separation) || p.separation < 2 || p.separation > 12) throw new RangeError('Khoảng cách ban đầu nằm trong khoảng 2 đến 12 m.');

  const approaching = p.velocity1 > p.velocity2;
  const collisionTime = approaching ? p.separation / (p.velocity1 - p.velocity2) : null;
  const momentumBefore = p.mass1 * p.velocity1 + p.mass2 * p.velocity2;
  const kineticBefore = 0.5 * p.mass1 * p.velocity1 ** 2 + 0.5 * p.mass2 * p.velocity2 ** 2;
  const collisionPosition = approaching ? p.velocity1 * collisionTime : null;
  const velocity1After = approaching
    ? ((p.mass1 - p.restitution * p.mass2) * p.velocity1 + (1 + p.restitution) * p.mass2 * p.velocity2) / (p.mass1 + p.mass2)
    : p.velocity1;
  const velocity2After = approaching
    ? ((p.mass2 - p.restitution * p.mass1) * p.velocity2 + (1 + p.restitution) * p.mass1 * p.velocity1) / (p.mass1 + p.mass2)
    : p.velocity2;
  const duration = approaching ? collisionTime + 3 : 6;

  function at(time) {
    const t = clamp(Number(time), 0, duration);
    const collided = approaching && t >= collisionTime;
    const x1 = collided
      ? collisionPosition + velocity1After * (t - collisionTime)
      : p.velocity1 * t;
    const x2 = collided
      ? collisionPosition + velocity2After * (t - collisionTime)
      : p.separation + p.velocity2 * t;
    const v1 = collided ? velocity1After : p.velocity1;
    const v2 = collided ? velocity2After : p.velocity2;
    const momentum = p.mass1 * v1 + p.mass2 * v2;
    const kineticEnergy = 0.5 * p.mass1 * v1 ** 2 + 0.5 * p.mass2 * v2 ** 2;
    return Object.freeze({
      t, time: t, x1, x2, v1, v2, momentum, kineticEnergy,
      momentumBefore, kineticBefore, collisionTime, collided,
      velocity1After, velocity2After
    });
  }

  return Object.freeze({
    parameters: Object.freeze(p), approaching, collisionTime, duration,
    momentumBefore, kineticBefore, velocity1After, velocity2After, at,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count)); }
  });
}
