import './thermal.css';
import { createIdealGas, IDEAL_GAS_DEFAULTS } from '../../core/ideal-gas.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { quantizeParameter, clampSceneValue } from '../../core/direct-manipulation.js';
import { particlePositions } from '../../core/gas-particles.js';
import { volumeToPistonX, pistonXToVolume } from '../../core/scene-geometry.js';
import { gasWorkbenchAction } from '../../core/gas-workbench-actions.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'ideal-gas';
  let params = { ...IDEAL_GAS_DEFAULTS };
  let savedTime = 0;
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try {
      const restored = createIdealGas(saved.parameters);
      params = restored.parameters;
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...IDEAL_GAS_DEFAULTS };
    }
  }
  let model = createIdealGas(params);
  progress.visit(id, 'Khám phá định luật khí lí tưởng');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">NHIỆT HỌC · LỚP 12</p><h1>Khí lí tưởng và các quá trình</h1><p>Điều khiển piston và quan sát mối liên hệ giữa áp suất, thể tích, nhiệt độ cùng trao đổi năng lượng.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="gas-layout"><section class="panel gas-workbench"><div class="gas-topline"><span class="tag">MÔ HÌNH KHÍ LÍ TƯỞNG ĐƠN NGUYÊN TỬ</span><strong id="gas-time"></strong></div>
      <div class="gas-preset-actions" role="group" aria-label="Tình huống thí nghiệm khí"><button type="button" data-gas-preset="expand">Giãn nở</button><button type="button" data-gas-preset="compress">Nén khí</button><button type="button" data-gas-preset="heat">Đẳng tích: gia nhiệt</button></div><div class="gas-apparatus-actions" role="group" aria-label="Thao tác trực tiếp với bình khí"><button type="button" data-gas-action="pump">➕ Bơm khí</button><button type="button" data-gas-action="vent">➖ Xả khí</button><button type="button" data-gas-action="heat">♨️ Gia nhiệt</button><button type="button" data-gas-action="cool">❄️ Làm lạnh</button></div>
      <svg id="gas-scene" viewBox="0 0 620 300" role="img" aria-label="Bình khí có piston kéo được, các phân tử khí minh họa chuyển động nhiệt"><defs><clipPath id="gas-particle-clip"><rect id="gas-clip-rect" x="116" y="65" width="184" height="172" rx="3"/></clipPath></defs><rect class="gas-cylinder" x="100" y="55" width="420" height="190" rx="12"/><g id="gas-particles" clip-path="url(#gas-particle-clip)"></g><line id="gas-target-line" class="gas-target-line" x1="324" y1="57" x2="324" y2="245" aria-hidden="true"/><rect id="gas-piston" class="gas-piston-hit" x="257" y="55" width="110" height="190" tabindex="0" role="slider" aria-label="Kéo piston để điều chỉnh thể tích cuối" aria-valuemin="0.001" aria-valuemax="0.4" aria-valuenow="0.04"/><rect id="gas-piston-visual" class="gas-piston" x="300" y="55" width="24" height="190" aria-hidden="true"/><g class="gas-piston-handle" aria-hidden="true"><path id="gas-handle-rod" d="M324 150H557"/><rect x="535" y="125" width="24" height="50" rx="7"/></g><text id="gas-piston-label" x="306" y="272"></text><text id="gas-target-label" x="420" y="48" class="gas-target-label">V đích</text><g id="gas-pressure-meter" role="img" aria-label="Đồng hồ áp suất khí"><rect x="390" y="7" width="164" height="37" rx="9" class="gas-meter-box"/><text x="402" y="23" class="gas-meter-caption">ÁP SUẤT</text><text id="gas-pressure-scene-value" x="402" y="37" class="gas-meter-digits">-- kPa</text></g><text class="gas-scene-label" x="112" y="38">KHÍ LÍ TƯỞNG · MÔ HÌNH VI MÔ</text><text class="gas-scene-label" x="505" y="286" text-anchor="end">KÉO PISTON ↔</text></svg><div class="gas-live-legend"><span>│ Nét đứt: thể tích đích, nét liền: piston thực</span><span><i class="gas-legend-dot"></i> Phân tử khí đang chuyển động</span><span>Chuyển động minh họa · số đo lấy từ PV = nRT</span></div>
      <p class="gas-gesture-hint">Kéo piston sang trái hoặc phải để thay đổi thể tích cuối. Khi chọn đẳng tích, piston được cố định. Vị trí piston dùng thang logarit để dễ thấy cả thể tích nhỏ; số đo và công thức luôn sử dụng thể tích thực.</p>
      <div class="gas-readouts">${[['pressure','Áp suất P','Pa'],['volume','Thể tích V','m³'],['temperature','Nhiệt độ T','K'],['internalEnergy','Nội năng U','J'],['work','Công W','J'],['heat','Nhiệt lượng Q','J']].map(([key,label,unit])=>`<div><span>${label}</span><strong id="gas-${key}"></strong><small>${unit}</small></div>`).join('')}</div>
      <div class="gas-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
      <label class="timeline-label" for="scrubber">Tiến trình <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Tiến trình quá trình nhiệt"></section>
      <aside class="panel gas-controls"><h2>Điều kiện ban đầu và quá trình</h2><label class="gas-process" for="gas-process"><span>Quá trình nhiệt</span><select id="gas-process" aria-label="Chọn quá trình nhiệt"><option value="isothermal">Đẳng nhiệt</option><option value="isobaric">Đẳng áp</option><option value="isochoric">Đẳng tích</option></select></label>
        ${[['amount','Lượng chất n',0.1,10,0.1,'mol'],['initialVolume','Thể tích đầu V₀',0.001,0.2,0.001,'m³'],['finalVolume','Thể tích cuối V₁',0.001,0.4,0.001,'m³'],['initialTemperature','Nhiệt độ đầu T₀',100,1000,5,'K'],['finalTemperature','Nhiệt độ cuối T₁',100,1000,5,'K']].map(([key,label,min,max,step,unit])=>`<label class="gas-parameter" data-gas-field="${key}" for="gas-${key}"><span>${label}</span><strong data-gas-param="${key}"></strong><input id="gas-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
        <p id="gas-equation" class="gas-equation"></p><p class="gas-assumption">PV = nRT, khí lí tưởng đơn nguyên tử: U = 3nRT/2. Quy ước W dương khi khí sinh công, Q = ΔU + W.</p></aside></div>
    <section class="gas-graph"><div class="section-heading"><div><h2>Đồ thị trạng thái P–V</h2><p>Đường đi nhiệt động lực học ứng với quá trình đã chọn.</p></div></div><article id="graph-pv" class="graph-card"></article></section>`;

  const graph = new GraphRenderer(main.querySelector('#graph-pv'), { key: 'pressure', label: 'Áp suất theo thể tích · P–V', unit: 'Pa', role: 'blue', xKey: 'volume', xLabel: 'V (m³)' });
  const scrubber = main.querySelector('#scrubber');
  const play = main.querySelector('#play');
  const abort = new AbortController();
  const timeline = new Timeline(model.duration, frame, () => { progress.complete(id); persist(); });
  function persist() { progress.session(id, { parameters: { ...params }, time: timeline.state.get().time }); }

  function frame(time) {
    const state = model.at(time);
    for (const key of ['pressure','volume','temperature','internalEnergy','work','heat']) main.querySelector(`#gas-${key}`).textContent = format(state[key]);
    main.querySelector('#gas-time').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#gas-pressure-scene-value').textContent = `${format(state.pressure/1000,2)} kPa`;
    main.querySelector('#gas-scene').dataset.thermal = state.temperature>=500?'hot':state.temperature<275?'cold':'normal';
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String(state.progress * 1000);
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    // Piston area tracks volume linearly for each set of endpoints. The minimum
    // 18px width keeps small but nonzero volumes visible; numeric values stay exact.
    const pistonX = volumeToPistonX(Math.max(.001, Math.min(.4, state.volume)));
    main.querySelector('#gas-piston').setAttribute('x', pistonX - 43);
    main.querySelector('#gas-piston-visual').setAttribute('x', pistonX);
    main.querySelector('#gas-piston').setAttribute('aria-valuenow', String(params.finalVolume));
    main.querySelector('#gas-piston').setAttribute('aria-valuetext', `${format(params.finalVolume, 3)} mét khối`);
    main.querySelector('#gas-piston-label').setAttribute('x', Math.min(510, Math.max(155, pistonX + 10)));
    main.querySelector('#gas-piston-label').textContent = `V hiện tại = ${format(state.volume, 3)} m³`;
    const target=volumeToPistonX(params.process==='isochoric'?params.initialVolume:params.finalVolume);
    const guide=main.querySelector('#gas-target-line');
    guide.setAttribute('x1',target);guide.setAttribute('x2',target);
    guide.hidden=params.process==='isochoric';
    const label=main.querySelector('#gas-target-label');label.setAttribute('x',Math.min(490,Math.max(115,target-35)));
    label.textContent=params.process==='isochoric'?'Piston cố định':`V đích = ${format(params.finalVolume,3)} m³`;
    main.querySelector('#gas-clip-rect').setAttribute('width', Math.max(12, pistonX - 118));
    main.querySelector('#gas-handle-rod').setAttribute('d', `M${pistonX + 24} 150H557`);
    const width = Math.max(16, pistonX - 118);
    main.querySelector('#gas-particles').innerHTML = particlePositions({ time, temperature: state.temperature }).map(p =>
      `<circle class="gas-particle" cx="${118 + p.x * width}" cy="${66 + p.y * 171}" r="${p.radius}"/>`
    ).join('');
    main.querySelector('#gas-equation').textContent = `PV = nRT · P = ${format(state.pressure)} Pa · W = ${format(state.work)} J · ΔU = ${format(state.changeInInternalEnergy)} J · Q = ΔU + W`;
    graph.update(time);
  }

  function replaceModel(next) {
    try {
      model = createIdealGas(next);
      params = { ...model.parameters };
      main.querySelector('#gas-process').value = params.process;
      renderApplicableControls();
      for (const key of Object.keys(IDEAL_GAS_DEFAULTS)) {
        const input = main.querySelector(`#gas-${key}`);
        if (input) input.value = params[key];
      }
      for (const key of ['amount','initialVolume','finalVolume','initialTemperature','finalTemperature']) {
        const unit = key.includes('Volume') ? 'm³' : key.includes('Temperature') ? 'K' : 'mol';
        main.querySelector(`[data-gas-param="${key}"]`).textContent = `${format(params[key])} ${unit}`;
      }
      graph.setModel(model);
      timeline.reset(model.duration);
      frame(0);
      persist();
    } catch (error) {
      main.querySelector('#gas-equation').textContent = error.message;
    }
  }

  function renderApplicableControls() {
    main.querySelector('[data-gas-field="finalVolume"]').hidden = params.process === 'isochoric';
    main.querySelector('[data-gas-field="finalTemperature"]').hidden = params.process !== 'isochoric';
  }

  for (const key of ['amount','initialVolume','finalVolume','initialTemperature','finalTemperature']) {
    main.querySelector(`#gas-${key}`).addEventListener('input', event => replaceModel({ ...params, [key]: Number(event.target.value) }), { signal: abort.signal });
    main.querySelector(`[data-gas-param="${key}"]`).textContent = `${format(params[key])} ${key.includes('Volume') ? 'm³' : key.includes('Temperature') ? 'K' : key === 'amount' ? 'mol' : ''}`;
  }
  main.querySelector('#gas-process').value = params.process;
  renderApplicableControls();
  main.querySelector('#gas-process').addEventListener('change', event => replaceModel({ ...params, process: event.target.value }), { signal: abort.signal });
  main.querySelectorAll('[data-gas-preset]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.gasPreset;
    if(kind==='expand')replaceModel({...params,process:'isothermal',initialVolume:.02,finalVolume:.07,initialTemperature:300});
    else if(kind==='compress')replaceModel({...params,process:'isothermal',initialVolume:.07,finalVolume:.02,initialTemperature:300});
    else replaceModel({...params,process:'isochoric',initialVolume:.035,finalTemperature:550,initialTemperature:300});
  },{signal:abort.signal}));
  main.querySelectorAll('[data-gas-action]').forEach(button => button.addEventListener('click',()=>{
    replaceModel(gasWorkbenchAction(params,button.dataset.gasAction));
    button.classList.add('gas-action-active');
    button.blur();
  },{signal:abort.signal}));
  main.querySelector('#play').addEventListener('click', () => timeline.state.get().playing ? timeline.pause() : timeline.play(), { signal: abort.signal });
  main.querySelector('#reset').addEventListener('click', () => { timeline.reset(model.duration); persist(); }, { signal: abort.signal });
  scrubber.addEventListener('input', event => { timeline.seek(Number(event.target.value) / 1000 * model.duration); persist(); }, { signal: abort.signal });
  main.querySelector('#playback-rate').addEventListener('change', event => timeline.rate(Number(event.target.value)), { signal: abort.signal });
  const gasScene = main.querySelector('#gas-scene');
  const piston = main.querySelector('#gas-piston');
  let draggingPiston = null;
  function updatePiston(event) {
    if (params.process === 'isochoric') return;
    const matrix = gasScene.getScreenCTM(); if (!matrix) return;
    const pos = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const volume = quantizeParameter(pistonXToVolume(pos.x), { min: .001, max: .4, step: .001 });
    replaceModel({ ...params, finalVolume: volume });
  }
  piston.addEventListener('pointerdown', event => {
    if (params.process === 'isochoric') return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    draggingPiston = event.pointerId;
    gasScene.setPointerCapture?.(event.pointerId);
    updatePiston(event);
  }, { signal: abort.signal });
  gasScene.addEventListener('pointermove', event => { if (event.pointerId === draggingPiston) updatePiston(event); }, { signal: abort.signal });
  gasScene.addEventListener('pointerup', event => { if (event.pointerId === draggingPiston) draggingPiston = null; }, { signal: abort.signal });
  gasScene.addEventListener('pointercancel', event => { if (event.pointerId === draggingPiston) draggingPiston = null; }, { signal: abort.signal });
  piston.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key) || params.process === 'isochoric') return;
    event.preventDefault();
    const next = clampSceneValue(Number((params.finalVolume + (event.key === 'ArrowRight' ? .001 : -.001)).toFixed(3)), .001, .4);
    replaceModel({ ...params, finalVolume: next });
  }, { signal: abort.signal });
  graph.setModel(model);
  timeline.reset(model.duration);
  timeline.seek(savedTime);
  frame(savedTime);
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: ['pressure'] });
  persist();
  return () => { persist(); abort.abort(); timeline.destroy(); context.activeSimulation = null; };
}
