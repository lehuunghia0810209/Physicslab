import '../styles/mechanics.css';
import { format } from '../core/units.js';
import { Timeline } from '../engines/timeline.js';
import { GraphRenderer } from '../engines/graph.js';
import { normalizePointerX, quantizeParameter } from '../core/direct-manipulation.js';

export function mountMechanicsSimulation(main, context, config) {
  const { progress } = context;
  let params = { ...config.defaults };
  let savedTime = 0;
  const saved = progress.get().sessions[config.id];
  if (saved?.parameters) {
    try {
      params = config.create(saved.parameters).parameters;
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...config.defaults };
    }
  }
  let model = config.create(params);
  progress.visit(config.id, config.title);

  main.innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">CƠ HỌC · LỚP ${config.grade}</p><h1>${config.title}</h1><p>${config.subtitle}</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="mechanics-layout">
      <section class="mechanics-workbench">
        <div class="mechanics-viewport">
          <div class="mechanics-viewport-top"><span class="tag">${config.sceneLabel}</span><strong id="mechanics-time">t = 0 s</strong></div>
          <div class="mechanics-scene mechanics-scene--${config.kind}" tabindex="0" role="slider" aria-label="Tua thời gian trực tiếp trên cảnh: ${config.sceneLabel}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0 giây">
            ${config.kind === 'collision'
              ? '<div class="collision-track"><span class="collision-block collision-block--one" id="body-one">m₁</span><span class="collision-block collision-block--two" id="body-two">m₂</span><span class="collision-floor"></span></div><p id="scene-caption" role="status"></p>'
              : config.kind === 'oscillation'
                ? '<div class="oscillator-track"><span class="oscillator-anchor">▥</span><span class="oscillator-spring" id="spring-coil"></span><span class="oscillator-mass" id="oscillator-mass">m</span><span class="oscillator-center"></span></div><p id="scene-caption" role="status"></p>'
                : `<div class="force-track"><span class="force-label">${config.kind === 'work' ? 'F cos θ' : 'F tác dụng'}</span><span class="force-arrow" role="slider" aria-label="Kéo ngang để thay đổi lực tác dụng" tabindex="0" aria-valuemin="-80" aria-valuemax="80" aria-valuenow="0" title="Kéo mũi tên để đổi lực">⟶</span><span class="motion-block" id="motion-block"></span><span class="motion-floor"></span></div><p id="scene-caption" role="status"></p>`}
          </div>
          <p class="scene-gesture-hint">Kéo trực tiếp trên cảnh để thay đổi thời điểm và quan sát số đo, đồ thị cùng cập nhật. Dùng ← → khi chọn cảnh.</p>
          <div class="mechanics-controls">
            <div class="mechanics-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
            <label class="timeline-label" for="scrubber">Thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Thời điểm trong mô phỏng">
          </div>
          <div class="mechanics-measurements">${config.readouts.map(readout => `<div><span>${readout.label}</span><strong data-readout="${readout.key}">0</strong><small>${readout.unit}</small></div>`).join('')}</div>
        </div>
      </section>
      <aside class="mechanics-panel">
        <div class="control-heading"><h2>Thiết lập</h2><span>SI</span></div>
        <div class="mechanics-parameters">${config.parameters.map(parameter => `<div class="mechanics-parameter"><label for="param-${parameter.key}">${parameter.label}</label><input id="param-${parameter.key}" type="range" min="${parameter.min}" max="${parameter.max}" step="${parameter.step}" value="${params[parameter.key]}" aria-label="${parameter.label}"><span data-param-value="${parameter.key}"></span></div>`).join('')}</div>
        <p id="model-note" class="mechanics-note"></p>
        <details class="assumptions"><summary>Giả định vật lý</summary><ul>${config.assumptions.map(text => `<li>${text}</li>`).join('')}</ul></details>
      </aside>
    </div>
    <section class="mechanics-graphs"><div class="section-heading"><div><h2>${config.graphHeading}</h2><p>Đồ thị được đồng bộ với thời gian trên mô phỏng.</p></div></div><div class="graphs-grid">${config.graphs.map(graph => `<article class="graph-card" id="graph-${graph.key}"></article>`).join('')}</div></section>`;

  const graphs = config.graphs.map(graph => new GraphRenderer(main.querySelector(`#graph-${graph.key}`), graph));
  const play = main.querySelector('#play');
  const scrubber = main.querySelector('#scrubber');
  const valueElements = [...main.querySelectorAll('[data-readout]')];
  const timeline = new Timeline(model.duration, frame, () => {
    progress.complete(config.id);
    persist();
  });
  const abort = new AbortController();
  const bind = (selector, event, listener) => main.querySelector(selector).addEventListener(event, listener, { signal: abort.signal });

  function persist() {
    progress.session(config.id, { parameters: { ...params }, time: timeline.state.get().time });
  }

  function updateScene(state) {
    const caption = main.querySelector('#scene-caption');
    const stage = main.querySelector('.mechanics-scene');
    if (stage) {
      stage.setAttribute('aria-valuemax', String(Number(model.duration.toFixed(3))));
      stage.setAttribute('aria-valuenow', String(Number(state.time.toFixed(3))));
      stage.setAttribute('aria-valuetext', `${format(state.time)} giây`);
    }
    if (config.kind === 'collision') {
      const extent = Math.max(6, Math.abs(state.x1), Math.abs(state.x2)) + 1;
      const toPercent = x => Math.max(2, Math.min(94, 50 + (x / extent) * 44));
      main.querySelector('#body-one').style.left = `${toPercent(state.x1)}%`;
      main.querySelector('#body-two').style.left = `${toPercent(state.x2)}%`;
      caption.textContent = state.collided ? 'Sau va chạm' : model.approaching ? 'Hai vật đang tiến lại gần nhau' : 'Hai vật không tiến lại gần nhau';
    } else if (config.kind === 'oscillation') {
      const x = model.parameters.amplitude > 0 ? Math.max(-1, Math.min(1, state.position / model.parameters.amplitude)) : 0;
      main.querySelector('#oscillator-mass').style.left = `${50 + x * 30}%`;
      main.querySelector('#oscillator-mass').style.transform = 'translateX(-50%)';
      const springWidth = Math.max(5, Math.min(70, 36 + x * 30));
      main.querySelector('#spring-coil').style.width = `${springWidth}%`;
      caption.textContent = `x = ${format(state.position)} m`;
    } else {
      const travel = config.kind === 'work' ? model.distance : model.maxDistance;
      const ratio = Math.max(-1, Math.min(1, state.position / Math.max(0.1, travel)));
      const block = main.querySelector('#motion-block');
      block.style.left = `${50 + ratio * 34}%`;
      block.style.transform = 'translateX(-50%)';
      caption.textContent = config.kind === 'friction'
        ? (model.threshold ? 'Ma sát nghỉ giữ vật đứng yên' : 'Vật trượt; ma sát ngược chiều chuyển động')
        : `Quãng đường: ${format(state.position)} m`;
    }
  }

  function frame(time) {
    const state = model.at(time);
    graphs.forEach(graph => graph.update(time));
    main.querySelector('#mechanics-time').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String((state.time / Math.max(model.duration, 1e-9)) * 1000);
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    valueElements.forEach(element => {
      const value = state[element.dataset.readout];
      element.textContent = Number.isFinite(value) ? format(value) : '—';
    });
    updateScene(state);
    main.querySelector('#model-note').textContent = config.explain(model);
  }

  function apply(next) {
    try {
      const normalized = config.normalize ? config.normalize(next) : next;
      model = config.create(normalized);
      params = { ...model.parameters };
      for (const parameter of config.parameters) {
        main.querySelector(`#param-${parameter.key}`).value = params[parameter.key];
        main.querySelector(`[data-param-value="${parameter.key}"]`).textContent = `${format(params[parameter.key])} ${parameter.unit}`;
      }
      timeline.reset(model.duration);
      graphs.forEach(graph => graph.setModel(model));
      frame(0);
      persist();
    } catch (error) {
      main.querySelector('#model-note').textContent = error.message;
    }
  }

  for (const parameter of config.parameters) {
    main.querySelector(`[data-param-value="${parameter.key}"]`).textContent = `${format(params[parameter.key])} ${parameter.unit}`;
    bind(`#param-${parameter.key}`, 'input', event => apply({ ...params, [parameter.key]: Number(event.target.value) }));
  }
  // Direct manipulation stays within the model's validated time range; it never invents a trajectory.
  const scene = main.querySelector('.mechanics-scene');
  let gestureId = null;
  function seekFromPointer(event) {
    const fraction = normalizePointerX(event.clientX, scene.getBoundingClientRect());
    timeline.seek(fraction * model.duration);
    frame(timeline.state.get().time);
  }
  scene.addEventListener('pointerdown', event => {
    if (event.target.closest('.force-arrow')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    gestureId = event.pointerId;
    scene.classList.add('scene-is-dragging');
    scene.setPointerCapture?.(event.pointerId);
    seekFromPointer(event);
  }, { signal: abort.signal });
  scene.addEventListener('pointermove', event => {
    if (event.pointerId === gestureId) seekFromPointer(event);
  }, { signal: abort.signal });
  const finishGesture = event => {
    if (event.pointerId !== gestureId) return;
    gestureId = null;
    scene.classList.remove('scene-is-dragging');
    persist();
  };
  scene.addEventListener('pointerup', finishGesture, { signal: abort.signal });
  scene.addEventListener('pointercancel', finishGesture, { signal: abort.signal });
  scene.addEventListener('keydown', event => {
    if (event.target !== scene) return;
    const step = model.duration / 40;
    const offset = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : null;
    const destination = event.key === 'Home' ? 0 : event.key === 'End' ? model.duration : offset === null ? null : timeline.state.get().time + offset;
    if (destination === null) return;
    event.preventDefault(); timeline.seek(destination); persist();
  }, { signal: abort.signal });
  const forceArrow = main.querySelector('.force-arrow');
  const forceConfig = config.parameters.find(parameter => parameter.key === 'force');
  if (forceArrow && forceConfig) {
    forceArrow.setAttribute('aria-valuemin', String(forceConfig.min));
    forceArrow.setAttribute('aria-valuemax', String(forceConfig.max));
    const moveForce = event => {
      const fraction = normalizePointerX(event.clientX, scene.getBoundingClientRect());
      const force = quantizeParameter(fraction, forceConfig);
      apply({ ...params, force });
      forceArrow.setAttribute('aria-valuenow', String(params.force));
      forceArrow.title = `Lực kéo ${format(params.force)} ${forceConfig.unit || 'N'}`;
    };
    let forcePointer = null;
    forceArrow.addEventListener('pointerdown', event => {
      event.stopPropagation();
      forcePointer = event.pointerId;
      forceArrow.setPointerCapture?.(event.pointerId);
      moveForce(event);
    }, { signal: abort.signal });
    forceArrow.addEventListener('pointermove', event => {
      if (event.pointerId === forcePointer) moveForce(event);
    }, { signal: abort.signal });
    forceArrow.addEventListener('pointerup', () => { forcePointer = null; }, { signal: abort.signal });
    forceArrow.addEventListener('pointercancel', () => { forcePointer = null; }, { signal: abort.signal });
    forceArrow.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const value = event.key === 'Home' ? forceConfig.min : event.key === 'End' ? forceConfig.max : params.force + (event.key === 'ArrowRight' ? forceConfig.step : -forceConfig.step);
      apply({ ...params, force: quantizeParameter((value - forceConfig.min) / (forceConfig.max - forceConfig.min), forceConfig) });
      forceArrow.setAttribute('aria-valuenow', String(params.force));
    }, { signal: abort.signal });
    forceArrow.setAttribute('aria-valuenow', String(params.force));
  }
  bind('#play', 'click', () => timeline.state.get().playing ? timeline.pause() : timeline.play());
  bind('#reset', 'click', () => { timeline.reset(model.duration); persist(); });
  bind('#scrubber', 'input', event => { timeline.seek(Number(event.target.value) / 1000 * model.duration); persist(); });
  bind('#playback-rate', 'change', event => timeline.rate(Number(event.target.value)));

  const unsubscribe = timeline.state.subscribe(state => {
    play.textContent = state.playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
  });
  graphs.forEach(graph => graph.setModel(model));
  timeline.reset(model.duration);
  timeline.seek(savedTime);
  frame(savedTime);
  persist();

  context.activeSimulation = () => ({
    id: config.id, parameters: { ...params }, state: timeline.state.get(),
    measurements: model.at(timeline.state.get().time), graphs: config.graphs.map(graph => graph.key)
  });
  return () => {
    persist();
    abort.abort();
    unsubscribe();
    timeline.destroy();
    context.activeSimulation = null;
  };
}
