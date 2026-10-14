/** Live, interactive experiment scenes. Measurements remain owned by scientific core. */
import { createCollision } from '../core/momentum.js';
import { createOscillation } from '../core/oscillation.js';
import { createProjectile } from '../core/projectile.js';
import { createInclinedPlane } from '../core/inclined.js';
import { createNewtonMotion } from '../core/newton.js';
import { createFrictionMotion } from '../core/friction.js';
import { createWorkEnergyMotion } from '../core/work-energy.js';
import { measureLabExperiment } from '../core/lab-experiments.js';
import { BENCH_SIZE, benchHandleFor, benchHandlePoint, benchValueFromPoint, benchGuidance, benchLocalObservation } from '../core/lab-workbench-model.js';
import '../styles/lab-1-5.css';

const { width: W, height: H } = BENCH_SIZE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=v=>Number.isFinite(v)?Number(v).toLocaleString('vi-VN',{maximumFractionDigits:3}):'—';
const palette={ground:'#364657',muted:'#8eabbc',ink:'#eaf7fa',mint:'#5ce1c5',blue:'#77b6fc',gold:'#ffd478',orange:'#fb966f',pink:'#db9dff'};
const circle=(c,x,y,r,color,stroke)=>{c.beginPath();c.arc(x,y,Math.max(1,r),0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}};
function line(c,x,y,x2,y2,color=palette.mint,lw=3,dash=[]) {c.beginPath();c.setLineDash(dash);c.moveTo(x,y);c.lineTo(x2,y2);c.lineWidth=lw;c.strokeStyle=color;c.stroke();c.setLineDash([]);}
function label(c,x,y,value,color=palette.ink,size=19,align='left') {c.font=`600 ${size}px system-ui, sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(String(value),x,y);c.textAlign='left';}
function pill(c,x,y,value,bg='#203e49',color=palette.ink){c.font='600 16px system-ui';const tw=c.measureText(value).width;c.fillStyle=bg;c.beginPath();c.roundRect(x,y,tw+24,31,10);c.fill();label(c,x+12,y+22,value,color,15);}
function arrow(c,x,y,x2,y2,color=palette.mint,lw=5) {line(c,x,y,x2,y2,color,lw);const a=Math.atan2(y2-y,x2-x);const n=14;line(c,x2,y2,x2-n*Math.cos(a-.48),y2-n*Math.sin(a-.48),color,lw);line(c,x2,y2,x2-n*Math.cos(a+.48),y2-n*Math.sin(a+.48),color,lw);}
function ruler(c,x1,y,x2,unit='m') {line(c,x1,y,x2,y,'#57778a',2);for(let i=0;i<=10;i++){const x=x1+(x2-x1)*i/10;line(c,x,y,x,y+(i%5===0?18:9),'#789aaa',2);if(i%2===0)label(c,x,y+39,`${i/10}`,palette.muted,13,'center');}label(c,x2+18,y+9,unit,palette.muted,15);}
function cart(c,x,y,name,color=palette.mint,size=105){c.fillStyle=color;c.beginPath();c.roundRect(x-size/2,y-53,size,66,16);c.fill();c.fillStyle='#1d3540';c.beginPath();c.roundRect(x-size/2+8,y-43,size-16,43,11);c.fill();circle(c,x-size*.27,y+20,17,'#a8bac6','#1e303c');circle(c,x+size*.27,y+20,17,'#a8bac6','#1e303c');label(c,x,y-13,name,'#ebffff',17,'center');}
function spring(c,x1,x2,y,color=palette.mint){const count=17;c.beginPath();c.moveTo(x1,y);c.lineTo(x1+12,y);for(let i=0;i<count;i++)c.lineTo(x1+12+(x2-x1-24)*(i+.5)/count,y+(i%2?-18:18));c.lineTo(x2,y);c.strokeStyle=color;c.lineWidth=4;c.stroke();}
function handle(c,p){if(!p)return;circle(c,p.x,p.y,25,'rgba(92,225,197,.19)',palette.mint);circle(c,p.x,p.y,11,palette.mint,'#083b39');circle(c,p.x-3,p.y-3,3,'#fff');}
function renderBackdrop(c,id,guide,t,playing){
 const grd=c.createLinearGradient(0,0,W,H);grd.addColorStop(0,'#102d3a');grd.addColorStop(1,'#091b2c');c.fillStyle=grd;c.fillRect(0,0,W,H);
 c.strokeStyle='rgba(165,229,232,.055)';c.lineWidth=1;for(let x=0;x<W;x+=40)line(c,x,0,x,H,'rgba(165,229,232,.055)',1);for(let y=0;y<H;y+=40)line(c,0,y,W,y,'rgba(165,229,232,.055)',1);
 c.fillStyle='#173b45';c.beginPath();c.roundRect(25,24,W-50,55,16);c.fill();
 label(c,47,58,guide[0]||'Thử nghiệm trên bàn',palette.ink,20);
 pill(c,35,H-57,`t = ${fmt(t)} s`,playing?'#245b58':'#243c4d');
 label(c,W-45,H-29,'KÉO TAY NẮM MÀU XANH ĐỂ TƯƠNG TÁC',palette.muted,13,'right');
}
function mechanics(c,id,s,t){
 line(c,45,396,916,396,'#8b9eae',8);for(let x=60;x<920;x+=72)line(c,x,412,x+32,412,'#506b77',3);
 const primary=benchHandlePoint(id,s);
 const isCollision=id==='momentum-collision';
 if(isCollision){
  const model=createCollision(s);const state=model.at(Math.min(t,model.duration));
  const scale=25;const x1=clamp(260+state.x1*scale,90,900),x2=clamp(260+state.x2*scale,90,900);
  cart(c,x1,360,`A · ${fmt(s.mass1)} kg`,palette.mint,110);cart(c,x2,360,`B · ${fmt(s.mass2)} kg`,palette.orange,110);
  arrow(c,220,290,220+clamp(s.velocity1*9,-155,155),290,palette.mint,5);
  arrow(c,450,290,450+clamp(s.velocity2*9,-155,155),290,palette.orange,5);
  pill(c,55,113,`p trước = ${fmt(model.momentumBefore)} kg·m/s`);
  pill(c,55,154,`p hiện tại = ${fmt(state.momentum)} kg·m/s`);
  label(c,90,460,'ĐƯỜNG RAY KHÔNG MA SÁT',palette.muted,15);
 }else{
  let x=265;
  if(id==='work-energy'){const motion=createWorkEnergyMotion(s);x=185+550*clamp(motion.at(Math.min(t,motion.duration)).position/30,0,1);}
  else if(id==='newton-second-law'){const motion=createNewtonMotion(s);x+=clamp(motion.at(Math.min(t,motion.duration)).position*18,0,350);}
  else if(id==='friction'){const motion=createFrictionMotion(s);x+=clamp(motion.at(Math.min(t,motion.duration)).position*18,0,350);}
  cart(c,x,360,`${fmt(s.mass)} kg`,palette.mint);
  if(id==='work-energy'){
   line(c,185,433,735,433,palette.blue,2,[9,8]);ruler(c,185,449,735,'d');
   const finish=185+550*clamp((Number(s.distance)-1)/29,0,1);
   line(c,finish,310,finish,423,palette.gold,2,[5,5]);label(c,finish,303,'ĐÍCH',palette.gold,13,'center');
   line(c,185,391,x,391,palette.gold,6);pill(c,55,110,`Đoạn đường đặt trước: ${fmt(s.distance)} m`);
   pill(c,55,150,`Lực kéo: ${fmt(s.force)} N`);
  }else{
   arrow(c,x+56,330,Math.min(860,x+56+s.force*3),330,palette.gold);
   pill(c,58,111,`F kéo = ${fmt(s.force)} N`);
   if(id==='friction'){
    const threshold=s.mass*s.gravity*s.staticCoefficient;
    const stat=s.force<=threshold;
    arrow(c,x-57,332,x-57-Math.min(160,(stat?s.force:s.mass*s.gravity*s.kineticCoefficient)*3),332,palette.orange);
    pill(c,58,152,stat?'MA SÁT NGHỈ · XE ĐỨNG YÊN':'MA SÁT TRƯỢT · XE ĐANG CHẠY',stat?'#264b47':'#784a35');
   }else pill(c,58,152,'Gia tốc do lực tổng hợp gây ra');
  }
 }
 handle(c,primary);
}
function drawIncline(c,s,t){
 const theta=Number(s.angle)*Math.PI/180;
 const x0=170,y0=421,L=Math.min(530,260/Math.max(.001,Math.sin(theta))),x1=x0+L*Math.cos(theta),y1=y0-L*Math.sin(theta);
 line(c,x0,y0,x1,y1,'#9daeb8',19);line(c,x0,y0,x1,y1,palette.blue,9);
 c.fillStyle='#1d4550';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1,y0);c.closePath();c.fill();
 const model=createInclinedPlane(s);const fraction=clamp(.5*model.acceleration*t*t/8,0,1);
 const px=x1+(x0-x1)*fraction,py=y1+(y0-y1)*fraction;
 c.save();c.translate(px,py);c.rotate(-theta);cart(c,0,-24,`${fmt(s.mass)} kg`,palette.mint,94);c.restore();
 line(c,x0,y0,x0+100,y0,'#8da0ae',2);label(c,x0+94,y0-10,`${fmt(s.angle)}°`,palette.gold,19);
 pill(c,48,113,model.moving?'Đủ dốc: xe đang trượt':'Ma sát giữ xe đứng yên',model.moving?'#265647':'#4a4353');
 pill(c,48,157,`a = ${fmt(model.acceleration)} m/s²`);
 handle(c,benchHandlePoint('inclined-plane',s));
}
function drawProjectile(c,s,t){
 const model=createProjectile(s);const scaleX=600/Math.max(1,model.range),scaleY=255/Math.max(1,model.maxHeight);
 const pos=(state)=>({x:146+state.x*scaleX,y:420-state.y*scaleY});
 line(c,44,421,916,421,'#9fbbbd',5);ruler(c,146,439,830,'m');
 c.beginPath();for(let i=0;i<=100;i++){const p=pos(model.at(model.duration*i/100));if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);}c.strokeStyle=palette.blue;c.lineWidth=4;c.setLineDash([10,7]);c.stroke();c.setLineDash([]);
 const x0=146,y0=420,ang=s.angle*Math.PI/180;
 arrow(c,x0,y0,x0+105*Math.cos(ang),y0-105*Math.sin(ang),palette.gold,8);
 const p=pos(model.at(Math.min(model.duration,t)));circle(c,p.x,p.y,11,palette.orange);circle(c,p.x,p.y,20,'rgba(251,150,111,.12)');
 pill(c,42,109,`Góc phóng = ${fmt(s.angle)}°`);pill(c,42,152,`Tầm xa = ${fmt(model.range)} m`);
 label(c,147,394,'MÁY PHÓNG',palette.muted,15);handle(c,benchHandlePoint('projectile-motion',s));
}
function drawSpring(c,s,t){
 const model=createOscillation(s);const x=model.at(t%model.duration).position;const massX=400+x*140;
 line(c,120,274,120,367,'#a5b8c6',16);line(c,120,320,800,320,'#5b798a',3,[5,7]);
 spring(c,150,massX-62,320);cart(c,massX,316,`${fmt(s.mass)} kg`,palette.orange);
 line(c,400,221,400,408,palette.blue,2,[6,6]);pill(c,45,115,`x = ${fmt(x)} m`);pill(c,45,157,`T = ${fmt(model.period)} s`);
 label(c,425,249,'VỊ TRÍ CÂN BẰNG',palette.muted,15);handle(c,benchHandlePoint('spring-oscillation',s));
}
function drawWaves(c,id,s,t){
 const isSpeed=id==='wave-speed',freq=s.frequency,wave=s.wavelength||3;
 const phase=(s.phaseDifference||0)*Math.PI/180;
 const amplitude=(s.amplitude||.5)*75;
 const plot=(offset,colour,a,phi=0)=>{
  c.beginPath();for(let x=128;x<=878;x+=3){const y=offset-a*Math.sin(2*Math.PI*(x-128)/Math.max(35,wave*42)-2*Math.PI*freq*t+phi);if(x===128)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=colour;c.lineWidth=4;c.stroke();
 };
 line(c,128,285,878,285,'#426379',2);
 if(isSpeed){plot(286,palette.mint,68);const h=benchHandlePoint(id,s);line(c,h.x,172,h.x,397,palette.gold,3,[7,6]);pill(c,42,111,`v = fλ = ${fmt(freq*wave)} m/s`);pill(c,42,152,`Cổng đo ở ${fmt(s.distance)} m`);label(c,175,449,'NGUỒN RUNG',palette.muted,17);circle(c,142,286,17,palette.orange);}
 else{plot(214,palette.blue,Math.min(65,amplitude),0);plot(310,palette.orange,Math.min(65,amplitude),phase);plot(417,palette.mint,Math.min(75,amplitude*2*Math.abs(Math.cos(phase/2))),phase/2);pill(c,40,105,`Δφ = ${fmt(s.phaseDifference)}°`);label(c,60,205,'Sóng 1',palette.blue);label(c,60,300,'Sóng 2',palette.orange);label(c,60,412,'Tổng',palette.mint);}
 handle(c,benchHandlePoint(id,s));
}
function drawLens(c,s,t){
 const f=s.focalLength,u=s.objectDistance,imageDist=Math.abs(u-f)<1e-8?Infinity:f*u/(u-f);
 const lens=520,base=300,scale=200;
 const objX=lens-u*scale, h=75;
 line(c,55,base,920,base,'#728c9a',2);
 line(c,lens,130,lens,446,palette.blue,9);
 c.strokeStyle='#b2d5fa';c.lineWidth=4;c.beginPath();c.ellipse(lens,287,19,159,0,0,Math.PI*2);c.stroke();
 const focal=f*scale;circle(c,lens-focal,base,6,palette.gold);circle(c,lens+focal,base,6,palette.gold);
 label(c,lens-focal-8,base+28,'F',palette.gold,17);label(c,lens+focal-6,base+28,'F′',palette.gold,17);
 arrow(c,objX,base,objX,base-h,palette.orange,7);
 if(Number.isFinite(imageDist)){
  const imgX=lens+imageDist*scale, imgh=-h*imageDist/u;
  if(Math.abs(imgX)<1500 && Math.abs(imgh)<1000)arrow(c,imgX,base,imgX,base-imgh,palette.mint,6);
  line(c,objX,base-h,lens,base-h,palette.gold,2);if(Math.abs(imgX)<1500 && Math.abs(imgh)<1000){line(c,lens,base-h,imgX,base-imgh,palette.gold,2);line(c,objX,base-h,imgX,base-imgh,palette.mint,2);}
  const light=(((t*0.6)%1)+1)%1;
  if(light<0.5){const q=light*2;circle(c,objX+(lens-objX)*q,base-h,7,palette.gold);}else if(Math.abs(imgX)<1500&&Math.abs(imgh)<1000){const q=(light-.5)*2;circle(c,lens+(imgX-lens)*q,base-h-imgh*q,7,palette.gold);}
  pill(c,50,111,imageDist>=0?'Ảnh thật · đảo chiều':'Ảnh ảo · cùng chiều');
  pill(c,50,154,`d ảnh = ${fmt(imageDist)} m`);
 }else pill(c,50,113,'Vật tại tiêu điểm · Ảnh ở vô cực');
 label(c,728,475,'CÁC TIA SÁNG CƠ BẢN',palette.muted,15);
 handle(c,benchHandlePoint('thin-lens',s));
}
function drawLorentz(c,s,t){
 for(let i=0;i<9;i++)for(let j=0;j<5;j++){
  const x=140+i*83,y=127+j*65;circle(c,x,y,4,'#49698b');line(c,x-8,y-8,x+8,y+8,'#49698b',2);line(c,x+8,y-8,x-8,y+8,'#49698b',2);
 }
 const q=s.charge,B=s.magneticField,v=s.speed,m=s.mass;
 const theta=s.pitchAngle*Math.PI/180,omega=Math.abs(q*B/m);const r=Math.abs(q*B)>1e-9?Math.abs(m*v*Math.sin(theta)/(q*B)):0;
 const radius=clamp(r*14,3,120),vz=v*Math.cos(theta);
 const particleX=310+clamp(vz*16*t,0,460),particleY=305+radius*Math.sin(omega*t);
 c.beginPath();for(let i=0;i<=140;i++){const time=t*i/140,x=310+clamp(vz*16*time,0,460),y=305+radius*Math.sin(omega*time);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.strokeStyle=palette.gold;c.lineWidth=3;c.stroke();
 circle(c,particleX,particleY,15,palette.mint,'#1b5358');arrow(c,310,305,310+105*Math.cos(theta),305-105*Math.sin(theta),palette.orange);
 pill(c,45,111,`B = ${fmt(B)} T`);pill(c,45,152,`θ = ${fmt(s.pitchAngle)}°`);label(c,140,470,'× TỪ TRƯỜNG HƯỚNG VÀO MÀN HÌNH',palette.muted,15);
 handle(c,benchHandlePoint('lorentz-force',s));
}
function drawInduction(c,s,t){
 const f=s.frequency,theta=2*Math.PI*f*t;
 for(let i=0;i<7;i++){c.strokeStyle=palette.gold;c.lineWidth=5;c.beginPath();c.ellipse(285+i*20,291,22,109,0,0,Math.PI*2);c.stroke();}
 c.save();c.translate(625,287);c.rotate(theta);c.fillStyle='#dc7772';c.fillRect(-83,-40,83,80);c.fillStyle=palette.blue;c.fillRect(0,-40,83,80);label(c,-48,8,'N','#fff',24);label(c,32,8,'S','#fff',24);c.restore();
 circle(c,735,395,50,'#173c4a','#729ca8');arrow(c,735,395,735+34*Math.cos(theta),395-34*Math.sin(theta),palette.mint,3);
 pill(c,45,115,`f = ${fmt(f)} Hz`);pill(c,45,157,`N = ${fmt(s.turns)} vòng`);
 label(c,214,439,'CUỘN DÂY',palette.muted,17);label(c,610,466,'TỪ TRƯỜNG XOAY',palette.muted,17);
 handle(c,benchHandlePoint('electromagnetic-induction',s));
}
const SCIENCE_NOTE={
 'newton-second-law':'Mô hình xe trên máng ngang; bỏ qua cản không khí.',
 friction:'Ngưỡng ma sát nghỉ và hệ số ma sát trượt theo mô hình Coulomb.',
 'momentum-collision':'Va chạm 1 chiều của hai xe trong hệ cô lập, không có ma sát.',
 'work-energy':'Chuyển động 1 chiều; tính công bằng mô hình cơ học hiện có.',
 'spring-oscillation':'Dao động điều hòa lí tưởng; không mô phỏng tắt dần.',
 'projectile-motion':'Bỏ qua sức cản không khí; chuyển động trong trọng trường đều.',
 'inclined-plane':'Mô hình hệ số ma sát duy nhất; bỏ qua lực cản không khí.',
 'wave-speed':'Sóng điều hòa trên dây, không mô phỏng suy giảm biên độ.',
 'wave-interference':'Nguyên lý chồng chất của hai sóng điều hòa kết hợp.',
 'thin-lens':'Thấu kính mỏng, tia cận trục; bỏ qua quang sai.',
 'lorentz-force':'Từ trường đều; bỏ qua bức xạ và các hiệu ứng tương đối tính.',
 'electromagnetic-induction':'Từ thông hình sin; suất điện động theo định luật Faraday.'
};

export function mountLabLiveStage(host,{experiment,setup,onParameterChange,onCapture}){
 const abort=new AbortController();let active=true,playing=false,mode='move',time=0,last=0,raf=0,pointerId=null,probe=null;
 const guide=benchGuidance(experiment.id),handleInfo=benchHandleFor(experiment.id);
 host.innerHTML=`<div class="lab15-workbench" data-experiment="${experiment.id}">
 <div class="lab15-toolbar"><div class="lab15-tool-label"><span class="lab15-live-pip"></span><strong>BÀN THÍ NGHIỆM TƯƠNG TÁC</strong><small>${handleInfo?.label||'Kéo vật thể để bắt đầu'}</small></div>
 <div class="lab15-actions"><button type="button" data-lab15-play class="button primary">▶ Chạy</button><button type="button" data-lab15-reset class="button secondary">↺ Thử lại</button><button type="button" data-lab15-probe class="button secondary" aria-pressed="false">◎ Đầu dò</button></div></div>
 <div class="lab15-canvas-frame"><canvas data-lab15-canvas width="${W}" height="${H}" tabindex="0" role="group" aria-label="${experiment.title}: ${handleInfo?.label||'thử và quan sát'}; dùng các phím mũi tên trái và phải để điều chỉnh"></canvas><div data-lab15-badge class="lab15-badge">● Tạm dừng · Thử thao tác kéo vật</div></div>
 <div class="lab15-readouts"><div><small>TRỤC X · ĐẠI LƯỢNG ĐO</small><strong data-lab15-x>—</strong><span>${experiment.xLabel}</span></div><div><small>TRỤC Y · ĐẠI LƯỢNG ĐO</small><strong data-lab15-y>—</strong><span>${experiment.yLabel}</span></div><div><small>THỜI GIAN MÔ PHỎNG</small><strong data-lab15-time>0 s</strong><span>Đồng hồ chạy / dừng</span></div></div>
 <div class="lab15-lower"><div class="lab15-guide"><strong>🧪 Hãy tự khám phá</strong><ol>${guide.map(item=>`<li>${item}</li>`).join('')}</ol></div><div class="lab15-guide lab15-measure"><strong>📍 Đầu dò & quan sát</strong><p data-lab15-probe-note>Bấm «Đầu dò», sau đó chạm vùng thí nghiệm để đặt điểm quan sát.</p><button class="button primary" type="button" data-lab15-record>＋ Ghi phép đo vào sổ</button></div></div>
 <details class="lab15-science"><summary>Giới hạn của mô hình và cách đọc kết quả</summary><p>${SCIENCE_NOTE[experiment.id]||'Mô hình Vật lý lí tưởng ở cấp trung học.'} Chuyển động và hình vẽ giúp quan sát hiện tượng; số đo trong sổ được tính bằng mô hình khoa học và làm tròn theo độ chia dụng cụ đã chọn. Đầu dò là công cụ quan sát trong mô hình, không phải cảm biến vật lý thực. Chỉ Sóng và Ném xiên có số liệu khác nhau theo điểm chạm.</p></details></div>`;
 const $=selector=>host.querySelector(selector);
 const canvas=$('[data-lab15-canvas]'),c=canvas.getContext('2d');
 const getPoint=e=>{const box=canvas.getBoundingClientRect();return {x:(e.clientX-box.left)*W/box.width,y:(e.clientY-box.top)*H/box.height};};
 function snapshot(){try{return measureLabExperiment(experiment.id,setup)}catch{return null;}}
 function updateReadout(){const s=snapshot();$('[data-lab15-x]').textContent=s?fmt(s.x):'Không xác định';$('[data-lab15-y]').textContent=s?fmt(s.y):'Không xác định';}
 function draw(){
  if(!active)return;
  c.clearRect(0,0,W,H);renderBackdrop(c,experiment.id,guide,time,playing);
  const id=experiment.id;
  try { if(['newton-second-law','friction','work-energy','momentum-collision'].includes(id))mechanics(c,id,setup,time);
  else if(id==='inclined-plane')drawIncline(c,setup,time);
  else if(id==='projectile-motion')drawProjectile(c,setup,time);
  else if(id==='spring-oscillation')drawSpring(c,setup,time);
  else if(id==='wave-speed'||id==='wave-interference')drawWaves(c,id,setup,time);
  else if(id==='thin-lens')drawLens(c,setup,time);
  else if(id==='lorentz-force')drawLorentz(c,setup,time);
  else if(id==='electromagnetic-induction')drawInduction(c,setup,time);
  } catch(error) { pill(c,42,132,'Điều kiện ngoài phạm vi mô hình: mở mục Thông số để điều chỉnh','#6a3c3c'); }
  if(probe){line(c,probe.x,probe.y,probe.x+39,probe.y-46,palette.gold,2);circle(c,probe.x,probe.y,10,'rgba(255,212,120,.4)',palette.gold);pill(c,clamp(probe.x+18,15,720),clamp(probe.y-88,90,452),'◎ Đầu dò đã đặt','#57462d');}
  $('[data-lab15-time]').textContent=`${fmt(time)} s`;
 }
 function sceneDuration(){
    try {
      switch(experiment.id){
        case 'projectile-motion': return createProjectile(setup).duration;
        case 'momentum-collision': return createCollision(setup).duration;
        case 'newton-second-law': return createNewtonMotion(setup).duration;
        case 'friction': return createFrictionMotion(setup).duration;
        case 'work-energy': return createWorkEnergyMotion(setup).duration;
        case 'spring-oscillation': return createOscillation(setup).duration;
        default: return 30;
      }
    } catch {return 30;}
  }
 function tick(now){if(!playing||!active)return;const limit=sceneDuration();if(last)time=Math.min(time+Math.min((now-last)/1000,.05)*.75,limit);last=now;draw();if(time>=limit)pause();else raf=requestAnimationFrame(tick);}
 function pause(){playing=false;cancelAnimationFrame(raf);last=0;$('[data-lab15-play]').textContent='▶ Chạy';$('[data-lab15-badge]').textContent='● Tạm dừng · Chạm Chạy để quan sát';}
 function start(){if(time>=sceneDuration())time=0;playing=true;last=0;$('[data-lab15-play]').textContent='Ⅱ Tạm dừng';$('[data-lab15-badge]').textContent='● Đang mô phỏng · Nhấn để tạm dừng';raf=requestAnimationFrame(tick);}
 $('[data-lab15-play]').addEventListener('click',()=>playing?pause():start(),{signal:abort.signal});
 $('[data-lab15-reset]').addEventListener('click',()=>{pause();time=0;probe=null;draw();$('[data-lab15-probe-note]').textContent='Đã đặt lại thời gian và vị trí đầu dò.';},{signal:abort.signal});
 $('[data-lab15-probe]').addEventListener('click',e=>{mode=mode==='probe'?'move':'probe';e.currentTarget.setAttribute('aria-pressed',String(mode==='probe'));e.currentTarget.textContent=mode==='probe'?'↖ Kéo vật thể':'◎ Đầu dò';},{signal:abort.signal});
 $('[data-lab15-record]').addEventListener('click',onCapture,{signal:abort.signal});
 canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse' && e.button!==0)return;
  const point=getPoint(e);if(mode==='probe'){probe=point;const read=snapshot();const local=benchLocalObservation(experiment.id,setup,point,time);
  $('[data-lab15-probe-note]').textContent=local?`${local.label}: ${fmt(local.value)} ${local.unit}. Kết quả lí thuyết tại điểm chạm; bấm Ghi phép đo để lưu số liệu toàn thí nghiệm.`:read?`Đã đặt mốc quan sát. ${experiment.xLabel}: ${fmt(read.x)}; ${experiment.yLabel}: ${fmt(read.y)}. Đây là đại lượng toàn thí nghiệm, không phải số đo thay đổi theo tọa độ.`:'Ảnh ở vô cực hoặc thông số chưa phù hợp để đo.';draw();return;}
  if(!handleInfo)return;
  // The handle is deliberately large and touch-friendly, but also supports tapping the scene.
  const hp=benchHandlePoint(experiment.id,setup);
  if(!hp||Math.hypot(hp.x-point.x,hp.y-point.y)>105)return;
  pointerId=e.pointerId;canvas.setPointerCapture?.(e.pointerId);e.preventDefault();
 },{signal:abort.signal});
 canvas.addEventListener('pointermove',e=>{
  if(pointerId!==e.pointerId)return;
  const value=benchValueFromPoint(experiment.id,getPoint(e),setup[handleInfo.key]);
  if(value!==null&&value!==setup[handleInfo.key]){onParameterChange(handleInfo.key,value);time=0;draw();}
 },{signal:abort.signal});
 const end=e=>{if(pointerId===e.pointerId){pointerId=null;try{canvas.releasePointerCapture(e.pointerId)}catch{/* may already be released */}}};
 canvas.addEventListener('pointerup',end,{signal:abort.signal});canvas.addEventListener('pointercancel',end,{signal:abort.signal});
 canvas.addEventListener('keydown',e=>{if(!handleInfo||!['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))return;e.preventDefault();if(e.key===' '||e.key==='Enter'){playing?pause():start();return;}const p=handleInfo.parameter;const direction=e.key==='ArrowRight'?1:-1;onParameterChange(p.key,Number(clamp(Number(setup[p.key])+p.step*direction,p.min,p.max).toFixed(6)));time=0;draw();},{signal:abort.signal});
 // Reduced motion: all motion remains opt-in via explicit Play, not automatic.
 updateReadout();draw();
 return { pause, update(nextSetup){setup=nextSetup;updateReadout();draw();},destroy(){active=false;pause();abort.abort();host.replaceChildren();} };
}
