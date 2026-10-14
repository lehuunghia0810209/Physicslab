/** PhysicsLab 1.7: refined apparatus-first interactive optical, wave and incline labs. */
import { escapeHtml } from '../app/icons.js';
import { LAB16_IDS, rampGeometry, opticalBench, waveSpeed, ROPE_LENGTH } from '../core/lab-16-physics.js';
import { LAB16_SIZE, paintLab16Background, drawRamp, drawOptics, drawWave } from './lab-16-scenes.js';
import '../styles/lab-1-6.css';
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const titles={
  'inclined-plane':'MÁNG NGHIÊNG & XE TRƯỢT',
  'thin-lens':'BÀN QUANG HỌC & MÀN HỨNG',
  'wave-speed':'DÂY SÓNG & ĐỒNG HỒ ĐO',
  'wave-interference':'HAI NGUỒN SÓNG KẾT HỢP'
};
const guided={
  'inclined-plane':['Thử kéo đầu máng để tạo dốc thấp, bấm Thả xe.','Tăng góc đến khi xe tự trượt; quan sát gia tốc và lực ma sát.','Ghi ba góc khác nhau vào sổ để so sánh.'],
  'thin-lens':['Kéo vật sáng về phía trước hoặc sau thấu kính.','Kéo màn hứng tới nơi các tia hội tụ để tạo ảnh rõ.','Đưa vật vào trong tiêu cự: ảnh ảo không hứng được trên màn.'],
  'wave-speed':['Chọn Phát xung rồi quan sát xung đi qua đầu dò.','Di chuyển đầu dò đến vị trí mới để đo thời gian truyền.','Thử đổi đầu cố định/tự do; quan sát xung phản xạ.'],
  'wave-interference':['Kéo tay điều khiển pha của nguồn 2 lên/xuống.','Quan sát sóng 1, sóng 2 và sóng tổng hợp.','Thử Δφ = 0° và 180°, rồi ghi phép đo để so sánh.']
};
const science={
  'inclined-plane':'Máng dài 4 m, xe thả không vận tốc đầu, lực ma sát Coulomb có cùng hệ số trong mô hình. Trượt khi mg sinθ > μmg cosθ; khi xe đến chân dốc nó dừng tại chặn cuối. Vectơ lực vẽ theo quy ước minh họa. Sổ đo ghi gia tốc lí thuyết theo góc và độ chia dụng cụ, không giả số đo thực nghiệm ngẫu nhiên.',
  'thin-lens':'Mô hình thấu kính mỏng, gần trục; 1/f = 1/dₒ + 1/dᵢ. Ảnh thật có thể hứng trên màn, ảnh ảo không. Tia và độ cao biểu tượng được tăng kích thước để dễ nhìn; khoảng cách đo bằng mô hình SI. Khi dₒ = f, ảnh ở vô cực và không thể ghi một phép đo hữu hạn.',
  'wave-speed':'Dây 1D lý tưởng, không tán sắc, truyền với v = fλ. Xung và sóng tuần hoàn được phát từ đầu trái; đầu phải có điều kiện phản xạ cố định hoặc tự do. Sóng không tính ma sát, âm thanh, hay lực căng dây độc lập. Sổ đo ghi d/v theo khoảng cách đầu dò và độ chia thiết bị.',
  'wave-interference':'Hai nguồn đồng bộ cùng biên độ, tần số và bước sóng; sóng tổng là tổng li độ tức thời của từng nguồn. Số đọc tại đầu dò là tức thời theo mô hình lý tưởng. Sổ đo có quy ước đo tại thời điểm tham chiếu của thí nghiệm, không phải vị trí đầu dò trên ảnh.'
};
const isWave=id=>id.startsWith('wave-');
function options(id){
 if(id==='inclined-plane')return `<button type="button" class="lab16-chip" data-lab16-preset="15">Dốc nhẹ 15°</button><button type="button" class="lab16-chip" data-lab16-preset="35">Dốc 35°</button><button type="button" class="lab16-chip" data-lab16-preset="55">Dốc lớn 55°</button><label class="lab16-chip lab16-toggle"><input type="checkbox" data-lab16-vectors checked> Hiện lực</label>`;
 if(id==='thin-lens')return `<button type="button" class="lab16-chip" data-lab16-object="real">Ảnh thật</button><button type="button" class="lab16-chip" data-lab16-object="virtual">Ảnh ảo</button><button type="button" class="lab16-chip" data-lab16-object="infinity">Ở tiêu điểm</button><button type="button" class="lab16-chip lab16-accent" data-lab16-align>Đưa màn vào nét</button>`;
 if(id==='wave-speed')return `<label class="lab16-label">Nguồn <select data-lab16-wave-mode><option value="pulse">Phát xung</option><option value="harmonic">Rung tuần hoàn</option></select></label><label class="lab16-label">Đầu dây <select data-lab16-boundary><option value="fixed">Cố định</option><option value="free">Tự do</option></select></label>`;
 return `<button type="button" class="lab16-chip" data-lab16-phase="0">Đồng pha</button><button type="button" class="lab16-chip" data-lab16-phase="90">Lệch 90°</button><button type="button" class="lab16-chip" data-lab16-phase="180">Ngược pha</button>`;
}
export function mountLab16Workbench(host,{experiment,setup:initialSetup,onParameterChange,onCapture}){
 if(!LAB16_IDS.includes(experiment.id))throw new RangeError('Bàn thí nghiệm chưa có chế độ chuyên sâu.');
 let setup={...initialSetup};let time=0,last=0,raf=0,playing=false,disposed=false,drag=null;
 let dragSession=null;
 let release=0,screenDistance=0.22,probe=isWave(experiment.id)?Number(setup.distance||2):0;
 let waveMode='pulse',boundary='fixed',vectors=true,focused='';
 const id=experiment.id;
 host.innerHTML=`<section class="lab16-workbench" data-lab16-id="${id}">
 <div class="lab16-head"><div><span class="lab16-eyebrow">PHYSICSLAB 1.7 · BÀN THỰC HÀNH</span><h3>${escapeHtml(titles[id])}</h3><p>${escapeHtml(experiment.description)}</p></div><span class="lab16-label-tag">TỰ KHÁM PHÁ</span></div>
 <div class="lab16-bar"><div class="lab16-controls">${options(id)}</div><div class="lab16-run"><button type="button" class="button primary" data-lab16-play ${id==='thin-lens'?'hidden':''}>${id==='inclined-plane'?'▶ Thả xe':'▶ Phát sóng'}</button><button type="button" class="button secondary" data-lab16-reset>↺ Thử lại</button><button type="button" class="button secondary" data-lab16-slow aria-pressed="false" ${id==='thin-lens'?'hidden':''}>½× Chậm</button></div></div>
 <div class="lab16-frame"><div class="lab16-stage-scroller"><canvas data-lab16-canvas width="${LAB16_SIZE.width}" height="${LAB16_SIZE.height}" tabindex="0" role="group" aria-label="${escapeHtml(experiment.title)}. Kéo các tay nắm phát sáng. Dùng Tab đến nút điều khiển, dùng mũi tên khi chọn canvas."></canvas></div><div class="lab16-status-chip" data-lab16-chip>● Sẵn sàng · Kéo vật thể để bắt đầu</div></div>
 <p class="lab16-mobile-hint">↔ Vuốt vùng trống trên bàn để xem toàn bộ thiết bị. Kéo tay nắm xanh để thao tác.</p><div class="lab16-meters" aria-live="polite"><div><small data-lab16-r0>KẾT QUẢ</small><strong data-lab16-v0>—</strong></div><div><small data-lab16-r1>KẾT QUẢ</small><strong data-lab16-v1>—</strong></div><div><small data-lab16-r2>KẾT QUẢ</small><strong data-lab16-v2>—</strong></div></div>
 <div class="lab16-education"><section><h4>Thử → Quan sát → Giải thích</h4><ol>${guided[id].map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><p class="lab16-feedback" data-lab16-feedback role="status">Kéo tay nắm màu xanh hoặc dùng các nút gợi ý phía trên.</p></section><section><h4>Dụng cụ đo & số liệu</h4><p>Số đọc hiển thị trên bàn thay đổi cùng thí nghiệm. Dùng <strong>Ghi phép đo</strong> để lưu giá trị mô hình vào sổ và đồ thị ở phía dưới.</p><p data-lab16-time>Thời gian: 0,00 s</p><button type="button" class="button primary" data-lab16-capture>＋ Ghi phép đo</button></section></div>
 <details class="lab16-science"><summary>Giải thích mô hình Vật lý và giới hạn</summary><p>${escapeHtml(science[id])}</p></details>
 <p class="lab16-a11y">Hỗ trợ bàn phím: khi chọn vùng thí nghiệm, phím ← → thay đổi ${id==='inclined-plane'?'góc dốc':id==='thin-lens'?'khoảng cách vật':id==='wave-interference'?'độ lệch pha':'vị trí đầu dò'}. Space phát/dừng khi có đồng hồ.</p>
 </section>`;
 const $=s=>host.querySelector(s);const canvas=$('[data-lab16-canvas]');const scroller=$('.lab16-stage-scroller');const c=canvas.getContext('2d');
 if(!c)throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');
 const events=new AbortController();let result;
 function info(text){$('[data-lab16-feedback]').textContent=text;}
 function status(text){$('[data-lab16-chip]').textContent=text;}
 function pointer(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)*960/b.width,y:(e.clientY-b.top)*540/b.height};}
 function format(num){return Number(num).toLocaleString('vi-VN',{maximumFractionDigits:3});}
 function render(){if(disposed)return; c.clearRect(0,0,960,540);paintLab16Background(c,titles[id]);
   try {result=id==='inclined-plane'?drawRamp(c,setup,time,release,{vectors})
     :id==='thin-lens'?drawOptics(c,setup,screenDistance,{})
     :drawWave(c,id,setup,time,probe,{waveMode,boundary});
    result.telemetry.forEach(([label,val],i)=>{$(`[data-lab16-r${i}]`).textContent=label;$(`[data-lab16-v${i}]`).textContent=val;});
   }catch(error){info(`Cần chỉnh lại thông số: ${error.message}`);}
   $('[data-lab16-time]').textContent=`Thời gian: ${format(time)} s`;
 }
 function setParam(key,value){const param=experiment.parameters.find(p=>p.key===key);if(!param||param.type==='select')return;
  const adjusted=Number((param.min+Math.round((clamp(value,param.min,param.max)-param.min)/param.step)*param.step).toFixed(6));
  if(!Number.isFinite(adjusted)||adjusted===setup[key])return;
  setup={...setup,[key]:adjusted}; time=0; release=0;onParameterChange(key,adjusted); render();
 }
 function maxTime(){if(id==='inclined-plane'){const a=Math.max(.03,result?.state?.acceleration||0);return Math.min(12,Math.sqrt(8/a)+.5);}if(id==='wave-speed')return Math.min(18,Math.max(3,2*ROPE_LENGTH/waveSpeed(setup)+.95));return 12;}
 function pause(){playing=false;cancelAnimationFrame(raf);raf=0;last=0;const button=$('[data-lab16-play]');if(button)button.textContent=id==='inclined-plane'?'▶ Thả xe':'▶ Phát sóng';status('● Tạm dừng · Có thể thay đổi dụng cụ');}
 function tick(now){if(!playing||disposed)return;if(last)time+=Math.min(.05,(now-last)/1000)*($('[data-lab16-slow]').getAttribute('aria-pressed')==='true'?.5:1);last=now;
  if(time>=maxTime()){time=maxTime();pause();}render();if(playing)raf=requestAnimationFrame(tick);
 }
 function play(){if(id==='thin-lens')return;if(playing){pause();return;}if(time>=maxTime())time=0;playing=true;last=0;$('[data-lab16-play]').textContent='Ⅱ Tạm dừng';status('● Đang quan sát · Kéo vật để đổi điều kiện');raf=requestAnimationFrame(tick);}
 function restart(){pause();time=0;release=0;render();info(id==='thin-lens'?'Hãy kéo vật sáng và màn hứng.':'Đã đặt lại thời gian và vị trí ban đầu.');}
 function hit(p){const items=result?.handles||[];return items.find(h=>Math.hypot(p.x-h.x,p.y-h.y)<h.r)?.id||null;}
 function dragTo(p,which){
  if(which==='ramp-angle'){const g=rampGeometry(setup.angle),ang= Math.atan2(g.foot.y-p.y,p.x-g.foot.x)*180/Math.PI;setParam('angle',ang);info('Đã điều chỉnh dốc. Thả xe và quan sát lực ma sát.');}
  else if(which==='ramp-cart'){const {geometry:g}=result.state;const vx=g.foot.x-g.top.x,vy=g.foot.y-g.top.y;const projection=clamp(((p.x-g.top.x)*vx+(p.y-g.top.y)*vy)/(vx*vx+vy*vy),0,.98);release=4*projection;time=0;render();info(`Xe đang ở vị trí ${format(release)} m dọc máng; bấm Thả xe.`);}
  else if(which==='lens-object'){
    const base=dragSession?.id===which?dragSession:{setup,scale:result?.state?.scale||1,startPointer:p};
    const nextDistance=clamp(base.setup.objectDistance-(p.x-base.startPointer.x)/base.scale,.02,2);
    setParam('objectDistance',nextDistance);info('Vật đã dịch chuyển; hãy nhìn vị trí ảnh rồi kéo màn.');
  }
  else if(which==='lens-screen'){
    const base=dragSession?.id===which?dragSession:{screenDistance,scale:result?.state?.scale||1,startPointer:p};
    screenDistance=clamp(base.screenDistance+(p.x-base.startPointer.x)/base.scale,.02,5);render();info(result?.state?.screenFocused?'Ảnh thật đã nét trên màn.':'Kéo màn đến nơi hội tụ tia; ảnh ảo không hứng được.');
  }
  else if(which==='wave-probe'){probe=clamp((p.x-125)*ROPE_LENGTH/710,0,ROPE_LENGTH);setParam('distance',probe);render();info(`Đầu dò ở ${format(probe)} m. Xem thời gian xung đi qua.`);}
  else if(which==='wave-phase'){setParam('phaseDifference',clamp((315-p.y)/.55,-180,180));info(`Độ lệch pha: ${format(setup.phaseDifference)}°`);}
 }
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;const p=pointer(e);const picked=hit(p);drag=picked;
  dragSession=null;
  // Direct dragging the scale in wave-speed is also allowed, not only the tiny probe.
  if(!drag && id==='wave-speed'&&p.y>200&&p.y<450&&p.x>=125&&p.x<=835)drag='wave-probe';
  if(!drag && e.pointerType==='touch'){drag='pan';canvas.dataset.panX=String(e.clientX);}
  if(drag){
    if(drag!=='pan'){
      pause();
      const handle=(result?.handles||[]).find(item=>item.id===drag);
      dragSession={id:drag,startPointer:p,handle,setup:{...setup},screenDistance,release,probe,scale:result?.state?.scale||1};
    }
    canvas.setPointerCapture?.(e.pointerId);canvas.dataset.dragging=drag;canvas.dataset.pointer=String(e.pointerId);e.preventDefault();if(drag!=='pan')dragTo(p,drag);}
 },{signal:events.signal});
 canvas.addEventListener('pointermove',e=>{if(!drag||Number(canvas.dataset.pointer)!==e.pointerId)return; if(drag==='pan'){const previous=Number(canvas.dataset.panX);scroller.scrollLeft-=e.clientX-previous;canvas.dataset.panX=String(e.clientX);}else dragTo(pointer(e),drag);},{signal:events.signal});
 const end=e=>{if(drag&&Number(canvas.dataset.pointer)===e.pointerId){drag=null;dragSession=null;delete canvas.dataset.dragging;delete canvas.dataset.pointer;delete canvas.dataset.panX;try{canvas.releasePointerCapture(e.pointerId);}catch{/* already lost */}}};
 canvas.addEventListener('pointerup',end,{signal:events.signal});canvas.addEventListener('pointercancel',end,{signal:events.signal});
 canvas.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft',' ','Enter'].includes(e.key))return;e.preventDefault();if(e.key===' '||e.key==='Enter'){play();return;}
   const direction=e.key==='ArrowRight'?1:-1;
   if(id==='inclined-plane')setParam('angle',setup.angle+direction);
   else if(id==='thin-lens')setParam('objectDistance',setup.objectDistance+direction*.01);
   else if(id==='wave-interference')setParam('phaseDifference',setup.phaseDifference+direction*5);
   else {probe=clamp(probe+direction*.1,.5,8);setParam('distance',probe);render();}
 },{signal:events.signal});
 $('[data-lab16-play]').addEventListener('click',play,{signal:events.signal});
 $('[data-lab16-reset]').addEventListener('click',restart,{signal:events.signal});
 $('[data-lab16-capture]').addEventListener('click',onCapture,{signal:events.signal});
 $('[data-lab16-slow]').addEventListener('click',e=>{const next=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(next));e.currentTarget.textContent=next?'1× Thường':'½× Chậm';},{signal:events.signal});
 host.querySelectorAll('[data-lab16-preset]').forEach(btn=>btn.addEventListener('click',()=>{setParam('angle',Number(btn.dataset.lab16Preset));restart();},{signal:events.signal}));
 host.querySelectorAll('[data-lab16-object]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.lab16Object;setParam('focalLength',.1);setParam('objectDistance',type==='real'?.3:type==='virtual'?.05:.1);info(type==='virtual'?'Ảnh ảo: không thể thu lên màn.':type==='infinity'?'Vật ở tiêu điểm: ảnh ở vô cực.':'Ảnh thật: kéo màn sang phải đến điểm hội tụ.');},{signal:events.signal}));
 $('[data-lab16-vectors]')?.addEventListener('change',e=>{vectors=e.target.checked;render();},{signal:events.signal});
 $('[data-lab16-align]')?.addEventListener('click',()=>{const lens=opticalBench(setup,screenDistance);if(lens.imageDistance!==null&&lens.imageDistance>0){screenDistance=lens.imageDistance;render();info('Màn đã đặt đúng vị trí ảnh thật; thử kéo vật để mất nét.');}else info('Ảnh ảo hoặc ở vô cực không thu được trên màn.');},{signal:events.signal});
 $('[data-lab16-wave-mode]')?.addEventListener('change',e=>{waveMode=e.target.value;restart();},{signal:events.signal});
 $('[data-lab16-boundary]')?.addEventListener('change',e=>{boundary=e.target.value;restart();},{signal:events.signal});
 host.querySelectorAll('[data-lab16-phase]').forEach(btn=>btn.addEventListener('click',()=>{setParam('phaseDifference',Number(btn.dataset.lab16Phase));info('Đã đổi độ lệch pha giữa hai nguồn.');},{signal:events.signal}));
 render();
 // On narrow touch screens, reveal the apparatus instead of an empty edge of the 960px scene.
 requestAnimationFrame(()=>{if(!disposed && scroller.scrollWidth>scroller.clientWidth){scroller.scrollLeft=id==='wave-speed'?65:id==='wave-interference'?170:190;}});
 return {pause,update(next){setup={...next};if(id==='wave-speed')probe=Number(setup.distance);render();},destroy(){disposed=true;pause();events.abort();host.replaceChildren();}};
}
