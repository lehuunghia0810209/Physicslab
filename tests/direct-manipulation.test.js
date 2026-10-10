import test from 'node:test';
import assert from 'node:assert/strict';
import { quantizeParameter, normalizePointerX, clampSceneValue } from '../src/core/direct-manipulation.js';
test('Scene gestures quantize into allowed physical parameter slider values', () => {
  const scale = { min: -80, max: 80, step: 1 };
  assert.equal(quantizeParameter(0, scale), -80);
  assert.equal(quantizeParameter(0.5, scale), 0);
  assert.equal(quantizeParameter(1.5, scale), 80);
  assert.equal(quantizeParameter(-1, scale), -80);
  assert.equal(quantizeParameter(0.75, { min: 0.05, max: 2, step: 0.05 }), 1.5);
});
test('Pointer mapping clamps to the stage and refuses invalid geometry', () => {
  assert.equal(normalizePointerX(250, { left: 100, width: 300 }), 0.5);
  assert.equal(normalizePointerX(0, { left: 100, width: 300 }), 0);
  assert.equal(normalizePointerX(900, { left: 100, width: 300 }), 1);
  assert.throws(() => normalizePointerX(100, { left: 0, width: 0 }));
  assert.equal(clampSceneValue(-1, 0, 1), 0);
});
