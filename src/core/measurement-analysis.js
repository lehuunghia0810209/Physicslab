export function analyzeMeasurements(values, resolution = 0) {
  if (!Array.isArray(values) || values.length < 2 || values.some(value => !Number.isFinite(value))) {
    throw new TypeError('Cần ít nhất hai số đo hữu hạn để phân tích.');
  }
  if (!Number.isFinite(resolution) || resolution < 0) {
    throw new RangeError('Độ chia dụng cụ phải là số hữu hạn không âm.');
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDeviation = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  const standardDeviation = Math.sqrt(squaredDeviation / (values.length - 1));
  const standardError = standardDeviation / Math.sqrt(values.length);
  const resolutionUncertainty = resolution / Math.sqrt(12);
  const combinedUncertainty = Math.hypot(standardError, resolutionUncertainty);
  return Object.freeze({
    count: values.length, mean, standardDeviation, standardError,
    resolutionUncertainty, combinedUncertainty,
    relativeUncertainty: mean === 0 ? null : combinedUncertainty / Math.abs(mean)
  });
}
