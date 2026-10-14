/** PhysicsLab 1.6: deterministic scientific models for hands-on benches.
 * Scene positions are visualizations; the model is always in SI units.
 */
import { createInclinedPlane } from './inclined.js';
import { createThinLens } from './optics.js';

export const LAB16_IDS = Object.freeze(['inclined-plane', 'thin-lens', 'wave-speed', 'wave-interference']);
export const ROPE_LENGTH = 8; // metres; ideal 1D nondispersive string
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function rampGeometry(angle) {
  if (!Number.isFinite(angle) || angle < 5 || angle > 80) throw new RangeError('Góc nghiêng không hợp lệ.');
  const rad = angle * Math.PI / 180;
  const pixels = Math.min(580, 305 / Math.sin(rad));
  const foot = Object.freeze({ x: 130, y: 475 });
  const top = Object.freeze({ x: foot.x + pixels * Math.cos(rad), y: foot.y - pixels * Math.sin(rad) });
  return Object.freeze({ foot, top, angle, lengthMetres: 4 });
}

export function rampState(setup, time, initialDistance = 0) {
  if (!Number.isFinite(time) || time < 0) throw new RangeError('Thời gian phải không âm.');
  if (!Number.isFinite(initialDistance) || initialDistance < 0 || initialDistance > 4) throw new RangeError('Vị trí thả xe không hợp lệ.');
  const model = createInclinedPlane(setup);
  const distance = Math.min(4, initialDistance + model.acceleration * time * time / 2);
  const elapsedDistance = distance - initialDistance;
  const velocity = distance >= 4 ? 0 : Math.sqrt(2 * model.acceleration * elapsedDistance);
  const geometry = rampGeometry(setup.angle);
  const progress = distance / geometry.lengthMetres;
  const x = geometry.top.x + progress * (geometry.foot.x - geometry.top.x);
  const y = geometry.top.y + progress * (geometry.foot.y - geometry.top.y);
  return Object.freeze({ x, y, distance, velocity, acceleration: model.acceleration, moving: model.moving,
    downForce: model.gravityComponent, normalForce: model.normal, frictionForce: model.friction,
    atEnd: distance >= 4, geometry });
}

/** Ray construction using the paraxial thin-lens model. Positive di: real image.
 * virtual images are located to the left of the lens and cannot be projected on a screen.
 */
export function opticalBench(setup, screenDistance = 0.15) {
  if (!Number.isFinite(screenDistance) || screenDistance <= 0) throw new RangeError('Vị trí màn hứng không hợp lệ.');
  const result = createThinLens(setup).at(setup.objectDistance);
  const { objectDistance: d, focalLength: f, imageDistance: di, imageHeight } = result;
  // Stable apparatus scale: the former fit-to-image scale changed on *every* drag
  // frame, which made both instruments and rays jump even with anchored pointers.
  // Distances and imaging equation remain in metres; only drawing uses this scale.
  const scale = 520;
  const lensX = 495, axisY = 285;
  const objectX = lensX - d * scale;
  const objectHeightPx = clamp(setup.objectHeight * scale, 18, 105); // symbol enhanced for visibility
  const imageX = di === null ? null : lensX + di * scale;
  const imageHeightPx = di === null ? null : -objectHeightPx * di / d;
  const screenX = clamp(lensX + screenDistance * scale, lensX + 16, 929);
  return Object.freeze({ ...result, scale, lensX, axisY, objectX, objectTipY: axisY - objectHeightPx,
    imageX, imageTipY: imageHeightPx === null ? null : axisY - imageHeightPx,
    screenX, screenDistance,
    screenFocused: result.imageType === 'real' && Math.abs(di - screenDistance) <= 0.015 });
}

export function waveSpeed(setup) {
  const f = Number(setup.frequency), lambda = Number(setup.wavelength);
  if (!Number.isFinite(f) || f <= 0 || !Number.isFinite(lambda) || lambda <= 0) throw new RangeError('Tần số và bước sóng phải dương.');
  return f * lambda;
}

/** Idealized one-dimensional wave and reflection at the far boundary.
 * The pulse is launched at t=0.35 s. The traveling harmonic has a causal front.
 * Boundary: fixed = inversion, free = non-inversion. No damping or dispersion.
 */
export function ropeDisplacement(setup, x, time, options = {}) {
  if (![x, time].every(Number.isFinite)) throw new RangeError('Tọa độ và thời gian không hợp lệ.');
  if (x < 0 || x > ROPE_LENGTH || time < 0) throw new RangeError('Điểm ngoài dây hoặc thời gian âm.');
  const v = waveSpeed(setup);
  const mode = options.mode === 'harmonic' ? 'harmonic' : 'pulse';
  const boundary = options.boundary === 'free' ? 'free' : 'fixed';
  const amplitude = Number.isFinite(options.amplitude) ? options.amplitude : 0.5;
  const packet = delay => {
    if (mode === 'harmonic') return delay < 0 ? 0 : Math.sin(2 * Math.PI * setup.frequency * delay);
    return Math.exp(-(((delay - 0.35) / 0.125) ** 2));
  };
  const forward = packet(time - x / v);
  const reflected = packet(time - (2 * ROPE_LENGTH - x) / v);
  return amplitude * (forward + (boundary === 'fixed' ? -1 : 1) * reflected);
}

/** Two coherent sources, same amplitude and frequency, at one common observation coordinate. */
export function interferenceDisplacement(setup, x, time) {
  if (![x, time].every(Number.isFinite)) throw new RangeError('Tọa độ và thời gian không hợp lệ.');
  const a = Number(setup.amplitude), f = Number(setup.frequency), lambda = Number(setup.wavelength);
  if (!(a > 0 && f > 0 && lambda > 0)) throw new RangeError('Thông số sóng không hợp lệ.');
  const phase = Number(setup.phaseDifference) * Math.PI / 180;
  const argument = 2 * Math.PI * (x / lambda - f * time);
  const first = a * Math.sin(argument), second = a * Math.sin(argument + phase);
  return Object.freeze({ first, second, total: first + second });
}
