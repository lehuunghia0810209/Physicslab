export const CIRCUIT_DEFAULTS = Object.freeze({
  voltage: 12,
  resistance1: 10,
  resistance2: 20,
  topology: 'series'
});

export function createCircuit(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu mạch điện.');
  const voltage = Number(input.voltage);
  const resistance1 = Number(input.resistance1);
  const resistance2 = Number(input.resistance2);
  const topology = input.topology;
  if (!Number.isFinite(voltage) || voltage < 0 || voltage > 24) throw new RangeError('Điện áp nguồn nằm trong khoảng 0 đến 24 V.');
  for (const resistance of [resistance1, resistance2]) {
    if (!Number.isFinite(resistance) || resistance < 1 || resistance > 1000) throw new RangeError('Mỗi điện trở nằm trong khoảng 1 đến 1000 Ω.');
  }
  if (topology !== 'series' && topology !== 'parallel') throw new RangeError('Chọn mạch nối tiếp hoặc song song.');
  const equivalentResistance = topology === 'series'
    ? resistance1 + resistance2
    : resistance1 * resistance2 / (resistance1 + resistance2);
  const duration = 24;

  function at(sourceVoltage) {
    const v = Math.max(0, Math.min(duration, Number(sourceVoltage)));
    const current = v / equivalentResistance;
    const current1 = topology === 'series' ? current : v / resistance1;
    const current2 = topology === 'series' ? current : v / resistance2;
    const voltage1 = topology === 'series' ? current * resistance1 : v;
    const voltage2 = topology === 'series' ? current * resistance2 : v;
    return Object.freeze({
      t: v, voltage: v, sourceVoltage: v, current, current1, current2,
      voltage1, voltage2, resistance1, resistance2, equivalentResistance,
      power: v * current, power1: voltage1 * current1, power2: voltage2 * current2, topology
    });
  }

  return Object.freeze({
    parameters: Object.freeze({ voltage, resistance1, resistance2, topology }),
    equivalentResistance, duration, at,
    sample(count = 120) { return Array.from({ length: count + 1 }, (_, index) => at(duration * index / count)); }
  });
}
