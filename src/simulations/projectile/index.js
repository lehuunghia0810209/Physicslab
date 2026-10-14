import './projectile.css';
import '../simulation-first-half.css';
import { createProjectile, DEFAULTS, PARAMS, PRESETS } from '../../core/projectile.js';
import { format } from '../../core/units.js';
import { Timeline } from '../../engines/timeline.js';
import { GraphRenderer } from '../../engines/graph.js';
import { MeasurementSystem } from '../../engines/measurements.js';
import { ProjectileScene } from './scene.js';
import { icon } from '../../app/icons.js';
import { compareProjectiles } from '../../core/projectile-comparison.js';
import { projectileShareURL, parseProjectileShare } from '../../core/projectile-share.js';
import { clampSceneValue, quantizeParameter } from '../../core/direct-manipulation.js';

export function mount(main, context) {
  const { progress } = context;
  let params = { ...DEFAULTS }; let savedTime = 0;
  const saved = progress.get().sessions['projectile-motion'];
  try { if (saved) { params = createProjectile(saved.parameters).parameters; savedTime = Number.isFinite(saved.time) ? saved.time : 0; } } catch { /* Invalid saved session uses defaults. */ }
  // An explicit teacher share link overrides the old local session only for this visit.
  const sharedParameters = parseProjectileShare(window.location.search);
  if (sharedParameters) { params = { ...sharedParameters }; savedTime = 0; }
  let model = createProjectile(params);
  let reference = null;
  progress.visit('projectile-motion', 'Khám phá chuyển động ném xiên');
  main.innerHTML = `<a class="back-link" href="#/simulations">← Thư viện mô phỏng</a><div class="page-heading simulation-heading"><div><p class="eyebrow">CƠ HỌC · LỚP 10</p><h1>Chuyển động ném xiên</h1><p>Thay một tham số. Quan sát cả một quỹ đạo.</p></div><a class="button secondary" href="#/learning">${icon('book')} Bài khám phá</a></div>
    <div class="simulation-layout physics-first-layout"><section class="simulation-workbench"><div class="viewport-panel physics-first-panel"><div class="viewport-top"><span class="tag">BÀN MÔ PHỎNG 2D</span><span id="play-status" role="status">Sẵn sàng</span></div><div id="scene-container" class="physics-first-projectile-stage"></div><div class="scene-legend"><span><i class="legend-dot teal"></i> Quỹ đạo hiện tại</span><span><i class="comparison-legend-line"></i> Quỹ đạo tham chiếu</span><span><i class="legend-dot amber"></i> Vận tốc v</span><span><i class="legend-dot blue"></i> vₓ</span><span><i class="legend-dot purple"></i> vᵧ</span><small>Vector: 1,1 đơn vị SVG / (m/s). Trục x và y cùng tỉ lệ, tự vừa khung.</small></div>
    <div class="physics-first-quick" aria-label="Thử nhanh các góc ném"><button class="button secondary" type="button" data-launch-angle="30">30°</button><button class="button secondary" type="button" data-launch-angle="45">45°</button><button class="button secondary" type="button" data-launch-angle="60">60°</button><button class="button secondary" type="button" id="projectile-compare-shortcut">Lưu quỹ đạo đối chiếu</button></div>
    <div class="playback-row physics-first-play"><button class="button primary" id="play">${icon('play')}<span>Chạy</span></button><button class="button secondary" id="reset">${icon('reset')} Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><span id="time-display" class="time-display"></span></div><label class="timeline-label" for="scrubber">Thời gian · kéo để xem lại<span id="duration-label"></span></label><input id="scrubber" class="timeline-slider" type="range" min="0" max="1000" value="0" step="1" aria-label="Thời điểm trong chuyển động"><div class="display-options"><label><input type="checkbox" data-display="trajectory" checked> Quỹ đạo</label><label><input type="checkbox" data-display="velocity" checked> Vector v</label><label><input type="checkbox" data-display="components" checked> vₓ, vᵧ</label><label><input type="checkbox" data-display="grid" checked> Lưới tọa độ</label></div></div>
    <div class="share-setup-strip"><div><strong>Giao bài nhanh</strong><p>Chia sẻ liên kết chứa thông số hiện tại; không chia sẻ điểm số hay tiến độ học sinh.</p></div><button class="button secondary" id="share-setup" type="button">${icon('arrow')} Sao chép liên kết</button><span id="share-status" role="status" aria-live="polite"></span></div>
    <div class="measurement-strip physics-first-meters">${[['x', 'Vị trí ngang', 'm'], ['y', 'Độ cao hiện tại', 'm'], ['speed', 'Tốc độ', 'm/s'], ['maxHeight', 'Độ cao cực đại', 'm'], ['range', 'Tầm xa', 'm']].map(([key, label, unit]) => `<div><span>${label}</span><strong data-measure="${key}">0</strong><small>${unit}</small></div>`).join('')}</div></section>
    <aside class="control-panel physics-first-controls"><div class="control-heading"><h2>Thiết lập cú ném</h2><span>SI</span></div><div class="preset-buttons" aria-label="Môi trường trọng lực"><button class="preset" data-preset="earth">${icon('sun')} Trái Đất</button><button class="preset" data-preset="moon">${icon('orbit')} Mặt Trăng</button></div><p class="preset-note" id="preset-note"></p><div class="parameters">${PARAMS.map(p => `<div class="parameter"><div class="parameter-title"><label for="param-${p.key}">${p.label}</label><span>${p.symbol}</span></div><div class="number-unit"><input id="number-${p.key}" type="number" min="${p.min}" max="${p.max}" step="${p.step}" value="${params[p.key]}" aria-label="${p.label}, ${p.unit}"><span>${p.unit}</span></div><input id="param-${p.key}" type="range" data-param="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${params[p.key]}" aria-label="Điều chỉnh ${p.label}"><div class="range-limits"><span>${p.min}</span><span>${p.max} ${p.unit}</span></div></div>`).join('')}</div><p id="parameter-error" class="error-message" role="alert"></p><p class="control-hint">Đổi tham số sẽ đặt thời gian về 0 và xóa bảng đo của lần thiết lập trước.</p><details class="assumptions" open><summary>Giả định vật lý</summary><ul><li>Bỏ qua lực cản không khí.</li><li>g không đổi, mặt đất phẳng tại y = 0.</li><li>Vật là chất điểm; khối lượng không ảnh hưởng quỹ đạo.</li><li>Dừng ở lần chạm đất đầu tiên, không mô phỏng nảy.</li></ul></details></aside></div>
    <section class="compare-workspace panel" aria-labelledby="compare-title"><div><span class="tag">THỰC NGHIỆM ĐỐI CHỨNG</span><h2 id="compare-title">So sánh hai lần ném</h2><p>Chọn “Lưu làm mốc”, thay góc ném, vận tốc hoặc trọng trường. Hai quỹ đạo và bốn đồ thị sẽ cùng hiển thị, với cùng hệ trục.</p></div><div class="compare-actions"><button class="button secondary" id="compare-save">${icon('check')} Lưu làm mốc</button><button class="button ghost" id="compare-clear" disabled>Xóa mốc</button></div><p class="compare-summary" id="compare-summary" role="status" aria-live="polite">Chưa có lần ném tham chiếu. Mốc so sánh chỉ lưu khi trang đang mở.</p></section>
    <section class="graphs-section"><div class="section-heading"><div><h2>Đồ thị kể câu chuyện chuyển động</h2><p>Con trỏ đồng bộ với thời gian. Rê chuột lên đồ thị hoặc nhấn Tab, rồi dùng ← → để đọc từng điểm mẫu.</p></div><span class="version-pill">${icon('clock')} Đồng bộ thời gian</span></div><div class="graphs-grid">${['x', 'y', 'vx', 'vy'].map(key => `<article class="graph-card" id="graph-${key}"></article>`).join('')}</div></section>
    <div class="data-equations"><section class="panel data-panel"><div class="section-heading"><div><h2>Sổ đo của bạn</h2><p>Ghi trạng thái tại thời điểm hiện tại · tối đa 100 mẫu</p></div><div class="data-actions"><button class="button secondary" id="capture">${icon('check')} Ghi mẫu</button><button class="button secondary" id="csv" disabled>${icon('download')} CSV</button><button class="button ghost" id="clear-data" disabled>Xóa mẫu</button></div></div><p id="data-status" role="status"></p><div class="table-scroll"><table><caption class="sr-only">Dữ liệu đo tại các thời điểm đã chọn</caption><thead><tr><th>t (s)</th><th>x (m)</th><th>y (m)</th><th>vₓ (m/s)</th><th>vᵧ (m/s)</th><th>|v| (m/s)</th></tr></thead><tbody id="measurements-body"><tr><td colspan="6" class="empty-cell">Chạy hoặc kéo thời gian, rồi chọn “Ghi mẫu”.</td></tr></tbody></table></div></section><section class="panel equations-panel"><span class="tag">MÔ HÌNH GIẢI TÍCH</span><h2>Hai phương, cùng thời gian</h2><div class="equation-box">x = v₀ cos(θ)t<br>y = h₀ + v₀ sin(θ)t − ½gt²<br>vₓ = v₀ cos(θ)<br>vᵧ = v₀ sin(θ) − gt</div><p>Trục +x sang phải, +y hướng lên. Tầm xa đo từ x = 0. Độ cao cực đại đo từ mặt đất.</p><p id="landing-equation"></p></section></div>`;
  const abort = new AbortController(); const bind = (selector, event, fn) => main.querySelector(selector).addEventListener(event, fn, { signal: abort.signal });
  const scene = new ProjectileScene(main.querySelector('#scene-container'));
  const aimHint = document.createElement('p');
  aimHint.className = 'launch-aim-hint';
  aimHint.textContent = 'Thử ngay: kéo nút “KÉO” trên mũi tên để đổi góc và vận tốc phóng; số liệu và quỹ đạo tự cập nhật.';
  main.querySelector('#scene-container').insertAdjacentElement('afterend', aimHint);
  const graphs = [
    ['x', 'Vị trí ngang · x–t', 'm', 'teal'], ['y', 'Độ cao · y–t', 'm', 'teal'],
    ['vx', 'Vận tốc ngang · vₓ–t', 'm/s', 'blue'], ['vy', 'Vận tốc đứng · vᵧ–t', 'm/s', 'purple']
  ].map(([key, label, unit, role]) => new GraphRenderer(main.querySelector(`#graph-${key}`), { key, label, unit, role }));
  const measurements = new MeasurementSystem();
  function renderComparison() {
    scene.setComparison(reference);
    graphs.forEach(graph => graph.setComparison(reference));
    main.querySelector('#compare-clear').disabled = !reference;
    const summary = main.querySelector('#compare-summary');
    if (!reference) {
      summary.textContent = 'Chưa có lần ném tham chiếu. Mốc so sánh chỉ lưu khi trang đang mở.';
      return;
    }
    const delta = compareProjectiles(model, reference);
    const signed = (value, unit) => `${value >= 0 ? '+' : '−'}${format(Math.abs(value))} ${unit}`;
    summary.textContent = `Mốc: v₀ = ${format(reference.parameters.v0)} m/s, θ = ${format(reference.parameters.angle)}°, g = ${format(reference.parameters.g)} m/s². Chênh lệch hiện tại − mốc: tầm xa ${signed(delta.range, 'm')}; độ cao cực đại ${signed(delta.maxHeight, 'm')}; thời gian bay ${signed(delta.duration, 's')}. Đường nét đứt màu vàng là mốc.`;
  }
  const measureEls = [...main.querySelectorAll('[data-measure]')];
  const play = main.querySelector('#play'); const scrub = main.querySelector('#scrubber');
  const timeDisplay = main.querySelector('#time-display'); const status = main.querySelector('#play-status');
  function persist() { progress.session('projectile-motion', { parameters: { ...params }, time: timeline.state.get().time }); }
  function frame(time) {
    const state = model.at(time); scene.update(time); graphs.forEach(g => g.update(time));
    measureEls.forEach(el => { el.textContent = format(state[el.dataset.measure] ?? model[el.dataset.measure]); });
    scrub.value = model.duration ? time / model.duration * 1000 : 0;
    scrub.setAttribute('aria-valuetext', `${format(state.t)} giây`);
    timeDisplay.textContent = `t = ${format(state.t)} s`;
  }
  const timeline = new Timeline(model.duration, frame, () => {
    status.textContent = model.duration === 0 ? 'Vật ở mặt đất · không có thời gian bay' : 'Đã chạm đất';
    // A zero-duration setup is not counted as an experiment.
    if (model.duration > 0) progress.complete('projectile-motion');
    persist();
  });
  let lastPlayLabel = 'Chạy';
  const unsubscribe = timeline.state.subscribe(state => {
    const label = state.playing ? 'Tạm dừng' : state.time >= model.duration && model.duration > 0 ? 'Chạy lại' : 'Chạy';
    // Keep child nodes stable during pointerdown/up and animation frames.
    if (label !== lastPlayLabel) { play.innerHTML = `${icon(state.playing ? 'pause' : 'play')}<span>${label}</span>`; lastPlayLabel = label; }
    play.setAttribute('aria-label', state.playing ? 'Tạm dừng mô phỏng' : 'Chạy mô phỏng');
    if (state.playing) status.textContent = 'Đang chuyển động';
    else if (model.duration === 0) status.textContent = 'Vật ở mặt đất · không có thời gian bay';
    else status.textContent = state.time >= model.duration ? 'Đã chạm đất' : state.time > 0 ? 'Tạm dừng' : 'Sẵn sàng';
  });
  function refreshModel() {
    scene.setModel(model); graphs.forEach(g => g.setModel(model));
    if (reference) renderComparison();
    main.querySelector('#duration-label').textContent = `0 → ${format(model.duration)} s`;
    main.querySelector('#landing-equation').textContent = `Thời gian bay T = [v₀ sin(θ) + √((v₀ sin(θ))² + 2gh₀)] / g = ${format(model.duration)} s.`;
    main.querySelectorAll('[data-launch-angle]').forEach(b => b.addEventListener('click', () => apply({...params,angle:Number(b.dataset.launchAngle)}), { signal: abort.signal }));
  bind('#projectile-compare-shortcut','click',()=>{reference=model;renderComparison();});
  main.querySelectorAll('[data-preset]').forEach(b => { const active = Math.abs(params.g - PRESETS[b.dataset.preset].g) < 1e-8; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', String(active)); });
    const preset = Object.values(PRESETS).find(p => Math.abs(p.g - params.g) < 1e-8);
    main.querySelector('#preset-note').textContent = `${preset?.label || 'Trọng lực tùy chỉnh'} · g = ${format(params.g)} m/s²`;
    frame(0);
  }
  function renderData() {
    main.querySelector('#measurements-body').innerHTML = measurements.rows.length ? measurements.rows.map(r => `<tr>${[r.t, r.x, r.y, r.vx, r.vy, r.speed].map(v => `<td>${format(v, 3)}</td>`).join('')}</tr>`).join('') : '<tr><td colspan="6" class="empty-cell">Chưa có mẫu đo cho thiết lập hiện tại.</td></tr>';
    main.querySelector('#csv').disabled = main.querySelector('#clear-data').disabled = measurements.rows.length === 0;
  }
  function apply(next) {
    try {
      const candidate = createProjectile(next);
      params = candidate.parameters; model = candidate;
      for (const p of PARAMS) { main.querySelector(`#number-${p.key}`).value = params[p.key]; main.querySelector(`#param-${p.key}`).value = params[p.key]; main.querySelector(`#number-${p.key}`).removeAttribute('aria-invalid'); }
      measurements.clear(); renderData(); main.querySelector('#data-status').textContent = '';
      main.querySelector('#parameter-error').textContent = ''; refreshModel(); timeline.reset(model.duration); persist();
    } catch (e) { main.querySelector('#parameter-error').textContent = e.message; }
  }

  // Real direct manipulation: SVG coordinates use the scene's viewBox and physical launch origin.
  let aimPointer = null;
  function launchFromPointer(event) {
    const matrix = scene.svg.getScreenCTM();
    if (!matrix) return;
    const position = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const dx = Math.max(0, position.x - scene.launchOrigin[0]);
    const dy = Math.max(0, scene.launchOrigin[1] - position.y);
    const speed = quantizeParameter((Math.hypot(dx, dy) - 30) / 120, PARAMS[0]);
    const angle = quantizeParameter(Math.atan2(dy, dx) / (Math.PI / 2), PARAMS[1]);
    apply({ ...params, v0: speed, angle });
  }
  scene.aim.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    aimPointer = event.pointerId;
    scene.svg.setPointerCapture(event.pointerId);
    launchFromPointer(event);
  }, { signal: abort.signal });
  scene.svg.addEventListener('pointermove', event => {
    if (event.pointerId === aimPointer) launchFromPointer(event);
  }, { signal: abort.signal });
  const stopAiming = event => { if (event.pointerId === aimPointer) aimPointer = null; };
  scene.svg.addEventListener('pointerup', stopAiming, { signal: abort.signal });
  scene.svg.addEventListener('pointercancel', stopAiming, { signal: abort.signal });
  scene.aim.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'ArrowUp' || event.key === 'ArrowDown'
      ? { ...params, v0: clampSceneValue(params.v0 + (event.key === 'ArrowUp' ? .5 : -.5), 0, 60) }
      : { ...params, angle: clampSceneValue(params.angle + (event.key === 'ArrowRight' ? 1 : -1), 0, 90) };
    apply(next);
  }, { signal: abort.signal });
  PARAMS.forEach(p => {
    bind(`#param-${p.key}`, 'input', e => apply({ ...params, [p.key]: Number(e.target.value) }));
    bind(`#number-${p.key}`, 'change', e => {
      const value = e.target.valueAsNumber;
      if (!Number.isFinite(value) || value < p.min || value > p.max) e.target.setAttribute('aria-invalid', 'true');
      apply({ ...params, [p.key]: value });
    });
  });
  main.querySelectorAll('[data-launch-angle]').forEach(b => b.addEventListener('click', () => apply({...params,angle:Number(b.dataset.launchAngle)}), { signal: abort.signal }));
  bind('#projectile-compare-shortcut','click',()=>{reference=model;renderComparison();});
  main.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => apply({ ...params, g: PRESETS[b.dataset.preset].g }), { signal: abort.signal }));
  main.querySelectorAll('[data-display]').forEach(el => el.addEventListener('change', () => { scene.options[el.dataset.display] = el.checked; frame(timeline.state.get().time); }, { signal: abort.signal }));
  bind('#share-setup', 'click', async () => {
    const link = projectileShareURL(params, window.location.href);
    const statusEl = main.querySelector('#share-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard chưa được cấp quyền');
      await navigator.clipboard.writeText(link);
      statusEl.textContent = 'Đã sao chép liên kết thiết lập. Bạn có thể gửi cho học sinh.';
    } catch {
      // Browsers outside HTTPS may forbid clipboard access: show an editable URL instead.
      statusEl.replaceChildren();
      const field = document.createElement('input');
      field.type = 'text'; field.value = link; field.readOnly = true;
      field.setAttribute('aria-label', 'Liên kết mô phỏng để sao chép');
      field.addEventListener('focus', () => field.select());
      statusEl.append(field);
      field.focus(); field.select();
    }
  });
  bind('#compare-save', 'click', () => { reference = model; renderComparison(); });
  bind('#compare-clear', 'click', () => { reference = null; renderComparison(); });
  bind('#play', 'click', () => { if (timeline.state.get().playing) { timeline.pause(); persist(); } else timeline.play(); });
  bind('#reset', 'click', () => { timeline.reset(); persist(); });
  bind('#scrubber', 'input', e => { timeline.seek(Number(e.target.value) / 1000 * model.duration); persist(); });
  bind('#playback-rate', 'change', e => timeline.rate(Number(e.target.value)));
  bind('#capture', 'click', () => { const ok = measurements.capture(model.at(timeline.state.get().time)); renderData(); main.querySelector('#data-status').textContent = ok ? `Đã ghi mẫu ${measurements.rows.length} tại t = ${format(timeline.state.get().time)} s.` : 'Đã đủ 100 mẫu. Xuất CSV hoặc xóa mẫu để tiếp tục.'; });
  bind('#clear-data', 'click', () => { measurements.clear(); renderData(); main.querySelector('#data-status').textContent = 'Đã xóa các mẫu đo.'; });
  bind('#csv', 'click', () => { const url = URL.createObjectURL(new Blob([measurements.csv()], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'physicslab-nem-xien.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  const onHide = () => persist(); window.addEventListener('pagehide', onHide);
  context.activeSimulation = () => ({ id: 'projectile-motion', parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: ['x', 'y', 'vx', 'vy'] });
  refreshModel(); timeline.seek(savedTime);
  return () => { persist(); timeline.destroy(); unsubscribe(); abort.abort(); window.removeEventListener('pagehide', onHide); context.activeSimulation = null; };
}
