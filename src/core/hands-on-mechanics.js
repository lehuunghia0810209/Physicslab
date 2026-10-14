import { quantizeParameter, normalizePointerX } from './direct-manipulation.js';

/** Map a grab gesture to an actual initial condition; never edit measurement output. */
export function sceneParameterFromPoint(kind, clientX, bounds, parameter) {
  const fraction = normalizePointerX(clientX, bounds);
  if (kind === 'oscillation') {
    const signed = 2 * fraction - 1;
    return {
      amplitude: quantizeParameter((Math.max(parameter.min, Math.abs(signed) * parameter.max) - parameter.min) / (parameter.max - parameter.min), parameter),
      phase: signed < 0 ? 180 : 0
    };
  }
  return { [parameter.key]: quantizeParameter(fraction, parameter) };
}

/** Collision: drag a starting-velocity handle left/right; sign is intentional. */
export function velocityFromDrag(deltaX, width, initial, parameter) {
  if (!Number.isFinite(deltaX) || !Number.isFinite(width) || width <= 0) throw new RangeError('Vùng kéo không hợp lệ.');
  const value = Math.max(parameter.min, Math.min(parameter.max, initial + deltaX / width * 38));
  return quantizeParameter((value - parameter.min) / (parameter.max - parameter.min), parameter);
}

export function parameterFromDragDelta(deltaX, width, initial, parameter) {
  if (![deltaX,width,initial].every(Number.isFinite)||width<=0)throw new RangeError('Vùng kéo không hợp lệ.');
  const proposed=initial+deltaX/width*(parameter.max-parameter.min);
  return quantizeParameter((proposed-parameter.min)/(parameter.max-parameter.min),parameter);
}

export function momentumBalance(model) {
  const before = model.momentumBefore;
  const after = model.at(model.duration).momentum;
  return { before, after, drift: after - before };
}
