import { createHookeExperiment, SPRINGS } from './hooke.js';

export const EQUIPMENT_CATALOG = Object.freeze([
  Object.freeze({ id: 'stand', type: 'support', label: 'Statív thí nghiệm', shortLabel: 'Statív', description: 'Giá cố định lò xo' }),
  Object.freeze({ id: 'mass-set', type: 'mass-set', label: 'Bộ quả cân', shortLabel: 'Quả cân', description: 'Quả cân 0,1–3,0 kg' }),
  Object.freeze({ id: 'ruler-1mm', type: 'ruler', label: 'Thước milimét', shortLabel: 'Thước 1 mm', resolution: 0.001, max: 10, unit: 'm' }),
  Object.freeze({ id: 'ruler-0.1mm', type: 'ruler', label: 'Thước chính xác 0,1 mm', shortLabel: 'Thước 0,1 mm', resolution: 0.0001, max: 10, unit: 'm' }),
  Object.freeze({ id: 'distance-tape-0.01m', type: 'distance-tape', label: 'Thước dây 1 cm', shortLabel: 'Thước dây', resolution: 0.01, max: 30, unit: 'm' }),
  Object.freeze({ id: 'force-sensor-0.01n', type: 'force-sensor', label: 'Lực kế 0,01 N', shortLabel: 'Lực kế 0,01 N', resolution: 0.01, max: 100, unit: 'N' }),
  Object.freeze({ id: 'force-sensor-0.001n', type: 'force-sensor', label: 'Cảm biến lực 0,001 N', shortLabel: 'Cảm biến lực', resolution: 0.001, max: 100, unit: 'N' }),
  Object.freeze({ id: 'ammeter-0.001a', type: 'ammeter', label: 'Ampe kế 0,001 A', shortLabel: 'Ampe kế', resolution: 0.001, max: 20, unit: 'A' }),
  Object.freeze({ id: 'voltmeter-0.01v', type: 'voltmeter', label: 'Vôn kế 0,01 V', shortLabel: 'Vôn kế', resolution: 0.01, max: 100, unit: 'V' }),
  Object.freeze({ id: 'pressure-sensor-10pa', type: 'pressure-sensor', label: 'Cảm biến áp suất 10 Pa', shortLabel: 'Cảm biến áp suất', resolution: 10, max: 5000000, unit: 'Pa' }),
  Object.freeze({ id: 'volume-sensor-0.0001m3', type: 'volume-sensor', label: 'Cảm biến thể tích 0,0001 m³', shortLabel: 'Cảm biến thể tích', resolution: 0.0001, max: 1, unit: 'm³' }),
  Object.freeze({ id: 'thermometer-0.1k', type: 'thermometer', label: 'Nhiệt kế 0,1 K', shortLabel: 'Nhiệt kế', resolution: 0.1, max: 2000, unit: 'K' }),
  Object.freeze({ id: 'stopwatch-0.01s', type: 'stopwatch', label: 'Đồng hồ bấm giây 0,01 s', shortLabel: 'Đồng hồ', resolution: 0.01, max: 3600, unit: 's' }),
  Object.freeze({ id: 'accelerometer-0.01ms2', type: 'accelerometer', label: 'Gia tốc kế 0,01 m/s²', shortLabel: 'Gia tốc kế', resolution: 0.01, max: 500, unit: 'm/s²' }),
  Object.freeze({ id: 'velocity-sensor-0.01ms', type: 'velocity-sensor', label: 'Cảm biến vận tốc 0,01 m/s', shortLabel: 'Cảm biến vận tốc', resolution: 0.01, max: 50, unit: 'm/s' }),
  Object.freeze({ id: 'energy-meter-0.01j', type: 'energy-meter', label: 'Máy đo công 0,01 J', shortLabel: 'Máy đo công', resolution: 0.01, max: 10000, unit: 'J' }),
  Object.freeze({ id: 'momentum-analyzer-0.001kgms', type: 'momentum-analyzer', label: 'Bộ phân tích động lượng 0,001 kg·m/s', shortLabel: 'Bộ đo động lượng', resolution: 0.001, max: 1000, unit: 'kg·m/s' }),
  Object.freeze({ id: 'magnetic-field-sensor-0.001t', type: 'magnetic-field-sensor', label: 'Đầu dò từ trường 0,001 T', shortLabel: 'Đầu dò từ trường', resolution: 0.001, max: 2, unit: 'T' }),
  Object.freeze({ id: 'frequency-counter-0.01hz', type: 'frequency-counter', label: 'Bộ đo tần số 0,01 Hz', shortLabel: 'Bộ đo tần số', resolution: 0.01, max: 10000, unit: 'Hz' }),
  Object.freeze({ id: 'balance-0.001kg', type: 'balance', label: 'Cân 0,001 kg', shortLabel: 'Cân', resolution: 0.001, max: 100, unit: 'kg' }),
  Object.freeze({ id: 'protractor-1deg', type: 'protractor', label: 'Thước đo góc 1°', shortLabel: 'Thước đo góc', resolution: 1, max: 360, unit: '°' }),
  ...SPRINGS.map(spring => Object.freeze({
    id: `spring-${spring.id}`, type: 'spring', label: spring.label,
    shortLabel: spring.label, springId: spring.id, unit: 'N/m'
  }))
]);

