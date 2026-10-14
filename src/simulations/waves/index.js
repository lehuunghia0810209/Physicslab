import './waves.css';
import { createWaveExperiment, WAVE_DEFAULTS } from '../../core/waves.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { path } from '../../engines/svg.js';
import { quantizeParameter, clampSceneValue } from '../../core/direct-manipulation.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'wave-on-string';
  const defaults = { ...WAVE_DEFAULTS, mode: 'pulse', boundary: 'fixed', probePosition: 2 };
  let params = { ...defaults };
  let savedTime = 0;
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try {
      const restored = createWaveExperiment({ ...defaults, ...saved.parameters });
      params = { ...defaults, ...saved.parameters, ...restored.parameters };
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...defaults };
    }
  }
  let model = createWaveExperiment(params);
  progress.visit(id, 'Khám phá sóng truyền trên dây');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">DAO ĐỘNG & SÓNG · LỚP 11</p><h1>Sóng trên dây</h1><p>Kéo nguồn để tạo xung, di chuyển đầu dò và quan sát sóng phản xạ tại đầu cố định hoặc tự do.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <section class="wave-viewport panel"><div class="wave-toolbar"><span class="tag" id="wave-scene-mode">XUNG SÓNG · ĐẦU CỐ ĐỊNH</span><strong id="wave-time">t = 0 s</strong></div>
      <svg id="wave-scene" viewBox="0 0 640 220" role="img" aria-label="Dây sóng có nguồn điều khiển, đầu phản xạ và đầu dò di chuyển được">
        <line class="wave-axis" x1="40" y1="110" x2="600" y2="110"></line><line class="wave-grid" x1="40" y1="20" x2="40" y2="200"></line>
        <line id="wave-boundary-post" class="wave-boundary-post" x1="600" y1="38" x2="600" y2="182"></line><path id="wave-profile" class="wave-profile"></path>
        <line id="wave-probe-line" class="wave-probe-line" x1="180" y1="38" x2="180" y2="182"></line><circle id="wave-probe" class="wave-probe" cx="180" cy="110" r="7"></circle>
        <g id="wave-probe-control" class="wave-control" data-wave-drag="probe" role="slider" tabindex="0" aria-label="Vị trí đầu dò" aria-valuemin="0" aria-valuemax="8" aria-valuenow="2"><circle class="wave-hit-target" cx="180" cy="31" r="60"></circle><circle class="wave-handle-halo" cx="180" cy="31" r="20"></circle><circle class="wave-handle" cx="180" cy="31" r="9"></circle><text x="180" y="16" text-anchor="middle">ĐẦU DÒ</text></g>
        <g id="wave-source-control" class="wave-control" data-wave-drag="source" role="slider" tabindex="0" aria-label="Biên độ nguồn" aria-valuemin="0.1" aria-valuemax="2" aria-valuenow="0.5"><line id="wave-source-arm" class="wave-source-arm" x1="20" y1="110" x2="40" y2="110"></line><circle class="wave-hit-target" id="wave-source-hit" cx="40" cy="110" r="60"></circle><circle class="wave-handle-halo" id="wave-source-halo" cx="40" cy="110" r="20"></circle><circle class="wave-source-handle" id="wave-source-handle" cx="40" cy="110" r="10"></circle><text x="58" y="187">KÉO NGUỒN</text></g>
        <text x="48" y="208">0 m</text><text id="wave-length-label" x="585" y="208" text-anchor="end">8 m</text><text x="600" y="104" text-anchor="end">x</text>
      </svg>
      <p class="wave-gesture-hint" id="wave-gesture-hint">Kéo nút NGUỒN lên hoặc xuống rồi thả để phát xung. Kéo ĐẦU DÒ dọc theo dây để đo tại vị trí khác.</p>
      <div class="wave-readouts"><div><span>Biên độ thành phần A</span><strong id="wave-amplitude-value"></strong><small>m</small></div><div><span>Tần số f</span><strong id="wave-frequency-value"></strong><small>Hz</small></div><div><span>Bước sóng λ</span><strong id="wave-wavelength-value"></strong><small>m</small></div><div><span>Tốc độ truyền sóng</span><strong id="wave-speed"></strong><small>m/s</small></div><div><span>Li độ tại đầu dò</span><strong id="wave-displacement"></strong><small>m</small></div><div><span>Vận tốc dao động</span><strong id="wave-particle-velocity"></strong><small>m/s</small></div></div>
      <div class="wave-playback"><button class="button primary" id="wave-launch">Phát xung</button><button class="button secondary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
      <label class="timeline-label" for="scrubber">Thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Thời điểm trong mô phỏng"></section>
    <aside class="panel wave-parameters"><h2>Thông số sóng</h2><label class="wave-mode" for="wave-mode"><span>Kiểu khám phá</span><select id="wave-mode" aria-label="Kiểu khám phá sóng"><option value="pulse">Xung và phản xạ</option><option value="harmonic">Nguồn rung tuần hoàn</option><option value="traveling">Sóng truyền lý tưởng</option><option value="standing">Sóng dừng</option><option value="interference">Giao thoa hai sóng</option></select></label><label class="wave-mode" id="wave-boundary-field" for="wave-boundary"><span>Điều kiện biên</span><select id="wave-boundary" aria-label="Điều kiện biên"><option value="fixed">Đầu cố định · đảo dấu</option><option value="free">Đầu tự do · không đảo dấu</option></select></label>${[
      ['amplitude', 'Biên độ', 0.1, 2, 0.1, 'm'],
      ['frequency', 'Tần số', 0.2, 5, 0.1, 'Hz'],
      ['wavelength', 'Bước sóng', 0.2, 8, 0.1, 'm'],
      ['phase', 'Pha ban đầu', -180, 180, 5, '°'],
      ['phaseDifference', 'Độ lệch pha hai nguồn', -180, 180, 5, '°']
    ].map(([key, label, min, max, step, unit]) => `<label class="wave-parameter" for="wave-${key}"><span>${label}</span><strong data-wave-param="${key}"></strong><input id="wave-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
      <p id="wave-equation" class="wave-equation"></p><p id="wave-assumption" class="wave-assumption"></p></aside>
    <section class="wave-graphs"><div class="section-heading"><div><h2 id="wave-graph-title">Dao động tại đầu dò</h2><p>Đồ thị theo thời gian của li độ và vận tốc phần tử dây tại vị trí đầu dò.</p></div></div><div class="graphs-grid"><article class="graph-card" id="graph-displacement"></article><article class="graph-card" id="graph-particleVelocity"></article></div></section>`;

  const graphs = [
    new GraphRenderer(main.querySelector('#graph-displacement'), { key: 'displacement', label: 'Li độ đầu dò · y–t', unit: 'm', role: 'teal' }),
    new GraphRenderer(main.querySelector('#graph-particleVelocity'), { key: 'particleVelocity', label: 'Vận tốc phần tử · u–t', unit: 'm/s', role: 'blue' })
  ];
  const play = main.querySelector('#play');
  const scrubber = main.querySelector('#scrubber');
  const timeline = new Timeline(model.duration, frame, () => { progress.complete(id); persist(); });
  const abort = new AbortController();
  const bind = (selector, event, handler) => main.querySelector(selector).addEventListener(event, handler, { signal: abort.signal });
  const isRopeMode = () => params.mode === 'pulse' || params.mode === 'harmonic';
  let sourcePreviewY = null;

  function persist() { progress.session(id, { parameters: { ...params }, time: timeline.state.get().time }); }
  function equation() {
    if (params.mode === 'pulse') return `xung y(x,t) truyền với c = fλ = ${format(model.speed)} m/s · phản xạ ${params.boundary === 'fixed' ? 'đảo dấu' : 'không đảo dấu'}`;
    if (params.mode === 'harmonic') return `y(x,t) = A sin[2πf(t − x/c)] sau khi mặt sóng tới · c = fλ = ${format(model.speed)} m/s`;
    if (params.mode === 'standing') return `y = 2A sin(kx) cos(ωt + φ) · Nút sóng cách nhau λ/2 · c = fλ = ${format(model.speed)} m/s`;
    if (params.mode === 'interference') return `y = y₁ + y₂ · Aᵣ = 2A|cos(Δφ/2)| · c = fλ = ${format(model.speed)} m/s`;
    return `y = A sin(kx − ωt + φ) · c = fλ = ${format(model.speed)} m/s · T = 1/f = ${format(model.period)} s`;
  }
  function renderEquation() {
    main.querySelector('#wave-equation').textContent = `${equation()} · k = 2π/λ = ${format(model.waveNumber)} rad/m`;
    main.querySelector('#wave-assumption').textContent = isRopeMode()
      ? `Dây 1D lý tưởng, không tán sắc. Đầu ${params.boundary === 'fixed' ? 'cố định có li độ bằng 0 và xung phản xạ đảo dấu' : 'tự do phản xạ không đảo dấu'}. Chuyển động phần tử vuông góc với hướng truyền năng lượng.`
      : params.mode === 'standing'
      ? 'Sóng dừng là chồng chất hai sóng cùng tần số, biên độ truyền ngược chiều; nút cố định và bụng dao động mạnh nhất.'
      : params.mode === 'interference'
        ? `Hai nguồn kết hợp cùng biên độ, tần số, truyền cùng chiều; độ lệch pha Δφ = ${format(params.phaseDifference)}°.`
        : 'Các phần tử môi trường dao động quanh vị trí cân bằng; sóng truyền mang năng lượng, không mang vật chất đi theo.';
    main.querySelector('#wave-phaseDifference').parentElement.hidden = params.mode !== 'interference';
    main.querySelector('#wave-phase').parentElement.hidden = isRopeMode();
    main.querySelector('#wave-boundary-field').hidden = !isRopeMode();
    main.querySelector('#wave-launch').hidden = !isRopeMode();
    main.querySelector('#wave-launch').textContent = params.mode === 'pulse' ? 'Phát xung' : 'Khởi động nguồn';
    main.querySelector('#wave-boundary').value = params.boundary;
    main.querySelector('#wave-scene-mode').textContent = params.mode === 'pulse'
      ? `XUNG SÓNG · ĐẦU ${params.boundary === 'fixed' ? 'CỐ ĐỊNH' : 'TỰ DO'}`
      : params.mode === 'harmonic'
        ? `NGUỒN TUẦN HOÀN · ĐẦU ${params.boundary === 'fixed' ? 'CỐ ĐỊNH' : 'TỰ DO'}`
        : params.mode === 'standing' ? 'SÓNG DỪNG' : params.mode === 'interference' ? 'GIAO THOA HAI SÓNG' : 'SÓNG TRUYỀN LÝ TƯỞNG';
    main.querySelector('#wave-gesture-hint').textContent = isRopeMode()
      ? 'Kéo nút NGUỒN lên hoặc xuống rồi thả để phát sóng. Kéo ĐẦU DÒ dọc theo dây để đo tại vị trí khác.'
      : 'Kéo nút NGUỒN để đổi biên độ. Kéo ĐẦU DÒ dọc theo dây để quan sát một phần tử khác.';
  }
  function frame(time) {
    const state = model.at(time);
    const points = model.profile(time);
    const length = model.length ?? 10;
    const sceneX = position => 40 + position / length * 560;
    const probeX = sceneX(state.probePosition);
    main.querySelector('#wave-profile').setAttribute('d', path(points.map(point => [sceneX(point.x), 110 - point.y * 20])));
    main.querySelector('#wave-probe').setAttribute('cx', probeX);
    main.querySelector('#wave-probe').setAttribute('cy', 110 - state.displacement * 20);
    for (const element of [main.querySelector('#wave-probe-line'), main.querySelector('#wave-probe-control .wave-hit-target'), main.querySelector('#wave-probe-control .wave-handle-halo'), main.querySelector('#wave-probe-control .wave-handle')]) {
      element.setAttribute('x1', probeX); element.setAttribute('x2', probeX); element.setAttribute('cx', probeX);
    }
    main.querySelector('#wave-probe-control text').setAttribute('x', probeX);
    const idleSourceY = 110 - params.amplitude * 28;
    const sourceY = sourcePreviewY ?? (timeline.state.get().playing || state.time > 0 ? 110 - (state.sourceDisplacement ?? points[0].y) * 20 : idleSourceY);
    main.querySelector('#wave-source-arm').setAttribute('y2', sourceY);
    main.querySelector('#wave-source-hit').setAttribute('cy', sourceY);
    main.querySelector('#wave-source-halo').setAttribute('cy', sourceY);
    main.querySelector('#wave-source-handle').setAttribute('cy', sourceY);
    main.querySelector('#wave-boundary-post').classList.toggle('is-free', params.boundary === 'free' && isRopeMode());
    main.querySelector('#wave-length-label').textContent = `${format(length)} m`;
    const probeControl = main.querySelector('#wave-probe-control');
    probeControl.setAttribute('aria-valuemax', String(length));
    probeControl.setAttribute('aria-valuenow', String(state.probePosition));
    probeControl.setAttribute('aria-valuetext', `${format(state.probePosition)} mét`);
    const sourceControl = main.querySelector('#wave-source-control');
    sourceControl.setAttribute('aria-valuenow', String(params.amplitude));
    sourceControl.setAttribute('aria-valuetext', `${format(params.amplitude)} mét`);
    main.querySelector('#wave-time').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String(state.time / model.duration * 1000);
    main.querySelector('#wave-speed').textContent = format(state.speed);
    main.querySelector('#wave-displacement').textContent = format(state.displacement);
    main.querySelector('#wave-particle-velocity').textContent = format(state.particleVelocity);
    main.querySelector('#wave-graph-title').textContent = `Dao động tại đầu dò x = ${format(state.probePosition)} m`;
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    graphs.forEach(graph => graph.update(time));
  }
  function updateModel(next, { keepTime = false } = {}) {
    try {
      const previousTime = timeline.state.get().time;
      const candidate = { ...defaults, ...params, ...next };
      model = createWaveExperiment(candidate);
      params = { ...candidate, ...model.parameters };
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
      if (keepTime) timeline.seek(Math.min(previousTime, model.duration));
      persist();
    } catch (error) {
      main.querySelector('#wave-equation').textContent = error.message;
    }
  }

  main.querySelector('#wave-amplitude-value').textContent = format(params.amplitude);
  main.querySelector('#wave-frequency-value').textContent = format(params.frequency);
  main.querySelector('#wave-wavelength-value').textContent = format(params.wavelength);
  main.querySelector('#wave-mode').value = params.mode;
  main.querySelector('#wave-boundary').value = params.boundary;
  renderEquation();
  for (const key of ['amplitude', 'frequency', 'wavelength', 'phase', 'phaseDifference']) {
    const unit = key === 'amplitude' || key === 'wavelength' ? 'm' : key === 'frequency' ? 'Hz' : '°';
    main.querySelector(`[data-wave-param="${key}"]`).textContent = `${format(params[key])} ${unit}`;
    bind(`#wave-${key}`, 'input', event => updateModel({ ...params, [key]: Number(event.target.value) }));
  }
  bind('#wave-mode', 'change', event => updateModel({ ...params, mode: event.target.value }));
  bind('#wave-boundary', 'change', event => updateModel({ ...params, boundary: event.target.value }));
  const waveScene = main.querySelector('#wave-scene');
  let draggingWave = null;
  const scenePoint = event => {
    const matrix = waveScene.getScreenCTM(); if (!matrix) return;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  };
  const updateDrag = event => {
    if (!draggingWave || event.pointerId !== draggingWave.pointerId) return;
    const point = scenePoint(event); if (!point) return;
    if (draggingWave.type === 'probe') {
      const length = model.length ?? 10;
      const raw = clampSceneValue(draggingWave.value + (point.x - draggingWave.start.x) * length / 560, 0, length);
      const probePosition = quantizeParameter(raw / length, { min: 0, max: length, step: 0.1 });
      updateModel({ ...params, probePosition }, { keepTime: true });
    } else {
      const raw = clampSceneValue(draggingWave.value + (draggingWave.start.y - point.y) / 28, 0.1, 2);
      const amplitude = quantizeParameter((raw - 0.1) / 1.9, { min: 0.1, max: 2, step: 0.1 });
      sourcePreviewY = clampSceneValue(point.y, 54, 166);
      updateModel({ ...params, amplitude }, { keepTime: true });
    }
  };
  waveScene.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const control = event.target.closest('[data-wave-drag]');
    if (!control) return;
    const point = scenePoint(event); if (!point) return;
    timeline.pause();
    draggingWave = { pointerId: event.pointerId, type: control.dataset.waveDrag, start: point, value: control.dataset.waveDrag === 'probe' ? params.probePosition : params.amplitude };
    waveScene.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { signal: abort.signal });
  waveScene.addEventListener('pointermove', updateDrag, { signal: abort.signal });
  waveScene.addEventListener('pointerup', event => {
    if (!draggingWave || event.pointerId !== draggingWave.pointerId) return;
    const releasedSource = draggingWave.type === 'source';
    draggingWave = null; sourcePreviewY = null;
    if (releasedSource && isRopeMode()) { timeline.reset(model.duration); timeline.play(); } else frame(timeline.state.get().time);
    persist();
  }, { signal: abort.signal });
  waveScene.addEventListener('pointercancel', event => {
    if (!draggingWave || event.pointerId !== draggingWave.pointerId) return;
    draggingWave = null; sourcePreviewY = null; frame(timeline.state.get().time);
  }, { signal: abort.signal });
  const adjustHandle = (type, direction) => {
    if (type === 'probe') {
      const length = model.length ?? 10;
      updateModel({ ...params, probePosition: clampSceneValue(params.probePosition + direction * 0.1, 0, length) }, { keepTime: true });
    } else updateModel({ ...params, amplitude: clampSceneValue(params.amplitude + direction * 0.1, 0.1, 2) }, { keepTime: true });
  };
  for (const type of ['probe', 'source']) {
    bind(`#wave-${type}-control`, 'keydown', event => {
      const horizontal = type === 'probe' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight');
      const vertical = type === 'source' && (event.key === 'ArrowDown' || event.key === 'ArrowUp');
      if (horizontal || vertical) {
        event.preventDefault();
        adjustHandle(type, event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1);
      } else if (type === 'source' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault(); timeline.reset(model.duration); timeline.play();
      }
    });
  }
  bind('#wave-launch', 'click', () => { timeline.reset(model.duration); timeline.play(); });
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
