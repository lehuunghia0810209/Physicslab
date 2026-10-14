const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

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

    // Regression: after the worker controls the page, network HTML must win over
    // the precached copy. This fails with the old cache-first navigation handler.
    const htmlPath = path.resolve('dist/index.html');
    const originalHtml = await fs.readFile(htmlPath, 'utf8');
    try {
      const freshHtml = originalHtml.replace('</head>', '<meta name="physicslab-network-document" content="fresh"></head>');
      assert.notEqual(freshHtml, originalHtml);
      await fs.writeFile(htmlPath, freshHtml);
      for (let n = 0; n < 10; n++) {
        await page.reload({ waitUntil: 'load' });
        await page.getByRole('heading', { name: /Hôm nay/ }).waitFor();
        assert.equal(await page.locator('meta[name="physicslab-network-document"]').count(), 1,
          `Navigation ${n + 1} came from old cached HTML instead of the network`);
      }
      console.log('PASS Service worker uses live network HTML over cached HTML on 10 successive reloads');
    } finally {
      await fs.writeFile(htmlPath, originalHtml);
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
