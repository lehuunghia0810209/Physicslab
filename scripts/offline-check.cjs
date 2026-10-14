const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const { preview } = await import('vite');
  const server = await preview({ preview: { host: '127.0.0.1', port: 5190, strictPort: true } });
  let browser;
  try { browser = await chromium.launch({ headless: true }); }
  catch { browser = await chromium.launch({ channel: 'msedge', headless: true }); }
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/sw.js', route => route.abort());
    await page.goto('http://127.0.0.1:5190/');
    await page.evaluate(() => caches.open('physicslab-static-obsolete'));
    await page.unroute('**/sw.js'); await page.reload();
    await page.getByRole('heading', { name: /Hôm nay/ }).waitFor();
    await page.waitForFunction(() => navigator.serviceWorker.controller && navigator.serviceWorker.ready);
    const initialCaches = await page.evaluate(() => caches.keys());
    assert.equal(initialCaches.filter(name => name.startsWith('physicslab-static-')).length, 1);
    const cachedUrls = await page.evaluate(async name => (await (await caches.open(name)).keys()).map(request => request.url), initialCaches[0]);
    for (const group of ['projectile-', 'learning-', 'lab-', 'tools-', 'explorer3d-']) {
      assert.ok(cachedUrls.some(url => url.includes(group)), `${group} feature bundle missing from precache`);
    }

    await context.setOffline(true);
    await page.reload(); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor();
    await page.evaluate(() => { location.hash = '#/simulation/projectile-motion'; });
    await page.locator('#play').waitFor({ state: 'attached' });
    assert.equal(await page.locator('.empty-state').count(), 0);
    console.log('PASS Production shell and a lazy simulation run offline; Learning, Lab, Tools and 3D bundles are in the versioned precache');
    console.log('PASS Activation removes obsolete PhysicsLab caches only after a complete replacement installs');
  } finally {
    await browser?.close();
    await server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
