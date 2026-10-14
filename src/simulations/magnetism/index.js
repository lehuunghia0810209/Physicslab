import './magnetism.css';
import { createElectromagneticModel, ELECTROMAGNETISM_DEFAULTS } from '../../core/electromagnetism.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { path } from '../../engines/svg.js';
import { normalizePointerX } from '../../core/direct-manipulation.js';
import { orbitForceDirection } from '../../core/lorentz-vectors.js';
import { magneticKnobValue } from '../../core/magnetism-gestures.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'magnetic-field';
  let params = { ...ELECTROMAGNETISM_DEFAULTS };
  let savedTime = 0;
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try {
      const restored = createElectromagneticModel(saved.parameters);
      params = { ...ELECTROMAGNETISM_DEFAULTS, ...restored.parameters };
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...ELECTROMAGNETISM_DEFAULTS };
    }
  }
  let model = createElectromagneticModel(params);
  progress.visit(id, 'Khám phá từ trường và cảm ứng điện từ');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">ĐIỆN TỪ HỌC · LỚP 11–12</p><h1>Từ trường và cảm ứng điện từ</h1><p>Khảo sát lực Lorentz lên điện tích chuyển động và suất điện động cảm ứng khi từ thông biến thiên.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="em-layout"><section class="panel em-workbench"><div class="em-heading"><span class="tag">MÔ HÌNH ĐIỆN TỪ</span><strong id="em-mode-label"></strong></div>
      <div class="em-primary-actions" role="group" aria-label="Các tình huống điện từ"><button type="button" data-em-preset="perpendicular">v ⟂ B</button><button type="button" data-em-preset="parallel">v ∥ B</button><button type="button" data-em-preset="reverse">Đổi dấu q</button><button type="button" data-em-preset="induction">Khảo sát cảm ứng</button></div><label class="em-direct-control" for="em-direct-value"><span id="em-direct-label">Góc giữa v và B</span><strong id="em-direct-reading">90°</strong><input id="em-direct-value" type="range" min="0" max="90" step="1" value="90" aria-label="Góc giữa vận tốc và từ trường"></label><svg id="em-scene" viewBox="0 0 620 300" role="slider" tabindex="0" aria-label="Kéo trên cảnh để tua thời gian của hiện tượng" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></svg><p class="em-gesture-hint">Kéo nút trên cảnh để đổi góc vận tốc hoặc số vòng dây. Kéo trên nền để tua thời gian; số đo luôn lấy từ cùng mô hình.</p><div id="em-readouts" class="em-readouts"></div>
      <div class="em-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><strong id="em-time"></strong></div>
      <label class="timeline-label" for="scrubber">Thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Thời điểm trong mô phỏng"></section>
      <aside class="panel em-controls"><h2>Thiết lập thí nghiệm</h2><label class="em-mode" for="em-mode"><span>Hiện tượng</span><select id="em-mode" aria-label="Hiện tượng điện từ"><option value="lorentz">Lực Lorentz</option><option value="induction">Cảm ứng điện từ</option></select></label><div id="em-parameters"></div><p id="em-equation" class="em-equation"></p><p id="em-assumption" class="em-assumption"></p></aside></div>
    <section class="em-graph"><div class="section-heading"><div><h2 id="em-graph-heading"></h2><p id="em-graph-description"></p></div></div><article id="em-graph" class="graph-card"></article></section>`;

  const scene = main.querySelector('#em-scene');
  const scrubber = main.querySelector('#scrubber');
  const play = main.querySelector('#play');
  let graph;
  let configuredMode = null;
  let unsubscribe;
  let abort = new AbortController();
  let timeline;

  function persist() { progress.session(id, { parameters: { ...params }, time: timeline?.state.get().time ?? 0 }); }
  function readout(key, label, unit) { return `<div><span>${label}</span><strong id="em-${key}"></strong><small>${unit}</small></div>`; }

  function configure() {
    const forceMode = params.mode === 'lorentz';
    const definitions = forceMode
      ? [['charge', 'Điện tích q', -5, 5, 0.1, 'C', true], ['mass', 'Khối lượng m', 0.1, 20, 0.1, 'kg'], ['speed', 'Tốc độ v', 0, 50, 0.5, 'm/s'], ['magneticField', 'Cảm ứng từ B', 0.01, 2, 0.01, 'T'], ['pitchAngle', 'Góc với B', 0, 90, 1, '°']]
      : [['magneticField', 'Cảm ứng từ cực đại B₀', 0.01, 2, 0.01, 'T'], ['area', 'Diện tích cuộn dây S', 0.001, 2, 0.001, 'm²'], ['turns', 'Số vòng dây N', 1, 1000, 1, 'vòng'], ['frequency', 'Tần số biến thiên f', 0.1, 20, 0.1, 'Hz'], ['resistance', 'Điện trở mạch R', 0.1, 1000, 0.1, 'Ω']];
    // Do not replace input elements on every range `input` event: doing so
    // detaches the dragged slider and makes the experiment look frozen.
    const modeChanged = configuredMode !== params.mode;
    main.querySelector('[data-em-preset="perpendicular"]').hidden=!forceMode;
    main.querySelector('[data-em-preset="parallel"]').hidden=!forceMode;
    main.querySelector('[data-em-preset="reverse"]').hidden=!forceMode;
    main.querySelector('[data-em-preset="induction"]').hidden=!forceMode;
    const direct=main.querySelector('#em-direct-value');
    direct.min=forceMode?'0':'1';direct.max=forceMode?'90':'1000';direct.step=forceMode?'1':'1';direct.value=forceMode?params.pitchAngle:params.turns;
    direct.setAttribute('aria-label',forceMode?'Góc giữa vận tốc và từ trường':'Số vòng dây');
    main.querySelector('#em-direct-label').textContent=forceMode?'Góc giữa v và B':'Số vòng dây N';
    main.querySelector('#em-direct-reading').textContent=forceMode?`${params.pitchAngle}°`:`${params.turns} vòng`;
    if (modeChanged) {
      main.querySelector('#em-parameters').innerHTML = definitions.map(([key, label, min, max, step, unit, signed]) => `<label class="em-parameter" for="em-param-${key}"><span>${label}</span><strong data-em-param="${key}"></strong><input id="em-param-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>${signed ? `<p class="em-hint">Dấu của điện tích quyết định chiều lực từ.</p>` : ''}`).join('');
    }
    const key = forceMode ? 'force' : 'emf';
    const graphLabel = forceMode ? 'Lực từ theo thời gian · F–t' : 'Suất điện động theo thời gian · ε–t';
    main.querySelector('#em-graph-heading').textContent = graphLabel;
    main.querySelector('#em-graph-description').textContent = forceMode ? 'Lực từ vuông góc với vận tốc và cảm ứng từ.' : 'Suất điện động cảm ứng tuân theo định luật Faraday–Lenz.';
    if (modeChanged) {
      graph = new GraphRenderer(main.querySelector('#em-graph'), { key, label: graphLabel, unit: forceMode ? 'N' : 'V', role: forceMode ? 'teal' : 'blue' });
      configuredMode = params.mode;
    }
    graph.setModel(model);
    main.querySelector('#em-mode-label').textContent = forceMode ? 'LỰC LORENTZ · QUỸ ĐẠO HẠT' : 'ĐỊNH LUẬT FARADAY–LENZ';
    main.querySelector('#em-equation').textContent = forceMode
      ? 'F = qvB sinθ · r = mv⊥ / |q|B · T = 2πm / |q|B'
      : 'Φ = BS cos(ωt) · ε = −N dΦ/dt · I = ε/R';
    main.querySelector('#em-assumption').textContent = forceMode
      ? 'Điện tích chuyển động trong từ trường đều; mũi tên F luôn hướng về tâm quỹ đạo tròn. Dấu q quyết định chiều quay; thành phần song song B không bị đổi hướng. Giá trị F trên đồ thị mang dấu q.'
      : 'Từ trường đều vuông góc cuộn dây; điện trở cuộn dây và tải được gộp thành R.';
    if(modeChanged)renderReadouts();
  }

  function renderReadouts() {
    main.querySelector('#em-readouts').innerHTML = params.mode === 'lorentz'
      ? readout('force', 'Lực từ F', 'N') + readout('acceleration', 'Gia tốc a', 'm/s²') + readout('radius', 'Bán kính r', 'm') + readout('period', 'Chu kỳ T', 's')
      : readout('flux', 'Từ thông Φ', 'Wb') + readout('emf', 'Suất điện động ε', 'V') + readout('current', 'Dòng cảm ứng I', 'A') + readout('period', 'Chu kỳ T', 's');
  }

  function renderScene(state) {
    if (params.mode === 'lorentz') {
      const samples = Array.from({ length: 121 }, (_, index) => model.at(model.duration * index / 120));
      const maxRadius = Math.max(1, ...samples.map(point => Math.hypot(point.x, point.y)));
      const scale = Math.min(18, 105 / maxRadius);
      const coords = samples.map(point => [300 + point.x * scale, 150 - point.y * scale]);
      const currentX = 300 + state.x * scale;
      const currentY = 150 - state.y * scale;
      const forceDirection = orbitForceDirection(state,params.charge);
      const arrowX=forceDirection?currentX+forceDirection.x*53:currentX;
      const arrowY=forceDirection?currentY-forceDirection.y*53:currentY;
      scene.setAttribute('aria-label', 'Điện tích trong từ trường đều chịu lực Lorentz và chuyển động cong');
      scene.innerHTML = `<g class="em-field">${Array.from({ length: 5 }, (_, row) => Array.from({ length: 9 }, (_, column) => {
        const x = 35 + column * 69, y = 30 + row * 58;
        return `<circle cx="${x}" cy="${y}" r="7"/><path d="M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}"/>`;
      }).join('')).join('')}</g><path class="em-trajectory" d="${path(coords)}"/>${forceDirection?`<defs><marker id="em-force-arrowhead" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6Z" class="em-arrow"/></marker></defs><line class="em-force" x1="${currentX}" y1="${currentY}" x2="${arrowX}" y2="${arrowY}" marker-end="url(#em-force-arrowhead)"/>`:''}<circle class="em-particle" cx="${currentX}" cy="${currentY}" r="9"/><text x="18" y="24">B hướng vào mặt phẳng · q = ${format(params.charge)} C</text>${forceDirection?`<text x="${Math.min(593,Math.max(18,arrowX+12))}" y="${Math.min(280,Math.max(18,arrowY-7))}" class="em-vector-label">F</text>`:''}<g data-em-gesture="pitchAngle" role="presentation" aria-label="Đổi góc vận tốc với từ trường" aria-valuemin="0" aria-valuemax="90" aria-valuenow="${params.pitchAngle}"><rect class="em-gesture-hit" x="375" y="180" width="230" height="120" rx="16"/><rect class="em-gesture-track-bg" x="385" y="210" width="213" height="73" rx="13"/><text x="402" y="231" class="em-gesture-label">KÉO ĐIỂM ĐỂ ĐỔI GÓC v/B · ${params.pitchAngle}°</text><path class="em-gesture-track" d="M406 256H570"/><circle class="em-gesture-knob" cx="${406+params.pitchAngle/90*164}" cy="256" r="12"/></g>`;
    } else {
      const current = state.current;
      const arrow = current >= 0 ? '→' : '←';
      scene.setAttribute('aria-label', 'Cuộn dây trong từ trường biến thiên tạo suất điện động cảm ứng');
      scene.innerHTML = `<g class="em-field">${Array.from({ length: 8 }, (_, index) => `<circle cx="${75 + index * 68}" cy="95" r="7"/><path d="M${71 + index * 68} 91 L${79 + index * 68} 99 M${79 + index * 68} 91 L${71 + index * 68} 99"/>`).join('')}</g><rect class="em-core" x="100" y="118" width="420" height="62" rx="8"/><path class="em-coil" d="M130 118 C130 75 160 75 160 118 C160 75 190 75 190 118 C190 75 220 75 220 118 C220 75 250 75 250 118 C250 75 280 75 280 118 C280 75 310 75 310 118 C310 75 340 75 340 118 C340 75 370 75 370 118 C370 75 400 75 400 118 C400 75 430 75 430 118 C430 75 460 75 460 118 C460 75 490 75 490 118"/><path class="em-wire" d="M130 118 V225 H490 V118"/><path class="em-indicator" d="M270 225 H350"/><text x="310" y="218" text-anchor="middle">I ${arrow}</text><text x="310" y="158" text-anchor="middle">N = ${params.turns} vòng · Φ = ${format(state.flux)} Wb</text><text x="18" y="24">B biến thiên vuông góc với cuộn dây</text><g data-em-gesture="turns" role="presentation" aria-label="Kéo để đổi số vòng dây" aria-valuemin="1" aria-valuemax="1000" aria-valuenow="${params.turns}"><rect class="em-gesture-hit" x="375" y="180" width="230" height="120" rx="16"/><rect class="em-gesture-track-bg" x="380" y="233" width="220" height="57" rx="12"/><text x="397" y="252" class="em-gesture-label">KÉO ĐỔI SỐ VÒNG N = ${params.turns}</text><path class="em-gesture-track" d="M400 271H576"/><circle class="em-gesture-knob" cx="${400+(params.turns-1)/999*176}" cy="271" r="10"/></g>`;
    }
  }

  function frame(time) {
    const state = model.at(time);
    for (const [key, value] of Object.entries(state)) {
      const element = main.querySelector(`#em-${key}`);
      if (element && Number.isFinite(value)) element.textContent = format(value);
    }
    main.querySelector('#em-time').textContent = `t = ${format(time)} s`;
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String(time / model.duration * 1000);
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (time >= model.duration ? 'Chạy lại' : 'Chạy');
    graph.update(time);
    scene.setAttribute('aria-valuenow',String(Number(time.toFixed(3))));
    scene.setAttribute('aria-valuemax',String(Number(model.duration.toFixed(3))));
    scene.setAttribute('aria-valuetext',`${format(time)} giây`);
    renderScene(state);
  }

  function replaceModel(next,{retainTime=false}={}) {
    try {
      const candidate = createElectromagneticModel(next);
      params = { ...ELECTROMAGNETISM_DEFAULTS, ...candidate.parameters };
      model = candidate;
      main.querySelector('#em-mode').value = params.mode;
      configure();
      for (const [key, value] of Object.entries(params)) {
        const input = main.querySelector(`#em-param-${key}`);
        if (input) input.value = value;
      }
      const previousTime=timeline.state.get().time;
      timeline.reset(model.duration);
      if(retainTime)timeline.seek(Math.min(previousTime,model.duration));
      frame(timeline.state.get().time);
      persist();
    } catch (error) {
      main.querySelector('#em-assumption').textContent = error.message;
    }
  }

  function startTimeline() {
    timeline = new Timeline(model.duration, frame, () => { progress.complete(id); persist(); });
    timeline.reset(model.duration);
    timeline.seek(savedTime);
    unsubscribe?.();
    unsubscribe = timeline.state.subscribe(state => { play.textContent = state.playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy'); });
  }

  configure();
  startTimeline();
  frame(savedTime);
  const bind = (selector, event, handler) => main.querySelector(selector).addEventListener(event, handler, { signal: abort.signal });
  let scenePointer = null;
  let sceneGesture = null;
  const moveScenePointer = event => {
    const matrix=scene.getScreenCTM();
    const scenePoint=matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null;
    if(!scenePoint)return;
    const fraction=Math.max(0,Math.min(1,scenePoint.x/620));
    if (sceneGesture === 'pitchAngle') {
      const angle = magneticKnobValue(fraction,'pitchAngle');
      if (angle !== params.pitchAngle) replaceModel({...params,pitchAngle:angle},{retainTime:true});
    } else if (sceneGesture === 'turns') {
      const turns = magneticKnobValue(fraction,'turns');
      if (turns !== params.turns) replaceModel({...params,turns},{retainTime:true});
    } else {
      timeline.seek(fraction*model.duration);persist();
    }
  };
  scene.addEventListener('pointerdown',event=>{
    if(event.button!==0&&event.pointerType==='mouse')return;
    scenePointer=event.pointerId;
    sceneGesture=event.target.closest?.('[data-em-gesture]')?.dataset.emGesture||null;
    scene.setPointerCapture?.(event.pointerId);moveScenePointer(event);
  },{signal:abort.signal});
  scene.addEventListener('pointermove',event=>{if(event.pointerId===scenePointer)moveScenePointer(event);},{signal:abort.signal});
  const endGesture = event=>{if(event.pointerId===scenePointer){scenePointer=null;sceneGesture=null;}};
  scene.addEventListener('pointerup',endGesture,{signal:abort.signal});
  scene.addEventListener('pointercancel',endGesture,{signal:abort.signal});
  scene.addEventListener('keydown',event=>{
    const handle=event.target.closest?.('[data-em-gesture]');
    if(handle && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      event.preventDefault();event.stopPropagation();
      const field=handle.dataset.emGesture;
      const [min,max,step]=field==='pitchAngle'?[0,90,1]:[1,1000,10];
      const value=event.key==='Home'?min:event.key==='End'?max:Math.max(min,Math.min(max,params[field]+(event.key==='ArrowRight'?step:-step)));
      replaceModel({...params,[field]:value},{retainTime:true});return;
    }
  },{signal:abort.signal});
  scene.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();timeline.seek(timeline.state.get().time+(event.key==='ArrowRight'?1:-1)*model.duration/40);persist();
  },{signal:abort.signal});
  main.querySelectorAll('[data-em-preset]').forEach(button=>button.addEventListener('click',()=>{
    const preset=button.dataset.emPreset;
    if(preset==='induction')replaceModel({...params,mode:'induction'});
    else if(preset==='reverse')replaceModel({...params,charge:-params.charge},{retainTime:true});
    else replaceModel({...params,pitchAngle:preset==='parallel'?0:90},{retainTime:true});
  },{signal:abort.signal}));
  bind('#em-direct-value','input',event=>replaceModel({...params,[params.mode==='lorentz'?'pitchAngle':'turns']:Number(event.target.value)},{retainTime:true}));
  bind('#em-mode', 'change', event => replaceModel({ ...ELECTROMAGNETISM_DEFAULTS, ...params, mode: event.target.value }));
  bind('#em-parameters', 'input', event => {
    if (event.target.matches('input[type="range"]')) replaceModel({ ...params, [event.target.id.replace('em-param-', '')]: Number(event.target.value) },{retainTime:true});
  });
  bind('#play', 'click', () => timeline.state.get().playing ? timeline.pause() : timeline.play());
  bind('#reset', 'click', () => { timeline.reset(model.duration); persist(); });
  bind('#scrubber', 'input', event => { timeline.seek(Number(event.target.value) / 1000 * model.duration); persist(); });
  bind('#playback-rate', 'change', event => timeline.rate(Number(event.target.value)));
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: [params.mode === 'lorentz' ? 'force' : 'emf'] });
  persist();
  return () => { persist(); abort.abort(); unsubscribe?.(); timeline.destroy(); context.activeSimulation = null; };
}
