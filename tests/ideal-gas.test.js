import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIdealGas, IDEAL_GAS_CONSTANT } from '../src/core/ideal-gas.js';

const input = { amount: 1, initialVolume: 0.02, finalVolume: 0.04, initialTemperature: 300, finalTemperature: 450, process: 'isothermal' };
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('Isothermal expansion obeys ideal gas law and first-law energy balance', () => {
  const model = createIdealGas(input);
  const initial = model.at(0);
  const final = model.at(model.duration);
  near(initial.pressure * initial.volume, IDEAL_GAS_CONSTANT * 300);
  near(final.pressure * final.volume, IDEAL_GAS_CONSTANT * 300);
  near(final.pressure, initial.pressure / 2);
  near(final.changeInInternalEnergy, 0);
  near(final.heat, final.work);
});

test('Isobaric and isochoric processes conserve first-law energy', () => {
  const isobaric = createIdealGas({ ...input, process: 'isobaric' }).at(10);
  near(isobaric.pressure, IDEAL_GAS_CONSTANT * 300 / 0.02);
  near(isobaric.temperature, 600);
  near(isobaric.pressure * isobaric.volume, IDEAL_GAS_CONSTANT * isobaric.temperature);
  near(isobaric.heat, isobaric.changeInInternalEnergy + isobaric.work);
  const isochoric = createIdealGas({ ...input, process: 'isochoric' }).at(10);
  near(isochoric.volume, 0.02);
  near(isochoric.temperature, 450);
  near(isochoric.work, 0);
  near(isochoric.heat, isochoric.changeInInternalEnergy);
});

test('Ideal-gas model clamps time and validates state and sampling inputs', () => {
  const model = createIdealGas(input);
  assert.equal(model.at(-1).time, 0);
  assert.equal(model.at(100).time, 10);
  assert.equal(model.sample(20).length, 21);
  assert.throws(() => model.at(NaN), RangeError);
  assert.throws(() => model.sample(0), RangeError);
  assert.throws(() => createIdealGas({ ...input, amount: 0 }), RangeError);
  assert.throws(() => createIdealGas({ ...input, process: 'invalid' }), RangeError);
});
