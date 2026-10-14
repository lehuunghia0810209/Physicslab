import './optics.css';
import { createThinLens, OPTICS_DEFAULTS } from '../../core/optics.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { clampSceneValue } from '../../core/direct-manipulation.js';
import { opticalRayGeometry, isScreenFocused, opticalScreenFootprint } from '../../core/optical-scene-geometry.js';
import { minimumSvgHitRadius } from '../../core/svg-touch-target.js';
import { mountMeasurementPanel } from '../../app/measurement-panel.js';

/** Direct-manipulation optics bench. The physical model stays in SI; SVG is a viewport. */
const LENS_X = 360;
const AXIS_Y = 184;
const WIDTH = 720;
const HEIGHT = 368;
const MIN_SCALE = 135;
const MAX_SCALE = 760;
const clamp = clampSceneValue;
const n = value => Number(value.toFixed(6));
const quantize = (value, min, max, step = .01) => clamp(n(min + Math.round((clamp(value,min,max) - min) / step) * step), min, max);
const calculateFitScale = (p, imageDistance, screenDistance) => {
  const leftDistance = Math.max(p.objectDistance, Math.abs(Math.min(0, imageDistance ?? 0)), p.focalLength);
  const rightDistance = Math.max(screenDistance, Math.max(0, imageDistance ?? 0), p.focalLength);
  return clamp(Math.min(290 / Math.max(.1,leftDistance), 295 / Math.max(.1,rightDistance)), MIN_SCALE, MAX_SCALE);
};
function svgLine(x1,y1,x2,y2,className, extra = '') {
  if (![x1,y1,x2,y2].every(Number.isFinite)) return '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${className}" ${extra}/>`;
}
function lensRayMarkup(p, state, scale) {
  const geometry=opticalRayGeometry(p,state,scale,LENS_X,AXIS_Y);
  const {objectX:ox,objectY:oy,imageX:ix,imageY:realY}=geometry;
  const rightEnd=WIDTH-24;
  const outFirst=geometry.outgoingParallelY(rightEnd);
  const outCentral=geometry.outgoingCentralY(rightEnd);
  let markup = svgLine(ox,oy,LENS_X,oy,'optics-ray');
  markup += svgLine(ox,oy,LENS_X,AXIS_Y,'optics-ray secondary');
  markup += svgLine(LENS_X,oy,rightEnd,outFirst,'optics-ray');
  markup += svgLine(LENS_X,AXIS_Y,rightEnd,outCentral,'optics-ray secondary');
  // A virtual image is found by extending outgoing rays BACKWARDS, not by bending rays left.
  if (state.imageType === 'virtual' && ix !== null && Number.isFinite(realY)) {
    markup += svgLine(LENS_X,oy,ix,realY,'optics-ray virtual');
    markup += svgLine(LENS_X,AXIS_Y,ix,realY,'optics-ray secondary virtual');
  }
  if (state.imageType !== 'infinity' && ix !== null && Number.isFinite(realY) && ix > 10 && ix < WIDTH - 12) {
    markup += svgLine(ix,AXIS_Y,ix,realY,'optics-image', state.imageType === 'virtual' ? 'stroke-dasharray="6 5"' : '');
    const direction = realY < AXIS_Y ? 1 : -1;
    markup += `<polygon class="optics-image" points="${ix},${realY} ${ix-7},${realY+13*direction} ${ix+7},${realY+13*direction}"/>`;
  }
  return {markup,ox,oy,ix,realY};
}
export function mount(main, context) {
  const { progress } = context;
  const id = 'lens';
  const saved = progress.get().sessions[id];
  let params = { ...OPTICS_DEFAULTS };
  try { if (saved?.parameters) params = createThinLens(saved.parameters).parameters; } catch { /* keep safe defaults */ }
  let model = createThinLens(params);
  let screenDistance = Number.isFinite(saved?.setup?.screenDistance) ? clamp(saved.setup.screenDistance,.02,2) : .15;
  let scale = calculateFitScale(params,model.imageDistance,screenDistance);
  let drag = null;
  let raysVisible=true;
  const abort = new AbortController();
  progress.visit(id,'Khám phá ảnh qua thấu kính hội tụ');

  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">QUANG HỌC · LỚP 11</p><h1>Thấu kính hội tụ</h1><p>Kéo vật sáng, di chuyển màn hứng và quan sát tia sáng ngay trên bàn quang học.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
  <div class="optics-layout optics-direct-layout"><section class="panel optics-workbench optics-direct-workbench"><div class="optics-topline"><span class="tag">KHÁM PHÁ TRỰC TIẾP</span><strong id="optics-focus-state" role="status">Đang dựng ảnh</strong></div>
  <div class="optics-quick-actions"><button class="button secondary" type="button" data-optics-preset="real">Ảnh thật</button><button class="button secondary" type="button" data-optics-preset="virtual">Ảnh ảo</button><button class="button secondary" type="button" data-optics-preset="infinity">Vật tại F</button><button class="button secondary" type="button" id="optics-align">Đưa màn vào nét</button><button class="button secondary" type="button" id="optics-fit">Vừa khung</button><label class="optics-ray-toggle"><input type="checkbox" id="optics-show-rays" checked> Hiện tia sáng</label></div>
  <svg id="optics-scene" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="group" aria-label="Bàn quang học: kéo tay nắm VẬT và MÀN; phím mũi tên để dịch chuyển dụng cụ" tabindex="0">
    <defs><clipPath id="optics-viewport-clip"><rect x="12" y="48" width="696" height="266"/></clipPath></defs>
    <rect x="0" y="0" width="720" height="368" rx="14" class="optics-scene-back"/>
    <text x="23" y="31" class="optics-scene-title">BÀN QUANG HỌC · TIA SÁNG</text>
    <g clip-path="url(#optics-viewport-clip)">
      <line class="optics-axis" x1="20" y1="${AXIS_Y}" x2="700" y2="${AXIS_Y}"/>
      <g id="optics-rays"></g><g id="optics-screen-footprint" aria-hidden="true"></g>
      <path class="optics-lens" d="M360 62 Q326 184 360 306 Q394 184 360 62Z"/>
      <g id="optics-marks"></g>
      <g id="optics-screen" data-screen-handle="true" tabindex="0" role="slider" aria-label="Kéo màn hứng" aria-valuemin="0.02" aria-valuemax="2" aria-valuenow="0.15">
         <rect x="-7" y="-105" width="14" height="216" rx="5" class="optics-screen-shaft"/><rect x="-27" y="103" width="54" height="12" rx="4" class="optics-screen-base"/><circle cx="0" cy="0" r="30" class="optics-hit-area"/><circle r="10" class="optics-screen-grip"/>
      </g>
      <g id="optics-object-handle" data-object-handle="true" tabindex="0" role="slider" aria-label="Kéo vật sáng" aria-valuemin="0.02" aria-valuemax="2" aria-valuenow="0.3">
        <line id="optics-object-line" x1="0" y1="0" x2="0" y2="-55" class="optics-object"/><polygon id="optics-object-tip" points="0,-55 -8,-39 8,-39" class="optics-object"/><circle id="optics-object-hit" cx="0" cy="-55" r="32" class="optics-hit-area"/><circle id="optics-object-knob" cx="0" cy="-55" r="10" class="optics-object-knob"/>
      </g>
    </g>
    <text id="optics-object-caption" x="190" y="338" text-anchor="middle" class="optics-bottom-label">← KÉO VẬT</text>
    <text x="360" y="338" text-anchor="middle" class="optics-bottom-label">THẤU KÍNH</text>
    <text id="optics-screen-caption" x="480" y="338" text-anchor="middle" class="optics-bottom-label">KÉO MÀN →</text>
  </svg>
  <p class="optics-gesture-hint">Kéo vật ở bên trái; kéo màn ở bên phải. Tia nét liền là tia sáng thật, nét đứt là đường kéo dài để xác định ảnh ảo.</p>
  <div class="optics-readouts"><div><span>Khoảng cách ảnh dᵢ</span><strong id="optics-di"></strong><small>m</small></div><div><span>Độ phóng đại m</span><strong id="optics-mag"></strong><small>lần</small></div><div><span>Chiều cao ảnh hᵢ</span><strong id="optics-hi"></strong><small>m</small></div><div><span>Tính chất ảnh</span><strong id="optics-type"></strong><small id="optics-orientation"></small></div></div></section>
  <aside class="panel optics-controls"><h2>Thử thay đổi điều kiện</h2>${[['focalLength','Tiêu cự f',0.02,1,0.01,'m'],['objectDistance','Khoảng cách vật dₒ',0.02,2,0.01,'m'],['objectHeight','Chiều cao vật hₒ',0.01,1,0.01,'m']].map(([key,label,min,max,step]) => `<label class="optics-parameter" for="optics-${key}"><span>${label}</span><strong data-optics-param="${key}"></strong><input id="optics-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
  <p id="optics-equation" class="optics-equation"></p><p id="optics-status" role="status"></p><details class="assumptions"><summary>Giải thích và giới hạn mô hình</summary><p class="optics-assumption">Thấu kính mỏng hội tụ trong không khí; 1/f = 1/dₒ + 1/dᵢ. Ảnh ảo có dᵢ &lt; 0 và không thể thu trên màn thật. Chiều cao dụng cụ trong hình được tăng kích thước khi cần để dễ quan sát.</p></details></aside></div>
  <section class="optics-graph"><div class="section-heading"><div><h2>Khoảng cách ảnh theo vị trí vật</h2><p>Quan sát sự thay đổi dᵢ khi kéo vật qua tiêu điểm.</p></div></div><article id="graph-image-distance" class="graph-card"></article></section><section id="simulation-measurements"></section>`;

  const $ = selector => main.querySelector(selector);
  const graph = new GraphRenderer($('#graph-image-distance'),{key:'imageDistance',label:'Khoảng cách ảnh · dᵢ–dₒ',unit:'m',xKey:'objectDistance',xLabel:'dₒ (m)',role:'blue'});
  const stage = $('#optics-scene');
  mountMeasurementPanel($('#simulation-measurements'),{
    columns:[{key:'objectDistance',label:'Vật dₒ',unit:'m',csv:'object_distance_m'},{key:'focalLength',label:'Tiêu cự f',unit:'m',csv:'focal_length_m'},{key:'imageDistance',label:'Ảnh dᵢ',unit:'m',csv:'image_distance_m'},{key:'magnification',label:'Phóng đại',unit:'lần',csv:'magnification'},{key:'imageHeight',label:'Chiều cao ảnh',unit:'m',csv:'image_height_m'},{key:'screenDistance',label:'Vị trí màn',unit:'m',csv:'screen_distance_m'},{key:'focusError',label:'Sai lệch lấy nét',unit:'m',csv:'focus_error_m'}],
    state:()=>{const reading=model.at(params.objectDistance);return {...reading,screenDistance,focusError:Number.isFinite(reading.imageDistance)?Math.abs(screenDistance-reading.imageDistance):NaN};},
    filename:'physicslab-thau-kinh-measurements.csv',signal:abort.signal
    , experiment:{id:'lens',title:'Thấu kính hội tụ',parameters:()=>({...params,screenDistance}),assumptions:'Thấu kính mỏng hội tụ, gần trục. Ảnh ảo không hứng được trên màn; ảnh tại vô cực không có số đo khoảng cách hữu hạn.',reset:()=>{render();persist();}}
  });
  function resizeHitTargets() {
    const matrix=stage.getScreenCTM();
    const scaleX=matrix?Math.hypot(matrix.a,matrix.b):0;
    const scaleY=matrix?Math.hypot(matrix.c,matrix.d):0;
    const radius=minimumSvgHitRadius(Math.min(scaleX,scaleY));
    $('#optics-object-hit').setAttribute('r',String(radius));
    $('#optics-screen .optics-hit-area').setAttribute('r',String(radius));
  }
  const hitObserver=typeof ResizeObserver==='function'?new ResizeObserver(resizeHitTargets):null;
  hitObserver?.observe(stage);
  window.addEventListener('resize',resizeHitTargets,{signal:abort.signal});
  function persist() { progress.session(id,{parameters:{...params},setup:{screenDistance}}); }
  function render() {
    const state = model.at(params.objectDistance);
    const {markup,ox,oy,ix} = lensRayMarkup(params,state,scale);
    const sx = LENS_X + screenDistance*scale;
    const focalX = params.focalLength*scale;
    $('#optics-rays').innerHTML = raysVisible?markup:'';
    const footprint=opticalScreenFootprint(params,state,scale,screenDistance);
    const spot=$('#optics-screen-footprint');
    spot.innerHTML=footprint && footprint.x>16 && footprint.x<710?`<circle class="optics-projected-spot" cx="${footprint.x}" cy="${Math.min(312,Math.max(57,footprint.y))}" r="${Math.min(35,Math.max(3,footprint.blurRadius))}"/><text x="${Math.min(675,footprint.x+12)}" y="${Math.min(291,Math.max(70,footprint.y-18))}" class="optics-spot-label">${footprint.focused?'ẢNH RÕ':'ẢNH MỜ'}</text>`:'';
    $('#optics-marks').innerHTML = `<line class="optics-focus" x1="${LENS_X-focalX}" y1="176" x2="${LENS_X-focalX}" y2="192"/><line class="optics-focus" x1="${LENS_X+focalX}" y1="176" x2="${LENS_X+focalX}" y2="192"/><text x="${LENS_X-focalX}" y="214" text-anchor="middle">F</text><text x="${LENS_X+focalX}" y="214" text-anchor="middle">F</text>`;
    $('#optics-object-handle').setAttribute('transform',`translate(${ox}, ${AXIS_Y})`);
    $('#optics-object-line').setAttribute('y2',String(oy-AXIS_Y));
    $('#optics-object-tip').setAttribute('points',`0,${oy-AXIS_Y} -8,${oy-AXIS_Y+14} 8,${oy-AXIS_Y+14}`);
    $('#optics-object-hit').setAttribute('cy',String(oy-AXIS_Y));
    $('#optics-object-knob').setAttribute('cy',String(oy-AXIS_Y));
    $('#optics-object-handle').setAttribute('aria-valuenow',String(params.objectDistance));
    $('#optics-screen').setAttribute('transform',`translate(${sx}, ${AXIS_Y})`);
    $('#optics-screen').setAttribute('aria-valuenow',String(screenDistance));
    $('#optics-screen').classList.toggle('in-focus',isScreenFocused(state.imageDistance,screenDistance));
    $('#optics-object-caption').setAttribute('x',String(clamp(ox,70,280)));
    $('#optics-screen-caption').setAttribute('x',String(clamp(sx,440,640)));
    const type = state.imageType==='real'?'Ảnh thật':state.imageType==='virtual'?'Ảnh ảo':'Ảnh ở vô cực';
    $('#optics-di').textContent=state.imageDistance===null?'∞':format(state.imageDistance);
    $('#optics-mag').textContent=state.magnification===null?'∞':format(state.magnification);
    $('#optics-hi').textContent=state.imageHeight===null?'—':format(state.imageHeight);
    $('#optics-type').textContent=type;
    $('#optics-orientation').textContent=state.magnification===null?'':state.magnification<0?'ngược chiều':'cùng chiều';
    $('#optics-equation').textContent=state.imageDistance===null?'Vật đặt tại tiêu điểm: các tia ló song song; ảnh ở vô cực.':`1/f = 1/dₒ + 1/dᵢ · ${format(1/params.focalLength)} = ${format(1/params.objectDistance)} + ${format(1/state.imageDistance)} m⁻¹`;
    const focused=isScreenFocused(state.imageDistance,screenDistance);
    $('#optics-focus-state').textContent= focused?'✓ Ảnh thật đã hội tụ trên màn':state.imageType==='virtual'?'Ảnh ảo · màn không hứng được':state.imageType==='infinity'?'Ảnh ở vô cực': 'Di chuyển màn để lấy nét';
    $('#optics-status').textContent= focused?'Vị trí màn trùng với ảnh thật.':state.imageType==='virtual'?'Tia ló phân kỳ. Đường kéo dài gặp nhau bên trái thấu kính.':state.imageType==='infinity'?'Không có vị trí màn hữu hạn để hứng ảnh.':'Hãy kéo màn đến giao điểm của hai tia ló.';
    for(const key of Object.keys(OPTICS_DEFAULTS)){$(`[data-optics-param="${key}"]`).textContent=`${format(params[key])} m`;}
    if(state.imageDistance===null){graph.cursor.setAttribute('visibility','hidden');graph.dot.setAttribute('visibility','hidden');graph.live.textContent=`dₒ = ${format(params.objectDistance)} m · dᵢ → ∞ tại tiêu diện`;}
    else{graph.cursor.removeAttribute('visibility');graph.dot.removeAttribute('visibility');graph.update(params.objectDistance);}
  }
  function update(next,{fit=false}={}) {
    try {model=createThinLens(next);params={...model.parameters};
      if(fit && !drag)scale=calculateFitScale(params,model.imageDistance,screenDistance);
      for(const key of Object.keys(OPTICS_DEFAULTS))$(`#optics-${key}`).value=String(params[key]);
      if(drag)graph.update(params.objectDistance);else graph.setModel(model);render();persist();
    }catch(error){$('#optics-status').textContent=error.message;}
  }
  const pointer=(e)=>{const matrix=stage.getScreenCTM();return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):null;};
  for(const key of Object.keys(OPTICS_DEFAULTS))$(`#optics-${key}`).addEventListener('input',e=>update({...params,[key]:Number(e.target.value)},{fit:true}),{signal:abort.signal});
  stage.addEventListener('pointerdown',e=>{
    const target=e.target.closest('[data-object-handle],[data-screen-handle]');
    if(!target || (e.pointerType==='mouse'&&e.button!==0))return;
    const p=pointer(e);if(!p)return;
    drag={id:e.pointerId,kind:target.hasAttribute('data-object-handle')?'object':'screen',point:p,scale,objectDistance:params.objectDistance,screenDistance};
    stage.setPointerCapture(e.pointerId);e.preventDefault();target.focus({preventScroll:true});
  },{signal:abort.signal});
  stage.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;const p=pointer(e);if(!p)return;
    const difference=(p.x-drag.point.x)/drag.scale;
    if(drag.kind==='object')update({...params,objectDistance:quantize(drag.objectDistance-difference,.02,2)});
    else {screenDistance=quantize(drag.screenDistance+difference,.02,2);render();persist();}
  },{signal:abort.signal});
  const end=e=>{if(drag?.id!==e.pointerId)return;drag=null;graph.setModel(model);render();try{stage.releasePointerCapture(e.pointerId);}catch{/* already released */}};
  stage.addEventListener('pointerup',end,{signal:abort.signal});stage.addEventListener('pointercancel',end,{signal:abort.signal});stage.addEventListener('lostpointercapture',e=>{if(drag?.id!==e.pointerId)return;drag=null;graph.setModel(model);render();persist();},{signal:abort.signal});
  stage.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const delta=e.key==='ArrowRight'?.01:-.01;
    if(e.target.closest('[data-screen-handle]')){screenDistance=quantize(screenDistance+delta,.02,2);render();persist();}
    else update({...params,objectDistance:quantize(params.objectDistance-delta,.02,2)});
  },{signal:abort.signal});
  main.querySelectorAll('[data-optics-preset]').forEach(button=>button.addEventListener('click',()=>{
    const preset=button.dataset.opticsPreset;
    const focalLength=.1,objectDistance=preset==='real'?.3:preset==='virtual'?.05:.1;
    update({...params,focalLength,objectDistance},{fit:true});
  },{signal:abort.signal}));
  $('#optics-show-rays').addEventListener('change',event=>{raysVisible=event.target.checked;render();},{signal:abort.signal});
  $('#optics-fit').addEventListener('click',()=>{scale=calculateFitScale(params,model.imageDistance,screenDistance);render();},{signal:abort.signal});
  $('#optics-align').addEventListener('click',()=>{
    if(model.imageDistance===null||model.imageDistance<=0){$('#optics-status').textContent='Ảnh ảo hoặc ở vô cực không thể hứng trên màn.';return;}
    screenDistance=clamp(model.imageDistance,.02,2);scale=calculateFitScale(params,model.imageDistance,screenDistance);render();persist();
  },{signal:abort.signal});
  graph.setModel(model);render();resizeHitTargets();
  context.activeSimulation=()=>({id,parameters:{...params},state:{time:params.objectDistance,playing:false,rate:1},measurements:model.at(params.objectDistance),graphs:['imageDistance']});
  return()=>{hitObserver?.disconnect();abort.abort();context.activeSimulation=null;};
}