export function getEquipment(id) {
  const item = EQUIPMENT_CATALOG.find(equipment => equipment.id === id);
  if (!item) throw new RangeError(`Không tìm thấy dụng cụ “${id}”.`);
  return item;
}

export function readInstrument(id, value) {
  const instrument = getEquipment(id);
  if (!Number.isFinite(instrument.resolution) || !Number.isFinite(instrument.max)) throw new TypeError('Dụng cụ này không phải thiết bị đo.');
  if (!Number.isFinite(value) || value < 0 || value > instrument.max) throw new RangeError(`Giá trị vượt phạm vi đo của ${instrument.label}.`);
  const digits = Math.max(0, Math.round(-Math.log10(instrument.resolution)));
  return Number((Math.round(value / instrument.resolution) * instrument.resolution).toFixed(digits));
}

export function measureWithInstrument(id, value) {
  const instrument = getEquipment(id);
  const reading = readInstrument(id, value);
  return Object.freeze({
    instrumentId: instrument.id,
    instrumentLabel: instrument.shortLabel,
    value: reading,
    uncertainty: instrument.resolution / 2,
    unit: instrument.unit
  });
}

export function createHookeWorkspace(input) {
  const experiment = createHookeExperiment(input);
  const rulerId = input.rulerId || 'ruler-0.1mm';
  // forceGaugeId is the persisted/UI field; accept forceSensorId for older callers.
  const forceSensorId = input.forceGaugeId || input.forceSensorId || 'force-sensor-0.01n';
  const spring = getEquipment(`spring-${experiment.springId}`);
  const stand = getEquipment('stand');
  const masses = getEquipment('mass-set');
  const ruler = getEquipment(rulerId);
  const forceSensor = getEquipment(forceSensorId);
  if (ruler.type !== 'ruler' || forceSensor.type !== 'force-sensor') throw new TypeError('Chọn đúng thước đo và cảm biến lực cho thí nghiệm.');
  return Object.freeze({
    experiment,
    equipment: Object.freeze([stand, spring, masses, ruler, forceSensor]),
    ruler,
    forceSensor
  });
}

// Validate legacy Hooke records before rendering tables, graphs or CSV.
// The generic multi-experiment notebook uses a different measurement schema.
export function sanitizeHookeMeasurements(rows, defaults = {}) {
  if (!Array.isArray(rows)) return [];
  const fallbackRuler = defaults.rulerId || 'ruler-0.1mm';
  const fallbackGauge = defaults.forceGaugeId || defaults.forceSensorId || 'force-sensor-0.01n';
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
    const { mass, force, extension, springConstant } = row;
    if (![mass, force, extension, springConstant].every(Number.isFinite)
      || mass <= 0 || force < 0 || extension <= 0 || springConstant <= 0) return [];
    const rulerId = row.rulerId || fallbackRuler;
    const forceGaugeId = row.forceGaugeId || row.forceSensorId || fallbackGauge;
    try {
      if (getEquipment(rulerId).type !== 'ruler'
        || getEquipment(forceGaugeId).type !== 'force-sensor') return [];
    } catch { return []; }
    const springId = SPRINGS.some(spring => spring.id === row.springId) ? row.springId : null;
    return [{ mass, force, extension, springConstant, rulerId, forceGaugeId, ...(springId ? { springId } : {}) }];
  }).slice(-100);
}
