import './waves.css';
import { createTravelingWave, WAVE_DEFAULTS } from '../../core/waves.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { path } from '../../engines/svg.js';
import { quantizeParameter, clampSceneValue } from '../../core/direct-manipulation.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'wave-on-string';
  let params = { ...WAVE_DEFAULTS };
  let savedTime = 0;
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try {
      const restored = createTravelingWave(saved.parameters);
      params = restored.parameters;
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...WAVE_DEFAULTS };
    }
  }
  let model = createTravelingWave(params);
  progress.visit(id, 'Khám phá sóng truyền trên dây');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">DAO ĐỘNG & SÓNG · LỚP 11</p><h1>Sóng truyền trên dây</h1><p>Điều chỉnh biên độ, tần số và bước sóng; theo dõi dạng sóng cùng dao động của một điểm trên dây.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <section class="wave-viewport panel"><div class="wave-toolbar"><span class="tag">SÓNG HÌNH SIN · TRUYỀN SANG PHẢI</span><strong id="wave-time">t = 0 s</strong></div>
      <svg id="wave-scene" viewBox="0 0 640 220" role="img" aria-label="Dạng sóng truyền trên dây">
        <line class="wave-axis" x1="40" y1="110" x2="600" y2="110"></line><line class="wave-grid" x1="40" y1="20" x2="40" y2="200"></line><path id="wave-profile" class="wave-profile"></path><circle id="wave-probe" class="wave-probe" cx="180" cy="110" r="7"></circle>
        <text x="48" y="208">0 m</text><text x="585" y="208" text-anchor="end">10 m</text><text x="600" y="104" text-anchor="end">x</text>
      </svg>
      <p class="wave-gesture-hint">Kéo lên hoặc xuống trên dây để điều chỉnh biên độ của nguồn; quan sát dạng sóng và đồ thị cập nhật ngay.</p>
      <div class="wave-readouts"><div><span>Biên độ thành phần A</span><strong id="wave-amplitude-value"></strong><small>m</small></div><div><span>Tần số f</span><strong id="wave-frequency-value"></strong><small>Hz</small></div><div><span>Bước sóng λ</span><strong id="wave-wavelength-value"></strong><small>m</small></div><div><span>Tốc độ truyền sóng</span><strong id="wave-speed"></strong><small>m/s</small></div><div><span>Li độ tại đầu dò</span><strong id="wave-displacement"></strong><small>m</small></div><div><span>Vận tốc dao động</span><strong id="wave-particle-velocity"></strong><small>m/s</small></div></div>
      <div class="wave-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
      <label class="timeline-label" for="scrubber">Thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Thời điểm trong mô phỏng"></section>
    <aside class="panel wave-parameters"><h2>Thông số sóng</h2><label class="wave-mode" for="wave-mode"><span>Dạng sóng</span><select id="wave-mode" aria-label="Dạng sóng"><option value="traveling">Sóng truyền</option><option value="standing">Sóng dừng</option><option value="interference">Giao thoa hai sóng</option></select></label>${[
      ['amplitude', 'Biên độ', 0.1, 2, 0.1, 'm'],
      ['frequency', 'Tần số', 0.2, 5, 0.1, 'Hz'],
      ['wavelength', 'Bước sóng', 0.2, 8, 0.1, 'm'],
      ['phase', 'Pha ban đầu', -180, 180, 5, '°'],
      ['phaseDifference', 'Độ lệch pha hai nguồn', -180, 180, 5, '°']
    ].map(([key, label, min, max, step, unit]) => `<label class="wave-parameter" for="wave-${key}"><span>${label}</span><strong data-wave-param="${key}"></strong><input id="wave-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
      <p id="wave-equation" class="wave-equation"></p><p id="wave-assumption" class="wave-assumption"></p></aside>
    <section class="wave-graphs"><div class="section-heading"><div><h2>Dao động tại vị trí x = λ/4</h2><p>Đồ thị theo thời gian của li độ và vận tốc dao động tại điểm đầu dò.</p></div></div><div class="graphs-grid"><article class="graph-card" id="graph-displacement"></article><article class="graph-card" id="graph-particleVelocity"></article></div></section>`;

  const graphs = [
    new GraphRenderer(main.querySelector('#graph-displacement'), { key: 'displacement', label: 'Li độ đầu dò · y–t', unit: 'm', role: 'teal' }),
    new GraphRenderer(main.querySelector('#graph-particleVelocity'), { key: 'particleVelocity', label: 'Vận tốc phần tử · u–t', unit: 'm/s', role: 'blue' })
  ];
  const play = main.querySelector('#play');
  const scrubber = main.querySelector('#scrubber');
  const timeline = new Timeline(model.duration, frame, () => { progress.complete(id); persist(); });
  const abort = new AbortController();
  const bind = (selector, event, handler) => main.querySelector(selector).addEventListener(event, handler, { signal: abort.signal });

  function persist() { progress.session(id, { parameters: { ...params }, time: timeline.state.get().time }); }
  function equation() {
    if (params.mode === 'standing') return `y = 2A sin(kx) cos(ωt + φ) · Nút sóng cách nhau λ/2 · c = fλ = ${format(model.speed)} m/s`;
    if (params.mode === 'interference') return `y = y₁ + y₂ · Aᵣ = 2A|cos(Δφ/2)| · c = fλ = ${format(model.speed)} m/s`;
    return `y = A sin(kx − ωt + φ) · c = fλ = ${format(model.speed)} m/s · T = 1/f = ${format(model.period)} s`;
  }
  function renderEquation() {
    main.querySelector('#wave-equation').textContent = `${equation()} · k = 2π/λ = ${format(model.waveNumber)} rad/m`;
    main.querySelector('#wave-assumption').textContent = params.mode === 'standing'
      ? 'Sóng dừng là chồng chất hai sóng cùng tần số, biên độ truyền ngược chiều; nút cố định và bụng dao động mạnh nhất.'
      : params.mode === 'interference'
        ? `Hai nguồn kết hợp cùng biên độ, tần số, truyền cùng chiều; độ lệch pha Δφ = ${format(params.phaseDifference)}°.`
        : 'Các phần tử môi trường dao động quanh vị trí cân bằng; sóng truyền mang năng lượng, không mang vật chất đi theo.';
    main.querySelector('#wave-phaseDifference').parentElement.hidden = params.mode !== 'interference';
  }
  function frame(time) {
    const state = model.at(time);
    const points = model.profile(time);
    main.querySelector('#wave-profile').setAttribute('d', path(points.map(point => [40 + point.x * 56, 110 - point.y * 20])));
    main.querySelector('#wave-probe').setAttribute('cx', 40 + params.wavelength / 4 * 56);
    main.querySelector('#wave-probe').setAttribute('cy', 110 - state.displacement * 20);
    main.querySelector('#wave-time').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String(state.time / model.duration * 1000);
    main.querySelector('#wave-speed').textContent = format(state.speed);
    main.querySelector('#wave-displacement').textContent = format(state.displacement);
    main.querySelector('#wave-particle-velocity').textContent = format(state.particleVelocity);
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    graphs.forEach(graph => graph.update(time));
  }
  function updateModel(next) {
    try {
      model = createTravelingWave(next);
      params = { ...model.parameters };
      for (const key of ['amplitude', 'frequency', 'wavelength', 'phase', 'phaseDifference']) {
        main.querySelector(`#wave-${key}`).value = params[key];
        main.querySelector(`[data-wave-param="${key}"]`).textContent = `${format(params[key])} ${key === 'amplitude' || key === 'wavelength' ? 'm' : key === 'frequency' ? 'Hz' : '°'}`;
      }
      main.querySelector('#wave-amplitude-value').textContent = format(params.amplitude);
      main.querySelector('#wave-frequency-value').textContent = format(params.frequency);
      main.querySelector('#wave-wavelength-value').textContent = format(params.wavelength);
      main.querySelector('#wave-mode').value = params.mode;
      renderEquation();
      graphs.forEach(graph => graph.setModel(model));
      timeline.reset(model.duration);
      frame(0);
      persist();
    } catch (error) {
      main.querySelector('#wave-equation').textContent = error.message;
    }
  }

  main.querySelector('#wave-amplitude-value').textContent = format(params.amplitude);
  main.querySelector('#wave-frequency-value').textContent = format(params.frequency);
  main.querySelector('#wave-wavelength-value').textContent = format(params.wavelength);
  main.querySelector('#wave-mode').value = params.mode;
  renderEquation();
  for (const key of ['amplitude', 'frequency', 'wavelength', 'phase', 'phaseDifference']) {
    const unit = key === 'amplitude' || key === 'wavelength' ? 'm' : key === 'frequency' ? 'Hz' : '°';
    main.querySelector(`[data-wave-param="${key}"]`).textContent = `${format(params[key])} ${unit}`;
    bind(`#wave-${key}`, 'input', event => updateModel({ ...params, [key]: Number(event.target.value) }));
  }
  bind('#wave-mode', 'change', event => updateModel({ ...params, mode: event.target.value }));
  const waveScene = main.querySelector('#wave-scene');
  let draggingWave = null;
  const setAmplitudeFromPointer = event => {
    const matrix = waveScene.getScreenCTM(); if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const magnitude = clampSceneValue(Math.abs(110 - point.y) / 28, .1, 2);
    const amplitude = quantizeParameter((magnitude - .1) / 1.9, { min: .1, max: 2, step: .1 });
    updateModel({ ...params, amplitude });
  };
  waveScene.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    draggingWave = event.pointerId;
    waveScene.setPointerCapture?.(event.pointerId);
    setAmplitudeFromPointer(event);
  }, { signal: abort.signal });
  waveScene.addEventListener('pointermove', event => {
    if (event.pointerId === draggingWave) setAmplitudeFromPointer(event);
  }, { signal: abort.signal });
  waveScene.addEventListener('pointerup', event => { if (event.pointerId === draggingWave) draggingWave = null; }, { signal: abort.signal });
  waveScene.addEventListener('pointercancel', event => { if (event.pointerId === draggingWave) draggingWave = null; }, { signal: abort.signal });
  bind('#play', 'click', () => timeline.state.get().playing ? timeline.pause() : timeline.play());
  bind('#reset', 'click', () => { timeline.reset(model.duration); persist(); });
  bind('#scrubber', 'input', event => { timeline.seek(Number(event.target.value) / 1000 * model.duration); persist(); });
  bind('#playback-rate', 'change', event => timeline.rate(Number(event.target.value)));
  const unsubscribe = timeline.state.subscribe(state => { play.textContent = state.playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy'); });
  graphs.forEach(graph => graph.setModel(model));
  timeline.reset(model.duration);
  timeline.seek(savedTime);
  frame(savedTime);
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: ['displacement', 'particleVelocity'] });
  persist();
  return () => { persist(); abort.abort(); unsubscribe(); timeline.destroy(); context.activeSimulation = null; };
}
