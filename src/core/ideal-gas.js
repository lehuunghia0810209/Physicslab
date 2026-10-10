import { clamp } from './units.js';

export const IDEAL_GAS_CONSTANT = 8.314462618;
export const IDEAL_GAS_DEFAULTS = Object.freeze({
  amount: 1,
  initialVolume: 0.02,
  finalVolume: 0.04,
  initialTemperature: 300,
  finalTemperature: 450,
  process: 'isothermal'
});

export function createIdealGas(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu thông số khí lí tưởng.');
  const parameters = {
    amount: Number(input.amount),
    initialVolume: Number(input.initialVolume),
    finalVolume: Number(input.finalVolume),
    initialTemperature: Number(input.initialTemperature),
    finalTemperature: Number(input.finalTemperature),
    process: input.process
  };
  if (!Number.isFinite(parameters.amount) || parameters.amount <= 0 || parameters.amount > 10) throw new RangeError('Lượng khí nằm trong khoảng lớn hơn 0 đến 10 mol.');
  for (const key of ['initialVolume', 'finalVolume']) {
    if (!Number.isFinite(parameters[key]) || parameters[key] < 0.001 || parameters[key] > 1) throw new RangeError('Thể tích nằm trong khoảng 0,001 đến 1 m³.');
  }
  for (const key of ['initialTemperature', 'finalTemperature']) {
    if (!Number.isFinite(parameters[key]) || parameters[key] < 100 || parameters[key] > 1000) throw new RangeError('Nhiệt độ tuyệt đối nằm trong khoảng 100 đến 1000 K.');
  }
  if (!['isothermal', 'isobaric', 'isochoric'].includes(parameters.process)) throw new RangeError('Chọn quá trình đẳng nhiệt, đẳng áp hoặc đẳng tích.');
  const duration = 10;
  const { amount: n, initialVolume: V0, finalVolume: Vf, initialTemperature: T0, finalTemperature: Tf, process } = parameters;
  const initialPressure = n * IDEAL_GAS_CONSTANT * T0 / V0;

  function at(time) {
    const value = Number(time);
    if (!Number.isFinite(value)) throw new RangeError('Thời gian phải hữu hạn.');
    const t = clamp(value, 0, duration);
    const progress = t / duration;
    let volume, temperature, pressure, work;
    if (process === 'isothermal') {
      volume = V0 + (Vf - V0) * progress;
      temperature = T0;
      pressure = n * IDEAL_GAS_CONSTANT * temperature / volume;
      work = n * IDEAL_GAS_CONSTANT * temperature * Math.log(volume / V0);
    } else if (process === 'isobaric') {
      volume = V0 + (Vf - V0) * progress;
      pressure = initialPressure;
      temperature = pressure * volume / (n * IDEAL_GAS_CONSTANT);
      work = pressure * (volume - V0);
    } else {
      volume = V0;
      temperature = T0 + (Tf - T0) * progress;
      pressure = n * IDEAL_GAS_CONSTANT * temperature / volume;
      work = 0;
    }
    const internalEnergy = 1.5 * n * IDEAL_GAS_CONSTANT * temperature;
    const initialInternalEnergy = 1.5 * n * IDEAL_GAS_CONSTANT * T0;
    const changeInInternalEnergy = internalEnergy - initialInternalEnergy;
    const heat = changeInInternalEnergy + work;
    return Object.freeze({
      t, time: t, progress, amount: n, volume, temperature, pressure, work,
      internalEnergy, changeInInternalEnergy, heat, process
    });
  }

  return Object.freeze({
    parameters: Object.freeze(parameters), duration, initialPressure, at,
    sample(count = 120) {
      if (!Number.isInteger(count) || count < 1 || count > 2000) throw new RangeError('Số điểm đồ thị phải là số nguyên từ 1 đến 2000.');
      return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count));
    }
  });
}
