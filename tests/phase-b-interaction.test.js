import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Phase B priority simulations reuse the same model-backed measurement panel', async () => {
  for (const path of ['../src/simulations/newton/index.js','../src/simulations/mechanics-view.js','../src/simulations/optics/index.js']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /mountMeasurementPanel/);
    assert.match(source, /simulation-measurements/);
  }
});

test('Priority drag gestures clean up pointer cancellation and lost capture', async () => {
  for (const path of ['../src/simulations/newton/index.js','../src/simulations/mechanics-view.js','../src/simulations/optics/index.js']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /pointercancel/);
    assert.match(source, /lostpointercapture/);
  }
});
