# PhysicsLab PWA — stale lazy-chunk recovery

## Symptom

`Failed to fetch dynamically imported module` on routes such as `#/simulation/newton` or `#/tools` after a Cloudflare Pages deployment. The URL often includes an old content-hashed `/assets/*.js` file. This is a deployment/browser-cache compatibility issue, not a physics-model error. A network outage or missing deployment asset may cause the same message; verify the failed request's HTTP status in DevTools.

## Root cause and mitigation

Pages deployed by Vite use content-hashed chunks. A tab left open during a deployment can retain old JavaScript that requests chunks no longer served by the latest deployment. Previously, the Service Worker deleted every older `physicslab-static-*` cache as soon as a new version activated. This prematurely discarded old chunks needed by existing tabs.

- `scripts/service-worker-runtime.js` keeps the current and two previous *valid hashed* precaches. Older/invalid obsolete caches are still deleted. HTML navigation stays network-first; no stored user data is erased.
- `src/app/router.js` detects only known lazy-import transport errors and provides a **Cập nhật và thử lại** action. The action dispatches `physicslab:before-update` so current notes can flush, then reloads the latest HTML. Ordinary application errors are still shown without a forced refresh.
- `scripts/offline-check.cjs` now opens both Newton and Tools with a controlling Service Worker after repeated reloads. Unit tests exercise retained release caches and stale-asset requests.

## Reproducing/validating in production

1. Back up learning data from **Công cụ → Sao lưu đầy đủ JSON** if available.
2. Deploy to Cloudflare Pages from an unchanged release source with `npm run check:release` passing.
3. In Chrome/Cốc Cốc DevTools → Application → Service Workers, **disable** `Bypass for network`.
4. Open Newton and Tools, refresh repeatedly, then repeat in an old tab while deploying another version.
5. In Network, the requested `/assets/*.js` must return an actual JavaScript response (200, correct MIME), never a 404/HTML error. Verify the network, deployment and PWA worker if requests still fail.
6. If a pre-hotfix worker has already cached an outdated shell, **Unregister only the old Service Worker once** and reload. Do **not** clear site data, which can erase local learning progress.

The worker does not guarantee that assets older than two releases remain available forever; very old open tabs are offered a safe reload when a chunk is missing. These tests do not certify the public Cloudflare deployment without checking its status and actual HTTP asset responses.
