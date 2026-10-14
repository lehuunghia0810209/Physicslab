import './field.css';
import { ELECTRIC_FIELD_DEFAULTS, measureElectricField } from '../../core/electric-field.js';
import { format } from '../../core/units.js';
import { sampleElectricFieldLines } from '../../core/electric-field-lines.js';
import { minimumSvgHitRadius } from '../../core/svg-touch-target.js';

const X_MIN=-3.6, X_MAX=3.6, Y_MIN=-2.4, Y_MAX=2.4;
const WORLD_W=820,WORLD_H=520;
const xToPx=x=>40+(x-X_MIN)/(X_MAX-X_MIN)*740;
const yToPx=y=>470-(y-Y_MIN)/(Y_MAX-Y_MIN)*420;
const pxToX=px=>X_MIN+(px-40)/740*(X_MAX-X_MIN);
const pxToY=py=>Y_MIN+(470-py)/420*(Y_MAX-Y_MIN);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function mount(main,{progress}) {
  const saved=progress.get().sessions['electric-field'];
  let charges=ELECTRIC_FIELD_DEFAULTS.map(c=>({...c}));
  const savedCharges=[saved?.setup?.charge0,saved?.setup?.charge1];
  if(savedCharges.every(r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&Number.isFinite(r.charge)&&Math.abs(r.charge)<=5)) {
    charges=savedCharges.map(r=>({x:clamp(r.x,X_MIN+.2,X_MAX-.2),y:clamp(r.y,Y_MIN+.2,Y_MAX-.2),charge:r.charge}));
  }
  const previousProbe=saved?.setup?.probe;
  const probe={x:Number.isFinite(previousProbe?.x)?clamp(previousProbe.x,-3.4,3.4):0,
    y:Number.isFinite(previousProbe?.y)?clamp(previousProbe.y,-2.2,2.2):1};
  const controller=new AbortController();
  let dragging=null;
  let lineMode=true,vectorMode=true;
  progress.visit('electric-field','Khám phá điện trường');
  main.innerHTML=`<div class="page-heading"><div><p class="eyebrow">ĐIỆN HỌC · LỚP 11</p><h1>Điện trường của điện tích điểm</h1><p>Kéo hai điện tích, thay đổi điện lượng và đo cường độ điện trường ngay tại đầu dò.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="field-layout"><section class="panel field-workbench"><div class="field-stage-top"><span class="tag">MẶT CẮT XY · ĐIỆN TRƯỜNG TĨNH</span><span id="field-status" role="status">Kéo điện tích hoặc đầu dò để khảo sát</span></div>
      <svg id="field-stage" class="field-stage" viewBox="0 0 820 520" role="img" aria-label="Bản đồ vector điện trường từ hai điện tích điểm; kéo điểm xanh dương để đo">
        <defs><marker id="field-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor" stroke-width="1.5"/></marker></defs>
        <g id="field-grid"></g><g id="field-lines"></g><g id="field-arrows"></g><g id="field-probe-vector"></g><g id="field-objects"></g>
      </svg>
      <div class="field-scene-actions" role="group" aria-label="Tình huống điện trường"><button type="button" data-field-preset="dipole">Lưỡng cực +/−</button><button type="button" data-field-preset="positive">Hai điện tích +</button><button type="button" data-field-preset="negative">Hai điện tích −</button><label><input id="field-toggle-lines" type="checkbox" checked> Đường sức</label><label><input id="field-toggle-arrows" type="checkbox" checked> Vectơ</label></div>
      <div class="field-legend"><span><i class="field-legend-dot positive"></i> Điện tích dương</span><span><i class="field-legend-dot negative"></i> Điện tích âm</span><span><i class="field-legend-dot probe"></i> Đầu dò</span></div>
      <p class="field-assumption">Mô hình điện tích điểm trong chân không, bỏ qua môi trường và chuyển động điện tích. Các vector được chuẩn hóa chiều dài để dễ quan sát; độ lớn chính xác hiển thị ở số đo.</p>
    </section><aside class="panel field-controls"><h2>Thiết lập & đo lường</h2>
      <label class="field-control" for="field-charge-0"><span>Điện tích q₁</span><strong id="field-charge-value-0"></strong><input id="field-charge-0" type="range" min="-5" max="5" step="0.5" value="2"></label>
      <label class="field-control" for="field-charge-1"><span>Điện tích q₂</span><strong id="field-charge-value-1"></strong><input id="field-charge-1" type="range" min="-5" max="5" step="0.5" value="-2"></label>
      <h3>Vị trí đầu dò (m)</h3>
      <label class="field-control" for="field-probe-x"><span>Tọa độ x</span><strong id="field-probe-x-value"></strong><input id="field-probe-x" type="range" min="-3.4" max="3.4" step="0.1" value="0"></label>
      <label class="field-control" for="field-probe-y"><span>Tọa độ y</span><strong id="field-probe-y-value"></strong><input id="field-probe-y" type="range" min="-2.2" max="2.2" step="0.1" value="1"></label>
      <div class="field-readouts" aria-live="polite"><div><span>|E|</span><strong id="field-magnitude">—</strong><small>N/C</small></div><div><span>Eₓ</span><strong id="field-ex">—</strong><small>N/C</small></div><div><span>Eᵧ</span><strong id="field-ey">—</strong><small>N/C</small></div><div><span>Điện thế V</span><strong id="field-potential">—</strong><small>V</small></div></div>
      <button class="button secondary full-width" id="field-reset" type="button">↺ Khôi phục điện tích</button>
      <details class="field-theory" open><summary>Công thức & giả định</summary><p>E⃗ = Σ kqᵢr⃗ᵢ/|rᵢ|³; V = Σ kqᵢ/|rᵢ|. Hằng số k ≈ 8,99 × 10⁹ N·m²/C². 1 nC = 10⁻⁹ C.</p><p>Không lấy mẫu ngay trên điện tích vì cường độ tiến tới vô cực.</p></details>
    </aside></div>`;
  const stage=main.querySelector('#field-stage');
  const grid=main.querySelector('#field-grid');
  const arrows=main.querySelector('#field-arrows');
  const objects=main.querySelector('#field-objects');
  const paths=main.querySelector('#field-lines');
  const probeVector=main.querySelector('#field-probe-vector');
  const initialText='<g data-charge="0" class="field-charge" role="slider" tabindex="0" aria-label="Vị trí điện tích 1" aria-valuemin="-3.4" aria-valuemax="3.4" aria-valuenow="-1.2"><circle r="25" class="field-hit"/><circle r="21" class="field-body"/><text y="7" text-anchor="middle" font-size="21" font-weight="700" fill="white" pointer-events="none">+</text></g><g data-charge="1" class="field-charge" role="slider" tabindex="0" aria-label="Vị trí điện tích 2" aria-valuemin="-3.4" aria-valuemax="3.4" aria-valuenow="1.2"><circle r="25" class="field-hit"/><circle r="21" class="field-body"/><text y="7" text-anchor="middle" font-size="21" font-weight="700" fill="white" pointer-events="none">−</text></g><g data-probe="1" class="field-probe" role="slider" tabindex="0" aria-label="Vị trí đầu dò điện trường" aria-valuemin="-3.4" aria-valuemax="3.4" aria-valuenow="0"><circle r="24" class="field-hit"/><circle r="16" fill="#477dbf" stroke="#fff" stroke-width="3"/><circle r="4" fill="white"/></g>';
  objects.innerHTML=initialText;
  // Keep 48px transparent pointer targets regardless of SVG scaling.
  // Preserve the original visible charge/probe artwork and physical coordinates.
  function resizeHitTargets() {
    const matrix = stage.getScreenCTM();
    const scaleX = matrix ? Math.hypot(matrix.a, matrix.b) : 0;
    const scaleY = matrix ? Math.hypot(matrix.c, matrix.d) : 0;
    const scale = Math.min(scaleX, scaleY);
    const radius = minimumSvgHitRadius(scale);
    objects.querySelectorAll('.field-hit').forEach(hit => hit.setAttribute('r', String(radius)));
  }
  const hitObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resizeHitTargets) : null;
  hitObserver?.observe(stage);
  window.addEventListener('resize', resizeHitTargets, {signal:controller.signal});

  charges.forEach((charge,i)=>{ main.querySelector(`#field-charge-${i}`).value=charge.charge; });
  for(let x=-3;x<=3;x+=.5) {
    const px=xToPx(x);
    grid.insertAdjacentHTML('beforeend',`<line x1="${px}" x2="${px}" y1="50" y2="470" stroke="var(--line)" stroke-width="1"/>`);
  }
  for(let y=-2;y<=2;y+=.5) {
    const py=yToPx(y);
    grid.insertAdjacentHTML('beforeend',`<line x1="40" x2="780" y1="${py}" y2="${py}" stroke="var(--line)" stroke-width="1"/>`);
  }
  grid.insertAdjacentHTML('beforeend',`<line x1="40" y1="${yToPx(0)}" x2="780" y2="${yToPx(0)}" stroke="var(--muted)"/><line x1="${xToPx(0)}" x2="${xToPx(0)}" y1="50" y2="470" stroke="var(--muted)"/>`);

  function persist() { progress.session('electric-field',{setup:{charge0:{...charges[0]},charge1:{...charges[1]},probe:{...probe}}}); }
  function redraw() {
    paths.style.display=lineMode?'':'none';
    arrows.style.display=vectorMode?'':'none';
    if(lineMode)paths.innerHTML=sampleElectricFieldLines(charges).map(points=>`<polyline class="field-flow-line" points="${points.map(point=>`${xToPx(point.x).toFixed(1)},${yToPx(point.y).toFixed(1)}`).join(' ')}"/>`).join('');
    const segments=[];
    for(let y=-2.1;y<=2.1;y+=.42) for(let x=-3.25;x<=3.25;x+=.5) {
      try {
        const measurement=measureElectricField(charges,{x,y});
        const norm=measurement.magnitude;
        if(norm<1e-9) continue;
        const length=clamp(7+Math.log1p(norm)*2,9,20);
        const px=xToPx(x), py=yToPx(y), vx=measurement.ex/norm, vy=measurement.ey/norm;
        segments.push(`<line x1="${(px-vx*length*.5).toFixed(1)}" y1="${(py+vy*length*.5).toFixed(1)}" x2="${(px+vx*length*.5).toFixed(1)}" y2="${(py-vy*length*.5).toFixed(1)}" stroke="var(--primary)" stroke-width="1.7" opacity="${clamp(.26+Math.log1p(norm)/10,.35,.9)}" marker-end="url(#field-arrow)"/>`);
      } catch { /* The field is singular at a point charge. */ }
    }
    arrows.innerHTML=segments.join('');
    charges.forEach((charge,i)=>{const el=objects.querySelector(`[data-charge="${i}"]`);el.setAttribute('transform',`translate(${xToPx(charge.x)} ${yToPx(charge.y)})`);el.setAttribute('aria-valuenow',String(Number(charge.x.toFixed(2))));el.setAttribute('aria-valuetext',`x ${format(charge.x,2)} mét, y ${format(charge.y,2)} mét, điện tích ${format(charge.charge,1)} nanocoulomb`);el.querySelector('.field-body').setAttribute('fill',charge.charge>0?'#16836d':charge.charge<0?'#bb4b64':'#6b8290');el.querySelector('text').textContent=charge.charge>0?'+':charge.charge<0?'−':'0';});
    const tip=objects.querySelector('[data-probe]');tip.setAttribute('transform',`translate(${xToPx(probe.x)} ${yToPx(probe.y)})`);tip.setAttribute('aria-valuenow',String(Number(probe.x.toFixed(2))));tip.setAttribute('aria-valuetext',`x ${format(probe.x,2)} mét, y ${format(probe.y,2)} mét`);
    main.querySelectorAll('[id^="field-charge-value-"]').forEach((el,i)=>el.textContent=`${format(charges[i].charge,1)} nC`);
    main.querySelector('#field-probe-x').value=probe.x;
    main.querySelector('#field-probe-y').value=probe.y;
    main.querySelector('#field-probe-x-value').textContent=`${format(probe.x,1)} m`;
    main.querySelector('#field-probe-y-value').textContent=`${format(probe.y,1)} m`;
    try {
      const result=measureElectricField(charges,probe);
      for(const [id,value] of [['field-magnitude',result.magnitude],['field-ex',result.ex],['field-ey',result.ey],['field-potential',result.potential]]) {
        main.querySelector(`#${id}`).textContent=format(value,2);
      }
      main.querySelector('#field-status').textContent=`Đầu dò (${format(probe.x,1)}; ${format(probe.y,1)}) m · |E| = ${format(result.magnitude,2)} N/C`;
      const length=result.magnitude>1e-9?Math.min(90,23+Math.log1p(result.magnitude)*13):0;
      probeVector.innerHTML=length?`<line x1="${xToPx(probe.x)}" y1="${yToPx(probe.y)}" x2="${xToPx(probe.x)+result.ex/result.magnitude*length}" y2="${yToPx(probe.y)-result.ey/result.magnitude*length}" class="field-live-vector" marker-end="url(#field-arrow)"/><text x="${Math.min(763,xToPx(probe.x)+18)}" y="${Math.max(55,yToPx(probe.y)-22)}" class="field-live-caption">E⃗</text>`:'';
    } catch(error) {
      probeVector.innerHTML='';
      for(const id of ['field-magnitude','field-ex','field-ey','field-potential']) main.querySelector(`#${id}`).textContent='—';
      main.querySelector('#field-status').textContent=error.message;
    }
  }
  function getPosition(event) {
    const ctm=stage.getScreenCTM();
    const point=ctm?new DOMPoint(event.clientX,event.clientY).matrixTransform(ctm.inverse()):null;
    const x=point?.x??0, y=point?.y??0;
    return {x:clamp(pxToX(x),X_MIN+.2,X_MAX-.2),y:clamp(pxToY(y),Y_MIN+.2,Y_MAX-.2)};
  }
  stage.addEventListener('pointerdown',event=>{
    const target=event.target.closest('[data-charge],[data-probe]');
    if(!target) return;
    dragging={which:target.hasAttribute('data-probe')?'probe':Number(target.dataset.charge),pointer:event.pointerId};
    stage.setPointerCapture(event.pointerId);event.preventDefault();
  },{signal:controller.signal});
  stage.addEventListener('pointermove',event=>{
    if(dragging===null||dragging.pointer!==event.pointerId) return;
    const pos=getPosition(event);
    if(dragging.which==='probe') Object.assign(probe,pos);
    else Object.assign(charges[dragging.which],pos);
    redraw();
  },{signal:controller.signal});
  const stop=event=>{if(dragging!==null&&dragging.pointer===event.pointerId){dragging=null;persist();}};
  stage.addEventListener('pointerup',stop,{signal:controller.signal});
  stage.addEventListener('pointercancel',stop,{signal:controller.signal});
  stage.addEventListener('lostpointercapture',()=>{dragging=null;},{signal:controller.signal});
  stage.addEventListener('keydown',event=>{
    const el=event.target.closest('[data-charge],[data-probe]');if(!el||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const dx=event.key==='ArrowLeft'?-.1:event.key==='ArrowRight'?.1:0,dy=event.key==='ArrowUp'?.1:event.key==='ArrowDown'?-.1:0;
    const point=el.hasAttribute('data-probe')?probe:charges[Number(el.dataset.charge)];
    point.x=clamp(Number((point.x+dx).toFixed(2)),X_MIN+.2,X_MAX-.2);point.y=clamp(Number((point.y+dy).toFixed(2)),Y_MIN+.2,Y_MAX-.2);redraw();persist();
  },{signal:controller.signal});
  main.querySelectorAll('[data-field-preset]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.fieldPreset;charges=[{x:-1.2,y:0,charge:kind==='negative'?-2:2},{x:1.2,y:0,charge:kind==='dipole'?-2:kind==='negative'?-2:2}];
    charges.forEach((c,i)=>main.querySelector(`#field-charge-${i}`).value=c.charge);redraw();persist();
  },{signal:controller.signal}));
  main.querySelector('#field-toggle-lines').addEventListener('change',e=>{lineMode=e.target.checked;redraw();},{signal:controller.signal});
  main.querySelector('#field-toggle-arrows').addEventListener('change',e=>{vectorMode=e.target.checked;redraw();},{signal:controller.signal});
  for(let i=0;i<2;i++) main.querySelector(`#field-charge-${i}`).addEventListener('input',event=>{
    charges[i].charge=Number(event.target.value);redraw();persist();
  },{signal:controller.signal});
  for(const axis of ['x','y']) main.querySelector(`#field-probe-${axis}`).addEventListener('input',event=>{
    probe[axis]=Number(event.target.value);redraw();persist();
  },{signal:controller.signal});
  main.querySelector('#field-reset').addEventListener('click',()=>{
    charges=ELECTRIC_FIELD_DEFAULTS.map(c=>({...c}));
    probe.x=0;probe.y=1;
    for(let i=0;i<2;i++) main.querySelector(`#field-charge-${i}`).value=charges[i].charge;
    redraw();persist();
  },{signal:controller.signal});
  redraw();
  resizeHitTargets();
  return ()=>{hitObserver?.disconnect();controller.abort();persist();};
}
