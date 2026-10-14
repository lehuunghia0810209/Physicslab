/** Newton studio — direct-force workbench with one model for scene, readouts and graphs. */
import './newton.css';
import '../simulation-first-half.css';
import { createNewtonMotion, NEWTON_DEFAULTS } from '../../core/newton.js';
import { clamp, format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';
import { quantizeParameter } from '../../core/direct-manipulation.js';
import { mountMeasurementPanel } from '../../app/measurement-panel.js';

const LIMITS = { mass: [1,30,.5], force: [-80,80,1], friction: [0,1,.05], gravity: [1,25,.1] };
const fmt = number => format(Math.abs(number) < .0005 ? 0 : number);
const readouts = [
  ['acceleration','Gia tốc','m/s²'],['netForce','Hợp lực','N'],
  ['velocity','Vận tốc','m/s'],['position','Độ dời','m'],['frictionForce','Ma sát','N']
];
const fields = [
  ['mass','Khối lượng','kg'],['force','Lực tác dụng','N'],
  ['friction','Hệ số ma sát',''],['gravity','Trọng trường','m/s²']
];

export function mount(main, context) {
  const {progress}=context, abort=new AbortController();
  let params={...NEWTON_DEFAULTS}, savedTime=0;
  const saved=progress.get().sessions.newton;
  if(saved?.parameters){try{const restored=createNewtonMotion(saved.parameters);params={...restored.parameters};savedTime=Number.isFinite(saved.time)?saved.time:0;}catch{/* stale local data */}}
  let model=createNewtonMotion(params), forceGesture=null, blockGesture=null;
  progress.visit('newton','Khám phá định luật Newton');
  main.innerHTML=`<div class="page-heading"><div><p class="eyebrow">CƠ HỌC · LỚP 10 · TƯƠNG TÁC TRỰC TIẾP</p><h1>Định luật II Newton</h1><p>Thử đẩy mạnh hơn hoặc đổi khối lượng. Vật phản ứng như thế nào?</p></div><a href="#/simulations" class="button secondary">Thư viện mô phỏng</a></div>
  <div class="simulation-layout physics-first-layout"><section class="simulation-workbench"><div class="viewport-panel physics-first-panel">
    <div class="viewport-top"><span class="tag">SÂN THÍ NGHIỆM LỰC</span><span id="newton-time" class="time-label">t = 0 s</span></div>
    <div class="newton-scene physics-stage" id="newton-stage" role="group" aria-label="Mô phỏng khối chịu lực trên mặt phẳng ngang">
      <div class="physics-stage-tip">KÉO TAY NẮM <b>MÀU VÀNG</b> ĐỂ ĐỔI LỰC</div>
      <div class="newton-equilibrium" aria-hidden="true"></div>
      <div class="newton-path" aria-hidden="true"></div>
      <div class="newton-floor" aria-hidden="true"></div>
      <div class="newton-force-vector" id="newton-force-vector" aria-hidden="true"></div>
      <div class="newton-friction-vector" id="newton-friction-vector" aria-hidden="true"></div>
      <div class="newton-block" id="newton-block" role="slider" tabindex="0" aria-label="Kéo khối để xem các thời điểm chuyển động" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">5 kg</div>
      <div id="newton-force-handle" class="newton-force-handle" role="slider" tabindex="0" aria-label="Kéo tay nắm để thay đổi lực tác dụng" aria-valuemin="-80" aria-valuemax="80" aria-valuenow="22"><span>↔</span><small id="newton-force-label">+22 N</small></div>
      <div class="newton-direction" id="newton-direction" role="status">Hãy kéo lực để thử.</div>
    </div>
    <div class="newton-quick physics-first-quick" aria-label="Tình huống thử nhanh"><button type="button" class="button secondary" data-newton-preset="0">Cân bằng</button><button type="button" class="button secondary" data-newton-preset="25">Đẩy phải</button><button type="button" class="button secondary" data-newton-preset="-45">Đẩy trái</button><label class="physics-first-check"><input id="newton-show-forces" type="checkbox" checked> Hiện vectơ</label></div>
    <div class="playback-row physics-first-play"><button class="button primary" id="play">▶ Chạy</button><button class="button secondary" id="reset">↺ Đặt lại</button><label class="speed-control">Tốc độ <select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
    <label class="timeline-label" for="scrubber">Tua thời gian <span id="newton-duration"></span></label><input id="scrubber" class="timeline-slider" type="range" min="0" max="1000" value="0" aria-label="Thời điểm mô phỏng">
    <div class="measurement-strip physics-first-meters">${readouts.map(([key,label,unit])=>`<div><span>${label}</span><strong data-newton-value="${key}">0</strong><small>${unit}</small></div>`).join('')}</div>
    <p id="result-state" class="physics-first-feedback" role="status"></p>
  </div></section>
  <aside class="control-panel physics-first-controls"><div class="control-heading"><h2>Tùy chỉnh điều kiện</h2><span>SI</span></div><p class="physics-first-caption">Thử ngay trên sân mô phỏng trước; những điều kiện khác có thể đổi ở đây.</p><div class="parameters">${fields.map(([key,label,unit])=>`<div class="parameter"><div class="parameter-title"><label for="${key}">${label}</label><output data-newton-output="${key}">${fmt(params[key])} ${unit}</output></div><input id="${key}" type="range" min="${LIMITS[key][0]}" max="${LIMITS[key][1]}" step="${LIMITS[key][2]}" value="${params[key]}"></div>`).join('')}</div><details class="assumptions"><summary>Giả thiết và giới hạn mô hình</summary><ul><li>Vật ban đầu đứng yên trên mặt phẳng ngang.</li><li>Ma sát nghỉ giữ vật đứng yên khi |F| ≤ μmg; khi chuyển động, dùng lực ma sát có độ lớn μmg.</li><li>Lực và gia tốc được quy ước có dấu; mô hình không xét thay đổi lực theo thời gian sau khi thả.</li></ul></details></aside></div>
  <details class="physics-first-graphs" open><summary><strong>Đồ thị x–t và v–t</strong><span> Theo cùng thời gian với vật</span></summary><div class="graphs-grid"><article class="graph-card" id="graph-position"></article><article class="graph-card" id="graph-velocity"></article></div></details><section id="simulation-measurements"></section>`;
  const $=selector=>main.querySelector(selector), bind=(selector,type,fn)=>$(selector).addEventListener(type,fn,{signal:abort.signal});
  const stage=$('#newton-stage'), block=$('#newton-block'),handle=$('#newton-force-handle');
  const graphs=[new GraphRenderer($('#graph-position'),{key:'position',label:'Độ dời · x–t',unit:'m',role:'teal'}),new GraphRenderer($('#graph-velocity'),{key:'velocity',label:'Vận tốc · v–t',unit:'m/s',role:'blue'})];
  const timeline=new Timeline(model.duration,frame,()=>{progress.complete('newton');persist();});
  mountMeasurementPanel($('#simulation-measurements'),{
    columns:[{key:'t',label:'Thời gian',unit:'s',csv:'t_s'},{key:'position',label:'Độ dời',unit:'m',csv:'x_m'},{key:'velocity',label:'Vận tốc',unit:'m/s',csv:'v_m_s'},{key:'acceleration',label:'Gia tốc',unit:'m/s²',csv:'a_m_s2'},{key:'netForce',label:'Hợp lực',unit:'N',csv:'net_force_N'},{key:'frictionForce',label:'Ma sát',unit:'N',csv:'friction_N'}],
    state:()=>model.at(timeline.state.get().time),filename:'physicslab-newton-measurements.csv',signal:abort.signal
    , experiment:{id:'newton',title:'Định luật II Newton',parameters:()=>({...params}),assumptions:'Vật ban đầu đứng yên. Lực không đổi trên mặt phẳng ngang; cùng hệ số cho giới hạn ma sát nghỉ và ma sát trượt. Bỏ qua cản không khí.',reset:()=>{timeline.reset(model.duration);persist();},seek:time=>{timeline.seek(time);persist();},subscribe:fn=>timeline.state.subscribe(fn)}
  });
  function persist(){progress.session('newton',{parameters:{...params},time:timeline.state.get().time});}
  function frame(time){
    const s=model.at(time),playing=timeline.state.get().playing;
    graphs.forEach(g=>g.update(time));
    $('#newton-time').textContent=`t = ${fmt(time)} s`;
    $('#newton-duration').textContent=`0 – ${fmt(model.duration)} s`;
    $('#scrubber').value=String(1000*time/Math.max(model.duration,.001));
    $('#play').textContent=playing?'Ⅱ Tạm dừng':time>=model.duration?'↺ Chạy lại':'▶ Chạy';
    const movement=clamp(s.position/Math.max(model.maxDistance,.001),-1,1)*31;
    block.style.left=`${50+movement}%`;
    block.textContent=`${fmt(params.mass)} kg`;
    block.setAttribute('aria-valuenow',String(Math.round(100*time/Math.max(model.duration,.001))));
    handle.style.left=`${clamp(50+params.force*.28,24,76)}%`;
    $('#newton-force-label').textContent=`${params.force>0?'+':''}${fmt(params.force)} N`;
    handle.setAttribute('aria-valuenow',String(params.force));
    const f=stage.querySelector('#newton-force-vector'),fr=stage.querySelector('#newton-friction-vector');
    f.style.left=`${50+movement}%`;
    f.style.visibility=Math.abs(params.force)<.05?'hidden':'visible';
    f.style.setProperty('--vector-size',`${Math.min(30,Math.abs(params.force)*.32)}%`);
    f.dataset.direction=params.force>=0?'right':'left';
    fr.style.left=`${50+movement}%`;
    fr.style.visibility=Math.abs(s.frictionForce)<.05?'hidden':'visible';
    fr.style.setProperty('--vector-size',`${Math.min(24,Math.abs(s.frictionForce)*.3)}%`);
    fr.dataset.direction=params.force>=0?'left':'right';
    for(const [key] of readouts){const element=$(`[data-newton-value="${key}"]`);element.textContent=fmt(s[key]);}
    const held=model.threshold;
    $('#newton-direction').textContent=held?'ĐỨNG YÊN · MA SÁT NGHỈ':params.force>0?'ĐẨY SANG PHẢI':'ĐẨY SANG TRÁI';
    $('#result-state').textContent=held?`Ma sát nghỉ cân bằng lực ${fmt(Math.abs(params.force))} N. Chưa có gia tốc.`:`Hợp lực ${fmt(s.netForce)} N tạo gia tốc ${fmt(s.acceleration)} m/s². Đổi khối lượng để quan sát a = Fₕ/m.`;
  }
  function apply(next){
    try{
      model=createNewtonMotion(next);params={...model.parameters};
      for(const [key,,unit] of fields){$(`#${key}`).value=String(params[key]);$(`[data-newton-output="${key}"]`).textContent=`${fmt(params[key])} ${unit}`;}
      graphs.forEach(g=>g.setModel(model));timeline.reset(model.duration);persist();
    }catch(error){$('#result-state').textContent=error.message;}
  }
  function setForce(f){const [min,max,step]=LIMITS.force;const value=quantizeParameter((clamp(f,min,max)-min)/(max-min),{min,max,step});if(value!==params.force)apply({...params,force:value});}
  for(const [key] of fields)bind(`#${key}`,'input',e=>apply({...params,[key]:Number(e.target.value)}));
  bind('#play','click',()=>timeline.state.get().playing?timeline.pause():timeline.play());
  bind('#reset','click',()=>{apply({...NEWTON_DEFAULTS});});
  bind('#scrubber','input',e=>{timeline.seek(Number(e.target.value)/1000*model.duration);persist();});
  bind('#playback-rate','change',e=>timeline.rate(Number(e.target.value)));
  main.querySelectorAll('[data-newton-preset]').forEach(node=>node.addEventListener('click',()=>setForce(Number(node.dataset.newtonPreset)),{signal:abort.signal}));
  bind('#newton-show-forces','change',e=>stage.classList.toggle('hide-vectors',!e.target.checked));
  handle.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.stopPropagation();timeline.pause();forceGesture={id:e.pointerId,x:e.clientX,force:params.force,width:Math.max(240,stage.getBoundingClientRect().width)};handle.setPointerCapture(e.pointerId);e.preventDefault();},{signal:abort.signal});
  handle.addEventListener('pointermove',e=>{if(forceGesture?.id!==e.pointerId)return;setForce(forceGesture.force+(e.clientX-forceGesture.x)/forceGesture.width*180);},{signal:abort.signal});
  const endForce=e=>{if(forceGesture?.id!==e.pointerId)return;forceGesture=null;persist();};
  handle.addEventListener('pointerup',endForce,{signal:abort.signal});handle.addEventListener('pointercancel',endForce,{signal:abort.signal});handle.addEventListener('lostpointercapture',endForce,{signal:abort.signal});
  handle.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();setForce(e.key==='Home'?-80:e.key==='End'?80:params.force+(e.key==='ArrowRight'?1:-1));},{signal:abort.signal});
  block.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.stopPropagation();timeline.pause();blockGesture={id:e.pointerId,start:e.clientX,time:timeline.state.get().time,width:Math.max(200,stage.getBoundingClientRect().width)};block.setPointerCapture(e.pointerId);},{signal:abort.signal});
  block.addEventListener('pointermove',e=>{if(blockGesture?.id!==e.pointerId)return;timeline.seek(blockGesture.time+(e.clientX-blockGesture.start)/blockGesture.width*model.duration*2);},{signal:abort.signal});
  const endBlock=e=>{if(blockGesture?.id===e.pointerId){blockGesture=null;persist();}};
  block.addEventListener('pointerup',endBlock,{signal:abort.signal});block.addEventListener('pointercancel',endBlock,{signal:abort.signal});block.addEventListener('lostpointercapture',endBlock,{signal:abort.signal});
  block.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();timeline.seek(timeline.state.get().time+(e.key==='ArrowRight'?1:-1)*model.duration/40);persist();},{signal:abort.signal});
  const unsubscribe=timeline.state.subscribe(s=>{$('#play').textContent=s.playing?'Ⅱ Tạm dừng':s.time>=model.duration?'↺ Chạy lại':'▶ Chạy';});
  graphs.forEach(g=>g.setModel(model));timeline.reset(model.duration);timeline.seek(savedTime);frame(timeline.state.get().time);
  context.activeSimulation=()=>({id:'newton',parameters:{...params},state:timeline.state.get(),measurements:model.at(timeline.state.get().time),graphs:['position','velocity']});
  return ()=>{persist();abort.abort();unsubscribe();timeline.destroy();context.activeSimulation=null;};
}
