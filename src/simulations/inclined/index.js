import './inclined.css';
import '../simulation-first-half.css';
import { createInclinedPlane, DEFAULT_INCLINED } from '../../core/inclined.js';
import { format } from '../../core/units.js';
import { Timeline } from '../../engines/timeline.js';
import { GraphRenderer } from '../../engines/graph.js';
import { quantizeParameter, clampSceneValue } from '../../core/direct-manipulation.js';
import { createInclineRelease, TRACK_LENGTH } from '../../core/incline-release.js';

export function mount(main, { progress }) {
  const id = 'inclined-plane';
  const saved = progress.get().sessions[id];
  let params = { ...DEFAULT_INCLINED };
  try { if (saved?.parameters) params = createInclinedPlane(saved.parameters).parameters; } catch { /* invalid saved session */ }
  let model = createInclinedPlane(params);
  let releasePosition = Number.isFinite(saved?.setup?.releasePosition) ? clampSceneValue(saved.setup.releasePosition,0,9.5) : 0;
  let animation = createInclineRelease(model,releasePosition);
  let showVectors = false;
  const abort = new AbortController();
  progress.visit(id, 'Khám phá mặt phẳng nghiêng');

  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">CƠ HỌC · LỚP 10</p><h1>Mặt phẳng nghiêng</h1><p>Kéo góc dốc, đặt xe ở vị trí muốn thả rồi quan sát lực và chuyển động.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
  <div class="simulation-layout physics-first-layout"><section class="simulation-workbench"><div class="viewport-panel physics-first-panel"><div class="viewport-top"><span class="tag">THÍ NGHIỆM TƯƠNG TÁC · CƠ HỌC</span><strong id="inclined-clock">t = 0 s</strong></div>
  <div class="inclined-visual physics-stage physics-first-inclined-stage" id="plane-visual">
    <svg id="inclined-scene" viewBox="0 0 620 300" role="img" aria-label="Mặt phẳng nghiêng, kéo tay nắm ở đầu dốc để thay đổi góc và dùng nút Chạy để vật trượt">
      <defs><linearGradient id="ramp-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#318e81"/><stop offset="1" stop-color="#14575d"/></linearGradient></defs>
      <g id="inclined-grid"></g><path id="ramp-face" class="ramp-face"/><path id="ramp-surface" class="ramp-surface"/>
      <g id="inclined-vector-markers"></g><line id="inclined-angle-leader" class="inclined-angle-leader"/>
      <g id="inclined-moving-block"><rect x="-23" y="-32" width="46" height="32" rx="7" class="inclined-block"/><text x="0" y="-12" text-anchor="middle" class="inclined-block-text">m</text></g>
      <g id="inclined-cart-grip" tabindex="0" role="slider" aria-label="Di chuyển xe đến vị trí thả trên máng" aria-valuemin="0" aria-valuemax="9.5" aria-valuenow="0"><circle r="56" class="inclined-cart-hit"/><circle r="9" class="inclined-cart-ring"/></g>
      <g id="inclined-grip" tabindex="0" role="slider" aria-label="Kéo lên hoặc xuống để đổi góc dốc" aria-valuemin="5" aria-valuemax="80" aria-valuenow="30"><circle r="56" class="inclined-grip-hit"/><circle r="18" class="inclined-grip-ring"/><path d="M-8 0H8M0 -8V8"/></g>
      <text id="inclined-angle-text" class="inclined-angle-text"></text><text class="inclined-info" x="20" y="282">KÉO XE ←  ·  KÉO GÓC DỐC ↗</text><text x="20" y="27" class="inclined-info">Chiều dài dốc mô phỏng: 10 m · bỏ qua lực cản không khí</text>
    </svg>
    <p class="inclined-gesture-hint">Kéo tay nắm tròn phía trên để chỉnh góc; kéo chấm tròn trên xe để chọn vị trí thả. Thử tăng góc vượt ngưỡng ma sát.</p>
  </div>
  <div class="inclined-quick-actions"><button class="button secondary" type="button" data-inclined-preset="15">Dốc nhẹ 15°</button><button class="button secondary" type="button" data-inclined-preset="35">Dốc 35°</button><button class="button secondary" type="button" data-inclined-preset="55">Dốc 55°</button><label class="inclined-vector-toggle"><input type="checkbox" id="inclined-show-vectors"> Hiện các lực</label></div><div class="measurement-strip inclined-measurements physics-first-meters"><div><span>Gia tốc</span><strong id="result-accel">0</strong><small>m/s²</small></div><div><span>Lực xuống dốc</span><strong id="result-force">0</strong><small>N</small></div><div><span>Phản lực</span><strong id="result-normal">0</strong><small>N</small></div><div><span>Ma sát</span><strong id="result-friction">0</strong><small>N</small></div><div><span>Vận tốc</span><strong id="result-velocity">0</strong><small>m/s</small></div><div><span>Đã trượt</span><strong id="result-distance">0</strong><small>m</small></div></div>
  <div class="mechanics-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="pause-simulation">Tạm dừng</button><button class="button secondary" id="reset-time">Đặt lại vị trí xe</button><label class="speed-control">Tốc độ <select id="playback-rate"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
  <label class="timeline-label" for="scrubber">Tua thời gian <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" value="0" aria-label="Thời gian mô phỏng">
  </div></section><aside class="control-panel physics-first-controls"><div class="control-heading"><h2>Thiết lập mặt phẳng</h2><span>SI</span></div><div class="parameters">
  ${[['angle','Góc nghiêng θ',5,80,1,'°'],['mass','Khối lượng m',1,30,.5,'kg'],['gravity','Trọng trường g',1,25,.1,'m/s²'],['mu','Hệ số ma sát μ',0,1.2,.05,'']].map(([key,label,min,max,step,unit])=>`<div class="parameter"><label for="${key}">${label}</label><input id="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}"><span data-value="${key}">${params[key]} ${unit}</span></div>`).join('')}
  </div><button class="button secondary" id="reset">Khôi phục cấu hình</button><p id="result-state" class="helper-text" role="status"></p><p id="result-threshold" class="helper-text"></p><details class="assumptions"><summary>Giả định của mô hình</summary><ul><li>Ma sát nghỉ tự cân bằng thành phần trọng lực đến ngưỡng μN.</li><li>Vật thả không vận tốc đầu, xét dọc mặt phẳng nghiêng dài 10 m.</li><li>Sau khi bắt đầu trượt, gia tốc không đổi a = g(sin θ − μcos θ).</li></ul></details></aside></div>
  <section class="panel inclined-graph-section"><div class="section-heading"><div><h2>Quan sát vận tốc</h2><p>Thời gian và tốc độ được lấy từ phương trình chuyển động thẳng biến đổi đều trên mặt dốc.</p></div></div><div id="sample-graph" class="graph-card"></div></section>`;

  const graph = new GraphRenderer(main.querySelector('#sample-graph'), { key:'velocity',label:'Vận tốc khi trượt · v–t',unit:'m/s' });
  const clock = main.querySelector('#inclined-clock');
  const stage = main.querySelector('#inclined-scene');
  const grip = main.querySelector('#inclined-grip');
  const cartGrip = main.querySelector('#inclined-cart-grip');
  const scrub = main.querySelector('#scrubber');
  const play = main.querySelector('#play');
  const timeline = new Timeline(animation.duration, frame, () => { if(animation.at(animation.duration).distance>0)progress.complete(id); persist(); });

  function persist() { progress.session(id,{parameters:{...params},time:timeline.state.get().time,setup:{releasePosition}}); }
  function redrawRamp(time) {
    const theta = params.angle * Math.PI/180;
    const start = { x:100,y:260 };
    const end = {x:start.x+220*Math.cos(theta),y:start.y-220*Math.sin(theta)};
    const state = animation.at(time);
    const traveled = clampSceneValue(state.position/TRACK_LENGTH,0,1);
    const bx = end.x+(start.x-end.x)*traveled;
    const by = end.y+(start.y-end.y)*traveled;
    main.querySelector('#ramp-face').setAttribute('d',`M${start.x} ${start.y}L${end.x} ${end.y}L${end.x} 260Z`);
    main.querySelector('#ramp-surface').setAttribute('d',`M${start.x} ${start.y}L${end.x} ${end.y}`);
    main.querySelector('#inclined-moving-block').setAttribute('transform',`translate(${bx} ${by-2}) rotate(${-params.angle})`);
    const gripX=end.x+116,gripY=Math.max(36,end.y-24);
    grip.setAttribute('transform',`translate(${gripX} ${gripY})`);
    main.querySelector('#inclined-angle-leader').setAttribute('x1',String(end.x));
    main.querySelector('#inclined-angle-leader').setAttribute('y1',String(end.y));
    main.querySelector('#inclined-angle-leader').setAttribute('x2',String(gripX));
    main.querySelector('#inclined-angle-leader').setAttribute('y2',String(gripY));
    cartGrip.setAttribute('transform',`translate(${bx} ${by-40})`);
    cartGrip.setAttribute('aria-valuenow',String(releasePosition));
    grip.setAttribute('aria-valuenow', String(params.angle));
    main.querySelector('#inclined-angle-text').setAttribute('x','495');
    main.querySelector('#inclined-angle-text').setAttribute('y','57');
    main.querySelector('#inclined-angle-text').textContent=`θ = ${format(params.angle,0)}°`;
    if(showVectors){const vX=bx,vY=by-40,n=theta;const fx=model.gravityComponent>0?Math.min(65,20+model.gravityComponent):0;const normal= Math.min(65,20+model.normal);
      main.querySelector('#inclined-vector-markers').innerHTML=`<line x1="${vX}" y1="${vY}" x2="${vX}" y2="${vY+54}" class="inclined-gravity"/><line x1="${vX}" y1="${vY}" x2="${vX+Math.sin(n)*normal}" y2="${vY-Math.cos(n)*normal}" class="inclined-normal"/><line x1="${vX}" y1="${vY}" x2="${vX+Math.cos(n)*fx}" y2="${vY-Math.sin(n)*fx}" class="inclined-friction"/>`;
    }else main.querySelector('#inclined-vector-markers').replaceChildren();
    main.querySelector('#result-velocity').textContent=format(state.velocity);
    main.querySelector('#result-distance').textContent=format(state.distance);
  }
  function frame(time) {
    const state = animation.at(time);
    clock.textContent=`t = ${format(state.t)} s`;
    scrub.value=String((time/Math.max(animation.duration,1e-8))*1000);
    main.querySelector('#duration-label').textContent=`0 → ${format(animation.duration)} s`;
    play.textContent=timeline.state.get().playing?'Đang chạy':state.t>=animation.duration?'Chạy lại':'Chạy';
    redrawRamp(time); graph.update(time);
  }
  function syncParameters() {
    for (const [key,unit] of [['angle','°'],['mass','kg'],['gravity','m/s²'],['mu','']]) {
      main.querySelector(`#${key}`).value=String(params[key]);
      main.querySelector(`[data-value="${key}"]`).textContent=`${format(params[key],key==='angle'?0:2)} ${unit}`;
    }
    main.querySelector('#result-accel').textContent=format(model.acceleration);
    main.querySelector('#result-force').textContent=format(model.gravityComponent);
    main.querySelector('#result-normal').textContent=format(model.normal);
    main.querySelector('#result-friction').textContent=format(model.friction);
    main.querySelector('#result-state').textContent=model.moving?'Vật bắt đầu trượt: hợp lực theo chiều xuống dốc.':'Vật đứng yên: ma sát nghỉ cân bằng thành phần trọng lực.';
    main.querySelector('#result-threshold').textContent=`F∥ = ${format(model.gravityComponent)} N · Fma sát = ${format(model.friction)} N`;
  }
  function apply(next) {
    try {
      const candidate=createInclinedPlane(next);
      model=candidate;params={...model.parameters};animation=createInclineRelease(model,releasePosition);
      syncParameters();graph.setModel(animation);timeline.reset(animation.duration);frame(0);persist();
    } catch(error) {main.querySelector('#result-state').textContent=error.message;}
  }
  for (const key of ['angle','mass','gravity','mu']) main.querySelector(`#${key}`).addEventListener('input',event=>apply({...params,[key]:Number(event.target.value)}),{signal:abort.signal});
  const toScene=e=>{const matrix=stage.getScreenCTM();return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):null;};
  let drag=null;
  grip.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;const pt=toScene(e);if(!pt)return;
    drag={id:e.pointerId,kind:'angle',start:pt,angle:params.angle};
    stage.setPointerCapture(e.pointerId);e.preventDefault();
  },{signal:abort.signal});
  cartGrip.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;const pt=toScene(e);if(!pt)return;
    drag={id:e.pointerId,kind:'cart',start:pt,releasePosition,angle:params.angle};
    stage.setPointerCapture(e.pointerId);e.preventDefault();
  },{signal:abort.signal});
  stage.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;const pt=toScene(e);if(!pt)return;
    if(drag.kind==='angle'){
      const angle=quantizeParameter(clampSceneValue((drag.angle-(pt.y-drag.start.y)*.28-5)/75,0,1),{min:5,max:80,step:1});
      if(angle!==params.angle)apply({...params,angle});
    }else {
      const theta=drag.angle*Math.PI/180;
      const downX=-Math.cos(theta),downY=Math.sin(theta);
      const pixelTravel=(pt.x-drag.start.x)*downX+(pt.y-drag.start.y)*downY;
      const next=clampSceneValue(Math.round((drag.releasePosition+pixelTravel*TRACK_LENGTH/220)*10)/10,0,9.5);
      if(next!==releasePosition){releasePosition=next;animation=createInclineRelease(model,releasePosition);graph.setModel(animation);timeline.reset(animation.duration);frame(0);persist();}
    }
  },{signal:abort.signal});
  const endDrag=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;try{stage.releasePointerCapture(e.pointerId);}catch{/* capture lost */}};
  stage.addEventListener('pointerup',endDrag,{signal:abort.signal});
  stage.addEventListener('pointercancel',endDrag,{signal:abort.signal});
  stage.addEventListener('lostpointercapture',()=>{drag=null;},{signal:abort.signal});
  grip.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();apply({...params,angle:clampSceneValue(params.angle+(e.key==='ArrowRight'?1:-1),5,80)});},{signal:abort.signal});
  cartGrip.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();releasePosition=clampSceneValue(Math.round((releasePosition+(e.key==='ArrowRight'?.1:-.1))*10)/10,0,9.5);animation=createInclineRelease(model,releasePosition);graph.setModel(animation);timeline.reset(animation.duration);persist();},{signal:abort.signal});
  main.querySelectorAll('[data-inclined-preset]').forEach(button=>button.addEventListener('click',()=>apply({...params,angle:Number(button.dataset.inclinedPreset)}),{signal:abort.signal}));
  main.querySelector('#inclined-show-vectors').addEventListener('change',e=>{showVectors=e.target.checked;redrawRamp(timeline.state.get().time);},{signal:abort.signal});
  main.querySelector('#reset').addEventListener('click',()=>apply({...DEFAULT_INCLINED}),{signal:abort.signal});
  main.querySelector('#reset-time').addEventListener('click',()=>{releasePosition=0;animation=createInclineRelease(model,releasePosition);graph.setModel(animation);timeline.reset(animation.duration);persist();},{signal:abort.signal});
  main.querySelector('#play').addEventListener('click',()=>timeline.state.get().playing?timeline.pause():timeline.play(),{signal:abort.signal});
  main.querySelector('#pause-simulation').addEventListener('click',()=>timeline.pause(),{signal:abort.signal});
  scrub.addEventListener('input',event=>timeline.seek(Number(event.target.value)/1000*animation.duration),{signal:abort.signal});
  main.querySelector('#playback-rate').addEventListener('change',event=>timeline.rate(Number(event.target.value)),{signal:abort.signal});
  const unsubscribe=timeline.state.subscribe(()=>{play.textContent=timeline.state.get().playing?'Đang chạy':'Chạy';});
  syncParameters();graph.setModel(animation);timeline.seek(saved?.time??0);frame(timeline.state.get().time);
  return ()=>{persist();unsubscribe();abort.abort();timeline.destroy();};
}
