import { getEquipment, readInstrument } from './equipment.js';
/**
 * Demonstrate a deterministic instrument zero error, explicitly selected by the learner.
 * Correction removes only this known offset. Half a division is a conservative reading bound.
 * This is not a claim that physical instrument errors are independent or normally distributed.
 */
export function calibrateReading(instrumentId, trueValue, zeroSteps = 0, compensate = true) {
  const instrument = getEquipment(instrumentId);
  if (!Number.isFinite(instrument.resolution)) throw new TypeError('Dụng cụ không có độ chia.');
  if (!Number.isInteger(zeroSteps) || Math.abs(zeroSteps) > 3) throw new RangeError('Lệch điểm 0 tối đa ±3 độ chia.');
  if (!Number.isFinite(trueValue) || trueValue < 0) throw new RangeError('Phép đo không hợp lệ.');
  const offset = zeroSteps * instrument.resolution;
  const observed = readInstrument(instrumentId, trueValue + offset);
  const value = compensate ? Number((observed - offset).toFixed(9)) : observed;
  if (!(value > 0)) throw new RangeError('Sau hiệu chỉnh phép đo phải dương.');
  return Object.freeze({ value, observed, offset, corrected: Boolean(compensate), bound: instrument.resolution / 2, unit: instrument.unit });
}
/** Combined *standard* uncertainty, assuming independent uniform rounding over ± half division. */
export function hookeStiffnessUncertainty(force, extension, forceBound, extensionBound) {
  if (![force, extension, forceBound, extensionBound].every(Number.isFinite)
    || force <= 0 || extension <= 0 || forceBound < 0 || extensionBound < 0)
    throw new RangeError('Không đủ dữ liệu đo hợp lệ để tính sai số k.');
  const stiffness = force / extension;
  const uF = forceBound / Math.sqrt(3);
  const ux = extensionBound / Math.sqrt(3);
  return Object.freeze({ stiffness, uncertainty: stiffness * Math.hypot(uF / force, ux / extension),
    firstOrderLimit: stiffness * (forceBound / force + extensionBound / extension) });
}
