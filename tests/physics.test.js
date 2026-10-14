import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProjectile, DEFAULTS, validateParameters } from '../src/core/projectile.js';
import { convert } from '../src/core/units.js';
import { MeasurementSystem } from '../src/engines/measurements.js';
import { createNewtonMotion } from '../src/core/newton.js';
const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test('Earth 45° reproduces equal-height flight and range formulas', () => {
  const m = createProjectile(DEFAULTS);
  near(m.duration, 2 * 20 * Math.sin(Math.PI / 4) / 9.81);
  near(m.range, 400 / 9.81); near(m.maxHeight, 100 / 9.81);
  near(m.at(m.apexTime).vy, 0); near(m.at(m.duration).y, 0);
  near(m.at(1).x, Math.sqrt(200)); near(m.at(1).y, Math.sqrt(200) - 4.905);
});
test('30° and 60° ranges match only for equal starting and landing height', () => {
  near(createProjectile({ ...DEFAULTS, angle: 30 }).range, createProjectile({ ...DEFAULTS, angle: 60 }).range);
  assert.notEqual(createProjectile({ ...DEFAULTS, angle: 30, height: 10 }).range, createProjectile({ ...DEFAULTS, angle: 60, height: 10 }).range);
});
test('Moon preset scales T and R inversely with g at h=0', () => {
  const earth = createProjectile(DEFAULTS); const moon = createProjectile({ ...DEFAULTS, g: 1.62 });
  near(moon.duration / earth.duration, 9.81 / 1.62); near(moon.range / earth.range, 9.81 / 1.62);
});
test('Horizontal launch at height obeys free-fall timing', () => {
  const m = createProjectile({ v0: 12, angle: 0, height: 8, g: 9.81 });
  near(m.duration, Math.sqrt(16 / 9.81)); near(m.maxHeight, 8); near(m.range, 12 * m.duration);
});
test('Zero flight, zero speed, vertical launch, endpoint and clamping remain finite', () => {
  for (const parameters of [{ ...DEFAULTS, v0: 0 }, { ...DEFAULTS, angle: 0 }, { ...DEFAULTS, angle: 90 }, { ...DEFAULTS, v0: 0, height: 30 }]) {
    const m = createProjectile(parameters);
    for (const t of [-10, 0, m.duration / 2, m.duration, m.duration + 100]) assert.ok(Object.values(m.at(t)).every(Number.isFinite));
    near(m.at(m.duration + 1).t, m.duration); near(m.at(-1).t, 0); near(m.at(m.duration).y, 0);
  }
});
test('Energy conservation and velocity derivatives across parameter space', () => {
  for (const g of [0.1, 1.62, 9.81, 25]) for (const angle of [0, 30, 45, 90]) for (const height of [0, 15, 30]) {
    const m = createProjectile({ v0: 37.5, angle, height, g });
    if (!m.duration) continue;
    for (const t of [m.duration * .2, m.duration * .5, m.duration * .8]) {
      const s = m.at(t); near(.5 * s.speed ** 2 + g * s.y, .5 * 37.5 ** 2 + g * height);
      const dt = Math.min(1e-4, m.duration / 10000);
      near((m.at(t + dt).x - m.at(t - dt).x) / (2 * dt), s.vx, 1e-6);
      near((m.at(t + dt).y - m.at(t - dt).y) / (2 * dt), s.vy, 1e-6);
    }
  }
});
test('Model rejects invalid parameters and non-finite time', () => {
  for (const [key, value] of [['g', 0], ['v0', -1], ['angle', 91], ['height', NaN], ['g', Infinity]]) assert.throws(() => validateParameters({ ...DEFAULTS, [key]: value }));
  assert.throws(() => createProjectile(DEFAULTS).at(NaN));
});
test('SI conversion and CSV measurement preserve real numeric values', () => {
  near(convert(20, 'speed', 'm/s', 'km/h'), 72); near(convert(72, 'speed', 'km/h', 'm/s'), 20);
  near(convert(123, 'length', 'cm', 'm'), 1.23); assert.throws(() => convert(NaN, 'time', 's', 'h'));
  const log = new MeasurementSystem(1); assert.equal(log.capture(createProjectile(DEFAULTS).at(1)), true); assert.equal(log.capture(createProjectile(DEFAULTS).at(2)), false);
  assert.ok(log.csv().includes('1.000000,14.142136,9.237136')); log.clear(); assert.equal(log.rows.length, 0);
});
test('Reusable measurement log accepts a finite model-specific schema', () => {
  const log = new MeasurementSystem(2, [
    { key: 't', csv: 't_s' }, { key: 'netForce', csv: 'net_force_N' }, { key: 'acceleration', csv: 'a_m_s2' }
  ]);
  const motion = createNewtonMotion({ mass: 5, force: 40, friction: .1, gravity: 9.81 }).at(1);
  assert.equal(log.capture(motion), true);
  assert.equal(log.capture({ ...motion, acceleration: NaN }), false);
  assert.equal(log.rows.length, 1);
  assert.match(log.csv(), /^t_s,net_force_N,a_m_s2\n1\.000000,35\.095000,7\.019000$/);
  assert.throws(() => new MeasurementSystem(0, []), RangeError);
});
