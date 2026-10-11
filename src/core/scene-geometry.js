// View-space mappings, not physical laws. A logarithmic scale makes tiny
// nonzero gas volumes visible while all numerical measurements remain exact.
const MIN_VOLUME = 0.001;
const MAX_VOLUME = 0.4;
const BASE_X = 142;
const SPAN = 350;
export function volumeToPistonX(volume) {
  if (!Number.isFinite(volume) || volume < MIN_VOLUME || volume > MAX_VOLUME) throw new RangeError('Thể tích ngoài miền hiển thị');
  return BASE_X + (Math.log(volume / MIN_VOLUME) / Math.log(MAX_VOLUME / MIN_VOLUME)) * SPAN;
}
export function pistonXToVolume(x) {
  if (!Number.isFinite(x)) throw new RangeError('Vị trí piston phải hữu hạn');
  const fraction = Math.max(0, Math.min(1, (x - BASE_X) / SPAN));
  return MIN_VOLUME * (MAX_VOLUME / MIN_VOLUME) ** fraction;
}
