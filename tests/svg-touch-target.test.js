import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumSvgHitRadius } from '../src/core/svg-touch-target.js';

test('SVG direct-manipulation targets remain 48px at desktop, tablet, and phone scales', () => {
  for (const scale of [1.2, 1, 0.83, 0.65, 0.45, 0.37, 0.3]) {
    const radius = minimumSvgHitRadius(scale);
    assert.ok(radius >= 25, `visible decoration must fit inside pointer target at scale ${scale}`);
    assert.ok(2 * radius * scale >= 47.99, `touch area undersized at scale ${scale}`);
  }
});

test('Field SVG hit size responds to resize and invalid geometry safely', () => {
  assert.ok(minimumSvgHitRadius(0.3) > minimumSvgHitRadius(0.83));
  assert.equal(minimumSvgHitRadius(1), 25);
  assert.equal(minimumSvgHitRadius(0), 25);
  assert.equal(minimumSvgHitRadius(NaN), 25);
  assert.equal(minimumSvgHitRadius(Infinity), 25);
});
