import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../scripts/service-worker-runtime.js', import.meta.url), 'utf8');
const origin = 'https://physicslab-edulab.pages.dev/';

function workerHarness({ fetchImpl, cached = null, cacheError = null } = {}) {
  const callbacks = new Map();
  const requests = [];
  const scope = {
    CACHE: 'physicslab-static-test', ASSETS: ['./index.html'],
    self: {
      location: { origin: new URL(origin).origin }, registration: { scope: origin },
      addEventListener: (type, listener) => callbacks.set(type, listener),
      clients: { claim: async () => {} }, skipWaiting: () => {}
    },
    fetch: async (...args) => {
      requests.push(args);
      if (fetchImpl) return fetchImpl(...args);
      return new Response('network');
    },
    caches: {
      match: async (...args) => { if (cacheError) throw cacheError; return cached; },
      open: async () => ({ addAll: async () => {} }),
      keys: async () => [], delete: async () => true
    },
    URL, Response
  };
  vm.runInNewContext(source, scope);
  function respond(request) {
    let response;
    callbacks.get('fetch')({ request, respondWith: value => { response = value; } });
    return response;
  }
  return { respond, requests, callbacks };
}

const navRequest = () => ({ method: 'GET', url: origin, mode: 'navigate' });

test('PWA navigation always attempts network and bypasses HTTP cache even when precached', async () => {
  const h = workerHarness({ cached: new Response('stale') });
  const response = await h.respond(navRequest());
  assert.equal(await response.text(), 'network');
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0][1].cache, 'no-store');
});

test('PWA navigation falls back to precached document while offline', async () => {
  const h = workerHarness({ fetchImpl: async () => { throw new Error('offline'); }, cached: new Response('cached shell') });
  const response = await h.respond(navRequest());
  assert.equal(await response.text(), 'cached shell');
});

test('PWA navigation always resolves to a valid offline response even when CacheStorage fails', async () => {
  const h = workerHarness({ fetchImpl: async () => { throw new Error('offline'); }, cacheError: new Error('cache failed') });
  const response = await h.respond(navRequest());
  assert.equal(response.status, 503);
  assert.match(await response.text(), /ngoại tuyến/);
});

test('PWA static cache failures retry through network', async () => {
  const h = workerHarness({ cacheError: new Error('storage unavailable') });
  const response = await h.respond({ method: 'GET', url: `${origin}assets/index-123.js`, mode: 'cors' });
  assert.equal(await response.text(), 'network');
  assert.equal(h.requests.length, 1);
});
