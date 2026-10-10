import './newton.css';
import { createNewtonMotion, NEWTON_DEFAULTS } from '../../core/newton.js';
import { clamp, format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { quantizeParameter, normalizePointerX } from '../../core/direct-manipulation.js';

export function mount(main, context) {
  const { progress } = context;
  let params = { ...NEWTON_DEFAULTS };
  let model = createNewtonMotion(params);
  let savedTime = 0;
  const saved = progress.get().sessions.newton;
  if (saved && saved.parameters) {
    try {
      const candidate = createNewtonMotion(saved.parameters);
      params = candidate.parameters;
      model = candidate;
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      // Ignore invalid stored session and fall back to defaults.
    }
  }
  progress.visit('newton', 'Khám phá định luật Newton');
  const abort = new AbortController();

  function syncReadout(state) {
    const current = model.at(state.time);
    main.querySelector('#result-accel').textContent = `${format(current.acceleration)} m/s²`;
    main.querySelector('#result-net').textContent = `${format(current.netForce)} N`;
    main.querySelector('#result-friction').textContent = `${format(current.frictionForce)} N`;
    main.querySelector('#result-velocity').textContent = `${format(current.velocity)} m/s`;
    main.querySelector('#result-position').textContent = `${format(current.position)} m`;
    main.querySelector('#result-state').textContent = model.threshold ? 'Khối đang ở trạng thái cân bằng: lực kéo chưa vượt ngưỡng ma sát tĩnh.' : `Vật đang di chuyển ${model.direction} lực tác dụng.`;
    main.querySelector('#result-note').textContent = model.threshold ? 'Hệ số ma sát đủ lớn để ngăn khối bắt đầu chuyển động.' : `Gia tốc xuất hiện vì F_net = ${format(model.netForce)} N.`;
    main.querySelector('#time-label').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#scrubber').value = String((state.time / Math.max(model.duration, 1e-9)) * 1000 || 0);
    main.querySelector('#play-label').textContent = state.playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    const block = main.querySelector('#newton-block');
    const maxTravel = Math.max(0, main.querySelector('.newton-scene').clientWidth - block.clientWidth - 96);
    const travel = model.threshold ? 0 : clamp((current.position / Math.max(model.maxDistance, 0.5)) * maxTravel, -maxTravel, maxTravel);
    block.style.transform = `translateX(${travel}px)`;
    main.querySelector('.newton-scene').setAttribute('aria-valuenow', String(Number(state.time.toFixed(3))));
    main.querySelector('.newton-scene').setAttribute('aria-valuemax', String(Number(model.duration.toFixed(3))));
    block.textContent = `m = ${model.parameters.mass} kg`;
  }

  function frame(time) {
    const state = model.at(time);
    graphs.forEach(graph => graph.update(time));
    syncReadout({ time, playing: timeline.state.get().playing });
    if (time >= model.duration && model.duration > 0) {
      main.querySelector('#play-label').textContent = 'Chạy lại';
    }
  }

  function apply(next) {
    try {
      model = createNewtonMotion(next);
      params = { ...model.parameters };
      for (const key of Object.keys(NEWTON_DEFAULTS)) {
        const input = main.querySelector(`#${key}`);
        if (input) input.value = params[key];
      }
      timeline.reset(model.duration);
      graphs.forEach(graph => graph.setModel(model));
      frame(0);
      persist();
    } catch (error) {
      main.querySelector('#result-state').textContent = error.message;
    }
  }

  main.innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">CƠ HỌC · LỚP 10</p><h1>Định luật Newton</h1><p>Khảo sát mối quan hệ giữa lực, khối lượng và gia tốc.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="simulation-layout">
      <section class="simulation-workbench">
        <div class="viewport-panel">
          <div class="viewport-top"><span class="tag">BÀN MÔ PHỎNG LỰC</span><span class="tag">F = ma</span><span id="time-label" class="time-label">t = 0 s</span></div>
          <div class="newton-scene" role="slider" tabindex="0" aria-label="Kéo khối để tua thời gian chuyển động" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="newton-vector force" role="slider" tabindex="0" aria-label="Kéo mũi tên lực để thay đổi lực tác dụng" aria-valuemin="-80" aria-valuemax="80" aria-valuenow="0">
              <svg viewBox="0 0 180 48"><line x1="20" y1="24" x2="142" y2="24" /><path d="M138 12 L160 24 L138 36" /><text x="48" y="18">F kéo</text></svg>
            </div>
            <div class="newton-vector friction" aria-hidden="true">
              <svg viewBox="0 0 180 48"><line x1="150" y1="24" x2="24" y2="24" /><path d="M30 12 L8 24 L30 36" /><text x="70" y="18">F ma sát</text></svg>
            </div>
            <div class="newton-block" id="newton-block">m = ${params.mass} kg</div>
            <div class="newton-floor"></div>
          </div>
          <p class="newton-gesture-hint">Kéo khối để tua chuyển động; kéo mũi tên lực để thay đổi lực kéo và quan sát gia tốc.</p>
          <div class="newton-legend">
            <span><i class="newton-dot force"></i> Lực tác dụng</span>
            <span><i class="newton-dot friction"></i> Ma sát</span>
            <span><i class="newton-dot net"></i> Lực tổng</span>
          </div>
          <div class="measurement-strip">
            <div><span>Gia tốc</span><strong id="result-accel">0</strong><small>m/s²</small></div>
            <div><span>Lực tổng</span><strong id="result-net">0</strong><small>N</small></div>
            <div><span>Ma sát</span><strong id="result-friction">0</strong><small>N</small></div>
            <div><span>Vận tốc</span><strong id="result-velocity">0</strong><small>m/s</small></div>
            <div><span>Vị trí</span><strong id="result-position">0</strong><small>m</small></div>
          </div>
        </div>
      </section>
      <aside class="control-panel">
        <div class="control-heading"><h2>Thiết lập</h2><span>SI</span></div>
        <div class="parameters">
          <div class="parameter"><label for="mass">Khối lượng</label><input id="mass" type="range" min="1" max="30" step="0.5" value="${params.mass}"><span>${params.mass} kg</span></div>
          <div class="parameter"><label for="force">Lực tác dụng</label><input id="force" type="range" min="-80" max="80" step="1" value="${params.force}"><span>${params.force} N</span></div>
          <div class="parameter"><label for="friction">Hệ số ma sát</label><input id="friction" type="range" min="0" max="1" step="0.05" value="${params.friction}"><span>${params.friction}</span></div>
          <div class="parameter"><label for="gravity">Gia tốc trọng trường</label><input id="gravity" type="range" min="1" max="25" step="0.1" value="${params.gravity}"><span>${params.gravity} m/s²</span></div>
        </div>
        <div class="playback-row">
          <button class="button primary" id="play"><span id="play-label">Chạy</span></button>
          <button class="button secondary" id="reset">Đặt lại</button>
          <label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="3">3×</option></select></label>
        </div>
        <label class="timeline-label" for="scrubber">Thời gian<span>${format(model.duration)} s</span></label>
        <input id="scrubber" type="range" min="0" max="1000" value="0" step="1" aria-label="Thời điểm trong chuyển động">
        <p id="result-state" class="helper-text">Vật đang sẵn sàng để khảo sát.</p>
        <p id="result-note" class="helper-text">Độ lớn ma sát tăng theo khối lượng và trọng trường.</p>
        <details class="assumptions" open><summary>Giả định vật lý</summary><ul><li>Vật chuyển động trên mặt phẳng ngang.</li><li>Chỉ có lực kéo, ma sát và trọng lực tác dụng.</li><li>Ma sát tĩnh và động được mô hình hóa bằng μmg.</li></ul></details>
      </aside>
    </div>
    <section class="panel">
      <div class="section-heading"><div><h2>Đồ thị chuyển động</h2><p>Vị trí và vận tốc đồng bộ với đồng hồ thời gian thực của mô phỏng.</p></div></div>
      <div class="graphs-grid">
        <article class="graph-card" id="graph-position"></article>
        <article class="graph-card" id="graph-velocity"></article>
      </div>
    </section>
  `;

  const graphs = [
    new GraphRenderer(main.querySelector('#graph-position'), { key: 'position', label: 'Vị trí · x–t', unit: 'm', role: 'teal' }),
    new GraphRenderer(main.querySelector('#graph-velocity'), { key: 'velocity', label: 'Vận tốc · v–t', unit: 'm/s', role: 'blue' })
  ];

  const timeline = new Timeline(model.duration, frame, () => {
    progress.complete('newton');
    persist();
  });
  function persist() {
    progress.session('newton', { parameters: { ...params }, time: timeline.state.get().time });
  }

  const unsubscribe = timeline.state.subscribe(state => {
    const label = state.playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    main.querySelector('#play-label').textContent = label;
  });

  function initialize() {
    graphs.forEach(graph => graph.setModel(model));
    timeline.reset(model.duration);
    timeline.seek(savedTime);
    frame(savedTime);
    persist();
  }

  for (const key of ['mass', 'force', 'friction', 'gravity']) {
    main.querySelector(`#${key}`)?.addEventListener('input', e => {
      const next = { ...params, [key]: Number(e.target.value) };
      apply(next);
    });
  }

  main.querySelector('#play')?.addEventListener('click', () => {
    if (timeline.state.get().playing) timeline.pause();
    else timeline.play();
    persist();
  });

  main.querySelector('#reset')?.addEventListener('click', () => {
    timeline.reset(model.duration);
    frame(0);
    persist();
  });

  main.querySelector('#scrubber')?.addEventListener('input', e => {
    const time = (Number(e.target.value) / 1000) * model.duration;
    timeline.seek(time);
    persist();
  });

  main.querySelector('#playback-rate')?.addEventListener('change', e => {
    timeline.rate(Number(e.target.value));
  });

  // Drag the block to inspect a physical time, or drag the force arrow to change F.
  const stage = main.querySelector('.newton-scene');
  const forceHandle = main.querySelector('.newton-vector.force');
  let stagePointer = null; let forcePointer = null;
  function seekByPointer(event) {
    timeline.seek(normalizePointerX(event.clientX, stage.getBoundingClientRect()) * model.duration);
    persist();
  }
  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('.newton-vector')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    stagePointer = event.pointerId; stage.setPointerCapture?.(event.pointerId); seekByPointer(event);
  }, { signal: abort.signal });
  stage.addEventListener('pointermove', event => { if (event.pointerId === stagePointer) seekByPointer(event); }, { signal: abort.signal });
  const stopStage = event => { if (event.pointerId === stagePointer) stagePointer = null; };
  stage.addEventListener('pointerup', stopStage, { signal: abort.signal });
  stage.addEventListener('pointercancel', stopStage, { signal: abort.signal });
  stage.addEventListener('keydown', event => {
    if (event.target !== stage || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); timeline.seek(timeline.state.get().time + (event.key === 'ArrowRight' ? 1 : -1) * model.duration/35); persist();
  }, { signal: abort.signal });
  function forceFromPointer(event) {
    const force = quantizeParameter(normalizePointerX(event.clientX, stage.getBoundingClientRect()),{min:-80,max:80,step:1});
    apply({...params,force});forceHandle.setAttribute('aria-valuenow',String(params.force));
  }
  forceHandle.addEventListener('pointerdown', event => {
    event.stopPropagation(); forcePointer = event.pointerId; forceHandle.setPointerCapture?.(event.pointerId); forceFromPointer(event);
  }, { signal: abort.signal });
  forceHandle.addEventListener('pointermove', event => { if (event.pointerId === forcePointer) forceFromPointer(event); }, { signal: abort.signal });
  forceHandle.addEventListener('pointerup', () => { forcePointer = null; }, { signal: abort.signal });
  forceHandle.addEventListener('pointercancel', () => { forcePointer = null; }, { signal: abort.signal });
  forceHandle.addEventListener('keydown', event => {
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    apply({...params,force:Math.max(-80,Math.min(80,params.force+(event.key==='ArrowRight'?1:-1)))});
    forceHandle.setAttribute('aria-valuenow',String(params.force));
  },{signal:abort.signal});
  forceHandle.setAttribute('aria-valuenow',String(params.force));
  initialize();
  context.activeSimulation = () => ({ id: 'newton', parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: ['position', 'velocity'] });
  return () => {
    persist();
    abort.abort();
    unsubscribe();
    timeline.destroy();
    context.activeSimulation = null;
  };
}
