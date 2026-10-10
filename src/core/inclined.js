import { clamp, radians } from './units.js';

export const DEFAULT_INCLINED = Object.freeze({ angle: 30, mass: 4, gravity: 9.81, mu: 0.25 });

export function validateInclined(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu mặt phẳng nghiêng.');
  const angle = Number(input.angle);
  const mass = Number(input.mass);
  const gravity = Number(input.gravity);
  const mu = Number(input.mu);
  if (!Number.isFinite(angle) || angle < 5 || angle > 80) throw new RangeError('Góc nghiêng phải nằm trong khoảng 5° đến 80°.');
  if (!Number.isFinite(mass) || mass <= 0 || mass > 30) throw new RangeError('Khối lượng phải là số dương và nhỏ hơn 30 kg.');
  if (!Number.isFinite(gravity) || gravity <= 0 || gravity > 25) throw new RangeError('Gia tốc trọng trường phải nằm trong khoảng 0.1 đến 25 m/s².');
  if (!Number.isFinite(mu) || mu < 0 || mu > 1.2) throw new RangeError('Hệ số ma sát phải nằm trong khoảng 0 đến 1.2.');
  return { angle, mass, gravity, mu };
}

export function createInclinedPlane(input) {
  const p = validateInclined(input);
  const a = radians(p.angle);
  const weight = p.mass * p.gravity;
  const componentDown = weight * Math.sin(a);
  const normal = weight * Math.cos(a);
  const staticLimit = p.mu * normal;
  const moving = componentDown > staticLimit + 1e-9;
  const friction = moving ? staticLimit : componentDown;
  const net = moving ? componentDown - friction : 0;
  const acceleration = moving ? net / p.mass : 0;

  return Object.freeze({
    parameters: Object.freeze({ ...p }),
    angleRad: a,
    gravityComponent: componentDown,
    normal,
    staticLimit,
    friction,
    netForce: net,
    acceleration,
    moving,
    threshold: componentDown <= staticLimit,
    sample(count = 12) {
      return Array.from({ length: count }, (_, i) => {
        const t = i * 0.25;
        const velocity = moving ? acceleration * t : 0;
        const distance = moving ? 0.5 * acceleration * t * t : 0;
        return { t, velocity, distance, force: componentDown - friction };
      });
    }
  });
}
