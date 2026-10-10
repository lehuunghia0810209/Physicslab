export const OPTICS_DEFAULTS = Object.freeze({
  focalLength: 0.1,
  objectDistance: 0.3,
  objectHeight: 0.02
});

export function createThinLens(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu thông số thấu kính.');
  const parameters = Object.fromEntries(Object.keys(OPTICS_DEFAULTS).map(key => [key, Number(input[key])]));
  if (!Number.isFinite(parameters.focalLength) || parameters.focalLength < 0.02 || parameters.focalLength > 1) throw new RangeError('Tiêu cự nằm trong khoảng 0,02 đến 1 m.');
  if (!Number.isFinite(parameters.objectDistance) || parameters.objectDistance < 0.02 || parameters.objectDistance > 2) throw new RangeError('Khoảng cách vật nằm trong khoảng 0,02 đến 2 m.');
  if (!Number.isFinite(parameters.objectHeight) || parameters.objectHeight <= 0 || parameters.objectHeight > 1) throw new RangeError('Chiều cao vật phải lớn hơn 0 và không quá 1 m.');
  const denominator = 1 / parameters.focalLength - 1 / parameters.objectDistance;
  const atInfinity = Math.abs(denominator) < 1e-12;
  const imageDistance = atInfinity ? null : 1 / denominator;
  const magnification = atInfinity ? null : -imageDistance / parameters.objectDistance;
  const imageHeight = atInfinity ? null : parameters.objectHeight * magnification;
  const imageType = atInfinity ? 'infinity' : imageDistance > 0 ? 'real' : 'virtual';

  function at(objectDistance) {
    const distance = Number(objectDistance);
    if (!Number.isFinite(distance)) throw new RangeError('Khoảng cách vật phải hữu hạn.');
    const boundedDistance = Math.max(0.02, Math.min(2, distance));
    const reciprocal = 1 / parameters.focalLength - 1 / boundedDistance;
    const infinity = Math.abs(reciprocal) < 1e-12;
    const di = infinity ? null : 1 / reciprocal;
    const m = infinity ? null : -di / boundedDistance;
    return Object.freeze({
      objectDistance: boundedDistance, focalLength: parameters.focalLength,
      imageDistance: di, magnification: m,
      imageHeight: infinity ? null : parameters.objectHeight * m,
      imageType: infinity ? 'infinity' : di > 0 ? 'real' : 'virtual',
      objectHeight: parameters.objectHeight
    });
  }

  function sample(count = 120) {
    if (!Number.isInteger(count) || count < 2 || count > 2000) throw new RangeError('Số điểm đồ thị phải là số nguyên từ 2 đến 2000.');
    const lower = parameters.objectDistance < parameters.focalLength
      ? Math.max(0.02, parameters.focalLength * 0.1)
      : Math.min(2, parameters.focalLength * 1.1);
    const upper = parameters.objectDistance < parameters.focalLength
      ? parameters.focalLength * 0.9
      : Math.min(2, parameters.focalLength * 3);
    return Array.from({ length: count + 1 }, (_, index) => {
      const distance = lower + (upper - lower) * index / count;
      return at(distance);
    });
  }

  return Object.freeze({
    parameters: Object.freeze(parameters), imageDistance, magnification, imageHeight, imageType, at, sample
  });
}
