import { clamp } from './units.js';

export const OSCILLATION_DEFAULTS = Object.freeze({
  mass: 1,
  stiffness: 16,
  amplitude: 0.5,
  phase: 0
});

export function createOscillation(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu dao động.');
  const p = Object.fromEntries(Object.keys(OSCILLATION_DEFAULTS).map(key => [key, Number(input[key])]));
  if (!Number.isFinite(p.mass) || p.mass <= 0 || p.mass > 20) throw new RangeError('Khối lượng phải lớn hơn 0 và không quá 20 kg.');
  if (!Number.isFinite(p.stiffness) || p.stiffness <= 0 || p.stiffness > 200) throw new RangeError('Độ cứng lò xo phải nằm trong khoảng 0–200 N/m và lớn hơn 0.');
  if (!Number.isFinite(p.amplitude) || p.amplitude <= 0 || p.amplitude > 2) throw new RangeError('Biên độ phải lớn hơn 0 và không quá 2 m.');
  if (!Number.isFinite(p.phase) || p.phase < -180 || p.phase > 180) throw new RangeError('Pha ban đầu phải nằm trong khoảng −180° đến 180°.');

  const angularFrequency = Math.sqrt(p.stiffness / p.mass);
  const period = 2 * Math.PI / angularFrequency;
  const phaseRadians = p.phase * Math.PI / 180;
  const duration = 3 * period;

  function at(time) {
    const t = clamp(Number(time), 0, duration);
    const position = p.amplitude * Math.cos(angularFrequency * t + phaseRadians);
    const velocity = -p.amplitude * angularFrequency * Math.sin(angularFrequency * t + phaseRadians);
    const acceleration = -(angularFrequency ** 2) * position;
    const kineticEnergy = 0.5 * p.mass * velocity ** 2;
    const potentialEnergy = 0.5 * p.stiffness * position ** 2;
    return Object.freeze({
      t, time: t, position, velocity, acceleration, angularFrequency, period,
      kineticEnergy, potentialEnergy, totalEnergy: kineticEnergy + potentialEnergy
    });
  }

  return Object.freeze({
    parameters: Object.freeze(p), angularFrequency, period, duration,
    totalEnergy: 0.5 * p.stiffness * p.amplitude ** 2, at,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, i) => at(duration * i / count)); }
  });
}
