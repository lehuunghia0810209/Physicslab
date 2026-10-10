import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAB_EXPERIMENTS, defaultLabSetup, getLabExperiment, measureLabExperiment } from '../src/core/lab-experiments.js';

test('Reusable lab catalog covers mechanics, circuits, waves, optics, and thermal physics', () => {
  assert.equal(LAB_EXPERIMENTS.length, 15);
  assert.deepEqual(new Set(LAB_EXPERIMENTS.map(experiment => experiment.id)), new Set([
    'newton-second-law', 'hooke-law', 'ohms-law', 'wave-speed', 'thin-lens', 'gas-law',
    'friction', 'work-energy', 'momentum-collision', 'spring-oscillation',
    'wave-interference', 'lorentz-force', 'electromagnetic-induction', 'projectile-motion', 'inclined-plane'
  ]));
  for (const experiment of LAB_EXPERIMENTS) {
    const reading = measureLabExperiment(experiment.id, defaultLabSetup(experiment.id));
    assert.ok(Number.isFinite(reading.x), experiment.id);
    assert.ok(Number.isFinite(reading.y), experiment.id);
    assert.ok(Object.keys(experiment.axisInstruments).includes('x'));
    assert.ok(Object.keys(experiment.axisInstruments).includes('y'));
  }
});

test('Newton experiment produces the expected Fnet/m acceleration relationship', () => {
  const setup = { ...defaultLabSetup('newton-second-law'), mass: 5, friction: 0, force: 25 };
  const result = measureLabExperiment('newton-second-law', setup);
  assert.equal(result.values.netForce, 25);
  assert.equal(result.values.acceleration, 5);
});

test('Wave travel-time data has slope equal to the wave propagation speed', () => {
  const setup = { ...defaultLabSetup('wave-speed'), frequency: 2, wavelength: 3, distance: 6 };
  const result = measureLabExperiment('wave-speed', setup);
  assert.equal(result.x, 1);
  assert.equal(result.y, 6);
  assert.equal(result.values.speed, 6);
});

test('Ohm and gas experiments preserve Kirchhoff/ideal-gas relationships', () => {
  const circuit = measureLabExperiment('ohms-law', {
    ...defaultLabSetup('ohms-law'), voltage: 12, resistance1: 10, resistance2: 20, topology: 'series'
  });
  assert.equal(circuit.y, 0.4);
  const gas = measureLabExperiment('gas-law', defaultLabSetup('gas-law'));
  assert.ok(Math.abs(gas.values.pv - gas.values.amount * 8.314462618 * gas.values.temperature) < 1e-8);
});

test('Hooke and thin-lens laboratory readings follow their constitutive equations', () => {
  const spring = measureLabExperiment('hooke-law', { ...defaultLabSetup('hooke-law'), springId: 'standard', force: 8 });
  assert.ok(Math.abs(spring.y - 25 * spring.x) < 1e-10);
  assert.ok(Math.abs(spring.values.elasticEnergy - 0.5 * spring.y * spring.x) < 1e-10);
  const lens = measureLabExperiment('thin-lens', { ...defaultLabSetup('thin-lens'), focalLength: 0.1, objectDistance: 0.3 });
  assert.ok(Math.abs(1 / 0.1 - 1 / lens.x - 1 / lens.y) < 1e-10);
  assert.ok(Math.abs(lens.values.magnification + lens.y / lens.x) < 1e-10);
});

test('Mechanics laboratory adapters preserve friction, work-energy, momentum, and oscillator equations', () => {
  const friction = measureLabExperiment('friction', { ...defaultLabSetup('friction'), force: 10 });
  assert.equal(friction.values.frictionForce, -10);
  const work = measureLabExperiment('work-energy', defaultLabSetup('work-energy'));
  assert.ok(Math.abs(work.values.netWork - work.values.energyChange) < 1e-8);
  const collision = measureLabExperiment('momentum-collision', defaultLabSetup('momentum-collision'));
  assert.ok(Math.abs(collision.values.momentumBefore - collision.values.momentumAfter) < 1e-10);
  const oscillator = measureLabExperiment('spring-oscillation', defaultLabSetup('spring-oscillation'));
  assert.ok(Math.abs(oscillator.y + (16 / 1) * oscillator.x) < 1e-10);
});

test('Wave and electromagnetic laboratory adapters obey interference and induction laws', () => {
  const wave = measureLabExperiment('wave-interference', { ...defaultLabSetup('wave-interference'), phaseDifference: 180 });
  assert.ok(Math.abs(wave.y) < 1e-10);
  const lorentz = measureLabExperiment('lorentz-force', defaultLabSetup('lorentz-force'));
  assert.equal(lorentz.y, 4);
  const induction = measureLabExperiment('electromagnetic-induction', defaultLabSetup('electromagnetic-induction'));
  assert.ok(Math.abs(induction.y - 100 * 0.5 * 0.002 * 2 * Math.PI) < 1e-10);
});

test('Projectile and inclined-plane lab adapters reuse their validated analytic models', () => {
  const projectile = measureLabExperiment('projectile-motion', {
    ...defaultLabSetup('projectile-motion'), v0: 8, angle: 45, height: 0, g: 9.81
  });
  assert.ok(Math.abs(projectile.y - 8 ** 2 / 9.81) < 1e-10);
  const plane = measureLabExperiment('inclined-plane', {
    ...defaultLabSetup('inclined-plane'), angle: 30, mu: 0, gravity: 9.81
  });
  assert.ok(Math.abs(plane.y - 9.81 * 0.5) < 1e-10);
  for (const id of ['projectile-motion', 'inclined-plane', 'thin-lens', 'gas-law', 'wave-interference', 'friction']) {
    assert.equal(getLabExperiment(id).fit, false, `${id} should not claim a linear relationship`);
  }
});

test('Unknown laboratory experiment IDs are rejected explicitly', () => {
  assert.throws(() => getLabExperiment('not-an-experiment'), RangeError);
  assert.throws(() => measureLabExperiment('newton-second-law', null), TypeError);
  assert.throws(() => measureLabExperiment('ohms-law', { ...defaultLabSetup('ohms-law'), voltage: -1 }), RangeError);
});
