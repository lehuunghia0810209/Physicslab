import { clamp } from './units.js';

export const WORK_ENERGY_DEFAULTS = Object.freeze({
  mass: 4,
  force: 24,
  distance: 12,
  angle: 0,
  friction: 0.15,
  initialSpeed: 2,
  gravity: 9.81
});

export function createWorkEnergyMotion(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu công và năng lượng.');
  const p = Object.fromEntries(Object.keys(WORK_ENERGY_DEFAULTS).map(key => [key, Number(input[key])]));
  if (!Number.isFinite(p.mass) || p.mass <= 0 || p.mass > 30) throw new RangeError('Khối lượng phải lớn hơn 0 và không quá 30 kg.');
  if (!Number.isFinite(p.force) || p.force < 0 || p.force > 100) throw new RangeError('Lực kéo phải nằm trong khoảng 0 đến 100 N.');
  if (!Number.isFinite(p.distance) || p.distance <= 0 || p.distance > 30) throw new RangeError('Quãng đường phải lớn hơn 0 và không quá 30 m.');
  if (!Number.isFinite(p.angle) || p.angle < 0 || p.angle > 90) throw new RangeError('Góc giữa lực và chuyển dời nằm trong khoảng 0° đến 90°.');
  if (!Number.isFinite(p.friction) || p.friction < 0 || p.friction > 1) throw new RangeError('Hệ số ma sát phải nằm trong khoảng 0 đến 1.');
  if (!Number.isFinite(p.initialSpeed) || p.initialSpeed < 0 || p.initialSpeed > 20) throw new RangeError('Tốc độ đầu phải nằm trong khoảng 0 đến 20 m/s.');
  if (!Number.isFinite(p.gravity) || p.gravity <= 0 || p.gravity > 25) throw new RangeError('Gia tốc trọng trường không hợp lệ.');

  const forceAlong = p.force * Math.cos(p.angle * Math.PI / 180);
  // The pulling force points above the horizontal surface; its vertical component
  // reduces the contact normal and hence the kinetic friction magnitude.
  const normalForce = p.mass * p.gravity - p.force * Math.sin(p.angle * Math.PI / 180);
  if (normalForce < -1e-9) throw new RangeError('Lực kéo làm vật rời mặt phẳng; mô hình tiếp xúc ngang không còn phù hợp.');
  const kineticFriction = p.friction * Math.max(0, normalForce);
  const atRest = p.initialSpeed === 0 && forceAlong <= kineticFriction + 1e-9;
  // At rest, static friction balances the pull up to the assumed friction limit.
  // In this simplified model the same coefficient is used for the limiting static force.
  const frictionForce = atRest ? forceAlong : kineticFriction;
  const netForce = atRest ? 0 : forceAlong - frictionForce;
  const acceleration = netForce / p.mass;
  const stopTime = acceleration < 0 && p.initialSpeed > 0 ? -p.initialSpeed / acceleration : Infinity;
  const discriminant = p.initialSpeed ** 2 + 2 * acceleration * p.distance;
  const requestedTime = acceleration === 0
    ? (p.initialSpeed > 0 ? p.distance / p.initialSpeed : 4)
    : discriminant < 0 ? stopTime : (-p.initialSpeed + Math.sqrt(discriminant)) / acceleration;
  const duration = clamp(Math.min(requestedTime, stopTime), 0, 12);
  const reachedDistance = Math.min(p.distance, Math.max(0, p.initialSpeed * duration + 0.5 * acceleration * duration ** 2));

  function at(time) {
    const t = clamp(Number(time), 0, duration);
    const rawVelocity = p.initialSpeed + acceleration * t;
    const velocity = Math.max(0, rawVelocity);
    const position = clamp(p.initialSpeed * t + 0.5 * acceleration * t * t, 0, reachedDistance);
    const appliedWork = forceAlong * position;
    const frictionWork = -frictionForce * position;
    const kineticEnergy = 0.5 * p.mass * velocity ** 2;
    return Object.freeze({
      t, time: t, position, velocity, acceleration,
      forceAlong, normalForce: Math.max(0, normalForce), frictionForce, netForce,
      appliedWork, frictionWork, netWork: appliedWork + frictionWork,
      kineticEnergy, energyChange: kineticEnergy - 0.5 * p.mass * p.initialSpeed ** 2,
      moving: velocity > 0
    });
  }

  return Object.freeze({
    parameters: Object.freeze(p), forceAlong, normalForce: Math.max(0, normalForce), frictionForce, netForce, acceleration, atRest,
    duration, distance: reachedDistance, at,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count)); }
  });
}
