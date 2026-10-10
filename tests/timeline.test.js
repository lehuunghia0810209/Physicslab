import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Timeline } from '../src/engines/timeline.js';
test('Timeline play/pause/reset/seek stops exactly at impact and cleans listeners', () => {
  let callback; let removed = false;
  globalThis.document = { addEventListener() {}, removeEventListener() { removed = true; }, hidden: false };
  globalThis.requestAnimationFrame = fn => { callback = fn; return 1; }; globalThis.cancelAnimationFrame = () => {};
  let complete = 0; let latest = 0;
  const timeline = new Timeline(.15, t => { latest = t; }, () => complete++);
  timeline.play(); callback(0); callback(100); callback(200);
  assert.equal(latest, .15); assert.equal(complete, 1); assert.equal(timeline.state.get().playing, false);
  timeline.seek(99); assert.equal(latest, .15); timeline.reset(); assert.equal(latest, 0);
  timeline.play(); timeline.pause(); assert.equal(timeline.state.get().playing, false);
  timeline.seek(-1); assert.equal(latest, 0); timeline.destroy(); assert.equal(removed, true);
});
