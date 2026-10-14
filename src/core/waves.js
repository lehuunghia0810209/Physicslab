import { clamp } from './units.js';
import { ROPE_LENGTH, ropeDisplacement, waveSpeed } from './lab-16-physics.js';

export const WAVE_DEFAULTS = Object.freeze({
  amplitude: 0.5,
  frequency: 1.5,
  wavelength: 4,
  phase: 0,
  phaseDifference: 0,
  mode: 'traveling',
  boundary: 'fixed',
  probePosition: 2
});

export function createTravelingWave(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu tham số sóng.');
  const parameters = {
    amplitude: Number(input.amplitude),
    frequency: Number(input.frequency),
    wavelength: Number(input.wavelength),
    phase: Number(input.phase),
    phaseDifference: Number(input.phaseDifference ?? WAVE_DEFAULTS.phaseDifference),
    mode: input.mode ?? WAVE_DEFAULTS.mode,
    probePosition: Number(input.probePosition ?? Number(input.wavelength) / 4)
  };
  if (!Number.isFinite(parameters.amplitude) || parameters.amplitude <= 0 || parameters.amplitude > 2) throw new RangeError('Biên độ phải lớn hơn 0 và không quá 2 m.');
  if (!Number.isFinite(parameters.frequency) || parameters.frequency <= 0 || parameters.frequency > 10) throw new RangeError('Tần số phải lớn hơn 0 và không quá 10 Hz.');
  if (!Number.isFinite(parameters.wavelength) || parameters.wavelength <= 0 || parameters.wavelength > 20) throw new RangeError('Bước sóng phải lớn hơn 0 và không quá 20 m.');
  if (!Number.isFinite(parameters.phase) || parameters.phase < -180 || parameters.phase > 180) throw new RangeError('Pha ban đầu nằm trong khoảng −180° đến 180°.');
  if (!Number.isFinite(parameters.phaseDifference) || parameters.phaseDifference < -180 || parameters.phaseDifference > 180) throw new RangeError('Độ lệch pha nằm trong khoảng −180° đến 180°.');
  if (!['traveling', 'standing', 'interference'].includes(parameters.mode)) throw new RangeError('Chọn sóng truyền, sóng dừng hoặc giao thoa.');
  if (!Number.isFinite(parameters.probePosition) || parameters.probePosition < 0 || parameters.probePosition > 10) throw new RangeError('Đầu dò phải nằm trên dây từ 0 đến 10 m.');

  const angularFrequency = 2 * Math.PI * parameters.frequency;
  const waveNumber = 2 * Math.PI / parameters.wavelength;
  const speed = parameters.frequency * parameters.wavelength;
  const phase = parameters.phase * Math.PI / 180;
  const phaseDifference = parameters.phaseDifference * Math.PI / 180;
  const duration = 3 / parameters.frequency;
  const probePosition = parameters.probePosition;

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
    period: 1 / parameters.frequency, duration, probePosition, length: 10, at, profile,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count)); }
  });
}

/** Apparatus model shared with the Virtual Lab rope bench: a causal source,
 * propagation, reflection at a fixed/free end, and a movable measurement probe.
 */
export function createRopeWave(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu tham số sóng.');
  const mode = input.mode === 'harmonic' ? 'harmonic' : input.mode === 'pulse' ? 'pulse' : null;
  if (!mode) throw new RangeError('Nguồn dây phải là xung hoặc dao động tuần hoàn.');
  const base = createTravelingWave({ ...input, mode: 'traveling', probePosition: Math.min(ROPE_LENGTH, Number(input.probePosition ?? WAVE_DEFAULTS.probePosition)) });
  const boundary = input.boundary === 'free' ? 'free' : input.boundary === 'fixed' || input.boundary === undefined ? 'fixed' : null;
  if (!boundary) throw new RangeError('Đầu dây phải cố định hoặc tự do.');
  const probePosition = Number(input.probePosition ?? WAVE_DEFAULTS.probePosition);
  if (!Number.isFinite(probePosition) || probePosition < 0 || probePosition > ROPE_LENGTH) throw new RangeError(`Đầu dò phải nằm trên dây từ 0 đến ${ROPE_LENGTH} m.`);
  const parameters = Object.freeze({ ...base.parameters, mode, boundary, probePosition });
  const speed = waveSpeed(parameters);
  const duration = Math.max(4, 2 * ROPE_LENGTH / speed + 0.8);
  const displacementAt = (position, time) => ropeDisplacement(parameters, position, time, { mode, boundary, amplitude: parameters.amplitude });
  const particleVelocityAt = (position, time) => {
    const step = 1e-4;
    const before = Math.max(0, time - step);
    const after = Math.min(duration, time + step);
    return after === before ? 0 : (displacementAt(position, after) - displacementAt(position, before)) / (after - before);
  };
  function at(time) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    const t = clamp(value, 0, duration);
    return Object.freeze({
      t, time: t, displacement: displacementAt(probePosition, t),
      particleVelocity: particleVelocityAt(probePosition, t), sourceDisplacement: displacementAt(0, t),
      probePosition, amplitude: parameters.amplitude, frequency: parameters.frequency,
      wavelength: parameters.wavelength, angularFrequency: base.angularFrequency,
      waveNumber: base.waveNumber, speed, mode, boundary
    });
  }
  function profile(time, count = 160) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    if (!Number.isInteger(count) || count < 1 || count > 2000) throw new RangeError('Số điểm đồ thị phải là số nguyên từ 1 đến 2000.');
    const t = clamp(value, 0, duration);
    return Array.from({ length: count + 1 }, (_, index) => {
      const x = ROPE_LENGTH * index / count;
      return Object.freeze({ x, y: displacementAt(x, t) });
    });
  }
  return Object.freeze({
    parameters, angularFrequency: base.angularFrequency, waveNumber: base.waveNumber,
    speed, period: base.period, duration, probePosition, length: ROPE_LENGTH, at, profile,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count)); }
  });
}

export function createWaveExperiment(input) {
  return ['pulse', 'harmonic'].includes(input?.mode) ? createRopeWave(input) : createTravelingWave(input);
}
