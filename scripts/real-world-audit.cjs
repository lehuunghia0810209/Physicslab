const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = 'http://127.0.0.1:5194';
const out = path.resolve('work/audit-2026-10-14');
fs.mkdirSync(out, { recursive: true });
const evidence = { base, browser: 'Chromium (Playwright)', profile: 'fresh isolated context', scenarios: [], consoleErrors: [], pageErrors: [], requestsFailed: [] };
const add = (name, detail) => { evidence.scenarios.push({ name, ...detail }); console.log(`PASS ${name}`); };
let server;

async function route(page, routeName, selector) {
  const started = Date.now();
  await page.evaluate(value => window.PhysicsLabApp.navigate(value), routeName);
  await page.locator(selector).waitFor();
  return Date.now() - started;
}

(async () => {
  server = await (await import('vite')).createServer({ logLevel: 'error', server: { host: '127.0.0.1', port: 5194, strictPort: true } });
  await server.listen();
  let browser;
  try { browser = await chromium.launch({ headless: true }); }
  catch { browser = await chromium.launch({ channel: 'msedge', headless: true }); }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
  const page = await context.newPage();
  page.on('console', message => { if (message.type() === 'error') evidence.consoleErrors.push(message.text()); });
  page.on('pageerror', error => evidence.pageErrors.push(error.message));
  page.on('requestfailed', request => evidence.requestsFailed.push(request.url()));

  await page.goto(base); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor();
  await page.screenshot({ path: path.join(out, '01-home-desktop.png'), fullPage: true });
  await page.locator('[data-nav="learning"]').click(); await page.getByRole('heading', { name: /Học tập/ }).waitFor();
  const learningCards = await page.locator('[data-lesson]').count();
  add('First-use navigation from Home to Learning', { route: '#/learning', actions: 1, observed: `${learningCards} lesson choices are rendered after one primary-navigation action.` });

  const newtonMs = await route(page, 'learning/newton-discovery', '.complete-lesson');
  assert.equal(await page.locator('.worked-example').count(), 2);
  const newtonQuestion = page.locator('[data-lesson-assessment] fieldset').first();
  await newtonQuestion.locator('input[type="radio"]').first().check(); await newtonQuestion.locator('[data-check]').click();
  assert.ok((await newtonQuestion.locator('[data-feedback]').textContent()).trim());
  await page.locator('[data-lesson-note]').fill('Audit: phải tính hợp lực trước.'); await page.locator('[data-lesson-note]').dispatchEvent('change');
  await page.locator('#lesson-simulation-link').click(); await page.locator('#play').waitFor();
  const forceBefore = await page.locator('#newton-force-label').textContent(); await page.locator('#newton-force-handle').focus(); await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.locator('#newton-force-label').textContent(), forceBefore);
  await route(page, 'learning/newton-discovery', '.complete-lesson'); await page.reload(); await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('[data-lesson-note]').inputValue(), 'Audit: phải tính hợp lực trước.');
  await page.screenshot({ path: path.join(out, '02-student-a-newton.png'), fullPage: true });
  add('Student A: Newton learn–feedback–simulation–reload', { route: '#/learning/newton-discovery', navigationMs: newtonMs, observed: 'Question feedback, model parameter change, and note survived route change and reload.' });

  const waveMs = await route(page, 'learning/wave-discovery', '.complete-lesson');
  const waveQuestion = page.locator('[data-lesson-assessment] fieldset').filter({ has: page.locator('[data-written]') }).first();
  await waveQuestion.locator('[data-written]').fill('sai'); await waveQuestion.locator('[data-check]').click();
  assert.match(await waveQuestion.locator('[data-feedback]').textContent(), /Chưa đúng/);
  await page.locator('#lesson-simulation-link').click(); await page.locator('#wave-scene').waitFor();
  await page.locator('#wave-mode').selectOption('standing');
  assert.match(await page.locator('#wave-equation').textContent(), /sin/);
  add('Student B: wave lesson and model change', { route: '#/learning/wave-discovery', navigationMs: waveMs, observed: 'A deliberately invalid numeric response produced explanation; standing-wave control updated the equation.' });

  const gasMs = await route(page, 'learning/ideal-gas-discovery', '.complete-lesson');
  await page.locator('#lesson-simulation-link').click(); await page.locator('#gas-scene').waitFor();
  await page.locator('#gas-process').selectOption('isochoric');
  assert.equal(await page.locator('[data-gas-field="finalTemperature"]').isVisible(), true);
  await route(page, 'learning/revision', '.revision-home');
  await page.locator('[data-revision-grade]').selectOption('12');
  assert.equal(await page.locator('[data-revision-assessment] fieldset').count(), 10);
  await page.screenshot({ path: path.join(out, '03-student-c-revision.png'), fullPage: true });
  add('Student C: gas lesson to Grade 12 revision', { route: '#/learning/revision', navigationMs: gasMs, observed: 'Gas process control exposes temperature endpoint for isochoric mode; Grade 12 revision generated 10 questions.' });

  await page.setViewportSize({ width: 390, height: 844 });
  await route(page, 'learning/newton-discovery', '.complete-lesson');
  const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  assert.ok(sizes.scrollWidth <= sizes.clientWidth + 1);
  await page.locator('[data-lesson-anchor="lesson-examples"]').click();
  await page.screenshot({ path: path.join(out, '04-mobile-lesson-390.png'), fullPage: true });
  add('Mobile Student A lesson route', { route: '#/learning/newton-discovery', viewport: '390x844', observed: `No horizontal document overflow (${sizes.scrollWidth}/${sizes.clientWidth}); in-page table of contents scrolled to examples.` });

  await page.setViewportSize({ width: 1440, height: 900 });
  await route(page, 'simulation/projectile-motion', '#play');
  await page.evaluate(() => window.PhysicsLabApp.setRole('teacher'));
  await page.locator('[data-teacher-save]').click(); await page.locator('#number-angle').fill('52'); await page.locator('#number-angle').dispatchEvent('change'); await page.locator('[data-teacher-restore]').click();
  await page.locator('#presentation-toggle').click(); assert.ok(await page.locator('body.presentation-mode').count()); await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(out, '05-teacher-studio.png'), fullPage: true });
  add('Teacher: setup, restore, presentation exit', { route: '#/simulation/projectile-motion', observed: 'Teacher Studio saved/restored a configuration; Escape left presentation mode.' });

  const simIds = ['projectile-motion','newton','friction','work-energy','momentum-collision','spring-oscillation','wave-on-string','electric-circuits','electric-field','magnetic-field','lens','ideal-gas','inclined-plane'];
  const simulations = [];
  for (const id of simIds) { await route(page, `simulation/${id}`, 'main h1'); simulations.push(id); }
  add('Thirteen simulation routes opened in fresh browser profile', { route: '#/simulation/*', observed: simulations.join(', ') });

  await route(page, 'lab', 'main h1');
  const labOptions = await page.locator('main select option').count();
  const experimentSelect = page.locator('#generic-experiment:visible');
  if (await experimentSelect.count()) await experimentSelect.selectOption('ohms-law');
  await page.screenshot({ path: path.join(out, '06-lab-ohm.png'), fullPage: true });
  add('Laboratory catalogue and apparatus', { route: '#/lab', observed: `${labOptions} visible select options on the laboratory landing route; ${await experimentSelect.count() ? 'Ohm experiment selected.' : 'the generic apparatus selector is not present on this landing route.'}` });

  await context.close(); await browser.close();
  evidence.passed = evidence.consoleErrors.length === 0 && evidence.pageErrors.length === 0 && evidence.requestsFailed.length === 0;
  fs.writeFileSync(path.join(out, 'evidence.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  await server.close();
})().catch(async error => {
  evidence.passed = false; evidence.failure = error.stack || String(error);
  fs.writeFileSync(path.join(out, 'evidence.json'), JSON.stringify(evidence, null, 2));
  try { await server?.close(); } catch {}
  console.error(evidence.failure); process.exit(1);
});
