import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { springEquilibrium, sampleDampedSpring, springCoilPath, massCenterY, extensionFromStageY } from '../src/core/hooke-motion.js';

describe('Physical interactive Hooke workbench', () => {
  it('uses mg/k for each mass, stiffness and gravity, in SI units', () => {
    assert.ok(Math.abs(springEquilibrium(.5, 25) - .1962) < 1e-12);
    assert.ok(Math.abs(springEquilibrium(.5, 25, 3.71) - .0742) < 1e-12);
  });
  it('has correct exact initial extension and velocity, without teleporting', () => {
    const state = sampleDampedSpring({ mass: .5, stiffness: 25, initialExtension: .45, initialVelocity: -.8 }, 0);
    assert.ok(Math.abs(state.extension - .45) < 1e-12);
    assert.ok(Math.abs(state.velocity + .8) < 1e-12);
  });
  it('relaxes toward the true equilibrium while retaining physical forces', () => {
    const input = { mass: .5, stiffness: 25, initialExtension: 0, initialVelocity: 0 };
    const early = sampleDampedSpring(input, .1);
    const late = sampleDampedSpring(input, 15);
    assert.ok(early.extension > 0);
    assert.ok(Math.abs(late.extension - late.equilibrium) < .000002);
    assert.ok(Math.abs(late.springForce - late.gravityForce) < .00005);
  });
  it('recomputes spring force from current displacement even during motion', () => {
    const sample = sampleDampedSpring({ mass: .3, stiffness: 12, initialExtension: .25 }, .3);
    assert.ok(Math.abs(sample.springForce - 12 * sample.extension) < 1e-10);
    assert.ok(Math.abs(sample.gravityForce - .3 * 9.81) < 1e-10);
  });
  it('maps drag pixels to metres reversibly and draws a valid spring', () => {
    assert.ok(Math.abs(extensionFromStageY(massCenterY(.4)) - .4) < 1e-12);
    assert.match(springCoilPath(200, 40, 200), /^M /);
  });
  it('rejects physically impossible input instead of generating NaN', () => {
    assert.throws(() => springEquilibrium(0, 25), RangeError);
    assert.throws(() => sampleDampedSpring({ mass: .5, stiffness: 25, initialVelocity: NaN }, 1), RangeError);
    assert.throws(() => sampleDampedSpring({ mass: .5, stiffness: 25, damping: 10 }, 1), RangeError);
  });
});
