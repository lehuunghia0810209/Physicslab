/** Quantitative comparison of two independent analytic projectile runs. */
export function compareProjectiles(current, reference) {
  for (const model of [current, reference]) {
    if (!model || !['range', 'maxHeight', 'duration'].every(key => Number.isFinite(model[key]))) {
      throw new TypeError('Cần hai mô hình ném xiên hợp lệ để so sánh.');
    }
  }
  return Object.freeze({
    range: current.range - reference.range,
    maxHeight: current.maxHeight - reference.maxHeight,
    duration: current.duration - reference.duration
  });
}
