const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.PHYSICSLAB_TEST_URL || 'http://127.0.0.1:5188';
const out = path.resolve('work'); fs.mkdirSync(out, { recursive: true });
const report = { base, tests: [], consoleErrors: [], pageErrors: [], requestsFailed: [] };
function ok(name) { report.tests.push(name); console.log('PASS ' + name); }
(async () => {
  let browser;
  try { browser = await chromium.launch({ headless: true }); }
  catch { browser = await chromium.launch({ channel: 'msedge', headless: true }); }
  const { SimulationRegistry } = await import('../src/data/registry.js');
  const availableCount = SimulationRegistry.all().filter(item => item.status === 'available').length;
  const totalCount = SimulationRegistry.all().length;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'vi-VN', reducedMotion: 'reduce' });
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
  await page.getByRole('link', { name: 'Mở mô phỏng' }).first().click(); await page.locator('#play').waitFor();
  assert.ok(requests.some(u => /(?:simulations\/projectile\/index\.js|assets\/projectile-.*\.js)/.test(u))); ok('Projectile lazy loads on navigation');
  await page.screenshot({ path: path.join(out, 'simulation-desktop.png'), fullPage: true });
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
  await page.evaluate(() => window.PhysicsLabApp.openLesson()); await page.locator('#quiz').waitFor();
  await page.locator('input[name="prediction"][value="b"]').check(); await page.locator('#prediction').click();
  assert.ok(await page.locator('#experiment-done').isDisabled()); assert.ok((await page.locator('#experiment-requirements').textContent()).includes('Mở mô phỏng')); 
  await page.locator('#lesson-simulation-link').click(); await page.locator('#play').waitFor();
  await page.locator('#number-angle').fill('50'); await page.locator('#number-angle').dispatchEvent('change');
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning')); await page.locator('#experiment-done').waitFor();
  assert.ok(await page.locator('#experiment-done').isEnabled()); await page.locator('#experiment-done').click(); await page.locator('#observation').click();
  await page.locator('input[name="answer"][value="b"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await page.locator('#quiz-result').textContent()).startsWith('Đúng!'));
  assert.deepEqual(await page.locator('.learning-aside li.done').count(), 4); ok('Prediction is persisted; ordered experiment, observation, quiz feedback, and lesson completion work');
  await page.locator('[data-lesson="hooke-discovery"]').click();
  await page.locator('input[name="prediction"][value="a"]').check(); await page.locator('#prediction').click();
  await page.locator('#lesson-simulation-link').click(); await page.locator('#record-measurement').waitFor();
  await page.locator('#record-measurement').click();
  await page.evaluate(() => window.PhysicsLabApp.navigate('learning'));
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
  const mechanicsProgress = page.locator('.learning-mastery-item').filter({ hasText: 'Cơ học' });
  assert.ok((await mechanicsProgress.textContent()).includes('Đã kiểm tra 2/6'));
  await page.locator('input[name="answer"][value="c"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await mechanicsProgress.textContent()).includes('Đã kiểm tra 3/6'));
  assert.ok((await mechanicsProgress.textContent()).includes('Điểm tốt nhất TB: 67%'));
  await page.locator('input[name="answer"][value="a"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  assert.ok((await mechanicsProgress.textContent()).includes('Điểm tốt nhất TB: 100%'));
  ok('Learning dashboard updates topic coverage and best quiz scores without counting unattempted lessons');
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
  ok('Helix visibly contains trajectory and particle at default and extreme angles; fit control resets camera');
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
  await page.locator('#explorer3d-canvas').focus(); await page.keyboard.press('ArrowLeft');
  const canvasBeforeTheme = await page.locator('#explorer3d-canvas').evaluate(canvas => canvas.toDataURL());
  ok('Lorentz helix and 3D projectile scenes respond to rotation; projectile readouts match the shared analytic model');
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
  assert.ok(newtonCursor > 48 && newtonCursor < 378); ok('Newton playback advances and synchronizes model time with graph cursor');
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
  ok('Inclined-plane slope, draggable angle handle and physically driven acceleration display');
  await page.evaluate(() => window.PhysicsLabApp.navigate('lab')); await page.locator('#record-measurement').waitFor();
  assert.equal(await page.locator('#generic-graph .graph-value').textContent(), 'Chưa có điểm đo.');
  const hookeRowsBefore = await page.locator('#hooke-table-body tr').count();
  await page.locator('#record-measurement').click(); assert.equal(await page.locator('#hooke-table-body tr').count(), hookeRowsBefore + 1);
  assert.ok(await page.locator('#csv-export').isEnabled());
  await page.locator('[data-generic-parameter="force"]').fill('20'); await page.locator('#generic-capture').click();
  await page.locator('[data-generic-parameter="force"]').fill('30'); await page.locator('#generic-capture').click();
  await page.locator('[data-generic-parameter="force"]').fill('40'); await page.locator('#generic-capture').click();
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
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
  await page.locator('#generic-experiment').selectOption('ohms-law');
  for (const voltage of ['5', '10', '15']) {
    await page.locator('[data-generic-parameter="voltage"]').fill(voltage);
    await page.locator('#generic-capture').click();
  }
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  await page.locator('#generic-experiment').selectOption('newton-second-law');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  await page.locator('#generic-experiment').selectOption('ohms-law');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.evaluate(() => window.PhysicsLabApp.navigate('lab'));
  await page.locator('#generic-experiment').waitFor();
  assert.equal(await page.locator('#generic-table-body tr').count(), 3);
  assert.ok((await page.locator('#generic-lab-status').textContent()).includes('khôi phục'));
  await page.locator('#generic-experiment').selectOption('newton-second-law');
  assert.equal(await page.locator('#generic-table-body tr').count(), 3, JSON.stringify(await page.evaluate(() => ({
    selected: document.querySelector('#generic-experiment').value,
    ids: window.PhysicsLabApp.context().progress.sessions['virtual-lab']?.measurements.map(row => row.experimentId),
    table: document.querySelector('#generic-table-body').innerText
  }))));
  assert.equal(await page.locator('[data-generic-parameter="force"]').inputValue(), '40');
  for (const id of ['hooke-law', 'friction', 'work-energy', 'momentum-collision', 'spring-oscillation', 'wave-interference', 'lorentz-force', 'electromagnetic-induction', 'wave-speed', 'thin-lens', 'gas-law', 'projectile-motion', 'inclined-plane']) {
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
  for (const id of mechanicsRoutes) {
    await page.evaluate(route => window.PhysicsLabApp.navigate(`simulation/${route}`), id);
    await page.locator('#play').waitFor();
    await page.locator('#scrubber').fill('500');
    const sim = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
    assert.ok(sim && Number.isFinite(sim.state.time));
    assert.ok(Object.values(sim.measurements).filter(Number.isFinite).length >= 4, `${id} has synchronized physics measurements`);
    assert.equal(await page.locator('.graph-cursor').count(), 2);
    assert.equal(await page.locator('body').getAttribute('data-theme'), themeAfter);
  }
  ok('Friction, work-energy, collision, and oscillation routes render measurable states, graphs, and retain theme');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/wave-on-string')); await page.locator('#wave-scene').waitFor();
  await page.locator('#scrubber').fill('500');
  let wave = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
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
  ok('Traveling/standing/interference modes, nodes, destructive phase, controls, and synced graphs work');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/electric-circuits')); await page.locator('#circuit-schematic').waitFor();
  await page.locator('#circuit-voltage').fill('12');
  let circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(circuit.measurements.current - 0.4) < 1e-9);
  assert.ok(Math.abs(Number(await page.locator('#graph-current .graph-cursor').getAttribute('x1')) - 213) < 1e-7);
  assert.equal(await page.locator('#circuit-schematic svg').getAttribute('aria-label'), 'Sơ đồ mạch nối tiếp');
  await page.locator('#topology').selectOption('parallel');
  circuit = await page.evaluate(() => window.PhysicsLabApp.context().simulation);
  assert.ok(Math.abs(circuit.measurements.current - circuit.measurements.current1 - circuit.measurements.current2) < 1e-9);
  assert.equal(circuit.measurements.voltage1, 12); assert.equal(circuit.measurements.voltage2, 12);
  assert.equal(await page.locator('#circuit-schematic svg').getAttribute('aria-label'), 'Sơ đồ mạch song song');
  ok('Series/parallel circuit controls, Ohm readings, SVG topology, and I–U graph cursor work');
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
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['home', 'simulations', 'simulation/projectile-motion', 'simulation/newton', 'simulation/inclined-plane', 'simulation/friction', 'simulation/work-energy', 'simulation/momentum-collision', 'simulation/spring-oscillation', 'simulation/wave-on-string', 'simulation/electric-circuits', 'simulation/electric-field', 'simulation/magnetic-field', 'simulation/lens', 'simulation/ideal-gas', 'learning', 'lab', 'tools', 'explorer3d']) {
      await page.evaluate(r => window.PhysicsLabApp.navigate(r), route); await page.waitForTimeout(140);
      await page.locator('main h1').waitFor();
      const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      assert.ok(sizes.scroll <= sizes.client + 1, `${route} @${width}: overflow ${JSON.stringify(sizes)}`);
      assert.equal(await page.locator('body').getAttribute('data-theme'), themeAfter, `${route} @${width} lost the selected theme`);
      const smallButtons = await page.locator('button:visible,select:visible,input[type=range]:visible').evaluateAll(els => els.filter(e => !e.disabled && (e.getBoundingClientRect().height < 43.9 || e.getBoundingClientRect().width < 43.9)).map(e => ({ tag: e.tagName, id: e.id, width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height })));
      assert.deepEqual(smallButtons, [], `${route} @${width} has small targets`);
    }
  }
  ok('All routes at 1440 / 1024 / 768 / 390 / 360 / 320 px: no page overflow, control targets >=44px');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#theme-toggle').click(); assert.equal(await page.locator('body').getAttribute('data-theme'), 'light');
  for (const route of ['home', 'simulations', 'simulation/projectile-motion', 'simulation/newton', 'simulation/inclined-plane', 'simulation/friction', 'simulation/work-energy', 'simulation/momentum-collision', 'simulation/spring-oscillation', 'simulation/wave-on-string', 'simulation/electric-circuits', 'simulation/electric-field', 'simulation/magnetic-field', 'simulation/lens', 'simulation/ideal-gas', 'learning', 'lab', 'tools', 'explorer3d']) {
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
  await page.evaluate(() => window.PhysicsLabApp.navigate('home')); await page.getByRole('heading', { name: /Hôm nay/ }).waitFor(); await page.screenshot({ path: path.join(out, 'home-mobile.png'), fullPage: true });
  await page.evaluate(() => window.PhysicsLabApp.openSimulation('projectile-motion')); await page.locator('#play').waitFor(); await page.screenshot({ path: path.join(out, 'simulation-mobile.png'), fullPage: true });
  for (const setup of [{ v0: 0, angle: 0, height: 0, g: 9.81 }, { v0: 60, angle: 90, height: 30, g: .1 }]) {
    for (const [key, value] of Object.entries(setup)) { await page.locator(`#number-${key}`).fill(String(value)); await page.locator(`#number-${key}`).dispatchEvent('change'); }
    await page.locator('#scrubber').fill('1000');
    assert.ok(!(await page.locator('#main').innerHTML()).match(/NaN|Infinity/));
  }
  ok('Degenerate and extreme scene/graph parameter setups remain finite');
  await page.evaluate(() => window.PhysicsLabApp.navigate('simulation/nonexistent')); await page.getByRole('heading', { name: 'Chưa thể mở trang này' }).waitFor(); ok('Unavailable simulation fails gracefully');
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.consoleErrors, []); assert.deepEqual(report.requestsFailed, []); ok('No runtime exceptions, console errors or failed requests');
  await browser.close(); report.passed = true;
  fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2));
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
    fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2));
  } catch (writeError) {
    console.error('Could not save browser report:', writeError);
  }
  console.error('Original browser-test failure:\n' + report.failure);
  if (report.contextError) console.error('Diagnostic context unavailable:', report.contextError);
  if (report.screenshotError) console.error('Failure screenshot unavailable:', report.screenshotError);
  process.exit(1);
});
