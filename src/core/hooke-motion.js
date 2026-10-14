// A damped spring–mass system about the gravity-shifted equilibrium.
// Exact underdamped solution of x'' + 2 gamma x' + (k/m)x = g.
// Units: x (m), time (s), mass (kg), stiffness (N/m), g (m/s²).
export function springEquilibrium(mass, stiffness, gravity = 9.81) {
  if (![mass, stiffness, gravity].every(n => Number.isFinite(n) && n > 0)) throw new RangeError('m, k, g phải dương và hữu hạn.');
  return mass * gravity / stiffness;
}
export function sampleDampedSpring({ mass, stiffness, gravity = 9.81, initialExtension = 0, initialVelocity = 0, damping = 0.85 }, time) {
  const equilibrium = springEquilibrium(mass, stiffness, gravity);
  if (![initialExtension, initialVelocity, damping, time].every(Number.isFinite) || damping < 0 || time < 0) {
    throw new RangeError('Điều kiện đầu, hệ số tắt dần và thời gian phải hợp lệ.');
  }
  const omegaSquared = stiffness / mass;
  if (damping * damping >= omegaSquared) throw new RangeError('Chỉ hỗ trợ hệ dao động dưới tắt dần tới hạn.');
  const omega = Math.sqrt(omegaSquared - damping * damping);
  const a = initialExtension - equilibrium;
  const b = (initialVelocity + damping * a) / omega;
  const c = Math.cos(omega * time);
  const s = Math.sin(omega * time);
  const decay = Math.exp(-damping * time);
  const extension = equilibrium + decay * (a * c + b * s);
  const velocity = decay * ((b * omega - damping * a) * c + (-a * omega - damping * b) * s);
  return Object.freeze({ equilibrium, extension, velocity, springForce: stiffness * extension, gravityForce: mass * gravity,
    kineticEnergy: mass * velocity * velocity / 2, elasticEnergy: stiffness * extension * extension / 2 });
}

export function springCoilPath(topX, topY, bottomY, coils = 17, radius = 17) {
  if (![topX, topY, bottomY, coils, radius].every(Number.isFinite) || coils < 1 || radius <= 0 || bottomY <= topY + 12) throw new RangeError('Kích thước lò xo không hợp lệ.');
  const steps = Math.round(coils * 2);
  const margin = 13;
  const height = Math.max(1, bottomY - topY - margin * 2);
  const parts = [`M ${topX} ${topY}`, `L ${topX} ${topY + margin}`];
  for (let i = 0; i <= steps; i++) parts.push(`L ${topX + (i % 2 === 0 ? -radius : radius)} ${(topY + margin + height * i / steps).toFixed(2)}`);
  parts.push(`L ${topX} ${bottomY}`);
  return parts.join(' ');
}

export const HOOKE_STAGE = Object.freeze({ springX: 300, springTop: 94, naturalMassY: 258, pixelsPerMeter: 105, maxMass: 1 });
export function massCenterY(extension) { return HOOKE_STAGE.naturalMassY + extension * HOOKE_STAGE.pixelsPerMeter; }
export function extensionFromStageY(stageY) { return (stageY - HOOKE_STAGE.naturalMassY) / HOOKE_STAGE.pixelsPerMeter; }
