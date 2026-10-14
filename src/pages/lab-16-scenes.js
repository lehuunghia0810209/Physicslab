/** PhysicsLab 1.6. All positions are in an internal 960×540 drawing space. */
import { rampState, opticalBench, ropeDisplacement, interferenceDisplacement, ROPE_LENGTH, waveSpeed } from '../core/lab-16-physics.js';
export const LAB16_SIZE = { width: 960, height: 540 };
const C={text:'#effbff',sub:'#a9c0c9',mint:'#60dfcd',amber:'#f7bf67',blue:'#85b5ff',orange:'#f49982',purple:'#d2acff',surface:'#183641',edge:'#536d7d',ground:'#617b8b'};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function text(c,s,x,y,size=17,color=C.text,align='left',weight=650){c.font=`${weight} ${size}px system-ui, sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(String(s),x,y);c.textAlign='left';}
function line(c,x,y,x2,y2,color=C.mint,w=3,dash=[]){c.beginPath();c.setLineDash(dash);c.strokeStyle=color;c.lineWidth=w;c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);}
function polygon(c,points,fill,stroke,w=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rounded(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function circle(c,x,y,r,fill,stroke=C.edge){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function pill(c,s,x,y,color='#1c4149'){const w=Math.min(410,c.measureText(s).width+30);rounded(c,x,y,w,33,11,color);text(c,s,x+14,y+22,14);}
function arrow(c,x,y,x2,y2,color=C.amber,w=4){line(c,x,y,x2,y2,color,w);const a=Math.atan2(y2-y,x2-x);line(c,x2,y2,x2-13*Math.cos(a-.48),y2-13*Math.sin(a-.48),color,w);line(c,x2,y2,x2-13*Math.cos(a+.48),y2-13*Math.sin(a+.48),color,w);}
function grip(c,x,y,label,options={}){const dx=options.dx??0,dy=options.dy??-31,align=options.align??'center';circle(c,x,y,22,'#60dfcd33',C.mint);circle(c,x,y,9,C.mint,'#103e3e');if(options.leader){line(c,x,y+Math.sign(dy)*14,x+dx*.72,y+dy+9,'#68efe0a0',1.5,[4,4]);}text(c,label,x+dx,y+dy,13,C.mint,align);}
function ruler(c,x1,y,x2,n=8){line(c,x1,y,x2,y,C.edge,2);for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n;line(c,x,y,x,y+(i%2?9:17),C.sub,1);text(c,String(i),x,y+34,11,C.sub,'center',500);}}
export function paintLab16Background(c,title){
 const g=c.createLinearGradient(0,0,960,540);g.addColorStop(0,'#13323e');g.addColorStop(1,'#081d2a');c.fillStyle=g;c.fillRect(0,0,960,540);
 for(let x=0;x<960;x+=40)line(c,x,0,x,540,'#c4f5ff0b',1);for(let y=0;y<540;y+=40)line(c,0,y,960,y,'#c4f5ff0b',1);
 rounded(c,20,18,920,56,15,'#214450');text(c,title,40,52,21,C.text);
}
function cart(c,x,y,angle){c.save();c.translate(x,y);c.rotate(-angle*Math.PI/180);rounded(c,-49,-52,98,55,12,'#55c8ba','#a8f7e7');rounded(c,-37,-42,74,34,7,'#194454');circle(c,-29,10,13,'#a5bbce','#1b3547');circle(c,29,10,13,'#a5bbce','#1b3547');c.restore();}
export function drawRamp(c,setup,time,release,flags){
 const st=rampState(setup,time,release), g=st.geometry;
 polygon(c,[[g.foot.x,g.foot.y],[g.top.x,g.top.y],[g.top.x,g.foot.y]],'#284a54','#627d87');
 line(c,g.foot.x,g.foot.y,g.top.x,g.top.y,C.blue,13);line(c,g.foot.x,g.foot.y,g.top.x,g.top.y,'#d9eef4',2);
 line(c,80,480,912,480,'#7893a1',4);text(c,'MÁNG NGHIÊNG 4,0 m',510,513,14,C.sub);
 cart(c,st.x,st.y-17,setup.angle);
 if(flags.vectors){arrow(c,st.x,st.y-43,st.x,st.y+62,C.orange,3);arrow(c,st.x,st.y-43,st.x-80*Math.cos(g.angle*Math.PI/180),st.y-43+80*Math.sin(g.angle*Math.PI/180),C.amber,3);text(c,'P',st.x+12,st.y+69,14,C.orange);}
 const theta=setup.angle*Math.PI/180;
 c.beginPath();c.arc(g.foot.x,g.foot.y,75,-theta,0);c.strokeStyle=C.amber;c.lineWidth=3;c.stroke();
 text(c,`${setup.angle}°`,g.foot.x+102,g.foot.y-26,25,C.amber);
 const rampHandle={x:g.top.x,y:g.top.y}, cartHandle={x:st.x,y:st.y-43};
 const crowded=Math.hypot(rampHandle.x-cartHandle.x,rampHandle.y-cartHandle.y)<112;
 grip(c,rampHandle.x,rampHandle.y,'KÉO ĐẦU MÁNG', crowded?{dx:84,dy:-6,align:'left',leader:true}:{dx:18,dy:-34,align:'left'});
 grip(c,cartHandle.x,cartHandle.y,'KÉO XE', crowded?{dx:0,dy:-58,align:'center',leader:true}:{});
 pill(c,st.moving?'Vật trượt xuống dốc':'Lực ma sát giữ vật đứng yên',38,104,st.moving?'#194d46':'#534330');
 text(c,`a = ${st.acceleration.toFixed(2)} m/s²`,43,169,24,C.mint);
 text(c,`s = ${st.distance.toFixed(2)} m     v = ${st.velocity.toFixed(2)} m/s`,43,206,18,C.text);
 text(c,'Thước quãng đường và các lực nằm trên cùng mô hình 4 m.',43,255,15,C.sub);
 return {state:st,handles:[{id:'ramp-angle',x:g.top.x,y:g.top.y,r:48},{id:'ramp-cart',x:st.x,y:st.y-43,r:47}],
  telemetry:[['GIA TỐC',`${st.acceleration.toFixed(2)} m/s²`],['ĐÃ TRƯỢT',`${st.distance.toFixed(2)} m`],['VẬN TỐC',`${st.velocity.toFixed(2)} m/s`]]};
}
function ray(c,x1,y1,x2,y2,color,w=3,dash=[]){line(c,x1,y1,x2,y2,color,w,dash);}
export function drawOptics(c,setup,screenDistance,flags){
 const v=opticalBench(setup,screenDistance),{lensX:lens,axisY:axis,objectX:ox,objectTipY:oy,screenX:sx,imageX:ix,imageTipY:iy}=v;
 line(c,28,axis,932,axis,C.sub,2,[9,7]);ruler(c,115,474,885,10);
 const f=setup.focalLength*v.scale;
 for(const x of [lens-f,lens+f]){circle(c,x,axis,6,C.amber);text(c,'F',x,axis+33,17,C.amber,'center');}
 // Object and lens are physically independent draggable instruments.
 line(c,ox,axis,ox,oy,C.orange,7);arrow(c,ox,axis,ox,oy,C.orange,5);
 rounded(c,ox-29,axis+4,58,17,4,'#e6a17d');
 c.save();c.shadowColor=C.blue;c.shadowBlur=18;line(c,lens,128,lens,424,C.blue,11);c.restore();
 rounded(c,lens-14,410,28,54,9,'#456984');text(c,'THẤU KÍNH',lens,113,14,C.blue,'center');
 line(c,sx,177,sx,420,v.screenFocused?'#a1ffe5':'#67838b',12);rounded(c,sx-34,417,68,14,5,'#7496a5');text(c,'MÀN',sx,160,13,C.sub,'center');
 // Two principal rays obey paraxial imaging. Ray 1: parallel then through far focus.
 const endX=930, centralSlope=(axis-oy)/(lens-ox), parallelSlope=(axis-oy)/f;
 ray(c,ox,oy,lens,oy,C.amber,3);ray(c,lens,oy,endX,oy+(endX-lens)*parallelSlope,C.amber,3);
 ray(c,ox,oy,endX,oy+(endX-ox)*centralSlope,C.mint,3);
 if(v.imageType==='virtual'){
   ray(c,lens,oy,ix,iy,C.amber,2,[6,5]);ray(c,lens,axis,ix,iy,C.mint,2,[6,5]);
 }
 if(ix!==null && ix>45 && ix<940 && Number.isFinite(iy) && Math.abs(iy)<1200){
  line(c,ix,axis,ix,iy,v.imageType==='real'?'#9cebc4':C.purple,5, [v.imageType==='virtual'?5:1]);
  text(c,v.imageType==='real'?'ẢNH THẬT':'ẢNH ẢO',ix,clamp(iy+29,120,454),13,v.imageType==='real'?C.mint:C.purple,'center');
 }
 if(v.screenFocused && iy!==null){circle(c,sx,clamp(iy,178,405),13,'#d4fff1','#8bffd5');}
 grip(c,ox,oy,'KÉO VẬT');grip(c,sx,axis+21,'KÉO MÀN');
 const d=v.imageDistance;
 const type=d===null?'Ảnh ở vô cực':d>0?'Ảnh thật, ngược chiều':'Ảnh ảo, cùng chiều';
 pill(c,type,34,99, d===null?'#4e4559':d>0?'#1a4d4a':'#453653');
 text(c,d===null?'dᵢ = ∞':`dᵢ = ${d.toFixed(3)} m`,40,160,22,C.mint);
 text(c,v.screenFocused?'✓ Màn đang đúng vị trí ảnh thật':d!==null&&d<0?'Ảnh ảo: không hứng được trên màn':'Hãy kéo màn tới vị trí ảnh để lấy nét',40,200,16,C.sub);
 return {state:v,handles:[{id:'lens-object',x:ox,y:oy,r:49},{id:'lens-screen',x:sx,y:axis+21,r:49}],telemetry:[['KHOẢNG CÁCH VẬT',`${setup.objectDistance.toFixed(2)} m`],['KHOẢNG CÁCH ẢNH',d===null?'Vô cực':`${d.toFixed(3)} m`],['MÀN HỨNG',v.screenFocused?'Đã lấy nét':`${screenDistance.toFixed(2)} m`]]};
}
const mapX=x=>125+710*x/ROPE_LENGTH;
export function drawWave(c,experimentId,setup,time,probe,flags){
 const isInterference=experimentId==='wave-interference', speed=waveSpeed(setup);
 const probePx=mapX(probe);
 line(c,125,327,835,327,C.edge,2);ruler(c,125,440,835,8);
 // String tension apparatus, moving source, and an independent optical-style probe.
 rounded(c,93,273,38,108,11,'#52788c','#aac3d0');circle(c,111,326,17,C.orange);
 rounded(c,836,250,24,157,6,C.edge);text(c,'ĐẦU DÂY',848,232,13,C.sub,'center');
 const plot=(which,baseline,color,ampScale=135)=>{
   c.beginPath();for(let px=125;px<=835;px+=2){const x=(px-125)*ROPE_LENGTH/710;
     let y;if(isInterference){const z=interferenceDisplacement(setup,x,time);y=which==='first'?z.first:which==='second'?z.second:z.total;}
     else y=ropeDisplacement(setup,x,time,{mode:flags.waveMode,boundary:flags.boundary,amplitude:0.5});
     if(px===125)c.moveTo(px,baseline-y*ampScale);else c.lineTo(px,baseline-y*ampScale);
   }c.lineWidth=which==='total'?5:4;c.strokeStyle=color;c.stroke();
 };
 if(isInterference){
   plot('first',210,C.blue,85);plot('second',331,C.orange,85);plot('total',444,C.mint,85);
   text(c,'SÓNG 1',41,206,15,C.blue);text(c,'SÓNG 2',41,326,15,C.orange);text(c,'TỔNG',41,439,15,C.mint);
   // phase control is a second source paddle.
   rounded(c,884,197,40,237,12,'#355e68');circle(c,904,315-setup.phaseDifference*.55,18,C.orange);
   grip(c,904,315-setup.phaseDifference*.55,'LỆCH PHA');
 }else{
   plot('single',327,C.mint);
   const waveY=327-ropeDisplacement(setup,probe,time,{mode:flags.waveMode,boundary:flags.boundary})*135;
   line(c,probePx,235,probePx,399,C.amber,2,[5,7]);circle(c,probePx,waveY,11,C.amber);
   grip(c,probePx,235,'KÉO ĐẦU DÒ');
   text(c,flags.waveMode==='pulse'?'XUNG SÓNG LAN TRUYỀN':'SÓNG ĐIỀU HÒA TRÊN DÂY',38,105,17,C.text);
   text(c,flags.boundary==='fixed'?'Phản xạ tại đầu cố định: đảo dấu':'Phản xạ tại đầu tự do: không đảo dấu',38,141,15,C.sub);
 }
 text(c,`v = fλ = ${speed.toFixed(2)} m/s`,42,isInterference?102:181,23,C.mint);
 const local=isInterference?interferenceDisplacement(setup,probe,time).total:ropeDisplacement(setup,probe,time,{mode:flags.waveMode,boundary:flags.boundary});
 return {state:{speed,probe,displacement:local},handles:isInterference?[{id:'wave-phase',x:904,y:315-setup.phaseDifference*.55,r:52}]:[{id:'wave-probe',x:probePx,y:235,r:50}],telemetry:[['VẬN TỐC',`${speed.toFixed(2)} m/s`],['VỊ TRÍ ĐẦU DÒ',`${probe.toFixed(2)} m`],['LI ĐỘ TẠI ĐẦU DÒ',`${local.toFixed(2)} m`]]};
}
export const LAB16_DRAW_HELPERS=Object.freeze({clamp});
