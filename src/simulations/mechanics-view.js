import '../styles/mechanics.css';
import './simulation-first-half.css';
import { format } from '../core/units.js';
import { Timeline } from '../engines/timeline.js';
import { GraphRenderer } from '../engines/graph.js';
import { normalizePointerX, quantizeParameter } from '../core/direct-manipulation.js';
import { sceneParameterFromPoint, velocityFromDrag, parameterFromDragDelta, momentumBalance } from '../core/hands-on-mechanics.js';
import { mountMeasurementPanel } from '../app/measurement-panel.js';

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
    <div class="mechanics-layout physics-first-layout">
      <section class="mechanics-workbench">
        <div class="mechanics-viewport physics-first-panel">
          <div class="mechanics-viewport-top"><span class="tag">${config.sceneLabel}</span><strong id="mechanics-time">t = 0 s</strong></div>
          <div class="mechanics-scene mechanics-scene--${config.kind} physics-stage" tabindex="0" role="group" aria-label="${config.sceneLabel}. Chạm vùng trống để tua thời gian, dùng phím trái phải hoặc thước thời gian bên dưới.">
            <div class="mechanics-stage-hud" aria-hidden="true"><span id="stage-left-status">BẮT ĐẦU KHÁM PHÁ</span><span id="stage-right-status">SI · MÔ HÌNH LÝ TƯỞNG</span></div>
            ${config.kind === 'collision'
              ? '<div class="collision-track"><span class="collision-separation-handle scene-grabbable" id="collision-separation-handle" tabindex="0" role="slider" aria-label="Kéo để đặt khoảng cách ban đầu">↔ khoảng cách</span><span class="collision-block collision-block--one scene-grabbable" id="body-one" tabindex="0" role="slider" aria-label="Kéo để đặt vận tốc đầu xe số 1">m₁</span><span class="collision-block collision-block--two scene-grabbable" id="body-two" tabindex="0" role="slider" aria-label="Kéo để đặt vận tốc đầu xe số 2">m₂</span><span class="collision-floor"></span></div><p id="scene-caption" role="status"></p>'
              : config.kind === 'oscillation'
                ? '<div class="oscillator-track"><span class="oscillator-anchor">▥</span><span class="oscillator-spring" id="spring-coil"></span><span class="oscillator-mass scene-grabbable" id="oscillator-mass" tabindex="0" role="slider" aria-label="Kéo quả nặng sang trái hoặc phải rồi thả để dao động">m</span><span class="oscillator-center"></span></div><p id="scene-caption" role="status"></p>'
                : `<div class="force-track"><span class="force-label">${config.kind === 'work' ? 'F cos θ' : 'F tác dụng'}</span><span class="force-arrow" role="slider" aria-label="Kéo ngang để thay đổi lực tác dụng" tabindex="0" aria-valuemin="-80" aria-valuemax="80" aria-valuenow="0" title="Kéo mũi tên để đổi lực">⟶</span><span class="motion-block scene-grabbable" id="motion-block" tabindex="0" role="slider" aria-label="Kéo khối để thiết lập thí nghiệm"></span><span class="motion-floor"></span></div><p id="scene-caption" role="status"></p>`}
          </div>
          <div class="mechanics-quick physics-first-quick" aria-label="Tình huống thử nhanh">${config.kind==='friction' ? `<button type="button" class="button secondary" data-mech-example="smooth">Mặt nhẵn</button><button type="button" class="button secondary" data-mech-example="wood">Mặt gỗ</button><button type="button" class="button secondary" data-mech-example="rough">Mặt thô</button><button type="button" class="button secondary" data-mech-example="zero">Ngừng đẩy</button>` : config.kind==='work' ? `<button type="button" class="button secondary" data-mech-example="clean">Không ma sát</button><button type="button" class="button secondary" data-mech-example="resist">Có ma sát</button><button type="button" class="button secondary" data-mech-example="angle">Kéo chếch 30°</button>` : config.kind==='collision' ? `<button type="button" class="button secondary" data-mech-example="elastic">Đàn hồi hoàn toàn</button><button type="button" class="button secondary" data-mech-example="inelastic">Dính vào nhau</button><button type="button" class="button secondary" data-mech-example="headon">Đối đầu</button>` : `<button type="button" class="button secondary" data-mech-example="left">Kéo trái</button><button type="button" class="button secondary" data-mech-example="right">Kéo phải</button><button type="button" class="button secondary" data-mech-example="soft">Lò xo mềm</button>`}</div>
          <div class="mechanics-visual-key" aria-hidden="true"><span><i></i> Vật mô phỏng</span><span><i></i> Kéo vật để thiết lập</span><span>Thả để quan sát</span></div>
          <p class="scene-gesture-hint" id="mechanics-gesture-hint">${config.kind === 'collision' ? 'Kéo xe để điều chỉnh vận tốc xuất phát. Hai xe chỉ va chạm khi đang tiến lại gần nhau.' : config.kind === 'oscillation' ? 'Kéo quả nặng sang trái hoặc phải rồi thả để bắt đầu dao động. Vạch giữa là vị trí cân bằng.' : config.kind === 'friction' ? 'Kéo khối sang trái/phải để tác dụng lực. Thử tìm lực nhỏ nhất khiến vật bắt đầu trượt.' : 'Kéo khối trên bàn để thiết lập quãng đường khảo sát. Quan sát công và động năng khi thả.'} Dùng phím ← → khi chọn vật; chạm nền để tua thời gian.</p>
          <div class="mechanics-controls">
            <div class="mechanics-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
            <label class="timeline-label" for="scrubber">Thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Thời điểm trong mô phỏng">
          </div>
          <div class="mechanics-energy-bars" id="mechanics-energy-bars" ${['work','oscillation','collision'].includes(config.kind) ? '' : 'hidden'}><div class="energy-item"><span id="energy-label-one">ĐỘNG NĂNG</span><progress id="energy-one" value="0" max="100"></progress></div><div class="energy-item"><span id="energy-label-two">THẾ NĂNG / CÔNG</span><progress id="energy-two" value="0" max="100"></progress></div></div>
          ${config.kind==='collision'?'<div class="collision-balance" aria-label="So sánh trước và sau va chạm"><div><span>Động lượng trước</span><strong data-collision-balance="momentum-before"></strong></div><div><span>Động lượng sau</span><strong data-collision-balance="momentum-after"></strong></div><div><span>Động năng trước</span><strong data-collision-balance="energy-before"></strong></div><div><span>Động năng sau</span><strong data-collision-balance="energy-after"></strong></div></div>':''}
          <div class="mechanics-measurements physics-first-meters">${config.readouts.map(readout => `<div><span>${readout.label}</span><strong data-readout="${readout.key}">0</strong><small>${readout.unit}</small></div>`).join('')}</div>
        </div>
      </section>
      <aside class="mechanics-panel physics-first-controls">
        <div class="control-heading"><h2>Thiết lập</h2><span>SI</span></div>
        <div class="mechanics-parameters">${config.parameters.map(parameter => `<div class="mechanics-parameter"><label for="param-${parameter.key}">${parameter.label}</label><input id="param-${parameter.key}" type="range" min="${parameter.min}" max="${parameter.max}" step="${parameter.step}" value="${params[parameter.key]}" aria-label="${parameter.label}"><span data-param-value="${parameter.key}"></span></div>`).join('')}</div>
        <p id="model-note" class="mechanics-note"></p>
        <details class="assumptions"><summary>Giả định vật lý</summary><ul>${config.assumptions.map(text => `<li>${text}</li>`).join('')}</ul></details>
      </aside>
    </div>
    <section class="mechanics-graphs"><div class="section-heading"><div><h2>${config.graphHeading}</h2><p>Đồ thị được đồng bộ với thời gian trên mô phỏng.</p></div></div><div class="graphs-grid">${config.graphs.map(graph => `<article class="graph-card" id="graph-${graph.key}"></article>`).join('')}</div></section>
    <section id="simulation-measurements"></section>`;

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
  mountMeasurementPanel(main.querySelector('#simulation-measurements'), {
    columns: [{ key: 't', label: 'Thời gian', unit: 's', csv: 't_s' }, ...config.readouts.map(item => ({ ...item, csv: `${item.key}_${item.unit || 'ratio'}`.replaceAll('²','2').replaceAll('·','_').replaceAll('/','_') }))],
    state: () => ({ ...model.at(timeline.state.get().time), t: timeline.state.get().time }),
    filename: `physicslab-${config.id}-measurements.csv`, signal: abort.signal
    , experiment: { id: config.id, title: config.title, parameters: () => ({ ...params }), assumptions: config.assumptions.join(' '), reset: () => { timeline.reset(model.duration); persist(); }, seek: time => { timeline.seek(time); persist(); }, subscribe: fn => timeline.state.subscribe(fn) }
  });

  function persist() {
    progress.session(config.id, { parameters: { ...params }, time: timeline.state.get().time });
  }

  function collisionExtent(){
    if(config.kind!=='collision')return 1;
    const samples=[model.at(0),model.at(model.duration)];
    if(model.collisionTime!==null&&model.collisionTime!==undefined)samples.push(model.at(model.collisionTime));
    return Math.max(6,...samples.flatMap(s=>[Math.abs(s.x1),Math.abs(s.x2)]))+1;
  }
  let worldExtent=collisionExtent();
  function updateScene(state) {
    const caption = main.querySelector('#scene-caption');
    const stage = main.querySelector('.mechanics-scene');
    if (stage) {
      stage.setAttribute('aria-valuemax', String(Number(model.duration.toFixed(3))));
      stage.setAttribute('aria-valuenow', String(Number(state.time.toFixed(3))));
      stage.setAttribute('aria-valuetext', `${format(state.time)} giây`);
    }
    if (config.kind === 'collision') {
      const outcome = momentumBalance(model);
      stage.dataset.momentumCheck = Math.abs(outcome.drift) < 1e-6 ? 'Bảo toàn động lượng' : 'Kiểm tra mô hình';
      const extent = worldExtent;
      const toPercent = x => Math.max(2, Math.min(94, 50 + (x / extent) * 44));
      main.querySelector('#body-one').style.left = `${toPercent(state.x1)}%`;
      main.querySelector('#body-one').textContent=`${format(params.mass1)} kg`;
      main.querySelector('#body-one').dataset.speed=`v₁ ${format(state.v1)} m/s`;
      main.querySelector('#body-two').style.left = `${toPercent(state.x2)}%`;
      main.querySelector('#body-two').textContent=`${format(params.mass2)} kg`;
      main.querySelector('#body-two').dataset.speed=`v₂ ${format(state.v2)} m/s`;
      const separationHandle=main.querySelector('#collision-separation-handle');
      separationHandle.style.left=`${14+(params.separation-2)/10*72}%`;
      separationHandle.setAttribute('aria-valuenow',String(params.separation));
      const final=model.at(model.duration);
      main.querySelector('[data-collision-balance="momentum-before"]').textContent=`${format(model.momentumBefore)} kg·m/s`;
      main.querySelector('[data-collision-balance="momentum-after"]').textContent=`${format(final.momentum)} kg·m/s`;
      main.querySelector('[data-collision-balance="energy-before"]').textContent=`${format(model.kineticBefore)} J`;
      main.querySelector('[data-collision-balance="energy-after"]').textContent=`${format(final.kineticEnergy)} J`;
      caption.textContent = state.collided ? `Đã va chạm · p trước = ${format(model.momentumBefore)} kg·m/s, p sau = ${format(state.momentum)} kg·m/s` : model.approaching ? 'Hai vật đang tiến lại gần nhau' : 'Hai vật không tiến lại gần nhau';
    } else if (config.kind === 'oscillation') {
      // The ruler uses a fixed 2 m world scale; amplitude must change visible displacement.
      const x = Math.max(-1, Math.min(1, state.position / 2));
      main.querySelector('#oscillator-mass').style.left = `${50 + x * 30}%`;
      main.querySelector('#oscillator-mass').style.transform = 'translateX(-50%)';
      main.querySelector('#oscillator-mass').textContent=`${format(params.mass)} kg`;
      const springWidth = Math.max(5, Math.min(70, 36 + x * 30));
      main.querySelector('#spring-coil').style.width = `${springWidth}%`;
      caption.textContent = `x = ${format(state.position)} m`;
    } else {
      const travel = config.kind === 'work' ? model.distance : model.maxDistance;
      const ratio = Math.max(-1, Math.min(1, state.position / Math.max(0.1, travel)));
      const block = main.querySelector('#motion-block');
      if(config.kind==='friction')stage.dataset.surface=params.staticCoefficient<=.1?'smooth':params.staticCoefficient>=.7?'rough':'wood';
      block.style.left = `${50 + ratio * 34}%`;
      block.style.transform = 'translateX(-50%)';
      block.textContent = `${format(params.mass)} kg`;
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
    const left=main.querySelector('#stage-left-status'),right=main.querySelector('#stage-right-status');
    if(config.kind==='friction'){
      left.textContent=model.threshold?'ĐỨNG YÊN · MA SÁT NGHỈ':'ĐANG TRƯỢT · MA SÁT TRƯỢT';
      right.textContent=`F = ${format(params.force)} N · Fms = ${format(Math.abs(state.frictionForce))} N`;
    } else if(config.kind==='work'){
      left.textContent=`W = ${format(state.netWork)} J`;
      right.textContent=`ΔEₖ = ${format(state.energyChange)} J`;
    } else if(config.kind==='collision'){
      left.textContent=state.collided?'ĐÃ VA CHẠM':'TRƯỚC VA CHẠM';
      right.textContent=`p = ${format(state.momentum)} kg·m/s`;
    } else {
      left.textContent=`CHU KỲ T = ${format(model.period)} s`;
      right.textContent=`x = ${format(state.position)} m`;
    }
    if(['work','oscillation','collision'].includes(config.kind)){
      const ek=Math.max(0,state.kineticEnergy||0);
      const other=config.kind==='oscillation'?Math.max(0,state.potentialEnergy||0):config.kind==='work'?Math.abs(state.netWork||0):Math.max(0,model.kineticBefore||0);
      const max=Math.max(ek,other,1);
      main.querySelector('#energy-one').value=100*ek/max;
      main.querySelector('#energy-two').value=100*other/max;
      main.querySelector('#energy-label-one').textContent=`ĐỘNG NĂNG: ${format(ek)} J`;
      main.querySelector('#energy-label-two').textContent=`${config.kind==='oscillation'?'THẾ NĂNG':config.kind==='work'?'|CÔNG TỔNG|':'ĐỘNG NĂNG TRƯỚC'}: ${format(other)} J`;
    }
    main.querySelector('#model-note').textContent = config.explain(model);
  }

  function apply(next) {
    try {
      const normalized = config.normalize ? config.normalize(next) : next;
      model = config.create(normalized);
      worldExtent=collisionExtent();
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
  }
  scene.addEventListener('pointerdown', event => {
    if (event.target.closest('.force-arrow,.scene-grabbable')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (gestureId !== null) return;
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
  scene.addEventListener('lostpointercapture', finishGesture, { signal: abort.signal });
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
      if (!forceStart) return;
      // Fixed pointer origin prevents snapping to a different force on pointerdown.
      const width=Math.max(180,forceStart.width);
      const raw=forceStart.value+(event.clientX-forceStart.clientX)/width*(forceConfig.max-forceConfig.min);
      const force = quantizeParameter((Math.max(forceConfig.min,Math.min(forceConfig.max,raw))-forceConfig.min)/(forceConfig.max-forceConfig.min), forceConfig);
      apply({ ...params, force });
      forceArrow.setAttribute('aria-valuenow', String(params.force));
      forceArrow.title = `Lực kéo ${format(params.force)} ${forceConfig.unit || 'N'}`;
    };
    let forcePointer = null;let forceStart=null;
    forceArrow.addEventListener('pointerdown', event => {
      if(event.pointerType==='mouse'&&event.button!==0)return;
      event.stopPropagation();timeline.pause();
      forcePointer = event.pointerId;
      forceStart={clientX:event.clientX,value:params.force,width:scene.getBoundingClientRect().width};
      forceArrow.setPointerCapture?.(event.pointerId);
    }, { signal: abort.signal });
    forceArrow.addEventListener('pointermove', event => {
      if (event.pointerId === forcePointer) moveForce(event);
    }, { signal: abort.signal });
    forceArrow.addEventListener('pointerup', () => { forcePointer = null;forceStart=null;persist(); }, { signal: abort.signal });
    forceArrow.addEventListener('pointercancel', () => { forcePointer = null;forceStart=null; }, { signal: abort.signal });
    forceArrow.addEventListener('lostpointercapture', () => { forcePointer = null;forceStart=null; }, { signal: abort.signal });
    forceArrow.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const value = event.key === 'Home' ? forceConfig.min : event.key === 'End' ? forceConfig.max : params.force + (event.key === 'ArrowRight' ? forceConfig.step : -forceConfig.step);
      apply({ ...params, force: quantizeParameter((value - forceConfig.min) / (forceConfig.max - forceConfig.min), forceConfig) });
      forceArrow.setAttribute('aria-valuenow', String(params.force));
    }, { signal: abort.signal });
    forceArrow.setAttribute('aria-valuenow', String(params.force));
  }
  // Grabbing a physical object changes an actual model parameter, not a decorative position.
  // The background remains a time scrubber; these two intents never overlap.
  const gestureKeys = config.kind === 'collision'
    ? { 'body-one':'velocity1', 'body-two':'velocity2', 'collision-separation-handle':'separation' }
    : config.kind === 'oscillation' ? { 'oscillator-mass':'amplitude' }
    : config.kind === 'friction' ? { 'motion-block':'force' }
    : { 'motion-block':'distance' };
  let grabbed=null;
  for(const [nodeId,key] of Object.entries(gestureKeys)){
    const node=main.querySelector(`#${nodeId}`);
    const definition=config.parameters.find(p=>p.key===key);
    if(!node || !definition) continue;
    node.setAttribute('aria-valuemin',String(definition.min));
    node.setAttribute('aria-valuemax',String(definition.max));
    node.setAttribute('aria-valuenow',String(params[key]));
    node.title=`Kéo để đổi ${definition.label.toLowerCase()}`;
    function updateFromPoint(event){
      let next;
      if(config.kind==='collision'&&key.startsWith('velocity')) next={ [key]:velocityFromDrag(event.clientX-grabbed.startX,grabbed.width,grabbed.value,definition) };
      else if(config.kind==='collision') next={ [key]:parameterFromDragDelta(event.clientX-grabbed.startX,grabbed.width,grabbed.value,definition) };
      else if(config.kind==='friction'||config.kind==='work')next={ [key]:parameterFromDragDelta(event.clientX-grabbed.startX,grabbed.width,grabbed.value,definition) };
      else if(config.kind==='oscillation'){
        // Signed displacement anchored to the physical initial condition, never to the redrawn grip.
        const signedStart=grabbed.value*(grabbed.phase===180?-1:1);
        const signed=Math.max(-definition.max,Math.min(definition.max,signedStart+(event.clientX-grabbed.startX)/Math.max(180,grabbed.width)*definition.max/.3));
        const amplitude=quantizeParameter((Math.max(definition.min,Math.abs(signed))-definition.min)/(definition.max-definition.min),definition);
        next={amplitude,phase:signed<0?180:0};
      }
      else next=sceneParameterFromPoint(config.kind,event.clientX,scene.getBoundingClientRect(),definition);
      apply({...params,...next});
      node.setAttribute('aria-valuenow',String(params[key]));
      node.setAttribute('aria-valuetext',`${format(params[key])} ${definition.unit}`);
      // Do not move collision/friction carts visually away from their model positions.
      // Drag edits initial conditions; only the model determines the actual position.
      if(config.kind==='oscillation')node.style.transform='translateX(-50%)';
    }
    node.addEventListener('pointerdown',event=>{
      if(event.button!==0&&event.pointerType==='mouse')return;
      if (grabbed !== null) return;
      event.stopPropagation(); event.preventDefault(); timeline.pause();
      grabbed={id:event.pointerId,key,startX:event.clientX,value:params[key],phase:params.phase,width:scene.getBoundingClientRect().width};
      node.classList.add('is-grabbed'); node.setPointerCapture?.(event.pointerId);
    },{signal:abort.signal});
    node.addEventListener('pointermove',event=>{
      if(grabbed?.id===event.pointerId&&grabbed.key===key)updateFromPoint(event);
    },{signal:abort.signal});
    const release=(event,run)=>{
      if(grabbed?.id!==event.pointerId||grabbed.key!==key)return;
      grabbed=null;node.classList.remove('is-grabbed');persist();
      // A cancelled gesture (touch interruption / app switch) must never launch motion.
      if(run && (config.kind==='oscillation'||config.kind==='work'||config.kind==='collision'&&model.approaching||config.kind==='friction'&&!model.threshold))timeline.play();
    };
    node.addEventListener('pointerup',event=>release(event,true),{signal:abort.signal});
    node.addEventListener('pointercancel',event=>release(event,false),{signal:abort.signal});
    node.addEventListener('lostpointercapture',event=>release(event,false),{signal:abort.signal});
    node.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.stopPropagation();event.preventDefault();timeline.pause();
      const val=event.key==='Home'?definition.min:event.key==='End'?definition.max
        :params[key]+(event.key==='ArrowRight'?1:-1)*definition.step;
      const next=quantizeParameter((val-definition.min)/(definition.max-definition.min),definition);
      apply({...params,[key]:next,...(config.kind==='oscillation'?{phase:event.key==='ArrowLeft'?180:0}:{})});
      node.setAttribute('aria-valuenow',String(params[key]));persist();
    },{signal:abort.signal});
  }
  const examples={
    friction:{smooth:{staticCoefficient:.05,kineticCoefficient:.03},wood:{staticCoefficient:.4,kineticCoefficient:.25},rough:{staticCoefficient:.85,kineticCoefficient:.65},zero:{force:0}},
    work:{clean:{friction:0},resist:{friction:.25},angle:{angle:30}},
    collision:{elastic:{restitution:1},inelastic:{restitution:0},headon:{velocity1:4,velocity2:-3,separation:6}},
    oscillation:{left:{phase:180},right:{phase:0},soft:{stiffness:8}}
  };
  main.querySelectorAll('[data-mech-example]').forEach(button=>button.addEventListener('click',()=>{
    const changes=examples[config.kind]?.[button.dataset.mechExample];
    if(!changes)return;
    const next={...params,...changes};
    if(config.kind==='friction'&&next.kineticCoefficient>next.staticCoefficient)next.kineticCoefficient=next.staticCoefficient;
    apply(next);
  },{signal:abort.signal}));
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
