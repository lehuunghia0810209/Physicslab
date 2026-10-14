import { resolveForceVectors, forceFromPointer } from '../core/vector-workspace.js';
import { format } from '../core/units.js';
const clamp = (x,low,high)=>Math.max(low,Math.min(high,x));
const e = (text) => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountVectorPlayground(root) {
  if (!root) return () => {};
  const abort=new AbortController();
  let state={f1:9,a1:20,f2:7,a2:115};
  let dragging=null;
  let sceneScale=10;
  root.innerHTML=`<div class="vector-workbench">
    <div class="vector-workbench-intro"><span class="tag">CÔNG CỤ TRỰC QUAN · LỚP 10</span><h2>Thử kéo các lực</h2><p>Thay đổi hai vectơ lực bằng cách <strong>kéo đầu mũi tên</strong>, hoặc nhập giá trị. Quan sát hợp lực và các hình chiếu trên trục tọa độ.</p></div>
    <div class="vector-workbench-layout"><div class="vector-stage-area"><svg id="vector-workspace-svg" viewBox="0 0 640 360" role="group" aria-label="Bàn tổng hợp hai lực bằng vectơ; có thể kéo đầu mũi tên F1 và F2" tabindex="0"><defs><pattern id="vector-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="currentColor" stroke-opacity=".08" /></pattern><marker id="vec-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#50c5ad"/></marker><marker id="vec-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#f5bc6d"/></marker><marker id="vec-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#79aef7"/></marker></defs>
     <rect x="0" y="0" width="640" height="360" fill="url(#vector-grid)"/><path d="M34 184H607M280 328V28" class="vector-axis"/><text x="609" y="176" class="vector-label">x</text><text x="290" y="29" class="vector-label">y</text><circle cx="280" cy="184" r="6" class="vector-origin"/>
     <path id="vector-construction-a" class="vector-construction"/><path id="vector-construction-b" class="vector-construction"/>
     <path id="vector-a" class="vector-arrow vector-a" marker-end="url(#vec-a)"/><path id="vector-b" class="vector-arrow vector-b" marker-end="url(#vec-b)"/><path id="vector-r" class="vector-arrow vector-r" marker-end="url(#vec-r)"/>
     <circle id="vector-handle-a" data-vector="1" class="vector-handle-hit" r="56" tabindex="0" role="slider" aria-label="Kéo đầu lực F1" aria-valuemin="0" aria-valuemax="20"/><circle id="vector-handle-a-visual" class="vector-handle vector-handle-a" r="17" aria-hidden="true"/><circle id="vector-handle-b" data-vector="2" class="vector-handle-hit" r="56" tabindex="0" role="slider" aria-label="Kéo đầu lực F2" aria-valuemin="0" aria-valuemax="20"/><circle id="vector-handle-b-visual" class="vector-handle vector-handle-b" r="17" aria-hidden="true"/>
     <text id="vector-label-a" class="vector-label vector-label-a"></text><text id="vector-label-b" class="vector-label vector-label-b"></text><text id="vector-label-r" class="vector-label vector-label-r"></text>
     <text x="20" y="340" class="vector-footnote">Các mũi tên cùng gốc · tự căn tỉ lệ</text></svg>
    <div class="vector-stage-hint">Dùng chuột, cảm ứng hoặc Tab và phím mũi tên trên đầu vectơ. Hợp lực màu xanh dương được tính từ phép cộng vectơ.</div></div>
    <div class="vector-controls"><h3>Điều chỉnh hai lực</h3>${[1,2].map(n=>`<fieldset class="vector-input-group"><legend>F${n} · Lực ${n}</legend><label>Độ lớn <output id="vector-value-f${n}"></output><input id="vector-f${n}" type="range" min="0" max="20" step="0.1" value="${n===1?9:7}" aria-label="Độ lớn lực F${n}"/></label><label>Góc với trục Ox <output id="vector-value-a${n}"></output><input id="vector-a${n}" type="range" min="-180" max="180" step="1" value="${n===1?20:115}" aria-label="Góc của lực F${n} với trục Ox"/></label></fieldset>`).join('')}
    <div class="vector-result" aria-live="polite"><span>HỢP LỰC</span><strong id="vector-result-magnitude"></strong><p id="vector-result-components"></p><p id="vector-result-angle"></p></div><button type="button" class="button secondary" id="vector-reset">Đặt lại ví dụ</button></div></div></div>`;
  const svg=root.querySelector('svg');
  const origin={x:280,y:184};
  const toPoint=(v)=>({x:origin.x+v.x*sceneScale,y:origin.y-v.y*sceneScale});
  const get=(id)=>root.querySelector(`#${id}`);
  function paint(){
    const result=resolveForceVectors(state);
    const components=[result.first,result.second,result.resultant];
    const right=Math.max(0,...components.map(v=>v.x)),left=Math.max(0,...components.map(v=>-v.x));
    const up=Math.max(0,...components.map(v=>v.y)),down=Math.max(0,...components.map(v=>-v.y));
    sceneScale=Math.min(10, 320/Math.max(1,right), 244/Math.max(1,left), 148/Math.max(1,up), 146/Math.max(1,down));
    const p1=toPoint(result.first),p2=toPoint(result.second), pr=toPoint(result.resultant);
    const path=(from,to)=>`M${from.x.toFixed(2)} ${from.y.toFixed(2)}L${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
    get('vector-a').setAttribute('d',path(origin,p1));get('vector-b').setAttribute('d',path(origin,p2));get('vector-r').setAttribute('d',path(origin,pr));
    get('vector-construction-a').setAttribute('d',path(p1,pr));get('vector-construction-b').setAttribute('d',path(p2,pr));
    for(const [id,p,n] of [['a',p1,1],['b',p2,2]]){
      get(`vector-handle-${id}`).setAttribute('cx',p.x);get(`vector-handle-${id}`).setAttribute('cy',p.y);
      get(`vector-handle-${id}-visual`).setAttribute('cx',p.x);get(`vector-handle-${id}-visual`).setAttribute('cy',p.y);
      get(`vector-handle-${id}`).setAttribute('aria-valuenow',String(state[`f${n}`]));
      get(`vector-handle-${id}`).setAttribute('aria-valuetext',`${state[`f${n}`]} N, góc ${state[`a${n}`]} độ`);
      get(`vector-label-${id}`).setAttribute('x',clamp(p.x+17,10,582));get(`vector-label-${id}`).setAttribute('y',clamp(p.y-18,15,342));
      get(`vector-label-${id}`).textContent=`F${n}`;
      for(const key of ['f','a']) { get(`vector-${key}${n}`).value=String(state[`${key}${n}`]); get(`vector-value-${key}${n}`).textContent=`${state[`${key}${n}`]} ${key==='f'?'N':'°'}`;}
    }
    get('vector-label-r').setAttribute('x',clamp(pr.x+18,10,570));get('vector-label-r').setAttribute('y',clamp(pr.y-14,15,342));get('vector-label-r').textContent='F tổng';
    get('vector-result-magnitude').textContent=`${format(result.resultant.magnitude,2)} N`;
    get('vector-result-components').textContent=`Fₓ = ${format(result.resultant.x,2)} N · Fᵧ = ${format(result.resultant.y,2)} N`;
    get('vector-result-angle').textContent=result.resultant.angle===null?'Hai lực triệt tiêu nhau. Góc hợp lực không xác định.':`Hướng hợp lực: ${format(result.resultant.angle,1)}° với Ox`;
  }
  function movePointer(event) {
    if(!dragging || dragging.pointerId!==event.pointerId) return;
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const {magnitude,angle}=forceFromPointer(point.x,point.y,origin.x,origin.y,sceneScale);
    state={...state,[`f${dragging.n}`]:magnitude,[`a${dragging.n}`]:angle};paint();
  }
  svg.addEventListener('pointerdown',event=>{
    const node=event.target.closest('[data-vector]');if(!node || (event.pointerType==='mouse'&&event.button!==0))return;
    dragging={pointerId:event.pointerId,n:Number(node.dataset.vector)};
    svg.setPointerCapture?.(event.pointerId);movePointer(event);
  },{signal:abort.signal});
  svg.addEventListener('pointermove',movePointer,{signal:abort.signal});
  const stop=event=>{if(dragging?.pointerId===event.pointerId)dragging=null;};
  svg.addEventListener('pointerup',stop,{signal:abort.signal});svg.addEventListener('pointercancel',stop,{signal:abort.signal});
  svg.addEventListener('keydown',event=>{
    const node=event.target.closest('[data-vector]');if(!node || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const n=Number(node.dataset.vector),change=event.key==='ArrowUp'?1:event.key==='ArrowDown'?-1:0;
    state={...state,[`f${n}`]:clamp(Number((state[`f${n}`]+change).toFixed(1)),0,20),[`a${n}`]:clamp(state[`a${n}`]+(event.key==='ArrowLeft'?-3:event.key==='ArrowRight'?3:0),-180,180)};
    paint();root.querySelector(`#vector-handle-${n===1?'a':'b'}`)?.focus();
  },{signal:abort.signal});
  for(const n of [1,2]) for(const key of ['f','a']) get(`vector-${key}${n}`).addEventListener('input',event=>{state={...state,[`${key}${n}`]:Number(event.target.value)};paint();},{signal:abort.signal});
  get('vector-reset').addEventListener('click',()=>{state={f1:9,a1:20,f2:7,a2:115};paint();},{signal:abort.signal});
  paint();return()=>abort.abort();
}
