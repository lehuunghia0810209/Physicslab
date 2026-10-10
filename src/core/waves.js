import { clamp } from './units.js';

export const WAVE_DEFAULTS = Object.freeze({
  amplitude: 0.5,
  frequency: 1.5,
  wavelength: 4,
  phase: 0,
  phaseDifference: 0,
  mode: 'traveling'
});

export function createTravelingWave(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu tham số sóng.');
  const parameters = {
    amplitude: Number(input.amplitude),
    frequency: Number(input.frequency),
    wavelength: Number(input.wavelength),
    phase: Number(input.phase),
    phaseDifference: Number(input.phaseDifference ?? WAVE_DEFAULTS.phaseDifference),
    mode: input.mode ?? WAVE_DEFAULTS.mode
  };
  if (!Number.isFinite(parameters.amplitude) || parameters.amplitude <= 0 || parameters.amplitude > 2) throw new RangeError('Biên độ phải lớn hơn 0 và không quá 2 m.');
  if (!Number.isFinite(parameters.frequency) || parameters.frequency <= 0 || parameters.frequency > 10) throw new RangeError('Tần số phải lớn hơn 0 và không quá 10 Hz.');
  if (!Number.isFinite(parameters.wavelength) || parameters.wavelength <= 0 || parameters.wavelength > 20) throw new RangeError('Bước sóng phải lớn hơn 0 và không quá 20 m.');
  if (!Number.isFinite(parameters.phase) || parameters.phase < -180 || parameters.phase > 180) throw new RangeError('Pha ban đầu nằm trong khoảng −180° đến 180°.');
  if (!Number.isFinite(parameters.phaseDifference) || parameters.phaseDifference < -180 || parameters.phaseDifference > 180) throw new RangeError('Độ lệch pha nằm trong khoảng −180° đến 180°.');
  if (!['traveling', 'standing', 'interference'].includes(parameters.mode)) throw new RangeError('Chọn sóng truyền, sóng dừng hoặc giao thoa.');

  const angularFrequency = 2 * Math.PI * parameters.frequency;
  const waveNumber = 2 * Math.PI / parameters.wavelength;
  const speed = parameters.frequency * parameters.wavelength;
  const phase = parameters.phase * Math.PI / 180;
  const phaseDifference = parameters.phaseDifference * Math.PI / 180;
  const duration = 3 / parameters.frequency;
  const probePosition = parameters.wavelength / 4;

  function displacementAt(position, time) {
    const angle = waveNumber * position - angularFrequency * time + phase;
    if (parameters.mode === 'standing') return 2 * parameters.amplitude * Math.sin(waveNumber * position) * Math.cos(angularFrequency * time + phase);
    if (parameters.mode === 'interference') return parameters.amplitude * (Math.sin(angle) + Math.sin(angle + phaseDifference));
    return parameters.amplitude * Math.sin(angle);
  }

  function velocityAt(position, time) {
    const angle = waveNumber * position - angularFrequency * time + phase;
    if (parameters.mode === 'standing') return -2 * parameters.amplitude * angularFrequency * Math.sin(waveNumber * position) * Math.sin(angularFrequency * time + phase);
    if (parameters.mode === 'interference') return -parameters.amplitude * angularFrequency * (Math.cos(angle) + Math.cos(angle + phaseDifference));
    return -parameters.amplitude * angularFrequency * Math.cos(angle);
  }

  function at(time) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    const t = clamp(value, 0, duration);
    return Object.freeze({
      t, time: t,
      displacement: displacementAt(probePosition, t),
      particleVelocity: velocityAt(probePosition, t),
      probePosition, amplitude: parameters.amplitude,
      frequency: parameters.frequency, wavelength: parameters.wavelength,
      angularFrequency, waveNumber, speed, mode: parameters.mode
    });
  }

  function profile(time, count = 160, length = 10) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    if (!Number.isInteger(count) || count < 1 || count > 2000) throw new RangeError('Số điểm đồ thị phải là số nguyên từ 1 đến 2000.');
    if (!Number.isFinite(length) || length <= 0 || length > 100) throw new RangeError('Chiều dài dây phải lớn hơn 0 và không quá 100 m.');
    const t = clamp(value, 0, duration);
    return Array.from({ length: count + 1 }, (_, index) => {
      const x = length * index / count;
      return Object.freeze({ x, y: displacementAt(x, t) });
    });
  }

  return Object.freeze({
    parameters: Object.freeze(parameters), angularFrequency, waveNumber, speed,
    period: 1 / parameters.frequency, duration, probePosition, at, profile,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count)); }
  });
}
