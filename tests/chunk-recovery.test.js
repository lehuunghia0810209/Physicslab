import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isLazyModuleLoadFailure } from '../src/app/chunk-recovery.js';

test('Cloudflare stale hashed chunks are recognized without swallowing physics errors', () => {
  for (const message of [
    'Failed to fetch dynamically imported module: https://physicslab-edulab.pages.dev/assets/newton-DodSuFs5.js',
    'Failed to fetch dynamically imported module: https://physicslab-edulab.pages.dev/assets/tools-Dp2AVa4O.js',
    'Importing a module script failed.',
    'error loading dynamically imported module',
    'Loading chunk 13 failed'
  ]) assert.equal(isLazyModuleLoadFailure(new TypeError(message)), true, message);
  for (const message of ['Cannot read properties of undefined', 'Invalid gravitational force', 'Network went offline']) {
    assert.equal(isLazyModuleLoadFailure(new Error(message)), false, message);
  }
});

test('Router gives explicit recovery without deleting learning progress', () => {
  const router = readFileSync(new URL('../src/app/router.js', import.meta.url), 'utf8');
  assert.match(router, /isLazyModuleLoadFailure\(error\)/);
  assert.match(router, /data-reload-chunks/);
  assert.match(router, /physicslab:before-update/);
  assert.match(router, /location\.reload\(\)/);
  assert.doesNotMatch(router, /caches\.delete|localStorage\.clear|unregister\(/);
});
