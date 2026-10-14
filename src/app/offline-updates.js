/** Optional production-only SW update prompt. Never silently replaces in-progress notes. */
export function installOfflineUpdateNotice(registration, { documentRoot = document, nav = navigator, reload = () => location.reload() } = {}) {
  if (!registration || !documentRoot?.body || !nav?.serviceWorker) return () => {};
  const abort = new AbortController();
  let dismissed = false;
  let notice = null;
  let requestedUpdate = false;
  const cleanup = () => { notice?.remove(); notice = null; };
  function show() {
    if (dismissed || !nav.serviceWorker.controller || !registration.waiting || notice) return;
    notice = documentRoot.createElement('aside');
    notice.className = 'offline-update-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.innerHTML = '<p><strong>PhysicsLab có bản mới</strong><span>Bạn có thể cập nhật sau khi lưu nội dung đang làm.</span></p><div><button type="button" data-offline-later>Để sau</button><button type="button" data-offline-refresh>Cập nhật</button></div>';
    documentRoot.body.appendChild(notice);
    notice.querySelector('[data-offline-later]').addEventListener('click', () => { dismissed = true; cleanup(); }, { signal: abort.signal });
    notice.querySelector('[data-offline-refresh]').addEventListener('click', () => {
      if (!registration.waiting) return;
      // Give pending notebook edits a synchronous chance to persist before activation.
      documentRoot.defaultView?.dispatchEvent?.(new Event('physicslab:before-update'));
      requestedUpdate = true;
      notice.querySelector('[data-offline-refresh]').disabled = true;
      notice.querySelector('[data-offline-refresh]').textContent = 'Đang cập nhật…';
      registration.waiting.postMessage('SKIP_WAITING');
    }, { signal: abort.signal });
  }
  const found = () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => { if (worker.state === 'installed') show(); }, { signal: abort.signal });
  };
  const controlled = () => { if (requestedUpdate) reload(); };
  registration.addEventListener('updatefound', found, { signal: abort.signal });
  nav.serviceWorker.addEventListener('controllerchange', controlled, { signal: abort.signal });
  show();
  return () => { abort.abort(); cleanup(); };
}
