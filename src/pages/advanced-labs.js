import { ADVANCED_DEFAULTS, ADVANCED_META, advancedSample, interferenceSample } from '../core/advanced-labs.js';
import { getExperimentStore } from '../core/experiment-session.js';
import '../styles/advanced-labs.css';
const specs={
 induction:[['turns','Số vòng dây','vòng',1,600,1],['field','Cảm ứng từ cực đại','T',.05,.8,.05],['area','Diện tích vòng dây','m²',.001,.02,.001],['amplitude','Biên độ nam châm','m',.05,.3,.01],['frequency','Tần số dao động','Hz',.1,3,.1]],
 interference:[['amplitude','Biên độ mỗi nguồn','m',.02,.5,.01],['frequency','Tần số','Hz',.5,6,.1],['wavelength','Bước sóng','m',.3,4,.1],['phase','Độ lệch pha','°',-180,180,10]],
 calorimetry:[['m1','Khối lượng mẫu nóng','kg',.05,1,.05],['m2','Khối lượng mẫu lạnh','kg',.05,1,.05],['T1','Nhiệt độ ban đầu mẫu 1','K',283.15,373.15,5],['T2','Nhiệt độ ban đầu mẫu 2','K',283.15,373.15,5],['conductance','Hệ số truyền nhiệt mô hình','W/K',5,120,5]]
};
const cols={
 induction:[['t','Thời gian','s'],['x','Vị trí nam châm','m'],['velocity','Vận tốc','m/s'],['flux','Từ thông mỗi vòng','Wb'],['emf','Suất điện động','V']],
 interference:[['t','Thời gian','s'],['px','Đầu dò x','m'],['py','Đầu dò y','m'],['u1','Nguồn 1','m'],['u2','Nguồn 2','m'],['displacement','Li độ tổng','m']],
 calorimetry:[['t','Thời gian','s'],['temperature1','Nhiệt độ mẫu 1','K'],['temperature2','Nhiệt độ mẫu 2','K'],['heat1','Nhiệt lượng 1','J'],['heat2','Nhiệt lượng 2','J']]
};
const f=n=>Number.isFinite(n)?(Math.abs(n)>999?Number(n.toFixed(1)).toString():Number(n.toFixed(4)).toString()):'—';
const h=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const d=path=>path.join(' ');
const circle=(cx,cy,r,fill)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="${fill}"/>`;
function apparatusSvg(mode,p,t,s){
 if(mode==='induction'){
  const x=340+s.x*750;
  return `<defs><linearGradient id="v24mag" x1="0" x2="1"><stop stop-color="#ed846e"/><stop offset=".5" stop-color="#e6a15e"/><stop offset=".51" stop-color="#408cc0"/><stop offset="1" stop-color="#2b6aa4"/></linearGradient></defs>
   <path d="M30 262H650" stroke="currentColor" opacity=".2" stroke-width="2"/><g aria-hidden="true">${Array.from({length:7},(_,i)=>`<ellipse cx="${320+i*8}" cy="164" rx="34" ry="93" stroke="#65c6b1" stroke-width="4" fill="none"/>`).join('')}</g>
   <g data-handle="magnet" tabindex="0" role="slider" aria-label="Kéo nam châm dọc trục cuộn dây" aria-valuemin="-0.5" aria-valuemax="0.5" aria-valuenow="${f(s.x)}" aria-valuetext="${f(s.x)} mét" style="cursor:grab;outline:none"><rect x="${f(x-64)}" y="126" width="128" height="74" rx="13" fill="url(#v24mag)" stroke="#cde7e3" stroke-width="2"/><text x="${f(x-38)}" y="170" fill="white" font-size="22" font-weight="700">N</text><text x="${f(x+28)}" y="170" fill="white" font-size="22" font-weight="700">S</text><rect x="${f(x-74)}" y="100" width="148" height="130" rx="16" fill="transparent"/></g>
   <text x="283" y="292" fill="currentColor" font-size="17">Cuộn dây</text><text x="28" y="42" fill="currentColor" font-size="17">Nam châm có thể kéo trên trục x (m)</text><text x="28" y="322" fill="currentColor" font-size="16">Dừng kéo → v = 0 → ε = 0</text>`;
 }
 if(mode==='interference'){
  const xy=(x,y)=>[45+x*94,30+y*49];
  const points=Array.from({length:9},(_,yi)=>Array.from({length:13},(_,xi)=>{
   const x=xi*.5,y=yi*.75,env=interferenceSample(p,t,{px:x,py:y}).envelope/(2*p.amplitude);
   return `<rect x="${45+x*94-19}" y="${30+y*49-16}" width="38" height="31" rx="7" fill="#53b7c2" opacity="${f(.06+.54*env)}"/>`;
  }).join('')).join('');
  const mark=(key,label,color)=>{const [x,y]=xy(p[`${key}x`],p[`${key}y`]);return `<g data-handle="${key}" role="slider" tabindex="0" aria-label="Di chuyển ${label}" aria-valuetext="x ${f(p[`${key}x`])} mét, y ${f(p[`${key}y`])} mét" style="cursor:grab">${circle(x,y,20,color)}<text x="${f(x-9)}" y="${f(y+6)}" fill="#142a33" font-weight="800" font-size="18">${label}</text>${circle(x,y,25,'transparent')}</g>`;};
  return `<rect x="23" y="14" width="636" height="328" rx="18" fill="#102d3e"/>${points}${mark('s1','1','#fdba74')}${mark('s2','2','#f892b0')}${mark('p','P','#a5f3d6')}<text x="46" y="327" fill="#deedec" font-size="16">Vùng sáng: biên độ giao thoa lớn hơn · P: đầu dò</text>`;
 }
 const kelvin=(T)=>clamp((T-273.15)/100,0,1),height1=42+kelvin(s.temperature1)*145,height2=42+kelvin(s.temperature2)*145;
 return `<path d="M75 81V269Q75 289 98 289H252Q275 289 275 269V81" stroke="#8ecede" stroke-width="5" fill="none"/><path d="M382 81V269Q382 289 405 289H559Q582 289 582 269V81" stroke="#8ecede" stroke-width="5" fill="none"/><rect x="86" y="${f(282-height1)}" width="178" height="${f(height1)}" rx="9" fill="#f0a58b" opacity=".72"/><rect x="393" y="${f(282-height2)}" width="178" height="${f(height2)}" rx="9" fill="#6ac7d6" opacity=".75"/><text x="110" y="65" fill="currentColor" font-size="20" font-weight="650">Mẫu nóng</text><text x="412" y="65" fill="currentColor" font-size="20" font-weight="650">Mẫu lạnh</text><text x="112" y="164" font-size="26" font-weight="800" fill="#183e4f">${f(s.temperature1-273.15)}°C</text><text x="421" y="164" font-size="26" font-weight="800" fill="#183e4f">${f(s.temperature2-273.15)}°C</text><path d="M290 180H362m-14-12 14 12-14 12" stroke="#9ccbb4" stroke-width="5" stroke-linecap="round" fill="none"/><text x="62" y="329" fill="currentColor" font-size="17">Thay đổi nhiệt độ bằng điều khiển bên dưới; không thất thoát nhiệt.</text>`;
}
function chartSvg(mode,p,time){
 const len=mode==='calorimetry'?600:mode==='induction'?Math.max(1,3/p.frequency):Math.max(1,3/p.frequency);
 const samples=Array.from({length:101},(_,i)=>advancedSample(mode,p,len*i/100));
 // Never overlay Wb and V on the same Y-axis. Flux remains in the SI HUD.
 const keys=mode==='calorimetry'?['temperature1','temperature2']:mode==='induction'?['emf']:['u1','u2','displacement'];
 const vals=samples.flatMap(s=>keys.map(key=>s[key]));const lo=Math.min(...vals),hi=Math.max(...vals);const span=hi-lo||1;
 const colors=['#5cbdd1','#fa9a83','#a9dba2'];
 const paths=keys.map((key,index)=>`<polyline fill="none" stroke="${colors[index]}" stroke-width="3" stroke-linejoin="round" points="${samples.map((s,i)=>`${28+i*5.1},${130-(s[key]-lo)/span*108}`).join(' ')}"/>`).join('');
 return `<svg viewBox="0 0 560 175" role="img" aria-label="Đồ thị các đại lượng tính theo thời gian"><path d="M28 12V133H542" stroke="currentColor" opacity=".4" fill="none"/>${paths}<line x1="${f(28+clamp(time/len,0,1)*510)}" y1="12" x2="${f(28+clamp(time/len,0,1)*510)}" y2="133" stroke="currentColor" opacity=".65" stroke-dasharray="5 5"/><text x="28" y="156" fill="currentColor" font-size="12">0 s</text><text x="485" y="156" fill="currentColor" font-size="12">${f(len)} s</text>${keys.map((key,i)=>`<text x="${28+i*170}" y="171" fill="${colors[i]}" font-size="12">${h(key)}</text>`).join('')}</svg>`;
}
function saveFile(filename,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function mountAdvancedLab(host, initialMode = 'induction'){
 const abort=new AbortController();const store=getExperimentStore();
 let mode='induction',params={...ADVANCED_DEFAULTS.induction},time=0,playing=false,drag=null,manualX=null,speed=0,playbackSpeed=1,rows=[],runId='',frame=0,last=0,lastDraw=0;
 const metadata=()=>ADVANCED_META[mode];
 const current=()=>advancedSample(mode,params,time,mode==='induction'&&manualX!==null?{x:manualX,velocity:speed}:undefined);
 function hydrate(id){mode=id;playing=false;time=0;speed=0;drag=null;manualX=null;const draft=store.get().drafts[metadata().simulationId];params={...ADVANCED_DEFAULTS[mode]};rows=[];runId=`v24-${Date.now().toString(36)}-${Math.floor(Math.random()*1e8).toString(36)}`;
  if(draft && Object.keys(params).every(k=>Number.isFinite(draft.parameters[k]))){const valid=specs[mode].every(([k,, ,min,max])=>draft.parameters[k]>=min&&draft.parameters[k]<=max);if(valid){params={...params,...Object.fromEntries(Object.keys(params).map(k=>[k,draft.parameters[k]]))};rows=draft.rows;}}
 }
 function runData(){return {id:runId,simulationId:metadata().simulationId,name:metadata().title,createdAt:Date.now(),parameters:Object.fromEntries(Object.entries(params).filter(([,v])=>Number.isFinite(v))),modelVersion:'2.4.0-dev',assumptions:metadata().assumptions,columns:cols[mode].map(([key,label,unit])=>({key,label,unit,csv:label})),rows,selected:rows.map((_,i)=>i),notebook:{objective:metadata().description,observations:'',conclusion:''}};}
 function status(message){host.querySelector('[data-status]').textContent=message||'';}
 function display(){const s=current();const svg=host.querySelector('[data-apparatus]');if(!svg)return;
  svg.innerHTML=apparatusSvg(mode,params,time,s);
  host.querySelector('[data-time]').textContent=`${f(time)} s`;
  const displayed=cols[mode].slice(1).map(([k,label,unit])=>`<div><small>${h(label)}</small><strong>${f(s[k])} <span>${h(unit)}</span></strong></div>`).join('');
  host.querySelector('[data-readouts]').innerHTML=displayed;
  host.querySelector('[data-graph]').innerHTML=chartSvg(mode,params,time);
  host.querySelector('[data-count]').textContent=`${rows.length}/100 mẫu đo`;
  host.querySelector('[data-save]').disabled=!rows.length;
  host.querySelector('[data-csv]').disabled=!rows.length;
  host.querySelector('[data-play]').textContent=playing?'Tạm dừng':'Chạy mô phỏng';
 }
 function render(){const meta=metadata();host.innerHTML=`<section class="advanced-lab" aria-label="Phòng thí nghiệm nâng cao"><div class="advanced-top"><div><span class="eyebrow">VIRTUAL LAB 3.0 · PHYSICSLAB 2.4</span><h2>Trạm thực hành chuyên sâu</h2><p>Tương tác trực tiếp với thiết bị. Mọi số đo tính từ mô hình Vật lí và có đơn vị SI.</p></div><span class="tag">Lớp 11–12</span></div>
 <div class="advanced-tabs" role="group" aria-label="Chọn thí nghiệm nâng cao">${Object.entries(ADVANCED_META).map(([id,m])=>`<button type="button" data-mode="${id}" aria-pressed="${mode===id}">Lớp ${m.grade} · ${h(m.title.split(' · ')[0])}</button>`).join('')}</div>
 <div class="advanced-header"><h3>${h(meta.title)}</h3><p>${h(meta.description)}</p></div>
 <div class="advanced-grid"><div class="advanced-apparatus-wrap"><svg data-apparatus viewBox="0 0 680 360" role="group" aria-label="Thiết bị Vật lí có thể thao tác" tabindex="0"></svg><div class="advanced-transport"><button type="button" data-play class="button primary">Chạy mô phỏng</button><button type="button" data-reset class="button secondary">Về đầu</button><label class="advanced-speed">Tốc độ <select data-speed aria-label="Tốc độ chạy thí nghiệm"><option value="1">1×</option><option value="5">5×</option><option value="20">20×</option></select></label><span>Thời gian: <strong data-time>0 s</strong></span></div><div class="advanced-readouts" data-readouts></div></div>
 <aside class="advanced-controls"><h3>Thiết lập thí nghiệm</h3>${specs[mode].map(([k,label,unit,min,max,step])=>`<label><span>${h(label)} <output data-value="${k}">${f(params[k])} ${h(unit)}</output></span><input type="range" data-param="${k}" min="${min}" max="${max}" step="${step}" value="${params[k]}" aria-label="${h(label)}"></label>`).join('')}<p class="advanced-note"><strong>Giả định của mô hình</strong>${h(meta.assumptions)}</p></aside></div>
 <div class="advanced-results"><div><h3>Đồ thị & nhật kí đo</h3><div data-graph></div></div><div><h3>Bảng đo thực tế</h3><p data-count>0/100 mẫu đo</p><div class="advanced-actions"><button class="button primary" data-capture>Ghi phép đo</button><button class="button secondary" data-save>Lưu lần chạy</button><button class="button secondary" data-csv>Xuất CSV</button></div><p data-status role="status" aria-live="polite"></p><div class="advanced-rows" data-rows></div></div></div></section>`;
  const parent=host.querySelector('.advanced-lab');
  parent.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{hydrate(b.dataset.mode);render();},{signal:abort.signal}));
  parent.querySelectorAll('[data-param]').forEach(input=>input.addEventListener('input',()=>{playing=false;time=0;rows=[];manualX=null;params[input.dataset.param]=Number(input.value);host.querySelector(`[data-value="${input.dataset.param}"]`).textContent=`${f(params[input.dataset.param])} ${specs[mode].find(x=>x[0]===input.dataset.param)[2]}`;display();try{store.draft(runData());status('Đã đổi thiết lập: bản nháp mới không trộn mẫu của thiết lập trước. Các lần chạy đã lưu vẫn được giữ.');}catch(e){status(e.message);}},{signal:abort.signal}));
  parent.querySelector('[data-play]').addEventListener('click',()=>{if(!playing&&mode==='induction'&&manualX!==null){time=Math.acos(clamp(manualX/Math.max(.00001,params.amplitude),-1,1))/(2*Math.PI*params.frequency);manualX=null;}playing=!playing;last=0;display();},{signal:abort.signal});
  parent.querySelector('[data-speed]').value=String(playbackSpeed);
  parent.querySelector('[data-speed]').addEventListener('change',e=>{playbackSpeed=Number(e.target.value);},{signal:abort.signal});
  parent.querySelector('[data-reset]').addEventListener('click',()=>{time=0;playing=false;speed=0;manualX=null;display();},{signal:abort.signal});
  parent.querySelector('[data-capture]').addEventListener('click',()=>{try{if(rows.length>=100)throw Error('Đã đủ 100 mẫu. Hãy lưu lần chạy hoặc đổi thiết lập.');const s=current();rows.push(Object.fromEntries(cols[mode].map(([k])=>[k,s[k]])));store.draft(runData());refreshRows();display();status(store.issue()||'Đã ghi một mẫu từ mô hình.');}catch(e){status(e.message);}},{signal:abort.signal});
  parent.querySelector('[data-save]').addEventListener('click',()=>{try{store.save(runData());status(store.issue()||'Đã lưu lần chạy vào Experiment Studio, có thể mở và so sánh trong bảng đo.');runId=`v24-${Date.now().toString(36)}-${Math.floor(Math.random()*1e8).toString(36)}`;}catch(e){status(e.message);}},{signal:abort.signal});
  parent.querySelector('[data-csv]').addEventListener('click',()=>{const columns=cols[mode],csv='\uFEFF'+[columns.map(([,label,unit])=>`"${label} (${unit})"`).join(','),...rows.map(s=>columns.map(([key])=>s[key]).join(','))].join('\r\n');saveFile(`physicslab-24-${mode}.csv`,csv,'text/csv;charset=utf-8');},{signal:abort.signal});
  const svg=parent.querySelector('[data-apparatus]');
  svg.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-handle]');if(!el||!svg.contains(el))return;drag={key:el.dataset.handle,x:mode==='induction'?(manualX??current().x):0,lastX:0,lastT:e.timeStamp};manualX=mode==='induction'?drag.x:manualX;speed=0;playing=false;svg.setPointerCapture(e.pointerId);e.preventDefault();},{signal:abort.signal});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const rect=svg.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*680,y=(e.clientY-rect.top)/rect.height*360;
   const old=drag.x,dt=(e.timeStamp-drag.lastT)/1000;
   if(mode==='induction'){const next=clamp((x-340)/750,-params.amplitude,params.amplitude);speed=dt>0?clamp((next-old)/dt,-10,10):0;drag.x=next;manualX=next;}
   if(mode==='interference'){const key=drag.key;params[`${key}x`]=clamp((x-45)/94,0,6);params[`${key}y`]=clamp((y-30)/49,0,6);rows=[];}
   drag.lastT=e.timeStamp;time=mode==='induction'?0:time;display();e.preventDefault();
  },{signal:abort.signal});
  const end=e=>{if(!drag)return;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(mode==='induction'){speed=0;time=0;}drag=null;display();};
  svg.addEventListener('pointerup',end,{signal:abort.signal});svg.addEventListener('pointercancel',end,{signal:abort.signal});svg.addEventListener('lostpointercapture',()=>{drag=null;speed=0;display();},{signal:abort.signal});
  svg.addEventListener('keydown',e=>{const el=e.target.closest('[data-handle]')||(e.target===svg?{dataset:{handle:mode==='interference'?'p':'magnet'}}:null);if(!el||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const dir=['ArrowLeft','ArrowDown'].includes(e.key)?-1:1;playing=false;
   if(mode==='induction'){manualX=clamp((manualX??current().x)+.01*dir,-params.amplitude,params.amplitude);speed=0;}
   else if(mode==='interference'){const key=el.dataset.handle,coord=['ArrowUp','ArrowDown'].includes(e.key)?'y':'x';params[`${key}${coord}`]=clamp(params[`${key}${coord}`]+dir*.1,0,6);rows=[];}
   display();svg.focus();},{signal:abort.signal});
  refreshRows();display();
 }
 function refreshRows(){const panel=host.querySelector('[data-rows]');if(panel)panel.innerHTML=rows.length?`<div class="table-scroll"><table><thead><tr>${cols[mode].map(([_,label])=>`<th>${h(label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(-5).map(r=>`<tr>${cols[mode].map(([k])=>`<td>${f(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<p class="subtle">Chưa ghi mẫu nào. Chọn “Ghi phép đo” khi đã điều chỉnh thiết bị.</p>';}
 hydrate(Object.hasOwn(ADVANCED_META,initialMode)?initialMode:mode);render();
 function tick(now){if(abort.signal.aborted)return;if(last&&playing&&!drag){const dt=Math.min(.1,(now-last)/1000);time+=dt*playbackSpeed;const max=mode==='calorimetry'?600:Math.max(1,3/params.frequency);if(time>=max){time=max;playing=false;}if(now-lastDraw>32||!playing){lastDraw=now;display();}}last=now;frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
 return ()=>{abort.abort();cancelAnimationFrame(frame);};
}
