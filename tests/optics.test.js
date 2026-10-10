import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThinLens } from '../src/core/optics.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('Converging lens forms a real inverted image and satisfies the thin-lens equation', () => {
  const lens = createThinLens({ focalLength: 0.1, objectDistance: 0.3, objectHeight: 0.02 });
  near(lens.imageDistance, 0.15);
  near(lens.magnification, -0.5);
  near(lens.imageHeight, -0.01);
  assert.equal(lens.imageType, 'real');
  near(1 / lens.parameters.focalLength, 1 / lens.parameters.objectDistance + 1 / lens.imageDistance);
});

test('Object inside focal length forms an upright virtual image', () => {
  const image = createThinLens({ focalLength: 0.1, objectDistance: 0.05, objectHeight: 0.02 });
  near(image.imageDistance, -0.1);
  near(image.magnification, 2);
  assert.equal(image.imageType, 'virtual');
});

test('Object at the focal plane produces a collimated image and graph avoids singularity', () => {
  const lens = createThinLens({ focalLength: 0.1, objectDistance: 0.1, objectHeight: 0.02 });
  assert.equal(lens.imageDistance, null);
  assert.equal(lens.imageType, 'infinity');
  assert.ok(lens.sample().every(point => Number.isFinite(point.imageDistance) && Number.isFinite(point.objectDistance)));
  assert.throws(() => createThinLens({ focalLength: 0, objectDistance: 0.3, objectHeight: 0.02 }), RangeError);
  assert.throws(() => lens.at(NaN), RangeError);
});
