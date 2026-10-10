export const SPRINGS = Object.freeze([
  { id: 'soft', label: 'Lò xo mềm', constant: 12, restLength: 0.08 },
  { id: 'standard', label: 'Lò xo chuẩn', constant: 25, restLength: 0.10 },
  { id: 'stiff', label: 'Lò xo cứng', constant: 40, restLength: 0.12 }
]);

export const DEFAULT_HOOKE = Object.freeze({
  springId: 'standard',
  mass: 0.5,
  gravity: 9.81,
  maxMass: 3
});

export function validateHookeSetup(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu dữ liệu thí nghiệm.');
  const spring = SPRINGS.find(item => item.id === input.springId) || SPRINGS[1];
  const mass = Number(input.mass);
  const gravity = Number(input.gravity);
  if (!Number.isFinite(mass) || mass <= 0 || mass > (Number(input.maxMass) || 5)) {
    throw new RangeError('Khối lượng phải là số dương và nằm trong giới hạn cho phép.');
  }
  if (!Number.isFinite(gravity) || gravity <= 0) {
    throw new RangeError('Gia tốc trọng trường phải là số dương.');
  }
  return { springId: spring.id, springLabel: spring.label, springConstant: spring.constant, restLength: spring.restLength, mass, gravity, maxMass: Number.isFinite(Number(input.maxMass)) ? Math.max(Number(input.maxMass), mass) : 5 };
}

export function createHookeExperiment(input) {
  const setup = validateHookeSetup(input);
  const force = setup.mass * setup.gravity;
  const extension = force / setup.springConstant;
  const totalLength = setup.restLength + extension;
  const springForce = setup.springConstant * extension;
  // Floating-point round-off must not classify a valid equilibrium as a failure.
  const equilibrium = Math.abs(force - springForce) <= 1e-12 * Math.max(1, Math.abs(force), Math.abs(springForce));
  return Object.freeze({
    ...setup,
    force,
    extension,
    totalLength,
    equilibrium,
    energy: 0.5 * setup.springConstant * extension * extension,
    theory: { force, extension },
    sample(forceOverride = force) {
      const extensionValue = forceOverride / setup.springConstant;
      return { force: forceOverride, extension: extensionValue, totalLength: setup.restLength + extensionValue };
    }
  });
}

export function toCsv(rows) {
  return [
    'mass_kg,force_n,extension_m,stiffness_n_m,spring_id,ruler_id,force_sensor_id',
    ...rows.map(row => [
      ...[row.mass, row.force, row.extension, row.springConstant].map(v => Number(v).toFixed(6)),
      row.springId || '',
      row.rulerId || '',
      row.forceGaugeId || ''
    ].join(','))
  ].join('\n');
}
