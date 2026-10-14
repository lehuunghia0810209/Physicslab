/* PhysicsLab offline worker. CACHE and ASSETS are injected by vite.config.js. */
const OFFLINE_SHELL = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  // A release activates only when *every* lazy-loaded bundle is cached.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

// Preserve the two preceding releases so an already-open tab can still load
// hashed lazy chunks after deployment. Cloudflare may no longer host old hashes.
// CacheStorage.keys() returns caches in their creation order.
const CACHE_PREFIX = 'physicslab-static-';
const VALID_RELEASE_CACHE = /^physicslab-static-[0-9a-f]{12}$/;
const PREVIOUS_RELEASES_TO_KEEP = 2;

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previous = keys.filter(key => VALID_RELEASE_CACHE.test(key) && key !== CACHE);
    const keep = new Set([CACHE, ...previous.slice(-PREVIOUS_RELEASES_TO_KEEP)]);
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && !keep.has(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  // Do not silently update while a learner is entering notes.
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

async function navigate(request) {
  // NEVER serve a potentially stale precached index while online. That index
  // can refer to an older set of bundles after a Cloudflare deployment.
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch {
    try {
      const cached = await caches.match(OFFLINE_SHELL, { ignoreVary: true });
      if (cached) return cached;
    } catch { /* CacheStorage may be blocked; still give a valid HTTP response. */ }
    return new Response('<!doctype html><html lang="vi"><meta charset="utf-8"><title>PhysicsLab ngoại tuyến</title><body><h1>Chưa thể mở PhysicsLab khi ngoại tuyến</h1><p>Kết nối Internet và tải lại trang để tải dữ liệu học tập.</p></body></html>', {
      status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

async function loadStatic(request) {
  // Immutable hashed assets are safe to serve from the active version's cache.
  // Fall back to network if cache lookup itself fails (e.g. browser storage errors).
  try {
    const cached = await caches.match(request, { ignoreVary: true });
    if (cached) return cached;
  } catch { /* Retry through the network instead of failing the fetch event. */ }
  return fetch(request);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
  } else if (!url.pathname.endsWith('/sw.js')) {
    event.respondWith(loadStatic(request));
  }
});
