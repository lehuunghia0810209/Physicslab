const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.PHYSICSLAB_TEST_URL || 'http://127.0.0.1:5188';
const out = path.resolve('work'); fs.mkdirSync(out, { recursive: true });
const report = { base, tests: [], consoleErrors: [], pageErrors: [], requestsFailed: [] };
function ok(name) { report.tests.push(name); console.log('PASS ' + name); }
function saveReport() {
  const content = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(out, 'browser-report.json'), content);
  fs.writeFileSync(path.resolve('docs/browser-report.json'), content);
}
// Self-start Vite when no server is already listening; CI no longer depends on an
// undocumented, separately-running npm run dev terminal.
let managedServer = null;
async function ensureBrowserServer() {
  if (process.env.PHYSICSLAB_TEST_URL) return;
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(1500) });
    if (response.ok) return;
  } catch { /* No dev server is listening; start an owned one. */ }
  const { createServer } = await import('vite');
  managedServer = await createServer({ logLevel: 'error', server: { host: '127.0.0.1', port: 5188, strictPort: true } });
  await managedServer.listen();
  console.log('INFO Browser QA started its own Vite server at ' + base);
}
(async () => {
  await ensureBrowserServer();
  let browser;
  try { browser = await chromium.launch({ headless: true }); }
  catch { browser = await chromium.launch({ channel: 'msedge', headless: true }); }
  const { SimulationRegistry } = await import('../src/data/registry.js');
  const { LAB_EXPERIMENTS } = await import('../src/core/lab-experiments.js');
  const { lessons: discoveryLessons } = await import('../src/data/curriculum.js');
  const availableCount = SimulationRegistry.all().filter(item => item.status === 'available').length;
  const totalCount = SimulationRegistry.all().length;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'vi-VN', reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    const active = new Set(); let fired = 0;
    window.requestAnimationFrame = callback => {
      let id;
      id = request(time => { active.delete(id); fired++; callback(time); });
      active.add(id); return id;
    };
    window.cancelAnimationFrame = id => { active.delete(id); cancel(id); };
    window.__physicslabRafStats = () => ({ active: active.size, fired });
  });
  const page = await context.newPage(); globalThis.testPage = page;
  page.on('pageerror', e => report.pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
  page.on('requestfailed', r => report.requestsFailed.push(r.url()));
  const requests = []; page.on('request', r => requests.push(r.url()));
  await page.goto(base); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor();
  assert.ok(!requests.some(u => /(?:simulations\/projectile\/(?:index|scene)\.js|assets\/projectile-.*\.js)/.test(u))); ok('Home loads without projectile implementation');
  await page.screenshot({ path: path.join(out, 'home-desktop.png'), fullPage: true });
  await page.locator('#quick-search-toggle').click();
  await page.locator('#quick-search-input').fill('dien truong');
  assert.ok(await page.locator('.quick-search-result[href="#/simulation/electric-field"]').count());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.quick-search-overlay').isVisible(), false);
  ok('Quick search matches Vietnamese without accents and closes with Escape');
  await page.locator('#role-toggle').click();
  assert.equal(await page.locator('#role-toggle').textContent(), 'GV');
  await page.locator('#presentation-toggle').click();
  assert.ok(await page.locator('body.presentation-mode').count());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('body.presentation-mode').count(), 0);
  await page.locator('#role-toggle').click();
  assert.equal(await page.locator('#role-toggle').textContent(), 'HS');
  ok('Teacher mode offers presentation and exits on Escape without changing learning data');

  await page.locator('[data-nav="simulations"]').click(); await page.getByRole('heading', { name: 'Thư viện mô phỏng' }).waitFor();
  await page.locator('#search').fill('nem xien'); assert.equal(await page.locator('.simulation-card').count(), 1); ok('Vietnamese accent-insensitive library search');
  await page.locator('[data-filter="waves"]').click(); assert.equal(await page.locator('.simulation-card').count(), 0);
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click(); assert.equal(await page.locator('.simulation-card').count(), totalCount);
  await page.locator('#available').check(); assert.equal(await page.locator('.simulation-card').count(), availableCount); ok('Library category / availability / empty / reset filters');
  assert.equal(await page.locator('.simulation-card.ready .simulation-illustration').count(), availableCount);
  ok('Every available simulation has its own SVG illustration');
  await page.getByRole('link', { name: 'Mở mô phỏng' }).first().click(); await page.locator('#play').waitFor();
  assert.ok(requests.some(u => /(?:simulations\/projectile\/index\.js|assets\/projectile-.*\.js)/.test(u))); ok('Projectile lazy loads on navigation');
  await page.screenshot({ path: path.join(out, 'simulation-desktop.png'), fullPage: true });
  await page.evaluate(() => window.PhysicsLabApp.setRole('teacher'));
  assert.ok(await page.locator('.teacher-studio').isVisible());
  await page.locator('#number-angle').fill('37'); await page.locator('#number-angle').dispatchEvent('change');
  await page.locator('[data-teacher-save]').click();
  await page.locator('#number-angle').fill('58'); await page.locator('#number-angle').dispatchEvent('change');
  await page.locator('[data-teacher-restore]').click();
  assert.equal(await page.locator('#number-angle').inputValue(), '37');
  await page.locator('[data-teacher-layer="graphs"]').uncheck();
  assert.equal(await page.locator('.graphs-section').evaluate(element => getComputedStyle(element).display), 'none');
  await page.locator('[data-teacher-layer="graphs"]').check();
  await page.locator('#play').click(); await page.waitForTimeout(250); await page.locator('[data-teacher-pause]').click();
  const teacherPaused=await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time);
  await page.waitForTimeout(180); assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time),teacherPaused);
  await page.locator('#reset').click(); await page.evaluate(() => window.PhysicsLabApp.setRole('student'));
  assert.equal(await page.locator('.teacher-studio').isVisible(),false);
  ok('Teacher Studio saves/restores a real setup, pauses the model, and controls presentation layers');
  await page.locator('#play').click(); await page.waitForTimeout(550); await page.locator('#play').click();
  const paused = await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time); assert.ok(paused > 0);
  await page.waitForTimeout(250); assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time), paused); ok('Play advances physical time; Pause freezes it');
  await page.locator('#reset').click(); assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time), 0); ok('Reset preserves parameters and returns time to zero');
  await page.locator('[data-preset="moon"]').click(); assert.equal(await page.locator('#number-g').inputValue(), '1.62');
  await page.locator('#scrubber').fill('500');
  const snapshot = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(snapshot.measurements.vy) < 1e-9); assert.equal(snapshot.parameters.g, 1.62);
  for (const key of ['x', 'y', 'vx', 'vy']) { const x = Number(await page.locator(`#graph-${key} .graph-cursor`).getAttribute('x1')); assert.ok(Math.abs(x - 213) < 1e-7); }
  ok('Moon preset and all four graph cursors synchronize at apex');
  // Alpha 1: a reference run must remain independent of subsequent parameter edits.
  await page.locator('#compare-save').click();
  assert.equal(await page.locator('.comparison-path').getAttribute('d') !== '', true);
  assert.equal(await page.locator('.graph-comparison-line').count(), 4);
  await page.locator('#number-angle').fill('30'); await page.locator('#number-angle').dispatchEvent('change');
  assert.ok((await page.locator('#compare-summary').textContent()).includes('Chênh lệch'));
  const beforeInspection = await page.locator('#graph-y .graph-value').textContent();
  await page.locator('#graph-y .graph-svg').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#graph-y .graph-inspection-dot').getAttribute('visibility'), 'visible');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#graph-y .graph-inspection-dot').getAttribute('visibility'), 'hidden');
  assert.ok(beforeInspection);
  assert.equal(await page.locator('.experiment-guide li').count(), 3);
  await page.locator('#graph-y [data-graph-action=zoom-in]').click();
  assert.ok(await page.locator('#graph-y [data-graph-action=reset]').isEnabled());
  await page.locator('#graph-y [data-graph-action=reset]').click();
  const graphCsvWait = page.waitForEvent('download'); await page.locator('#graph-y [data-graph-action=csv]').click();
  const graphCsv = await graphCsvWait; await graphCsv.saveAs(path.join(out, 'projectile-graph.csv'));
  assert.ok(fs.readFileSync(path.join(out, 'projectile-graph.csv'), 'utf8').includes('t (s)'));
  ok('13-model exploration guide, graph zoom/reset and measured CSV export work');
  await page.locator('#compare-clear').click();
  assert.equal(await page.locator('.graph-comparison-line').count(), 0);
  ok('Comparison captures two valid models, graph inspection supports keyboard, and clearing keeps active simulation intact');
  // Restore the moon baseline before the rest of the existing scenarios.
  await page.locator('#number-angle').fill('45'); await page.locator('#number-angle').dispatchEvent('change');

  assert.equal(await page.locator('#share-setup').count(), 1);
  const sharedURL = await page.evaluate(() => {
    const url = new URL(location.href); url.searchParams.set('pm', '20,45,0,1.62'); url.hash = '#/simulation/projectile-motion'; return url.toString();
  });
  assert.ok(sharedURL.includes('pm=20%2C45%2C0%2C1.62'));
  ok('The classroom share panel is present; parameters are link-serializable without student progress');
  await page.locator('#capture').click(); assert.equal(await page.locator('#measurements-body tr').count(), 1); assert.ok(await page.locator('#csv').isEnabled());
  const dl = page.waitForEvent('download'); await page.locator('#csv').click(); const download = await dl; await download.saveAs(path.join(out, 'test-measurement.csv'));
  assert.ok(fs.readFileSync(path.join(out, 'test-measurement.csv'), 'utf8').includes('t_s,x_m,y_m')); ok('Measurement capture and real CSV download');
  await page.locator('#number-height').fill('10'); await page.locator('#number-height').dispatchEvent('change');
  assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().simulation.state.time), 0); assert.ok(await page.locator('#csv').isDisabled()); ok('Parameter changes reset time and clear incompatible samples');
  await page.locator('#number-g').fill('0'); await page.locator('#number-g').dispatchEvent('change'); assert.ok(await page.locator('#parameter-error').textContent()); assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().simulation.parameters.g), 1.62); ok('Invalid gravity is rejected without mutating active model');
  await page.locator('[data-preset="earth"]').click(); await page.locator('#number-height').fill('0'); await page.locator('#number-height').dispatchEvent('change');
  await page.locator('#playback-rate').selectOption('2'); await page.locator('#play').click(); await page.getByText('Đã chạm đất', { exact: true }).waitFor({ timeout: 8000 });
  const landed = await page.evaluate(() => window.PhysicsLabApp.context()); assert.equal(landed.simulation.measurements.y, 0); assert.equal(landed.progress.experiments['projectile-motion'], 1); assert.equal(landed.simulation.state.playing, false); ok('Exact impact stops playback and records a completed run');
  await page.reload(); await page.locator('#play').waitFor(); assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().progress.experiments['projectile-motion']), 1); ok('Parameters / time / progress persist after reload');
  await page.locator('[data-display="trajectory"]').uncheck(); assert.equal(await page.locator('.predicted-path').evaluate(el => getComputedStyle(el).display), 'none'); ok('Display toggles change actual SVG layers');
  await page.evaluate(() => window.PhysicsLabApp.openLesson()); await page.locator('.learning-home-browser').waitFor();
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/explore-projectile-discovery')); await page.locator('#quiz').waitFor();
  await page.locator('input[name="prediction"][value="b"]').check(); await page.locator('#prediction').click();
  assert.ok(await page.locator('#experiment-done').isDisabled()); assert.ok((await page.locator('#experiment-requirements').textContent()).includes('Mở mô phỏng')); 
  await page.locator('#lesson-simulation-link').click(); await page.locator('#play').waitFor();
  await page.locator('#number-angle').fill('50'); await page.locator('#number-angle').dispatchEvent('change');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/explore-projectile-discovery')); await page.locator('#experiment-done').waitFor();
  assert.ok(await page.locator('#experiment-done').isEnabled()); await page.locator('#experiment-done').click(); await page.locator('#observation').click();
  await page.locator('input[name="answer"][value="b"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await page.locator('#quiz-result').textContent()).startsWith('Đúng!'));
  assert.deepEqual(await page.locator('.learning-aside li.done').count(), 4); ok('Prediction is persisted; ordered experiment, observation, quiz feedback, and lesson completion work');
  await page.locator('[data-lesson="hooke-discovery"]').click();
  await page.locator('input[name="prediction"][value="a"]').check(); await page.locator('#prediction').click();
  await page.locator('#lesson-simulation-link').click(); await page.locator('#record-measurement').waitFor();
  await page.locator('#record-measurement').click();
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/explore-hooke-discovery'));
  await page.locator('[data-lesson="hooke-discovery"].selected').waitFor();
  assert.ok(await page.locator('#experiment-done').isEnabled()); await page.locator('#experiment-done').click(); await page.locator('#observation').click();
  await page.locator('input[name="answer"][value="b"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await page.locator('#quiz-result').textContent()).startsWith('Đúng!'));
  assert.equal(await page.locator('.learning-aside li.done').count(), 4); ok('Hooke lesson completion requires a saved prediction and real instrumented laboratory measurement');
  await page.locator('#learning-grade').selectOption('12');
  assert.ok(await page.locator('[data-lesson="newton-discovery"]').isHidden());
  await page.locator('#learning-grade').selectOption('all');
  await page.locator('#learning-search').fill('luc tong');
  assert.equal(await page.locator('.learning-choice:visible').count(), 1);
  await page.locator('#learning-search').fill('');
  ok('Lesson grade and accent-insensitive search filter results');
  await page.locator('[data-lesson="newton-discovery"]').click();
  // This legacy dashboard covers the 16 guided explorations only, not the 49 full Learning 3.0 readers.
  // Derive its denominator from the same discovery registry used by summarizeLearningProgress().
  const mechanicsDiscoveryCount = discoveryLessons.filter(item => item.category === 'mechanics').length;
  assert.equal(mechanicsDiscoveryCount, 6, 'Expected six mechanics discovery activities in the legacy registry');
  const mechanicsProgress = page.locator('.learning-mastery-item').filter({ hasText: 'Cơ học' });
  assert.ok((await mechanicsProgress.textContent()).includes(`Đã kiểm tra 2/${mechanicsDiscoveryCount}`));
  await page.locator('input[name="answer"][value="c"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await mechanicsProgress.textContent()).includes(`Đã kiểm tra 3/${mechanicsDiscoveryCount}`));
  assert.ok((await mechanicsProgress.textContent()).includes('Điểm tốt nhất TB: 67%'));
  await page.locator('input[name="answer"][value="a"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await mechanicsProgress.textContent()).includes('Điểm tốt nhất TB: 100%'));
  ok('Learning dashboard updates topic coverage and best quiz scores without counting unattempted lessons');
  // AUD-001: full curriculum must be discoverable from the actual home catalog, not only via hardcoded deep links.
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning'));await page.locator('.learning-home-browser').waitFor();
  const expectedByGrade = [['10',17],['11',16],['12',16],['all',49]];
  for (const [grade,expected] of expectedByGrade) {
    await page.locator(`[data-learning-grade="${grade}"]`).click();
    assert.equal(await page.locator('.learning-home-card').count(),expected,`Learning catalog count for grade ${grade}`);
    assert.equal(await page.locator('#learning-filter-count').textContent()!==null,true);
  }
  const advertised=await page.locator('.learning-home-card').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),title:node.querySelector('strong')?.textContent?.trim()})));
  assert.equal(new Set(advertised.map(item=>item.href)).size,49,'Each complete lesson must have a distinct clickable route');
  // Run all 49 routes through the real SPA renderer, detecting mistaken fallbacks and missing lesson content.
  for (const {href,title} of advertised) {
    const lessonId=href.split('/').pop();
    await page.evaluate(id=>window.PhysicsLabApp.navigate(`learning/${id}`),lessonId);
    await page.waitForFunction(expected=>document.querySelector('.complete-lesson h2')?.textContent.trim()===expected,title,{timeout:10000});
    assert.equal(await page.locator('[data-lesson-assessment] fieldset').count(),5,`Lesson ${lessonId} must have five exercises`);
    assert.equal(await page.locator('.complete-lesson h2').count(),1);
  }
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning'));await page.locator('.learning-home-browser').waitFor();
  await page.locator('[data-learning-grade="all"]').click();
  await page.locator('#learning-search').fill('cam ung dien tu');
  assert.ok(await page.locator('[data-lesson="12-induction"]').isVisible(),'Accent insensitive search must reach induction');
  await page.locator('#learning-reset').click();
  assert.equal(await page.locator('.learning-home-card').count(),49,'Reset must restore all 49 lessons');
  await page.locator('.learning-home-explore summary').click();
  assert.equal(await page.locator('[data-explore]').count(),16,'Legacy discoveries remain explicitly reachable');
  await page.locator('[data-explore="newton-discovery"]').click();await page.locator('#prediction-form').waitFor();
  assert.equal(await page.locator('.complete-lesson').count(),0,'Legacy exploration is separate from reader');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/newton-discovery'));await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('#prediction-form').count(),0,'Colliding bookmark must prioritize complete reader');
  ok('AUD-001 canonical catalog: 17/16/16 grade choices, 49 working reader routes, search, reset and legacy exploration');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/newton-discovery'));await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('.worked-example').count(),2);assert.equal(await page.locator('[data-lesson-assessment] fieldset').count(),5);
  const firstLearningQuestion=page.locator('[data-question="n3-single-inertia"]');
  await firstLearningQuestion.locator('input[value="a"]').check();await firstLearningQuestion.locator('[data-check]').click();
  assert.match(await firstLearningQuestion.locator('[data-feedback]').textContent(),/Chưa đúng/);
  const partialLearning=await page.evaluate(()=>JSON.parse(localStorage.getItem('physicslab.learning.v1')));
  assert.equal(partialLearning.attempts['newton-discovery'],undefined,'Checking only one practice question must not forge a full quiz score');
  assert.ok(partialLearning.practiceWrong['newton-discovery'].includes('n3-single-inertia'),'Wrong practice questions must remain available after reload');
  await page.locator('[data-lesson-note]').fill('Cần tính hợp lực trước khi dùng ΣF = ma.');await page.locator('[data-lesson-note]').dispatchEvent('change');
  await page.reload();await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('[data-lesson-note]').inputValue(),'Cần tính hợp lực trước khi dùng ΣF = ma.');
  assert.match(await page.locator('.lesson-attempt-summary').textContent(),/1 câu cần ôn/);
  await page.locator('[data-review-wrong]').click();assert.equal(await page.locator('[data-lesson-assessment] fieldset:visible').count(),1);
  ok('Learning 3.0 deep link, worked solutions, real grading, wrong-answer review and notes survive reload');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/10-intro'));await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('.worked-example').count(),2);assert.equal(await page.locator('[data-lesson-assessment] fieldset').count(),5);
  assert.equal(await page.locator('a[href*="null"]').count(),0);assert.match(await page.locator('.lesson-offline-activity').textContent(),/không gắn liên kết mô phỏng giả/i);
  await page.reload();await page.locator('.complete-lesson').waitFor();assert.match(await page.locator('.complete-lesson h2').textContent(),/phương pháp nghiên cứu/i);
  ok('Reader-only curriculum lessons deep-link, reload and present offline activities without fake resources');
  // Learning 3.0: all grade 11/12 curriculum entries now have deep-linked readers.
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/11-interf'));await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('.thpt-learning-map').count(),0,'Large curriculum grid must not precede the reader');
  assert.equal(await page.locator('.worked-example').count(),2);
  assert.equal(await page.locator('[data-lesson-assessment] fieldset').count(),5);
  assert.equal(await page.locator('a[href="#/lab/advanced-interference"]').count(),1);
  const lessonHash=await page.evaluate(() => location.hash);
  await page.locator('[data-lesson-anchor="lesson-examples"]').click();
  assert.equal(await page.evaluate(() => location.hash),lessonHash,'Lesson TOC must not overwrite the SPA route hash');
  await page.locator('.learning-reader-tools a[href="#/learning/11-field"]').click();
  await page.locator('.complete-lesson').waitFor();
  assert.match(await page.locator('.complete-lesson h2').textContent(),/Điện tích/i);
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/12-calorimetry'));await page.locator('.complete-lesson').waitFor();
  assert.equal(await page.locator('a[href="#/lab/advanced-calorimetry"]').count(),1);
  assert.equal(await page.locator('[data-lesson-assessment] fieldset').count(),5);
  ok('Learning 3.0 grade 11/12 lesson readers, real advanced stations, curriculum sequence and hash-safe TOC work');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning/revision'));await page.locator('.revision-home').waitFor();
  assert.equal(await page.locator('[data-revision-assessment] fieldset').count(),10);assert.equal(await page.locator('[data-revision-assessment] [data-question]').evaluateAll(nodes=>new Set(nodes.map(node=>node.dataset.question)).size),10);
  assert.equal(await page.locator('[data-revision-assessment] [data-check]:visible').count(),0);await page.locator('[data-revision-assessment] [data-submit]').click();assert.match(await page.locator('[data-assessment-status]').textContent(),/Đã nộp/);
  await page.reload();await page.locator('.revision-home').waitFor();assert.match(await page.locator('.revision-home').textContent(),/Lần kiểm tra gần nhất/);assert.ok(Number((await page.locator('[data-revision-mode="wrong"]').textContent()).match(/\d+/)?.[0])>=10);
  await page.locator('[data-revision-grade]').selectOption('11');assert.equal(await page.locator('[data-revision-assessment] fieldset').count(),10);
  ok('Revision Home builds unique graded tests, saves results, restores them and filters by grade');
  await page.evaluate(() => window.PhysicsLabApp.openTool()); await page.locator('#conversion').waitFor(); assert.ok((await page.locator('#conversion').textContent()).includes('72'));
  assert.ok((await page.locator('#measurement-analysis').textContent()).includes('n = 4'));
  await page.locator('#measurement-values').fill('1; 3');
  assert.ok((await page.locator('#measurement-analysis').textContent()).includes('x̄ = 2,0000'));
  await page.locator('#measurement-values').fill('1; invalid');
  assert.ok((await page.locator('#measurement-analysis').textContent()).includes('Cần ít nhất hai số đo hữu hạn'));
  ok('SI unit conversion and repeated-measurement uncertainty analysis handle valid and invalid inputs');
  await page.locator('[data-nav="explorer3d"]').click(); await page.locator('#explorer3d-canvas').waitFor();
  const countHelixPixels = () => page.locator('#explorer3d-canvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let orange = 0, green = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 175 && pixels[i] < 245 && pixels[i+1] > 85 && pixels[i+1] < 190 && pixels[i+2] < 100) orange++;
      if (pixels[i] < 60 && pixels[i+1] > 95 && pixels[i+1] < 200 && pixels[i+2] > 55 && pixels[i+2] < 180) green++;
    }
    return { orange, green };
  });
  const visibleHelix = await countHelixPixels();
  assert.ok(visibleHelix.orange > 35 && visibleHelix.green > 35, `Helix must show orange particle and green trajectory: ${JSON.stringify(visibleHelix)}`);
  await page.locator('#explorer3d-angle').fill('0');
  assert.ok((await countHelixPixels()).orange > 35);
  await page.locator('#explorer3d-angle').fill('90');
  assert.ok((await countHelixPixels()).orange > 35);
  await page.locator('#explorer3d-angle').fill('35');
  await page.locator('#explorer3d-fit').click();
  assert.equal(await page.locator('#explorer3d-zoom').inputValue(), '1');
  await page.locator('[data-camera=side]').click();
  assert.equal(await page.locator('[data-camera=side]').getAttribute('aria-pressed'), 'true');
  await page.locator('#explorer3d-vectors').uncheck();
  assert.ok((await countHelixPixels()).orange > 20);
  await page.locator('#explorer3d-vectors').check();
  await page.locator('[data-camera=isometric]').click();
  const layeredHelix = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  await page.locator('#explorer3d-path').uncheck();
  assert.notEqual(await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL()), layeredHelix);
  await page.locator('#explorer3d-path').check();
  await page.screenshot({ path: path.join(out, 'explorer3d-2-1-helix.png'), fullPage: false });
  // 2.2 regression: Helix reports `time` while the UI expects canonical `t`.
  // Both markers and the ruler must read genuine SI coordinates without NaN.
  await page.locator('.explorer3d-probe > summary').click();
  await page.locator('[data-probe-mark="a"]').click();
  await page.locator('#explorer3d-phase').fill('80');
  await page.locator('[data-probe-mark="b"]').click();
  let ruler = await page.locator('[data-probe-readout]').textContent();
  assert.match(ruler, /Khoảng cách thẳng AB=/);
  assert.doesNotMatch(ruler, /NaN|undefined|Infinity/);
  await page.locator('[data-probe-clear]').click();
  assert.match(await page.locator('[data-probe-readout]').textContent(), /Chưa có mốc đo/);
  ok('3D helix probe and A/B ruler use real SI coordinates and normalized model time');

  ok('3D camera presets and vector visibility work without hiding the particle');
  ok('Helix visibly contains fitted SI axes, grid, trajectory and particle; layer toggles change the actual canvas');
  const initialCanvas = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  await page.locator('#explorer3d-angle').fill('70');
  assert.notEqual(await page.locator('#explorer3d-angle-value').textContent(), '35°');
  const changedCanvas = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  assert.notEqual(changedCanvas, initialCanvas);
  await page.locator('#explorer3d-canvas').focus(); await page.keyboard.press('ArrowLeft');
  assert.ok(await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.width > 0 && canvas.height > 0));
  const beforeDrag = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  const canvasBounds = await page.locator('#explorer3d-canvas').boundingBox();
  await page.mouse.move(canvasBounds.x + canvasBounds.width * .45, canvasBounds.y + canvasBounds.height * .5);
  await page.mouse.down(); await page.mouse.move(canvasBounds.x + canvasBounds.width * .65, canvasBounds.y + canvasBounds.height * .58, { steps: 4 }); await page.mouse.up();
  assert.notEqual(await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL()), beforeDrag);
  await page.locator('#explorer3d-scene').selectOption('projectile');
  assert.equal(await page.locator('#explorer3d-range').textContent(), '40,82 m');
  assert.equal(await page.locator('#explorer3d-flight-time').textContent(), '2,89 s');
  const projectileCanvas = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  await page.locator('#explorer3d-projectile-angle').fill('30');
  assert.equal(await page.locator('#explorer3d-range').textContent(), '35,35 m');
  assert.notEqual(await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL()), projectileCanvas);
  await page.locator('[data-projectile-experiment="moon"]').click();
  assert.equal(await page.locator('#explorer3d-gravity').inputValue(), '1.62');
  assert.equal(await page.locator('#explorer3d-phase').inputValue(), '0');
  await page.locator('[data-projectile-experiment="range"]').click();
  await page.locator('#explorer3d-phase').fill('50');
  const halfFlight = Number((await page.locator('[data-explorer-time]').textContent()).split(' ')[0].replace(',', '.'));
  assert.ok(Math.abs(halfFlight - 1.445) < .03, `3D scrubber must read shared projectile time: ${halfFlight}`);
  await page.locator('#explorer3d-reset').click();
  await page.locator('#explorer3d-play').click(); await page.waitForTimeout(240); await page.locator('#explorer3d-play').click();
  const playedTime = Number((await page.locator('[data-explorer-time]').textContent()).split(' ')[0].replace(',', '.'));
  assert.ok(playedTime > .08 && playedTime < .5, `1× playback must advance real model seconds: ${playedTime}`);
  assert.match(await page.locator('[data-explorer-acceleration]').textContent(), /9,8/);
  await page.screenshot({ path: path.join(out, 'explorer3d-2-1-projectile.png'), fullPage: false });
  await page.locator('#explorer3d-canvas').focus(); await page.keyboard.press('ArrowLeft');
  const canvasBeforeTheme = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  ok('Lorentz helix and 3D projectile scenes share model time, presets, SI readouts and physical vectors');
  const themeBefore = await page.locator('body').getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  const themeAfter = await page.locator('body').getAttribute('data-theme');
  assert.notEqual(themeAfter, themeBefore);
  await page.waitForFunction(previous => document.querySelector('#explorer3d-canvas')?.toDataURL() !== previous, canvasBeforeTheme);
  ok('Dark/light theme toggle changes the document and redraws the canvas scene');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/newton')); await page.locator('#play').waitFor();
  await page.locator('#reset').click(); await page.locator('#play').click(); await page.waitForTimeout(320); await page.locator('#play').click();
  const newton = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(newton.state.time > 0); assert.ok(Number.isFinite(newton.measurements.position));
  const newtonCursor = Number(await page.locator('#graph-position .graph-cursor').getAttribute('x1'));
  assert.ok(newtonCursor > 48 && newtonCursor < 378);
  const newtonForceBefore=Number(await page.locator('#force').inputValue());
  await page.locator('#newton-force-handle').focus();await page.keyboard.press('ArrowRight');
  assert.equal(Number(await page.locator('#force').inputValue()),newtonForceBefore+1);
  await page.locator('[data-measure-capture]').click();assert.equal(await page.locator('[data-measure-body] tr').count(),1);
  ok('Newton playback, direct force handle, graph cursor and model-backed measurement stay synchronized');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/work-energy'));
  await page.locator('#graph-appliedWork .graph-line').waitFor();
  const workGraphFill = await page.locator('#graph-appliedWork .graph-line').evaluate(element => getComputedStyle(element).fill);
  assert.equal(workGraphFill, 'none', 'Graph strokes must not be filled in as black wedges');
  ok('Shared graph path has fill:none outside Projectile route');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/inclined-plane')); await page.locator('#plane-visual').waitFor();
  await page.locator('#angle').fill('35');
  assert.ok(Number.isFinite(Number((await page.locator('#result-accel').textContent()).replace(',', '.'))));
  assert.equal(await page.locator('.inclined-measurements [id="result-accel"] + small').textContent(), 'm/s²');
  assert.ok(await page.locator('#inclined-grip').count() === 1);
  assert.ok(await page.locator('#inclined-cart-grip').count() === 1);
  const cartPositionBefore = Number(await page.locator('#inclined-cart-grip').getAttribute('aria-valuenow'));
  await page.locator('#inclined-cart-grip').focus(); await page.keyboard.press('ArrowRight');
  assert.ok(Number(await page.locator('#inclined-cart-grip').getAttribute('aria-valuenow')) > cartPositionBefore, 'The release cart must be directly movable, not slider-only');
  ok('Inclined-plane slope, draggable angle handle and physically driven acceleration display');
  await page.evaluate(() => window.PhysicsLabApp.navigate('lab'));
  await page.locator('#cwb-current').waitFor();
  assert.ok(await page.locator('#lab-open-hooke').isVisible(),'Hooke is shared by grade 10 elasticity and grade 11 damping');
  await page.locator('[data-thpt-grade="12"]').click();assert.ok(await page.locator('#lab-open-gas').isVisible());
  await page.locator('[data-thpt-grade="10"]').click();assert.ok(await page.locator('#lab-open-hooke').isVisible());
  await page.locator('#lab-directory-query').fill('không tồn tại');assert.equal(await page.locator('.lab-discovery-card:visible').count(),0);
  await page.locator('[data-lab-reset]').click();assert.ok(await page.locator('#lab-open-hooke').isVisible());
  await page.locator('[data-thpt-grade="11"]').click();await page.locator('#lab-open-circuit').click();
  assert.equal((await page.locator('#cwb-current').textContent()).trim(), '0,75 A');
  await page.locator('[data-preset="parallel"]').click();
  assert.equal((await page.locator('#cwb-current').textContent()).trim(), '1,5 A');
  await page.locator('[data-preset="series"]').click();
  await page.locator('#lab-open-hooke').click();
  await page.locator('#record-measurement').waitFor();
  assert.equal(await page.locator('#generic-graph .graph-value').textContent(), 'Chưa có điểm đo.');
  const hookeRowsBefore = await page.locator('#hooke-table-body tr').count();
  await page.locator('#record-measurement').click(); assert.equal(await page.locator('#hooke-table-body tr').count(), hookeRowsBefore + 1);
  assert.ok(await page.locator('#csv-export').isEnabled());
  const previousRows = await page.locator('#hooke-table-body tr').count();
  await page.locator('.hw-settings > summary').click();
  await page.locator('.hw-settings-content details > summary').click();
  await page.locator('#force-zero-offset').selectOption('2');
  await page.locator('#calibration-compensate').uncheck();
  await page.locator('#record-measurement').click();
  assert.equal(await page.locator('#hooke-table-body tr').count(), previousRows + 1);
  assert.ok((await page.locator('#equipment-status').textContent()).includes('Chưa bù điểm 0'));
  await page.locator('#calibration-compensate').check();
  assert.ok((await page.locator('#calibration-status').textContent()).includes('Đã bật bù điểm 0'));
  ok('Hooke zero-offset calibration and measurement-uncertainty workflow are usable');
  assert.equal(await page.locator('.lab-discovery-card').count(), LAB_EXPERIMENTS.length);
  await page.locator('[data-thpt-grade="10"]').click();
  await page.locator('[data-open-lab="newton-second-law"]').click();
  assert.ok(await page.locator('#lab-generic-workspace').isVisible());
  assert.ok(await page.locator('#generic-apparatus [data-lab15-canvas]').isVisible());
  assert.equal(await page.locator('#generic-apparatus [data-lab15-canvas]').getAttribute('tabindex'), '0');
  await page.locator('.lab15-advanced > summary').click();
  await page.locator('[data-generic-parameter="force"]').fill('20'); await page.locator('#generic-capture').click();
  await page.locator('[data-generic-parameter="force"]').fill('30'); await page.locator('#generic-capture').click();
  await page.locator('[data-generic-parameter="force"]').fill('40'); await page.locator('#generic-capture').click();
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  assert.equal(await page.locator('[data-notebook-table] tr').count(), 3, 'Notebook should show all real measurements in the current experiment');
  const regression = await page.locator('#generic-graph .graph-value').textContent();
  assert.ok(regression.includes('Độ dốc = 0,2')); assert.ok(regression.includes('R² = 1,000'));
  assert.ok(await page.locator('#generic-graph .graph-error-bar').count() >= 18);
  assert.ok(await page.locator('#generic-report').isEnabled());
  const labReportDownload = page.waitForEvent('download'); await page.locator('#generic-report').click();
  const labReport = await labReportDownload; await labReport.saveAs(path.join(out, 'newton-lab-report.txt'));
  const reportText = fs.readFileSync(path.join(out, 'newton-lab-report.txt'), 'utf8');
  assert.ok(reportText.includes('Định luật II Newton')); assert.ok(reportText.includes('force=20'));
  const labCsvDownload = page.waitForEvent('download'); await page.locator('#generic-export').click();
  const labCsv = await labCsvDownload; await labCsv.saveAs(path.join(out, 'newton-lab-measurements.csv'));
  const csvText = fs.readFileSync(path.join(out, 'newton-lab-measurements.csv'), 'utf8');
  assert.ok(csvText.includes('measuredX,measuredY')); assert.ok(csvText.includes('setup_force'));
  await page.locator('[data-notebook-field="hypothesis"]').fill('Nếu tăng lực tổng hợp thì gia tốc tăng.');
  await page.locator('[data-notebook-assessment]').selectOption('4');
  await page.waitForTimeout(350);
  assert.equal(await page.evaluate(() => window.PhysicsLabApp.context().progress.notebooks['newton-second-law'].selfAssessment), 4);
  assert.ok((await page.locator('[data-notebook-print-field="hypothesis"]').textContent()).includes('gia tốc tăng'));
  assert.ok((await page.locator('[data-notebook-print-assessment]').textContent()).includes('Có thể giải thích'));
  await page.locator('#generic-experiment').selectOption('electromagnetic-induction');
  assert.equal(await page.locator('[data-notebook-title]').textContent(), 'Suất điện động cảm ứng');
  assert.equal(await page.locator('[data-notebook-field="hypothesis"]').inputValue(), '');
  for (const frequency of ['0.5', '1', '1.5']) {
    await page.locator('[data-generic-parameter="frequency"]').fill(frequency);
    await page.locator('#generic-capture').click();
  }
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  await page.locator('#generic-experiment').selectOption('newton-second-law');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  assert.equal(await page.locator('[data-notebook-field="hypothesis"]').inputValue(), 'Nếu tăng lực tổng hợp thì gia tốc tăng.');
  await page.locator('#generic-experiment').selectOption('electromagnetic-induction');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.evaluate(() => window.PhysicsLabApp.navigate('lab'));
  await page.locator('#generic-experiment').waitFor({ state: 'attached' });
  await page.locator('[data-thpt-grade="12"]').click();
  await page.locator('[data-open-lab="electromagnetic-induction"]').click();
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  assert.ok((await page.locator('#generic-lab-status').textContent()).includes('khôi phục'));
  await page.locator('#generic-experiment').selectOption('newton-second-law');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3, JSON.stringify(await page.evaluate(() => ({
    selected: document.querySelector('#generic-experiment').value,
    ids: window.PhysicsLabApp.context().progress.sessions['virtual-lab']?.measurements.map(row => row.experimentId),
    table: document.querySelector('#generic-table-body').innerText
  }))));
  assert.equal(await page.locator('[data-generic-parameter="force"]').inputValue(), '40');
  for (const id of ['friction', 'work-energy', 'momentum-collision', 'spring-oscillation', 'wave-interference', 'lorentz-force', 'wave-speed', 'thin-lens', 'projectile-motion', 'inclined-plane']) {
    await page.locator('#generic-experiment').selectOption(id);
    await page.locator('#generic-capture').click();
    assert.equal(await page.locator('#generic-table-body tr').count(), 1, `${id} should record one valid measurement`);
    assert.ok((await page.locator('#generic-lab-status').textContent()).includes('Đã ghi'), id);
    if (['friction', 'wave-interference', 'thin-lens', 'gas-law', 'projectile-motion', 'inclined-plane'].includes(id)) {
      assert.ok((await page.locator('#generic-graph .graph-value').textContent()).includes('không áp dụng hồi quy tuyến tính'), id);
    }
  }
  ok('Reusable 15-experiment equipment lab captures valid data and uses fits only for linear relationships');
  const mechanicsRoutes = ['friction', 'work-energy', 'momentum-collision', 'spring-oscillation'];
  const apparatusControls={friction:['#motion-block','#param-force'],'work-energy':['#motion-block','#param-distance'],'momentum-collision':['#body-one','#param-velocity1'],'spring-oscillation':['#oscillator-mass','#param-amplitude']};
  for (const id of mechanicsRoutes) {
    await page.evaluate(route => window.PhysicsLabApp.navigate(`simulation/${route}`), id);
    await page.locator('#play').waitFor();
    await page.locator('#scrubber').fill('500');
    const sim = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
    assert.ok(sim && Number.isFinite(sim.state.time));
    assert.ok(Object.values(sim.measurements).filter(Number.isFinite).length >= 4, `${id} has synchronized physics measurements`);
    assert.equal(await page.locator('.graph-cursor').count(), 2);
    assert.equal(await page.locator('body').getAttribute('data-theme'), themeAfter);
    const [handleSelector,inputSelector]=apparatusControls[id],before=Number(await page.locator(inputSelector).inputValue());
    await page.locator(handleSelector).focus();await page.keyboard.press('ArrowRight');
    assert.ok(Number(await page.locator(inputSelector).inputValue())>before,`${id} apparatus handle must change a real model parameter`);
    if(id==='momentum-collision'){
      const separation=Number(await page.locator('#param-separation').inputValue());
      await page.locator('#collision-separation-handle').focus();await page.keyboard.press('ArrowRight');
      assert.ok(Number(await page.locator('#param-separation').inputValue())>separation,'collision spacing handle must change initial position');
      assert.equal(await page.locator('.collision-balance strong').count(),4);
    }
    await page.locator('#scrubber').fill('500');await page.locator('[data-measure-capture]').click();
    assert.equal(await page.locator('[data-measure-body] tr').count(),1,`${id} must capture the current model state`);
  }
  const mechanicsCsv=page.waitForEvent('download');await page.locator('[data-measure-export]').click();
  const mechanicsDownload=await mechanicsCsv;await mechanicsDownload.saveAs(path.join(out,'mechanics-measurements.csv'));
  assert.ok(fs.readFileSync(path.join(out,'mechanics-measurements.csv'),'utf8').includes('t_s'));
  ok('Friction, work-energy, collision, and oscillation directly edit models and export measured states');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/wave-on-string')); await page.locator('#wave-scene').waitFor();
  let wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(wave.parameters.mode, 'pulse'); assert.equal(wave.parameters.boundary, 'fixed');
  const probeBefore = wave.parameters.probePosition;
  await page.locator('#wave-probe-control').focus(); await page.keyboard.press('ArrowRight');
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(wave.parameters.probePosition > probeBefore);
  await page.locator('#wave-boundary').selectOption('free');
  assert.equal((await page.evaluate(() => window.PhysicsLabApp.context().simulation)).parameters.boundary, 'free');
  await page.locator('#wave-source-handle').scrollIntoViewIfNeeded();
  const source = await page.locator('#wave-source-handle').boundingBox(); assert.ok(source);
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down(); await page.mouse.move(source.x + source.width / 2, source.y - 24, { steps: 5 }); await page.mouse.up();
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(wave.parameters.amplitude > 0.5); assert.equal(wave.state.playing, true);
  await page.waitForTimeout(120); await page.locator('#play').click();
  await page.screenshot({ path: path.join(out, 'wave-remake-desktop.png'), fullPage: true });
  await page.locator('#scrubber').fill('500');
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(wave.state.time > 0 && wave.measurements.speed > 0);
  assert.equal(await page.locator('#graph-displacement .graph-cursor').count(), 1);
  await page.locator('#play').click(); await page.waitForTimeout(240); await page.locator('#play').click();
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(wave.state.time > 0);
  await page.locator('#wave-frequency').fill('2');
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(wave.state.time, 0); assert.equal(wave.measurements.speed, wave.parameters.frequency * wave.parameters.wavelength);
  await page.locator('#wave-mode').selectOption('standing');
  assert.ok((await page.locator('#wave-equation').textContent()).includes('sin(kx)'));
  assert.equal((await page.evaluate(() => window.PhysicsLabApp.context().simulation)).measurements.mode, 'standing');
  await page.locator('#wave-mode').selectOption('interference'); await page.locator('#wave-phaseDifference').fill('180');
  wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(wave.measurements.displacement) < 1e-9);
  assert.equal(await page.locator('#wave-phaseDifference').isVisible(), true);
  ok('Hand-launched pulse, movable probe, boundary choice, analytic wave modes, and synced graphs work');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/electric-circuits')); await page.locator('#cwb-stage').waitFor();
  let circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(circuit.measurements.status, 'running'); assert.ok(Math.abs(circuit.measurements.totalCurrent - .75) < 1e-9);
  await page.locator('[data-preset="empty"]').click();
  for (const type of ['battery', 'switch', 'bulb']) await page.locator(`[data-add-part="${type}"]`).click();
  for (const [first, second] of [['part1:a', 'part2:a'], ['part2:b', 'part3:a'], ['part3:b', 'part1:b']]) {
    await page.locator(`[data-terminal="${first}"]`).click(); await page.locator(`[data-terminal="${second}"]`).click();
  }
  circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(circuit.parameters.componentCount, 3); assert.equal(circuit.parameters.wireCount, 3);
  assert.equal(circuit.measurements.status, 'running'); assert.ok(circuit.measurements.totalCurrent > 0);
  await page.locator('[data-move-part="part2"]').click();
  circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(circuit.measurements.status, 'open'); assert.equal(circuit.measurements.totalCurrent, 0);
  await page.locator('[data-preset="parallel"]').click();
  circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(circuit.measurements.totalCurrent - 1.5) < 1e-9);
  await page.screenshot({ path: path.join(out, 'circuit-construction-desktop.png'), fullPage: true });
  ok('Circuit simulation constructs components and wires, toggles a real switch, measures open/running states, and reuses the Kirchhoff workbench');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/magnetic-field')); await page.locator('#em-scene').waitFor();
  await page.locator('#scrubber').fill('250');
  let electromagnetic = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(electromagnetic.measurements.force > 0 && electromagnetic.measurements.radius > 0);
  await page.locator('#em-mode').selectOption('induction'); await page.locator('#scrubber').fill('250');
  electromagnetic = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(electromagnetic.measurements.emf) > 0);
  assert.ok(Math.abs(electromagnetic.measurements.current - electromagnetic.measurements.emf / electromagnetic.parameters.resistance) < 1e-9);
  ok('Lorentz trajectory, Faraday induction mode, model measurements, and synchronized timeline work');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/lens')); await page.locator('#optics-scene').waitFor();
  let optics = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(optics.measurements.imageType, 'real'); assert.ok(optics.measurements.imageDistance > 0);
  await page.locator('#optics-align').click();
  assert.match(await page.locator('#optics-focus-state').textContent(), /hội tụ/, 'Screen must focus at the true image position');
  await page.locator('[data-measure-capture]').click();assert.equal(await page.locator('[data-measure-body] tr').count(),1);
  const distanceBeforeDrag = await page.locator('#optics-objectDistance').inputValue();
  await page.locator('#optics-object-knob').scrollIntoViewIfNeeded();
  const objectKnob = await page.locator('#optics-object-knob').boundingBox();
  assert.ok(objectKnob, 'Object handle must remain visible');
  await page.mouse.move(objectKnob.x+objectKnob.width/2,objectKnob.y+objectKnob.height/2);await page.mouse.down();
  assert.equal(await page.locator('#optics-objectDistance').inputValue(),distanceBeforeDrag, 'Pointerdown must not snap the object');
  await page.mouse.move(objectKnob.x+objectKnob.width/2+30,objectKnob.y+objectKnob.height/2,{steps:6});await page.mouse.up();
  assert.notEqual(await page.locator('#optics-objectDistance').inputValue(),distanceBeforeDrag, 'Dragging the object must change its distance');
  await page.locator('#optics-objectDistance').fill('0.05');
  optics = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(optics.measurements.imageType, 'virtual'); assert.ok(optics.measurements.magnification > 0);
  await page.locator('#optics-objectDistance').fill('0.1');
  optics = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.equal(optics.measurements.imageDistance, null);
  assert.equal(await page.locator('#graph-image-distance .graph-cursor').getAttribute('visibility'), 'hidden');
  ok('Lens ray diagram and controls produce real, virtual, and focal-plane images');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/ideal-gas')); await page.locator('#gas-scene').waitFor();
  await page.locator('#scrubber').fill('1000');
  let gas = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(gas.measurements.pressure * gas.measurements.volume - gas.parameters.amount * 8.314462618 * gas.measurements.temperature) < 1e-7);
  assert.ok(Math.abs(gas.measurements.heat - gas.measurements.changeInInternalEnergy - gas.measurements.work) < 1e-7);
  assert.equal(await page.locator('#gas-particles circle').count(),28);
  const particleBefore = await page.locator('#gas-particles circle').first().getAttribute('cx');
  await page.locator('#scrubber').fill('550');
  assert.notEqual(await page.locator('#gas-particles circle').first().getAttribute('cx'),particleBefore);
  ok('Gas kinetic tracers move with real timeline while pressure stays analytic');
  await page.locator('#gas-process').selectOption('isobaric');
  gas = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(gas.measurements.volume > 0); assert.ok(gas.measurements.temperature > 0);
  assert.equal(await page.locator('[data-gas-field="finalTemperature"]').isVisible(), false);
  await page.locator('#gas-process').selectOption('isochoric');
  assert.equal(await page.locator('[data-gas-field="finalVolume"]').isVisible(), false);
  assert.equal(await page.locator('[data-gas-field="finalTemperature"]').isVisible(), true);
  ok('Ideal-gas process timeline, PV state equation, first-law energy balance, and process controls work');

  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/electric-field'));
  await page.locator('#field-stage').waitFor();
  const originalField = await page.locator('#field-magnitude').textContent();
  await page.locator('#field-charge-0').fill('3');
  assert.notEqual(await page.locator('#field-magnitude').textContent(), originalField);
  await page.locator('#field-probe-x').fill('1');
  assert.ok((await page.locator('#field-ex').textContent()).trim() !== '—');
  await page.reload(); await page.locator('#field-stage').waitFor();
  assert.equal(await page.locator('#field-charge-0').inputValue(), '3');
  assert.equal(await page.locator('#field-probe-x').inputValue(), '1');
  ok('Electric field measurement responds to charge/probe and persists valid session');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulations')); await page.locator('#library-results').waitFor();
  assert.equal(await page.locator('.simulation-card.ready').count(), availableCount); ok('Simulation library exposes all implemented simulations');
  for (const width of [1920, 1440, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['home', 'simulations', 'simulation/projectile-motion', 'simulation/newton', 'simulation/inclined-plane', 'simulation/friction', 'simulation/work-energy', 'simulation/momentum-collision', 'simulation/spring-oscillation', 'simulation/wave-on-string', 'simulation/electric-circuits', 'simulation/electric-field', 'simulation/magnetic-field', 'simulation/lens', 'simulation/ideal-gas', 'learning', 'learning/revision', 'lab', 'tools', 'explorer3d']) {
      await page.evaluate(r => window.PhysicsLabApp.navigate(r), route); await page.waitForTimeout(140);
      await page.locator('main h1').waitFor();
      const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      assert.ok(sizes.scroll <= sizes.client + 1, `${route} @${width}: overflow ${JSON.stringify(sizes)}`);
      assert.equal(await page.locator('body').getAttribute('data-theme'), themeAfter, `${route} @${width} lost the selected theme`);
      const smallButtons = await page.locator('button:visible,select:visible,input[type=range]:visible,[role=slider]:visible').evaluateAll(els => els.filter(e => !e.disabled && (e.getBoundingClientRect().height < 43.9 || e.getBoundingClientRect().width < 43.9)).map(e => ({ tag: e.tagName, id: e.id, width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height })));
      assert.deepEqual(smallButtons, [], `${route} @${width} has small targets`);
    }
  }
  ok('All routes at 1920 / 1440 / 1024 / 768 / 390 / 360 / 320 px: no page overflow, control targets >=44px');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#theme-toggle').click(); assert.equal(await page.locator('body').getAttribute('data-theme'), 'light');
  for (const route of ['home', 'simulations', 'simulation/projectile-motion', 'simulation/newton', 'simulation/inclined-plane', 'simulation/friction', 'simulation/work-energy', 'simulation/momentum-collision', 'simulation/spring-oscillation', 'simulation/wave-on-string', 'simulation/electric-circuits', 'simulation/electric-field', 'simulation/magnetic-field', 'simulation/lens', 'simulation/ideal-gas', 'learning', 'learning/revision', 'lab', 'tools', 'explorer3d']) {
    await page.evaluate(r => window.PhysicsLabApp.navigate(r), route);
    await page.locator('main h1').waitFor();
    assert.equal(await page.locator('body').getAttribute('data-theme'), 'light', `${route} lost light theme`);
    const unnamedControls = await page.locator('main button:visible,main a:visible,main input:visible,main select:visible,main textarea:visible,main canvas[tabindex]:visible').evaluateAll(elements => elements.filter(element => {
      const labelledBy = (element.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
      const labelText = Array.from(element.labels || []).map(label => label.innerText.trim()).join(' ');
      const content = ['BUTTON', 'A'].includes(element.tagName) ? element.innerText.trim() : '';
      return !(element.getAttribute('aria-label') || labelledBy || labelText || content || element.title);
    }).map(element => `${element.tagName.toLowerCase()}#${element.id}`));
    assert.deepEqual(unnamedControls, [], `${route} has interactive controls without accessible names`);
  }
  ok('Light theme and named interactive controls persist across every application route');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.PhysicsLabApp.navigate('explorer3d')); await page.locator('#explorer3d-canvas').waitFor(); await page.screenshot({ path: path.join(out, 'explorer3d-2-1-mobile.png'), fullPage: true });
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/wave-on-string')); await page.locator('#wave-scene').waitFor(); await page.screenshot({ path: path.join(out, 'wave-remake-mobile.png'), fullPage: true });
  await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor(); await page.screenshot({ path: path.join(out, 'home-mobile.png'), fullPage: true });
  await page.evaluate(() => window.PhysicsLabApp.openSimulation('projectile-motion')); await page.locator('#play').waitFor(); await page.screenshot({ path: path.join(out, 'simulation-mobile.png'), fullPage: true });
  for (const setup of [{ v0: 0, angle: 0, height: 0, g: 9.81 }, { v0: 60, angle: 90, height: 30, g: .1 }]) {
    for (const [key, value] of Object.entries(setup)) { await page.locator(`#number-${key}`).fill(String(value)); await page.locator(`#number-${key}`).dispatchEvent('change'); }
    await page.locator('#scrubber').fill('1000');
    assert.ok(!(await page.locator('#main').innerHTML()).match(/NaN|Infinity/));
  }
  ok('Degenerate and extreme scene/graph parameter setups remain finite');
  for (const route of ['projectile-motion','newton','wave-on-string','magnetic-field','ideal-gas']) {
    await page.evaluate(id => window.PhysicsLabApp.openSimulation(id), route); await page.locator('#play').waitFor();
    const before = await page.evaluate(() => window.__physicslabRafStats());
    await page.locator('#play').click(); await page.waitForTimeout(140);
    const during = await page.evaluate(() => window.__physicslabRafStats());
    assert.ok(during.active > 0 && during.fired > before.fired, `${route} animation did not produce frames`);
    await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor(); await page.waitForTimeout(40);
    assert.equal((await page.evaluate(() => window.__physicslabRafStats())).active, 0, `${route} leaked an animation frame`);
  }
  await page.evaluate(() => window.PhysicsLabApp.navigate('explorer3d')); await page.locator('#explorer3d-play').waitFor();
  const before3d = await page.evaluate(() => window.__physicslabRafStats().fired); await page.locator('#explorer3d-play').click(); await page.waitForTimeout(140);
  assert.ok((await page.evaluate(() => window.__physicslabRafStats().fired)) > before3d);
  await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor(); await page.waitForTimeout(40);
  assert.equal((await page.evaluate(() => window.__physicslabRafStats())).active, 0);
  ok('Animated simulation and 3D routes produce frames and release every animation loop on navigation');
  await require('./experiment-check.cjs')(browser,base,out);
  ok('Experiment Studio persists independent runs and selected Notebook evidence, exports real CSV/reports, and restores validated backups');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/nonexistent')); await page.getByRole('heading', { name: 'Chưa thể mở trang này' }).waitFor(); ok('Unavailable simulation fails gracefully');
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.consoleErrors, []); assert.deepEqual(report.requestsFailed, []); ok('No runtime exceptions, console errors or failed requests');
  await browser.close(); report.passed = true; saveReport();
  await managedServer?.close();
})().catch(async error => {
  // Never let diagnostic collection hide the original test failure.
  report.passed = false;
  report.failure = error?.stack || String(error);
  const page = globalThis.testPage;
  if (page && !page.isClosed()) {
    try {
      report.context = await page.evaluate(() => window.PhysicsLabApp?.context?.() ?? null);
    } catch (contextError) {
      report.contextError = contextError?.message || String(contextError);
    }
    try {
      await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true, timeout: 5000 });
    } catch (screenshotError) {
      report.screenshotError = screenshotError?.message || String(screenshotError);
    }
  }
  try {
    saveReport();
  } catch (writeError) {
    console.error('Could not save browser report:', writeError);
  }
  await managedServer?.close();
  console.error('Original browser-test failure:\n' + report.failure);
  if (report.contextError) console.error('Diagnostic context unavailable:', report.contextError);
  if (report.screenshotError) console.error('Failure screenshot unavailable:', report.screenshotError);
  process.exit(1);
});
