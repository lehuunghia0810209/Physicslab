import { clamp, radians } from './units.js';

export const PARAMS = Object.freeze([
  { key: 'v0', label: 'Vận tốc ban đầu', symbol: 'v₀', unit: 'm/s', min: 0, max: 60, step: 0.5 },
  { key: 'angle', label: 'Góc phóng', symbol: 'θ', unit: '°', min: 0, max: 90, step: 1 },
  { key: 'height', label: 'Độ cao ban đầu', symbol: 'h₀', unit: 'm', min: 0, max: 30, step: 0.5 },
  { key: 'g', label: 'Gia tốc trọng trường', symbol: 'g', unit: 'm/s²', min: 0.1, max: 25, step: 0.01 }
]);
export const DEFAULTS = Object.freeze({ v0: 20, angle: 45, height: 0, g: 9.81 });
export const PRESETS = Object.freeze({ earth: { label: 'Trái Đất', g: 9.81 }, moon: { label: 'Mặt Trăng', g: 1.62 } });

export function validateParameters(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu tham số.');
  const result = {};
  for (const p of PARAMS) {
    const value = input[p.key];
    if (!Number.isFinite(value) || value < p.min || value > p.max) throw new RangeError(`${p.label}: cần giá trị từ ${p.min} đến ${p.max}.`);
    result[p.key] = value;
  }
  return result;
}

// Analytic model in SI. +x right, +y up; origin on the ground below launch.
export function createProjectile(input) {
  const p = validateParameters(input);
  const vx0 = p.v0 * Math.cos(radians(p.angle));
  const vy0 = p.v0 * Math.sin(radians(p.angle));
  const duration = (vy0 + Math.sqrt(vy0 * vy0 + 2 * p.g * p.height)) / p.g;
  const apexTime = clamp(vy0 / p.g, 0, duration);
  const maxHeight = p.height + vy0 * apexTime - 0.5 * p.g * apexTime ** 2;
  function at(time) {
    if (!Number.isFinite(time)) throw new RangeError('Thời gian phải hữu hạn.');
    const t = clamp(time, 0, duration);
    const vx = vx0;
    const vy = vy0 - p.g * t;
    return Object.freeze({ t, x: vx * t, y: Math.max(0, p.height + vy0 * t - 0.5 * p.g * t * t), vx, vy, ax: 0, ay: -p.g, speed: Math.hypot(vx, vy) });
  }
  return Object.freeze({ parameters: Object.freeze(p), vx0, vy0, duration, apexTime, maxHeight, range: vx0 * duration, at,
    sample(count = 180) { return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count)); } });
}
