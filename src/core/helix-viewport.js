// Camera fitting for a uniform-field helix. Geometry remains in physical units;
// only the 2D projection is scaled to the available canvas pixels.
const finite = value => Number.isFinite(value);

export function createHelixViewport(model, { width, height, yaw = -0.55, elevation = 0.35, zoom = 1, turns = 1.5 } = {}) {
  if (!model || typeof model.at !== 'function' || ![width, height, yaw, elevation, zoom, turns].every(finite)
      || width <= 0 || height <= 0 || zoom <= 0 || turns <= 0) {
    throw new RangeError('Khung nhìn quỹ đạo không hợp lệ.');
  }
  const maxPhase = 2 * Math.PI * turns;
  const duration = maxPhase / Math.abs(model.omega);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(elevation), sp = Math.sin(elevation);
  function rotate({ x, y, z }) {
    const horizontal = x * sy + y * cy;
    return { x: x * cy - y * sy, y: z * cp - horizontal * sp };
  }
  const path = Array.from({ length: 241 }, (_, index) => model.at(duration * index / 240));
  const axisStart = { x: 0, y: 0, z: 0 };
  const axisEnd = { x: 0, y: 0, z: model.parallel * duration };
  const fitted = [...path, axisStart, axisEnd].map(rotate);
  const minX = Math.min(...fitted.map(point => point.x));
  const maxX = Math.max(...fitted.map(point => point.x));
  const minY = Math.min(...fitted.map(point => point.y));
  const maxY = Math.max(...fitted.map(point => point.y));
  const margin = Math.min(50, Math.max(24, Math.min(width, height) * 0.10));
  const availableWidth = Math.max(1, width - 2 * margin);
  const availableHeight = Math.max(1, height - 2 * margin);
  const spanX = Math.max(maxX - minX, 1e-8);
  const spanY = Math.max(maxY - minY, 1e-8);
  const scale = Math.min(availableWidth / spanX, availableHeight / spanY) * zoom;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  function project(point) {
    const rotated = rotate(point);
    return { x: width / 2 + (rotated.x - centerX) * scale, y: height / 2 - (rotated.y - centerY) * scale };
  }
  return Object.freeze({ maxPhase, duration, path, project, axisStart, axisEnd, margin });
}
