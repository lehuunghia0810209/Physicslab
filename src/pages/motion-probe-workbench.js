/** 1.8 interactive teaching instrument: projector + dual time traces.
 * All quantities come from the analytic SI physics core, never from pixels.
 */
import {createMotionProbe} from '../core/motion-probe.js';
import '../styles/motion-probe.css';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const fmt=(n,digits=2)=>Number(n).toLocaleString('vi-VN',{maximumFractionDigits:digits});
const SCENARIOS={earth:{v0:20,angle:45,height:2,g:9.81},horizontal:{v0:14,angle:0,height:12,g:9.81},moon:{v0:20,angle:35,height:2,g:1.62}};
const W=960,H=560;
const upper={left:70,right:910,top:80,bottom:295};
const plotX={left:76,right:453,top:354,bottom:496};
const plotY={left:532,right:910,top:354,bottom:496};
function pathLine(ctx,points,toX,toY){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(toX(p),toY(p)):ctx.moveTo(toX(p),toY(p)));ctx.stroke();}
function line(ctx,x1,y1,x2,y2,color='#466570',w=1,dash=[]){ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);}
function round(ctx,x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function label(ctx,str,x,y,color='#d4e7ed',size=14,align='left',weight=600){ctx.font=`${weight} ${size}px system-ui`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(str,x,y);ctx.textAlign='left';}
export function mountMotionProbeWorkbench(root){
 if(!root)return()=>{};
 root.innerHTML=`<div class="motion-probe-head"><div><span class="tag">DỤNG CỤ ĐO · CƠ HỌC LỚP 10</span><h2>Thước thời gian và quỹ đạo</h2><p>Kéo chấm trên quỹ đạo hoặc vạch thời gian trên đồ thị để xem vật chuyển động và đọc đúng các đại lượng tại cùng một thời điểm.</p></div><label class="motion-probe-scenario">Thử nghiệm<select data-motion-preset aria-label="Chọn tình huống ném xiên"><option value="earth">Trái Đất · Ném xiên</option><option value="horizontal">Ném ngang · H = 12 m</option><option value="moon">Mặt Trăng · Ném xiên</option></select></label></div>
 <div class="motion-probe-stage"><div class="motion-probe-scroll"><canvas data-motion-canvas width="${W}" height="${H}" tabindex="0" role="group" aria-label="Thước thời gian. Kéo chấm vàng dọc quỹ đạo hoặc kéo trên các đồ thị; phím mũi tên để thay đổi thời gian."></canvas></div></div>
 <div class="motion-probe-mobile-nav" role="group" aria-label="Chọn đồ thị trên điện thoại"><span>↔ Vuốt ngang để xem các phần của bàn đo</span><button type="button" data-motion-see="left" aria-pressed="true">Quỹ đạo · x(t)</button><button type="button" data-motion-see="right" aria-pressed="false">y(t)</button></div>
 <div class="motion-probe-actions"><button type="button" class="button primary" data-motion-play aria-pressed="false">▶ Phát</button><button type="button" class="button secondary" data-motion-reset>↺ Về ban đầu</button><label class="motion-probe-scrubber">Thời gian thí nghiệm <input data-motion-timeline type="range" min="0" max="1000" step="1" value="0" aria-label="Vị trí thời gian trên toàn quỹ đạo"></label><button type="button" class="button secondary" data-motion-csv>Xuất số đo CSV</button></div>
 <div class="motion-probe-readouts" aria-live="off"><div><small>THỜI GIAN</small><strong data-motion-t>0,00 s</strong></div><div><small>VỊ TRÍ x · y</small><strong data-motion-pos>—</strong></div><div><small>VẬN TỐC vₓ · vᵧ</small><strong data-motion-velocity>—</strong></div><div><small>CƠ NĂNG / kg</small><strong data-motion-energy>—</strong></div></div>
 <p class="motion-probe-help">Thử kéo chấm vàng trên đường bay hoặc vạch vàng trên hai đồ thị. <strong>Vị trí và vận tốc được tính theo SI</strong>, không phải đo từ hình vẽ. Dùng ← → và phím Space khi đang chọn khung để thao tác bằng bàn phím.</p>
 <details class="motion-probe-advanced"><summary>Tùy chỉnh điều kiện đầu và giải thích mô hình</summary><div class="motion-probe-advanced-grid"><label>Vận tốc đầu <output data-motion-speed-output>20 m/s</output><input data-motion-speed type="range" min="2" max="40" step="1" value="20"></label><label>Góc phóng <output data-motion-angle-output>45°</output><input data-motion-angle type="range" min="0" max="90" step="1" value="45"></label></div><p>Mô hình bỏ qua lực cản không khí, có gia tốc g không đổi. Đồ thị biểu diễn x(t), y(t); vectơ tiếp tuyến thể hiện vận tốc tức thời. Cơ năng riêng E/m = v²/2 + gy được bảo toàn trong mô hình.</p></details>`;
 const $=selector=>root.querySelector(selector),ctx=$('[data-motion-canvas]').getContext('2d');
 if(!ctx)throw new Error('Trình duyệt không hỗ trợ Canvas 2D');
 const abort=new AbortController();let params={...SCENARIOS.earth},probe=createMotionProbe(params),samples=probe.points(180),phase=0,drag=null,frameId=0,clock=0,disposed=false;
 const canvas=$('[data-motion-canvas]');
 function sampleXY(st){const maxR=Math.max(1,probe.model.range),maxY=Math.max(1,probe.model.maxHeight,params.height);
  return {x:upper.left+(upper.right-upper.left)*st.x/maxR,y:upper.bottom-(upper.bottom-upper.top)*st.y/maxY};}
 function graphCoords(st,rect,valueKey,maxVal){return {x:rect.left+(rect.right-rect.left)*st.phase,y:rect.bottom-(rect.bottom-rect.top)*st[valueKey]/Math.max(1,maxVal)};}
 function paintGraph(rect,key,maxVal,title,color){
  round(ctx,rect.left-16,rect.top-30,rect.right-rect.left+32,rect.bottom-rect.top+74,13,'#173740');
  for(let i=0;i<=4;i++){const y=rect.bottom-(rect.bottom-rect.top)*i/4;line(ctx,rect.left,y,rect.right,y,'#355560',1,[3,5]);}
  label(ctx,title,rect.left,rect.top-11,'#d4e8ee',14);
  label(ctx,`${fmt(maxVal,1)} m`,rect.left,rect.top-36,'#a6c5cb',11);
  label(ctx,'0',rect.left,rect.bottom+19,'#abc8cf',12);
  label(ctx,`${fmt(probe.model.duration,2)} s`,rect.right,rect.bottom+19,'#abc8cf',12,'right');
  ctx.strokeStyle=color;ctx.lineWidth=3;pathLine(ctx,samples,st=>graphCoords(st,rect,key,maxVal).x,st=>graphCoords(st,rect,key,maxVal).y);
  const current=probe.sample(phase),loc=graphCoords(current,rect,key,maxVal);
  const markerX=rect.left+(rect.right-rect.left)*phase;
  line(ctx,markerX,rect.top-4,markerX,rect.bottom+4,'#ffce83',1.7,[5,5]);
  ctx.beginPath();ctx.arc(loc.x,loc.y,7,0,Math.PI*2);ctx.fillStyle='#ffd084';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
 }
 function paint(){if(disposed)return;ctx.clearRect(0,0,W,H);const back=ctx.createLinearGradient(0,0,W,H);back.addColorStop(0,'#102d38');back.addColorStop(1,'#081d2a');ctx.fillStyle=back;ctx.fillRect(0,0,W,H);
  for(let x=0;x<W;x+=40)line(ctx,x,0,x,H,'#9bd0dc0c');for(let y=0;y<H;y+=40)line(ctx,0,y,W,y,'#9bd0dc0c');
  round(ctx,upper.left-20,52,upper.right-upper.left+40,upper.bottom-upper.top+45,15,'#173740');
  label(ctx,'QUỸ ĐẠO THỰC NGHIỆM',upper.left,73,'#b6dcdf',14);
  line(ctx,upper.left,upper.bottom,upper.right,upper.bottom,'#7194a0',2);
  for(let i=0;i<=4;i++){const x=upper.left+(upper.right-upper.left)*i/4;line(ctx,x,upper.bottom,x,upper.bottom+8,'#a1c5ca');}
  const xy=sampleXY(probe.sample(phase));ctx.strokeStyle='#5bdac3';ctx.lineWidth=4;
  pathLine(ctx,samples,st=>sampleXY(st).x,st=>sampleXY(st).y);
  line(ctx,xy.x,xy.y,xy.x,upper.bottom,'#edbe78',1.5,[5,5]);
  const state=probe.sample(phase),tip=sampleXY(probe.sample(clamp(phase+.035,0,1)));
  const dtx=(state.vx/Math.max(1,probe.model.range))*120, dty=-state.vy/Math.max(1,probe.model.maxHeight)*70;
  if(Math.hypot(dtx,dty)>4){const d=Math.min(85,Math.hypot(dtx,dty)),a=Math.atan2(dty,dtx),x2=xy.x+d*Math.cos(a),y2=xy.y+d*Math.sin(a);
   line(ctx,xy.x,xy.y,x2,y2,'#f6a980',3);line(ctx,x2,y2,x2-10*Math.cos(a-.5),y2-10*Math.sin(a-.5),'#f6a980',3);line(ctx,x2,y2,x2-10*Math.cos(a+.5),y2-10*Math.sin(a+.5),'#f6a980',3);
  }
  ctx.beginPath();ctx.arc(xy.x,xy.y,11,0,Math.PI*2);ctx.fillStyle='#ffcf80';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2.3;ctx.stroke();
  label(ctx,`t = ${fmt(state.t,2)} s`,clamp(xy.x+14,upper.left,upper.right-100),Math.max(95,xy.y-15),'#f8ddab',15);
  paintGraph(plotX,'x',probe.model.range,'TỌA ĐỘ x(t) · mét','#7eb4ff');
  paintGraph(plotY,'y',probe.model.maxHeight,'ĐỘ CAO y(t) · mét','#5bdac3');
  $('[data-motion-t]').textContent=`${fmt(state.t,2)} s`;
  $('[data-motion-pos]').textContent=`${fmt(state.x,2)} m · ${fmt(state.y,2)} m`;
  $('[data-motion-velocity]').textContent=`${fmt(state.vx,2)} · ${fmt(state.vy,2)} m/s`;
  $('[data-motion-energy]').textContent=`${fmt(state.energyPerKg,2)} J/kg`;
  $('[data-motion-timeline]').value=String(Math.round(phase*1000));
  $('[data-motion-speed-output]').textContent=`${fmt(params.v0,1)} m/s`;
  $('[data-motion-angle-output]').textContent=`${params.angle}°`;
 }
 function pause(){if(frameId)cancelAnimationFrame(frameId);frameId=0;clock=0;$('[data-motion-play]').textContent='▶ Phát';$('[data-motion-play]').setAttribute('aria-pressed','false');}
 function toggle(){if(frameId){pause();return;}if(phase>=1)phase=0;clock=0;$('[data-motion-play]').textContent='Ⅱ Tạm dừng';$('[data-motion-play]').setAttribute('aria-pressed','true');frameId=requestAnimationFrame(tick);}
 function tick(now){if(!frameId||disposed)return;if(clock){phase=clamp(phase+Math.min(.06,(now-clock)/1000)/Math.max(.05,probe.model.duration),0,1);}clock=now;paint();if(phase>=1){pause();return;}frameId=requestAnimationFrame(tick);}
 function update(next){pause();params={...next};probe=createMotionProbe(params);samples=probe.points(180);phase=0;$('[data-motion-speed]').value=String(params.v0);$('[data-motion-angle]').value=String(params.angle);paint();}
 function toLocal(e){const box=canvas.getBoundingClientRect();return{x:(e.clientX-box.left)*W/box.width,y:(e.clientY-box.top)*H/box.height};}
 function snapAt(point){
  const inGraph=(r)=>point.x>=r.left-12&&point.x<=r.right+12&&point.y>=r.top-35&&point.y<=r.bottom+35;
  if(inGraph(plotX))return clamp((point.x-plotX.left)/(plotX.right-plotX.left),0,1);
  if(inGraph(plotY))return clamp((point.x-plotY.left)/(plotY.right-plotY.left),0,1);
  // Distance to physical trajectory in screen space; this is a hit-test only.
  if(point.y<upper.top-10||point.y>upper.bottom+30)return null;
  let best=null,score=Infinity;
  for(const s of samples){const v=sampleXY(s),d=Math.hypot(v.x-point.x,v.y-point.y);if(d<score){score=d;best=s.phase;}}
  return score<64?best:null;
 }
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;const next=snapAt(toLocal(e));if(next===null)return;pause();drag=e.pointerId;canvas.setPointerCapture?.(drag);phase=next;paint();e.preventDefault();},{signal:abort.signal});
 canvas.addEventListener('pointermove',e=>{if(e.pointerId!==drag)return;const next=snapAt(toLocal(e));if(next!==null){phase=next;paint();}},{signal:abort.signal});
 const finish=e=>{if(e.pointerId===drag){drag=null;try{canvas.releasePointerCapture(e.pointerId);}catch{/* capture ended */}}};
 canvas.addEventListener('pointerup',finish,{signal:abort.signal});canvas.addEventListener('pointercancel',finish,{signal:abort.signal});
 canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();toggle();return;}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();pause();phase=clamp(phase+(e.key==='ArrowRight'?.01:-.01),0,1);paint();}},{signal:abort.signal});
 $('[data-motion-play]').addEventListener('click',toggle,{signal:abort.signal});
 $('[data-motion-reset]').addEventListener('click',()=>{pause();phase=0;paint();},{signal:abort.signal});
 $('[data-motion-timeline]').addEventListener('input',e=>{pause();phase=Number(e.target.value)/1000;paint();},{signal:abort.signal});
 $('[data-motion-preset]').addEventListener('change',e=>update(SCENARIOS[e.target.value]||SCENARIOS.earth),{signal:abort.signal});
 $('[data-motion-speed]').addEventListener('input',e=>update({...params,v0:Number(e.target.value)}),{signal:abort.signal});
 $('[data-motion-angle]').addEventListener('input',e=>update({...params,angle:Number(e.target.value)}),{signal:abort.signal});
 $('[data-motion-csv]').addEventListener('click',()=>{
  const lines=['t_s,x_m,y_m,vx_m_s,vy_m_s,speed_m_s,energy_per_kg_J_kg',...probe.points(50).map(s=>[s.t,s.x,s.y,s.vx,s.vy,s.speed,s.energyPerKg].map(v=>v.toFixed(6)).join(','))];
  const file=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download='PhysicsLab_1.8_thuoc_thoi_gian.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 },{signal:abort.signal});
 root.querySelectorAll('[data-motion-see]').forEach(button=>button.addEventListener('click',()=>{
  const area=$('.motion-probe-scroll');area.scrollTo({left:button.dataset.motionSee==='right'?area.scrollWidth-area.clientWidth:0,behavior:'smooth'});
  root.querySelectorAll('[data-motion-see]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 },{signal:abort.signal}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();},{signal:abort.signal});
 paint();return()=>{disposed=true;pause();abort.abort();root.replaceChildren();};
}
