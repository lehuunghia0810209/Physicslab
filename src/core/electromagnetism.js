import { clamp } from './units.js';

export const ELECTROMAGNETISM_DEFAULTS = Object.freeze({
  mode: 'lorentz',
  charge: 1,
  mass: 1,
  speed: 8,
  magneticField: 0.5,
  pitchAngle: 90,
  turns: 100,
  area: 0.01,
  frequency: 1,
  resistance: 10
});

export function createElectromagneticModel(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu tham số điện từ.');
  const mode = input.mode ?? ELECTROMAGNETISM_DEFAULTS.mode;
  if (mode !== 'lorentz' && mode !== 'induction') throw new RangeError('Chọn lực Lorentz hoặc cảm ứng điện từ.');
  const keys = mode === 'lorentz'
    ? ['charge', 'mass', 'speed', 'magneticField', 'pitchAngle']
    : ['turns', 'area', 'frequency', 'resistance', 'magneticField'];
  const parameters = { mode };
  for (const key of keys) parameters[key] = Number(input[key]);
  if (!Number.isFinite(parameters.magneticField) || parameters.magneticField <= 0 || parameters.magneticField > 2) throw new RangeError('Cảm ứng từ phải lớn hơn 0 và không quá 2 T.');

  if (mode === 'lorentz') {
    const { charge, mass, speed, magneticField, pitchAngle } = parameters;
    if (!Number.isFinite(charge) || charge === 0 || Math.abs(charge) > 10) throw new RangeError('Điện tích khác 0 và có độ lớn không quá 10 C.');
    if (!Number.isFinite(mass) || mass <= 0 || mass > 20) throw new RangeError('Khối lượng phải lớn hơn 0 và không quá 20 kg.');
    if (!Number.isFinite(speed) || speed < 0 || speed > 50) throw new RangeError('Tốc độ nằm trong khoảng 0 đến 50 m/s.');
    if (!Number.isFinite(pitchAngle) || pitchAngle < 0 || pitchAngle > 90) throw new RangeError('Góc giữa vận tốc và từ trường nằm trong khoảng 0° đến 90°.');
  } else {
    const { turns, area, frequency, resistance } = parameters;
    if (!Number.isInteger(turns) || turns < 1 || turns > 1000) throw new RangeError('Số vòng dây nằm trong khoảng 1 đến 1000.');
    if (!Number.isFinite(area) || area <= 0 || area > 2) throw new RangeError('Diện tích cuộn dây phải lớn hơn 0 và không quá 2 m².');
    if (!Number.isFinite(frequency) || frequency <= 0 || frequency > 20) throw new RangeError('Tần số biến thiên nằm trong khoảng lớn hơn 0 đến 20 Hz.');
    if (!Number.isFinite(resistance) || resistance <= 0 || resistance > 1000) throw new RangeError('Điện trở mạch nằm trong khoảng lớn hơn 0 đến 1000 Ω.');
  }

  const { magneticField } = parameters;
  const duration = mode === 'lorentz'
    ? 2 * Math.PI * parameters.mass / (Math.abs(parameters.charge) * magneticField) * 2
    : 3 / parameters.frequency;
  const period = mode === 'lorentz' ? duration / 2 : 1 / parameters.frequency;

  function at(time) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    const t = clamp(value, 0, duration);
    if (mode === 'lorentz') {
      const { charge, mass, speed, pitchAngle } = parameters;
      const angle = pitchAngle * Math.PI / 180;
      const perpendicularSpeed = speed * Math.sin(angle);
      const parallelSpeed = speed * Math.cos(angle);
      const angularFrequency = Math.abs(charge) * magneticField / mass;
      const radius = perpendicularSpeed / angularFrequency;
      const phase = angularFrequency * t;
      const force = charge * perpendicularSpeed * magneticField;
      return Object.freeze({
        t, time: t, x: radius * Math.sin(phase),
        y: Math.sign(charge) * radius * (1 - Math.cos(phase)),
        force, acceleration: force / mass, speed,
        parallelSpeed, perpendicularSpeed, radius, angularFrequency,
        period: 2 * Math.PI / angularFrequency, magneticField, mode
      });
    }
    const angularFrequency = 2 * Math.PI * parameters.frequency;
    const flux = magneticField * parameters.area * Math.cos(angularFrequency * t);
    const emf = parameters.turns * magneticField * parameters.area * angularFrequency * Math.sin(angularFrequency * t);
    const current = emf / parameters.resistance;
    return Object.freeze({
      t, time: t, flux, emf, current,
      magneticField, angularFrequency, period: 1 / parameters.frequency, mode
    });
  }

  return Object.freeze({
    parameters: Object.freeze(parameters), duration, period, mode, at,
    sample(count = 120) {
      if (!Number.isInteger(count) || count < 1 || count > 2000) throw new RangeError('Số điểm đồ thị phải là số nguyên từ 1 đến 2000.');
      return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count));
    }
  });
}
