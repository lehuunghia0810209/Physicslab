import { escapeHtml } from '../app/icons.js';

// Illustrations are qualitative views of the apparatus. Exact results come
// exclusively from lab-experiments.js, including instrument resolution.
const rect=(x,y,w,h,cls,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
const path=(d,cls)=>`<path d="${d}" class="${cls}"/>`;
const text=(x,y,label,cls='lab-figure-label')=>`<text x="${x}" y="${y}" class="${cls}">${escapeHtml(label)}</text>`;
const fmt = v => Number(v||0).toLocaleString('vi-VN',{maximumFractionDigits:2});
const cart=(x, y, label)=>`${rect(x,y,92,52,'lab-object',10)}${path(`M${x+18} ${y+53}v8M${x+74} ${y+53}v8`,'lab-stroke')}
<circle cx="${x+18}" cy="${y+65}" r="11" class="lab-wheel"/><circle cx="${x+74}" cy="${y+65}" r="11" class="lab-wheel"/>${text(x+17,y+33,label)}`;
function scene(experiment,setup) {
 const id=experiment.id;
 if(['newton-second-law','friction','work-energy'].includes(id)) {
   const force=Number(setup.force||0); const span=Math.min(170,44+force*1.2);
   return `${path('M45 230H670','lab-ground')}${cart(220,160,`m = ${fmt(setup.mass)} kg`)}${path(`M320 185H${320+span}`,'lab-highlight')}${path(`M${310+span} 175l10 10-10 10`,'lab-highlight')}${text(365,157,`Lực kéo ${fmt(force)} N`)}${text(220,266,id==='friction'?'Ma sát ngược chiều lực kéo':id==='work-energy'?'Công làm biến đổi động năng':'Fnet = ma')}`;
 }
 if(id==='momentum-collision') return `${path('M35 225H685','lab-ground')}${cart(160,158,'Vật A')}${cart(465,158,'Vật B')}${path('M275 183H365M350 172l15 11-15 11','lab-highlight')}${path('M443 183H390M405 172l-15 11 15 11','lab-highlight')}${text(245,269,'Đổi vận tốc và khối lượng để quan sát va chạm')}`;
 if(id==='inclined-plane') { const angle=Math.min(54,Math.max(10,Number(setup.angle||30))); const rise=120*Math.sin(angle*Math.PI/180);return `${path(`M95 230H620 L620 ${230-rise} Z`,'lab-ramp')}${rect(475,208-rise,69,47,'lab-object',7)}${path('M490 186H580','lab-highlight')}${text(330,274,`Mặt phẳng nghiêng · ${fmt(angle)}°`)}`; }
 if(id==='projectile-motion') { const ang=Number(setup.angle||45);const apexY=Math.max(38,150-ang);return `${path('M35 238H685','lab-ground')}${path(`M70 222Q330 ${apexY} 630 221`,'lab-highlight')}${path(`M65 224l50-${Math.min(90,ang+24)}`,'lab-stroke')}${text(80,263,`Góc phóng ${fmt(ang)}° · Quỹ đạo đạn không cản`)}`; }
 if(['hooke-law','spring-oscillation'].includes(id)) {
   const F=Number(setup.force||0); const stretch=Math.min(120,40+F*2); const x=335;
   const spring=Array.from({length:11},(_,i)=>`${i===0?'M':'L'}${x+(i%2?20:-20)} ${65+i*stretch/11}`).join(' ');
   return `${path('M220 36H440M330 36V57','lab-ground')}${path(spring,'lab-highlight')}${rect(289,64+stretch,90,57,'lab-object',10)}${text(304,98+stretch,'Quả nặng')}${path('M470 60V250','lab-measure')}${Array.from({length:12},(_,i)=>path(`M470 ${65+i*16}h${i%2?12:20}`,'lab-measure')).join('')}${text(488,80,'Thước đo')}`;
 }
 if(['wave-speed','wave-interference'].includes(id)) {
   const k=Number(setup.frequency||2); const phase=Math.min(14,Math.max(5,k*3));
   const wave=Array.from({length:150},(_,i)=>`${i?'L':'M'}${35+i*4.3} ${148-57*Math.sin(i/phase)}`).join(' ');
   return `${path('M35 148H683','lab-measure')}${path(wave,'lab-highlight')}${text(38,261,`Nguồn dao động · f = ${fmt(setup.frequency||2)} Hz`)}`;
 }
 if(id==='ohms-law') return `${path('M110 73H560V235H110V175M110 120V73','lab-highlight')}${path('M86 120H134M95 175H125','lab-stroke')}${rect(268,58,126,31,'lab-object',5)}${text(290,50,'Điện trở R')}${text(115,150,`${fmt(setup.voltage||12)} V`)}${text(285,273,'Nguồn – điện trở – ampe kế')}${path('M495 235h28','lab-measure')}`;
 if(id==='thin-lens') return `${path('M55 164H665','lab-measure')}${path('M357 48Q326 164 357 270Q390 164 357 48','lab-highlight')}${path('M148 164V91','lab-stroke')}${path('M138 109l10-18 10 18','lab-stroke')}${path('M148 91H357L592 230','lab-light')}${path('M148 91L357 164L592 236','lab-light')}${text(140,83,'Vật sáng')}${text(375,40,'Thấu kính')}${text(588,256,'Ảnh')}`;
 if(id==='gas-law') {const piston=380+Number(setup.finalVolume||.04)*320;return `${rect(115,69,475,160,'lab-vessel',16)}${Array.from({length:18},(_,i)=>`<circle cx="${140+(i*53)%210}" cy="${89+(i*47)%113}" r="6" class="lab-gas-dot"/>`).join('')}${rect(Math.min(540,piston),70,20,158,'lab-object',2)}${text(148,262,'Khí lí tưởng trong xi lanh')}${text(380,258,'Piston →')}`; }
 if(id==='electromagnetic-induction') return `${Array.from({length:7},(_,i)=>`<ellipse cx="${240+i*23}" cy="158" rx="21" ry="76" class="lab-stroke"/>`).join('')}${rect(477,102,109,110,'lab-object',10)}${text(501,164,'NAM CHÂM')}${path('M455 156H404M419 144l-15 12 15 12','lab-highlight')}${text(242,264,'Cuộn dây · Từ thông biến thiên')}`;
 if(id==='lorentz-force') return `${path('M140 230H590','lab-measure')}${Array.from({length:15},(_,i)=>`<circle cx="${135+(i%5)*95}" cy="${58+Math.floor(i/5)*71}" r="5" class="lab-field-dot"/>`).join('')}${path('M180 190Q324 -35 540 165','lab-highlight')}${rect(314,70,26,26,'lab-object',13)}${text(315,265,'Hạt mang điện lệch hướng trong từ trường')}`;
 return `${path('M35 230H680','lab-ground')}${cart(315,150,'Vật')}`;
}
export function labDragParameter(experiment) {
  const preferred=['force','voltage','angle','amplitude','frequency','objectDistance','finalVolume','distance','speed','mass'];
  return preferred.map(key => experiment.parameters.find(p=>p.key===key && p.type!=='select')).find(Boolean)
    || experiment.parameters.find(p=>p.type!=='select') || null;
}
export function labSceneMarkup(experiment,setup){
 const param=labDragParameter(experiment);
 const fraction=param ? Math.max(0,Math.min(1,(Number(setup[param.key])-param.min)/(param.max-param.min))) : 0;
 const handleX=90+540*fraction;
 const drag=param ? `<g data-lab-drag-handle role="slider" tabindex="0" aria-label="Thay đổi ${escapeHtml(param.label)} trên sơ đồ" aria-valuemin="${param.min}" aria-valuemax="${param.max}" aria-valuenow="${setup[param.key]}" aria-valuetext="${setup[param.key]} ${escapeHtml(param.unit)}"><path d="M90 321H630" class="lab-drag-track"/><path d="M90 321H${handleX}" class="lab-drag-fill"/><circle cx="${handleX}" cy="321" r="13" class="lab-drag-dot"/><rect x="74" y="295" width="572" height="54" fill="transparent" /></g><text x="91" y="297" class="lab-figure-label">KÉO CHẤM ĐỂ ĐỔI: ${escapeHtml(param.label)} · ${fmt(setup[param.key])} ${escapeHtml(param.unit)}</text>` : '';
 return `<div class="lab-figure" aria-label="Mô hình trực quan thí nghiệm ${escapeHtml(experiment.title)}"><svg viewBox="0 0 720 354" role="img" aria-label="Sơ đồ bố trí và hiện tượng ${escapeHtml(experiment.title)}"><defs><pattern id="lab-figure-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" stroke-opacity=".08"/></pattern></defs><rect width="720" height="354" fill="url(#lab-figure-grid)"/>${scene(experiment,setup)}${drag}</svg><span class="lab-figure-note">HÌNH MINH HỌA THIẾT BỊ · KHÔNG DÙNG ĐỂ ĐỌC SỐ ĐO</span></div>`;
}
