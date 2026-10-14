import './explorer3d.css';
import '../styles/remake-studio.css';
import { format } from '../core/units.js';
import { createProjectile } from '../core/projectile.js';
import { createHelix, HELIX_DEFAULTS } from '../core/helix.js';
import { createHelixViewport } from '../core/helix-viewport.js';
import { createProjectileViewport } from '../core/projectile-viewport.js';
import { Timeline } from '../engines/timeline.js';
import { normalizeTrajectoryPoint, pickTrajectorySample, markerSeparation } from '../core/trajectory-probe.js';

export function mount(main) {
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">KHÔNG GIAN BA CHIỀU</p><h1>Khám phá mô hình vật lý không gian</h1><p>Chọn hệ vật lý, điều chỉnh điều kiện ban đầu và kéo khung vẽ để xoay góc nhìn.</p></div><a class="button secondary" href="#/tools">Quay lại bàn công cụ</a></div>
    <section class="panel explorer3d-layout"><div class="explorer3d-stage"><div class="explorer3d-view-presets" role="group" aria-label="Góc nhìn và lớp hiển thị"><button type="button" data-camera="isometric" aria-pressed="true">Phối cảnh</button><button type="button" data-camera="side" aria-pressed="false">Nhìn bên</button><button type="button" data-camera="front" aria-pressed="false">Nhìn trước</button><span class="explorer3d-layer-toggles"><label><input id="explorer3d-vectors" type="checkbox" checked> Vectơ</label><label><input id="explorer3d-axes" type="checkbox" checked> Trục</label><label><input id="explorer3d-grid" type="checkbox" checked> Lưới</label><label><input id="explorer3d-path" type="checkbox" checked> Quỹ đạo</label></span></div><canvas id="explorer3d-canvas" aria-label="Mô hình ba chiều quỹ đạo hạt tích điện trong từ trường" tabindex="0"></canvas><p id="explorer3d-help">Kéo để xoay · phím mũi tên đổi góc · +/− hoặc Ctrl + cuộn để thu phóng.</p></div>
      <aside class="explorer3d-controls"><label class="field explorer3d-scene-select" for="explorer3d-scene"><span>Hệ vật lý</span><select id="explorer3d-scene"><option value="helix">Hạt tích điện trong từ trường</option><option value="projectile">Chuyển động ném xiên</option></select></label>
        <div id="explorer3d-helix-controls"><span class="tag">QUỸ ĐẠO XOẮN · LỰC LORENTZ</span><label class="explorer3d-parameter" for="explorer3d-angle"><span>Góc vận tốc với B</span><strong id="explorer3d-angle-value"></strong><input id="explorer3d-angle" type="range" min="0" max="90" step="1" value="35" aria-label="Góc giữa vận tốc với từ trường"></label>
          <label class="explorer3d-parameter" for="explorer3d-charge"><span>Điện tích</span><select id="explorer3d-charge" aria-label="Dấu điện tích"><option value="1">Dương (+q)</option><option value="-1">Âm (−q)</option></select></label>
          <label class="explorer3d-parameter" for="explorer3d-speed"><span>Tốc độ hạt</span><strong id="explorer3d-speed-value">8 m/s</strong><input id="explorer3d-speed" type="range" min="2" max="16" step="0.5" value="8"></label>
          <label class="explorer3d-parameter" for="explorer3d-field"><span>Cảm ứng từ B</span><strong id="explorer3d-field-value">0,5 T</strong><input id="explorer3d-field" type="range" min="0.2" max="2" step="0.1" value="0.5"></label>
          <label class="explorer3d-parameter" for="explorer3d-mass"><span>Khối lượng hạt (quy ước)</span><strong id="explorer3d-mass-value">1 kg</strong><input id="explorer3d-mass" type="range" min="0.5" max="3" step="0.5" value="1"></label>
          <dl class="explorer3d-readouts"><div><dt>v song song</dt><dd id="explorer3d-parallel"></dd></div><div><dt>v vuông góc</dt><dd id="explorer3d-perpendicular"></dd></div><div><dt>Bán kính Larmor</dt><dd id="explorer3d-radius"></dd></div><div><dt>Bước xoắn mỗi chu kỳ</dt><dd id="explorer3d-pitch"></dd></div></dl>
          <p class="explorer3d-equation">r = mv⊥ / |q|B · T = 2πm / |q|B · p = v∥T</p></div>
        <div id="explorer3d-projectile-controls" hidden><span class="tag">CHUYỂN ĐỘNG NÉM · TRỌNG LỰC ĐỀU</span>
          <label class="explorer3d-parameter" for="explorer3d-v0"><span>Vận tốc ban đầu</span><strong id="explorer3d-v0-value"></strong><input id="explorer3d-v0" type="range" min="1" max="40" step="1" value="20" aria-label="Vận tốc ban đầu"></label>
          <label class="explorer3d-parameter" for="explorer3d-projectile-angle"><span>Góc phóng</span><strong id="explorer3d-projectile-angle-value"></strong><input id="explorer3d-projectile-angle" type="range" min="0" max="90" step="1" value="45" aria-label="Góc phóng"></label>
          <label class="explorer3d-parameter" for="explorer3d-height"><span>Độ cao ban đầu</span><strong id="explorer3d-height-value"></strong><input id="explorer3d-height" type="range" min="0" max="20" step="0.5" value="0" aria-label="Độ cao ban đầu"></label>
          <label class="explorer3d-parameter" for="explorer3d-gravity"><span>Gia tốc trọng trường</span><strong id="explorer3d-gravity-value"></strong><input id="explorer3d-gravity" type="range" min="1" max="20" step="0.01" value="9.8" aria-label="Gia tốc trọng trường"></label>
          <dl class="explorer3d-readouts"><div><dt>Thời gian bay</dt><dd id="explorer3d-flight-time"></dd></div><div><dt>Tầm xa</dt><dd id="explorer3d-range"></dd></div><div><dt>Độ cao cực đại</dt><dd id="explorer3d-max-height"></dd></div><div><dt>Gia tốc</dt><dd id="explorer3d-projectile-acceleration"></dd></div></dl>
          <p class="explorer3d-equation">x = v₀cosθ·t · y = h₀ + v₀sinθ·t − ½gt²</p></div>
        <div class="explorer3d-playback" role="group" aria-label="Điều khiển hoạt ảnh"><button class="button secondary" id="explorer3d-fit" type="button" title="Khôi phục góc nhìn và tự căn toàn bộ quỹ đạo">⊞ Vừa khung</button><button class="button primary" id="explorer3d-play" type="button">▶ Phát</button><button class="button secondary" id="explorer3d-reset" type="button">↺ Đặt lại</button><label for="explorer3d-rate">Tốc độ<select id="explorer3d-rate"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
        <label class="explorer3d-parameter" for="explorer3d-phase"><span>Vị trí dọc quỹ đạo</span><strong id="explorer3d-phase-value"></strong><input id="explorer3d-phase" type="range" min="0" max="100" step="1" value="35" aria-label="Vị trí vật trên quỹ đạo"></label>
        <label class="explorer3d-parameter" for="explorer3d-zoom"><span>Thu phóng</span><strong id="explorer3d-zoom-value"></strong><input id="explorer3d-zoom" type="range" min="0.65" max="1.6" step="0.05" value="1" aria-label="Thu phóng mô hình ba chiều"></label></aside></section>`;

  // Remake: stage-centered playback with optional advanced parameters.
  // Keep all old IDs so presets, keyboard controls, equations and tests work.
  const viewer = main.querySelector('.explorer3d-stage');
  const controls = main.querySelector('.explorer3d-controls');
  const playback = main.querySelector('.explorer3d-playback');
  viewer.append(playback);
  const phaseControl = controls.querySelector('[for="explorer3d-phase"]');
  if (phaseControl) viewer.append(phaseControl);
  const advancedHelix = document.createElement('details');
  advancedHelix.className='explorer3d-advanced';
  advancedHelix.innerHTML='<summary>Thông số mở rộng & kết quả đo</summary>';
  const helixPanel=controls.querySelector('#explorer3d-helix-controls');
  [helixPanel.querySelector('[for="explorer3d-speed"]'),helixPanel.querySelector('[for="explorer3d-field"]'),helixPanel.querySelector('[for="explorer3d-mass"]'),helixPanel.querySelector('.explorer3d-readouts'),helixPanel.querySelector('.explorer3d-equation')].forEach(node=>{if(node)advancedHelix.append(node);});
  helixPanel.append(advancedHelix);
  const advancedProjectile=document.createElement('details');
  advancedProjectile.className='explorer3d-advanced';
  advancedProjectile.innerHTML='<summary>Độ cao, trọng trường & kết quả</summary>';
  const projectilePanel=controls.querySelector('#explorer3d-projectile-controls');
  [projectilePanel.querySelector('[for="explorer3d-height"]'),projectilePanel.querySelector('[for="explorer3d-gravity"]'),projectilePanel.querySelector('.explorer3d-readouts'),projectilePanel.querySelector('.explorer3d-equation')].forEach(node=>{if(node)advancedProjectile.append(node);});
  projectilePanel.append(advancedProjectile);
  const experiments=document.createElement('section');
  experiments.className='explorer3d-discovery';
  experiments.innerHTML=`<div><strong data-explorer-prompt>Thử một góc vận tốc</strong><small data-explorer-prompt-detail>Chọn và quan sát hình dạng quỹ đạo</small></div><div class="explorer3d-experiments" data-experiment-group="helix" role="group" aria-label="Tình huống quỹ đạo Lorentz"><button type="button" data-helix-experiment="0">0° · Thẳng</button><button type="button" data-helix-experiment="45">45° · Xoắn</button><button type="button" data-helix-experiment="90">90° · Tròn</button></div><div class="explorer3d-experiments" data-experiment-group="projectile" role="group" aria-label="Tình huống ném xiên" hidden><button type="button" data-projectile-experiment="horizontal">Ném ngang</button><button type="button" data-projectile-experiment="range">45° · Xa nhất</button><button type="button" data-projectile-experiment="moon">Mặt Trăng</button></div>`;
  viewer.querySelector('.explorer3d-view-presets').insertAdjacentElement('afterend',experiments);
  const instrument = document.createElement('div');
  instrument.className='explorer3d-hud';
  instrument.setAttribute('aria-live','off');
  instrument.innerHTML='<div><small>THỜI GIAN</small><strong data-explorer-time>0,00 s</strong></div><div><small>VỊ TRÍ SI</small><strong data-explorer-position>—</strong></div><div><small>TỐC ĐỘ</small><strong data-explorer-speed>—</strong></div><div><small>GIA TỐC</small><strong data-explorer-acceleration>—</strong></div>';
  viewer.querySelector('#explorer3d-help').insertAdjacentElement('afterend',instrument);
  const probe=document.createElement('details');probe.className='explorer3d-probe';
  probe.innerHTML='<summary>Đầu dò tọa độ & thước không gian</summary><p>Hệ trục x, y, z (m). Với ném xiên, z là độ cao (y của mô hình 2D). Đầu dò chọn mẫu gần nhất trên quỹ đạo hiển thị; thanh thời gian và nút A/B dùng được bằng bàn phím.</p><label><input type="checkbox" data-probe-mode> Chạm/kéo trên quỹ đạo để tua (tắt để xoay)</label><div class="simulation-measurement-actions"><button type="button" class="button secondary" data-probe-mark="a">Đặt mốc A tại vật</button><button type="button" class="button secondary" data-probe-mark="b">Đặt mốc B tại vật</button><button type="button" class="button secondary" data-probe-clear>Xóa hai mốc</button></div><p data-probe-readout role="status">Chưa có mốc đo. Các mốc được xóa khi đổi thiết lập hoặc hệ vật lý.</p><p data-probe-hint></p>';
  viewer.append(probe);
  const canvas = main.querySelector('#explorer3d-canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ canvas để dựng không gian 3D.');
  const abort = new AbortController();
  const params = { ...HELIX_DEFAULTS };
  const projectile = { speed: 20, angle: 45, height: 0, gravity: 9.8 };
  let scene = 'helix';
  let yaw = -0.55;
  let elevation = 0.35;
  let zoom = 1;
  let phase = 0.35;
  let showVectors = true;
  let showAxes = true;
  let showGrid = true;
  let showPath = true;
  let drag = null;
  let bounds;
  let probeView=null,currentPoint=null;
  const markers={a:null,b:null};
  const playButton = main.querySelector('#explorer3d-play');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function drawArrow(start,end,color,label) {
    const angle=Math.atan2(end.y-start.y,end.x-start.x);
    context.beginPath();context.moveTo(start.x,start.y);context.lineTo(end.x,end.y);
    context.strokeStyle=color;context.lineWidth=2.4;context.stroke();
    context.beginPath();context.moveTo(end.x,end.y);
    context.lineTo(end.x-9*Math.cos(angle-.48),end.y-9*Math.sin(angle-.48));
    context.lineTo(end.x-9*Math.cos(angle+.48),end.y-9*Math.sin(angle+.48));
    context.closePath();context.fillStyle=color;context.fill();
    context.font='700 13px system-ui';
    context.fillText(label,clamp(end.x+7,8,bounds.width-24),clamp(end.y-7,18,bounds.height-8));
  }

  function drawAxes(axes,project) {
    if(!showAxes)return;
    for(const [key,color] of [['x','#d66b6b'],['y','#2d9a79'],['z','#4384ba']]){
      const [from,to]=axes[key].map(project);
      drawArrow(from,to,color,`${key} (m)`);
    }
  }

  function drawHelixGrid(view) {
    if(!showGrid)return;
    const extent=view.referenceExtent;
    context.strokeStyle='rgba(86,159,171,.28)';context.lineWidth=1;
    for(let step=-2;step<=2;step++){
      const value=extent*step/2;
      for(const [a,b] of [[{x:-extent,y:value,z:0},{x:extent,y:value,z:0}],[{x:value,y:-extent,z:0},{x:value,y:extent,z:0}]]){
        const start=view.project(a),end=view.project(b);
        context.beginPath();context.moveTo(start.x,start.y);context.lineTo(end.x,end.y);context.stroke();
      }
    }
  }

  function drawMarkers(view,point) {
    probeView=view;currentPoint=normalizeTrajectoryPoint(point);
    if(markers.a&&markers.b){
      const a=view.project(markers.a),b=view.project(markers.b);
      context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
      context.strokeStyle='#b64c77';context.lineWidth=2;context.setLineDash([4,4]);context.stroke();context.setLineDash([]);
    }
    for(const [key,marker] of Object.entries(markers)){
      if(!marker)continue;const p=view.project(marker);
      context.beginPath();context.arc(p.x,p.y,11,0,Math.PI*2);context.strokeStyle='#b64c77';context.lineWidth=3;context.stroke();
      context.fillStyle=document.body.dataset.theme==='dark'?'#fff':'#54233b';context.font='700 14px system-ui';context.fillText(key.toUpperCase(),p.x+14,p.y-10);
    }
  }
  function markerReadout(){
    const lines=Object.entries(markers).filter(([,point])=>point).map(([key,p])=>`${key.toUpperCase()}: t=${format(p.t,6)} s; (x, y, z)=(${format(p.x,6)}; ${format(p.y,6)}; ${format(p.z,6)}) m`);
    if(markers.a&&markers.b){const result=markerSeparation(markers.a,markers.b);lines.push(`Khoảng cách thẳng AB=${format(result.distance,6)} m · |Δt|=${format(result.elapsed,6)} s. Đây không phải quãng đường dọc quỹ đạo.`);}
    probe.querySelector('[data-probe-readout]').textContent=lines.join(' · ')||'Chưa có mốc đo. Các mốc được xóa khi đổi thiết lập hoặc hệ vật lý.';
  }
  probe.addEventListener('click',event=>{
    const key=event.target.closest('[data-probe-mark]')?.dataset.probeMark;
    if(key&&currentPoint){pause();markers[key]={...currentPoint};markerReadout();render();}
    if(event.target.closest('[data-probe-clear]')){markers.a=markers.b=null;markerReadout();render();}
  },{signal:abort.signal});
  function seekProbe(event){
    if(!probeView||!showPath)return;
    const box=canvas.getBoundingClientRect();
    const point=pickTrajectorySample(probeView.path,probeView.project,{x:event.clientX-box.left,y:event.clientY-box.top},timeline.state.get().time);
    if(point){timeline.seek(point.t);probe.querySelector('[data-probe-hint]').textContent=`Đã tua tới mẫu t=${format(point.t,6)} s.`;}
    else probe.querySelector('[data-probe-hint]').textContent='Chạm trong phạm vi 22 px quanh quỹ đạo để chọn mẫu.';
  }


  function render() {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const targetWidth = Math.round(bounds.width * ratio);
    const targetHeight = Math.round(bounds.height * ratio);
    // Resetting the canvas bitmap on every animation frame is expensive.
    if (canvas.width !== targetWidth) canvas.width = targetWidth;
    if (canvas.height !== targetHeight) canvas.height = targetHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    const dark = document.body.dataset.theme === 'dark';
    const backdrop = context.createLinearGradient(0, 0, bounds.width, bounds.height);
    backdrop.addColorStop(0, dark?'#102b32':'#eef8f6');
    backdrop.addColorStop(1, dark?'#172d3b':'#e7f2f7');
    context.fillStyle=backdrop;
    context.fillRect(0,0,bounds.width,bounds.height);
    context.strokeStyle=dark?'rgba(178,222,215,.07)':'rgba(42,114,121,.09)';
    context.lineWidth=1;
    for(let x=20;x<bounds.width;x+=36){context.beginPath();context.moveTo(x,0);context.lineTo(x,bounds.height);context.stroke();}
    for(let y=20;y<bounds.height;y+=36){context.beginPath();context.moveTo(0,y);context.lineTo(bounds.width,y);context.stroke();}
    context.fillStyle=dark?'#c4e8df':'#25575b';
    context.font='700 13px system-ui';
    context.fillText(scene==='helix'?'HẠT TÍCH ĐIỆN · QUỸ ĐẠO 3D':'NÉM XIÊN · GÓC NHÌN 3D',20,30);
    context.font='12px system-ui';
    context.fillStyle=dark?'#94b7b9':'#5c7c83';
    context.fillText('Kéo khung để xoay góc nhìn',20,bounds.height-20);
    if (scene === 'projectile') {
      renderProjectile();
      return;
    }
    const model = createHelix(params);
    const { parallel, perpendicular, radius } = model;
    // Fit the actual physical trajectory before projecting it. The former fixed
    // 70-pixel/unit camera clipped the helix when the parallel pitch was large.
    const view = createHelixViewport(model, {
      width: bounds.width, height: bounds.height, yaw, elevation, zoom
    });
    const toCanvas = view.project;
    drawHelixGrid(view);
    drawAxes(view.axes,toCanvas);
    const points = view.path.map(toCanvas);
    if(showPath){context.beginPath();
      points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.strokeStyle = '#138a72'; context.lineWidth = 3.5; context.stroke();}
    const t = view.duration * phase;
    const state = model.at(t);
    drawMarkers(view,state);
    const particle = toCanvas(state);
    // Velocity tangent: use the actual instantaneous velocity vector,
    // not an unrelated fixed time/phase increment.
    const vectorTime = Math.min(view.duration * 0.075, 0.3 / Math.abs(model.omega));
    const velocityEnd = toCanvas({
      x: state.x + state.vx * vectorTime,
      y: state.y + state.vy * vectorTime,
      z: state.z + state.vz * vectorTime
    });
    if (showVectors) {
      drawArrow(particle,velocityEnd,'#e67979','v');
      const acceleration=Math.hypot(state.ax,state.ay,state.az);
      if(acceleration>1e-9){
        const vectorScale=view.referenceExtent*.55/acceleration;
        const forceEnd=toCanvas({x:state.x+state.ax*vectorScale,y:state.y+state.ay*vectorScale,z:state.z});
        drawArrow(particle,forceEnd,'#9b67d5','Fᴮ');
      }
    }
    // Paint the particle last so it cannot be hidden by the trajectory/axes.
    context.beginPath(); context.arc(particle.x, particle.y, 8, 0, 2 * Math.PI);
    context.fillStyle = '#da842f'; context.fill();
    context.strokeStyle = '#fff'; context.lineWidth = 2; context.stroke();
    canvas.setAttribute('aria-label', `Quỹ đạo xoắn trong từ trường. Bán kính ${format(radius)} mét, bước xoắn ${format(model.pitch)} mét. Hạt ở ${Math.round(phase * 100)}% quỹ đạo.`);
    main.querySelector('#explorer3d-speed-value').textContent = `${format(params.speed)} m/s`;
    main.querySelector('#explorer3d-field-value').textContent = `${format(params.field)} T`;
    main.querySelector('#explorer3d-mass-value').textContent = `${format(params.mass)} kg`;
    main.querySelector('#explorer3d-angle-value').textContent = `${params.angle}°`;
    main.querySelector('#explorer3d-phase-value').textContent = `${Math.round(phase * 100)}%`;
    main.querySelector('#explorer3d-zoom-value').textContent = `${format(zoom, 2)}×`;
    main.querySelector('#explorer3d-parallel').textContent = `${format(parallel)} m/s`;
    main.querySelector('#explorer3d-perpendicular').textContent = `${format(perpendicular)} m/s`;
    main.querySelector('#explorer3d-radius').textContent = `${format(radius)} m`;
    main.querySelector('#explorer3d-pitch').textContent = `${format(model.pitch)} m`;
    main.querySelector('[data-explorer-time]').textContent = `${format(t,2)} s`;
    main.querySelector('[data-explorer-position]').textContent = `(${format(state.x,2)}; ${format(state.y,2)}; ${format(state.z,2)}) m`;
    main.querySelector('[data-explorer-speed]').textContent = `${format(params.speed,2)} m/s`;
    main.querySelector('[data-explorer-acceleration]').textContent = `${format(Math.hypot(state.ax,state.ay,state.az),2)} m/s²`;
  }

  function renderProjectile() {
    const model = createProjectile({ v0: projectile.speed, angle: projectile.angle, height: projectile.height, g: projectile.gravity });
    const { duration: flightTime, range, maxHeight } = model;
    const view = createProjectileViewport(model, { width: bounds.width, height: bounds.height, yaw, elevation, zoom });
    const p=point=>view.project(point);
    // Ground reference plane, rendered in the same fitted projection as the real SI path.
    context.beginPath();
    view.ground.forEach((point,index)=>{const q=p(point);index?context.lineTo(q.x,q.y):context.moveTo(q.x,q.y);});
    context.closePath();
    context.fillStyle='rgba(80,171,151,.10)';context.fill();
    context.strokeStyle='rgba(86,159,171,.36)';context.lineWidth=1.5;context.stroke();
    if(showGrid){context.strokeStyle='rgba(96,144,167,.35)';context.lineWidth=1;
      for(let step=0;step<=5;step++){
        const x=range*step/5; const a=p({x,y:view.ground[0].y,z:0}), b=p({x,y:view.ground[3].y,z:0});
        context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke();
      }
    }
    drawAxes(view.axes,p);
    const pts=view.path.map(p);
    if(showPath){context.beginPath();pts.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y));
      context.strokeStyle='#20b694';context.lineWidth=3.8;context.stroke();}
    const current=model.at(flightTime*phase);
    drawMarkers(view,{x:current.x,y:0,z:current.y,t:current.t});
    const particle=p({x:current.x,y:0,z:current.y});
    const highest=p(view.apex);
    const base=p({x:view.apex.x,y:0,z:0});
    context.setLineDash([5,6]);context.strokeStyle='#75bedb';context.lineWidth=1.6;
    context.beginPath();context.moveTo(highest.x,highest.y);context.lineTo(base.x,base.y);context.stroke();context.setLineDash([]);
    if(showVectors){
      // The drawn tangent represents (vx, vy), scaled in seconds, not an invented direction.
      const dt=Math.max(0.04,Math.min(.25,flightTime*.07));
      const velocityEnd=p({x:current.x+current.vx*dt,y:0,z:current.y+current.vy*dt});
      drawArrow(particle,velocityEnd,'#f5ad7c','v');
      const accelerationTime=Math.sqrt(Math.max(maxHeight,range*.25,1)*.22/projectile.gravity);
      const accelerationEnd=p({x:current.x,y:0,z:current.y-.5*projectile.gravity*accelerationTime**2});
      drawArrow(particle,accelerationEnd,'#9b67d5','g');
      context.font='600 13px system-ui';context.fillStyle='#75bedb';
      context.fillText('Hmax',Math.max(10,Math.min(bounds.width-55,highest.x+10)),Math.max(54,highest.y-12));
    }
    context.beginPath();context.arc(particle.x,particle.y,8,0,Math.PI*2);
    context.fillStyle='#f0a05b';context.fill();context.strokeStyle='#f7ffff';context.lineWidth=2;context.stroke();
    main.querySelector('#explorer3d-v0-value').textContent = `${format(projectile.speed)} m/s`;
    main.querySelector('#explorer3d-projectile-angle-value').textContent = `${projectile.angle}°`;
    main.querySelector('#explorer3d-height-value').textContent = `${format(projectile.height)} m`;
    main.querySelector('#explorer3d-gravity-value').textContent = `${format(projectile.gravity)} m/s²`;
    main.querySelector('#explorer3d-flight-time').textContent = `${format(flightTime)} s`;
    main.querySelector('#explorer3d-range').textContent = `${format(range)} m`;
    main.querySelector('#explorer3d-max-height').textContent = `${format(maxHeight)} m`;
    main.querySelector('#explorer3d-projectile-acceleration').textContent = `−${format(projectile.gravity)} m/s²`;
    main.querySelector('[data-explorer-time]').textContent=`${format(current.t,2)} s`;
    main.querySelector('[data-explorer-position]').textContent=`x ${format(current.x,2)} · y 0 · z ${format(current.y,2)} m`;
    main.querySelector('[data-explorer-speed]').textContent=`${format(current.speed,2)} m/s`;
    main.querySelector('[data-explorer-acceleration]').textContent=`${format(projectile.gravity,2)} m/s²`;
    canvas.setAttribute('aria-label', `Mô hình quỹ đạo ném xiên. Tầm xa ${format(range)} mét, độ cao cực đại ${format(maxHeight)} mét. Thời gian ${format(current.t,2)} giây.`);
  }

  function durationForScene(){
    if(scene==='helix')return createHelix(params).period*1.5;
    return createProjectile({v0:projectile.speed,angle:projectile.angle,height:projectile.height,g:projectile.gravity}).duration;
  }
  function syncPlayButton(){
    const playing=timeline.state.get().playing;
    playButton.textContent=playing?'Ⅱ Tạm dừng':'▶ Phát';
    playButton.setAttribute('aria-pressed',String(playing));
  }
  function renderTime(time){
    phase=timeline.duration?clamp(time/timeline.duration,0,1):0;
    main.querySelector('#explorer3d-phase').value=String(Math.round(phase*100));
    render();
  }
  const timeline=new Timeline(durationForScene(),renderTime,syncPlayButton);
  function pause(){timeline.pause();syncPlayButton();}
  function resetTimeline(keepPhase=false){
    markers.a=markers.b=null;markerReadout();
    const nextPhase=keepPhase?phase:0;
    timeline.reset(durationForScene());
    if(nextPhase>0)timeline.seek(nextPhase*timeline.duration);
    syncPlayButton();
  }
  timeline.seek(timeline.duration*phase);
  playButton.addEventListener('click', () => {
    if(timeline.state.get().playing){pause();return;}
    timeline.play();syncPlayButton();
  }, { signal: abort.signal });
  const cameraPresets = { isometric: [-0.55, 0.35], side: [0, 0], front: [0, Math.PI / 2 - .12] };
  main.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => {
    [yaw, elevation] = cameraPresets[button.dataset.camera];
    main.querySelectorAll('[data-camera]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    render();
    canvas.focus({ preventScroll: true });
  }, { signal: abort.signal }));
  for(const [id,setter] of [['explorer3d-vectors',value=>showVectors=value],['explorer3d-axes',value=>showAxes=value],['explorer3d-grid',value=>showGrid=value],['explorer3d-path',value=>showPath=value]]){
    main.querySelector(`#${id}`).addEventListener('change',event=>{setter(event.target.checked);render();},{signal:abort.signal});
  }
  const projectileExperiments={horizontal:{speed:20,angle:0,height:10,gravity:9.8},range:{speed:20,angle:45,height:0,gravity:9.8},moon:{speed:20,angle:45,height:0,gravity:1.62}};
  experiments.addEventListener('click', event=>{
    const chosen=event.target.closest('[data-helix-experiment],[data-projectile-experiment]');if(!chosen)return;
    pause();
    if(chosen.hasAttribute('data-helix-experiment')){
      params.angle=Number(chosen.dataset.helixExperiment);
      main.querySelector('#explorer3d-angle').value=String(params.angle);
    }else{
      Object.assign(projectile,projectileExperiments[chosen.dataset.projectileExperiment]);
      for(const [id,key] of [['explorer3d-v0','speed'],['explorer3d-projectile-angle','angle'],['explorer3d-height','height'],['explorer3d-gravity','gravity']])main.querySelector(`#${id}`).value=String(projectile[key]);
    }
    experiments.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===chosen)));
    resetTimeline();
  },{signal:abort.signal});
  function adjustZoom(delta){
    zoom=Number(clamp(Math.round((zoom+delta)*20)/20,.65,1.6).toFixed(2));
    main.querySelector('#explorer3d-zoom').value=String(zoom);render();
  }
  canvas.addEventListener('wheel',event=>{
    if(!event.ctrlKey) return; // never hijack normal page scrolling
    event.preventDefault();adjustZoom(event.deltaY>0?-.05:.05);
  },{signal:abort.signal,passive:false});
  canvas.addEventListener('dblclick',()=>main.querySelector('#explorer3d-fit').click(),{signal:abort.signal});

  main.querySelector('#explorer3d-fit').addEventListener('click', () => {
    yaw = -0.55; elevation = 0.35; zoom = 1;
    main.querySelector('#explorer3d-zoom').value = '1';
    main.querySelectorAll('[data-camera]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.camera==='isometric')));
    render();
    canvas.focus({ preventScroll: true });
  }, { signal: abort.signal });
  main.querySelector('#explorer3d-reset').addEventListener('click', () => {
    pause();
    if(scene==='helix'){
      Object.assign(params,HELIX_DEFAULTS);
      for(const [id,key] of [['explorer3d-angle','angle'],['explorer3d-speed','speed'],['explorer3d-field','field'],['explorer3d-mass','mass'],['explorer3d-charge','charge']])main.querySelector(`#${id}`).value=String(params[key]);
    }else{
      Object.assign(projectile,{speed:20,angle:45,height:0,gravity:9.8});
      for(const [id,key] of [['explorer3d-v0','speed'],['explorer3d-projectile-angle','angle'],['explorer3d-height','height'],['explorer3d-gravity','gravity']])main.querySelector(`#${id}`).value=String(projectile[key]);
    }
    yaw=-.55;elevation=.35;zoom=1;showVectors=true;showAxes=true;showGrid=true;showPath=true;
    main.querySelector('#explorer3d-zoom').value='1';main.querySelector('#explorer3d-rate').value='1';timeline.rate(1);
    for(const id of ['explorer3d-vectors','explorer3d-axes','explorer3d-grid','explorer3d-path'])main.querySelector(`#${id}`).checked=true;
    main.querySelectorAll('[data-camera]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.camera==='isometric')));
    experiments.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
    resetTimeline();
  }, { signal: abort.signal });
  document.addEventListener('visibilitychange',syncPlayButton,{signal:abort.signal});
  main.querySelector('#explorer3d-scene').addEventListener('change', event => {
    pause();
    scene = event.target.value;
    main.querySelector('#explorer3d-helix-controls').hidden = scene !== 'helix';
    main.querySelector('#explorer3d-projectile-controls').hidden = scene !== 'projectile';
    experiments.querySelector('[data-experiment-group="helix"]').hidden=scene!=='helix';
    experiments.querySelector('[data-experiment-group="projectile"]').hidden=scene!=='projectile';
    main.querySelector('[data-explorer-prompt]').textContent=scene==='helix'?'Thử một góc vận tốc':'Thử một kiểu phóng';
    main.querySelector('[data-explorer-prompt-detail]').textContent=scene==='helix'?'Chọn và quan sát hình dạng quỹ đạo':'So sánh điều kiện đầu và trọng trường';
    experiments.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
    main.querySelector('#explorer3d-help').textContent = scene === 'helix'
      ? 'Kéo trên khung để xoay · Tab và phím mũi tên để đổi góc · Ctrl + cuộn để thu phóng.'
      : 'Quỹ đạo trong mặt phẳng đứng · Dùng thanh trượt để thay đổi điều kiện đầu và vị trí vật.';
    canvas.setAttribute('aria-label', scene === 'helix'
      ? 'Mô hình ba chiều quỹ đạo hạt tích điện trong từ trường'
      : 'Mô hình ba chiều quỹ đạo ném xiên trong trọng trường');
    resetTimeline();
  }, { signal: abort.signal });
  main.querySelector('#explorer3d-angle').addEventListener('input', event => { params.angle = Number(event.target.value); resetTimeline(true); }, { signal: abort.signal });
  main.querySelector('#explorer3d-charge').addEventListener('change', event => { params.charge = Number(event.target.value); resetTimeline(true); }, { signal: abort.signal });
  for (const [id, key] of [['explorer3d-speed', 'speed'], ['explorer3d-field', 'field'], ['explorer3d-mass', 'mass']]) {
    main.querySelector(`#${id}`).addEventListener('input', event => { params[key] = Number(event.target.value); resetTimeline(true); }, { signal: abort.signal });
  }
  for (const [id, key] of [['explorer3d-v0', 'speed'], ['explorer3d-projectile-angle', 'angle'], ['explorer3d-height', 'height'], ['explorer3d-gravity', 'gravity']]) {
    main.querySelector(`#${id}`).addEventListener('input', event => { projectile[key] = Number(event.target.value); resetTimeline(true); }, { signal: abort.signal });
  }
  main.querySelector('#explorer3d-phase').addEventListener('input', event => timeline.seek(Number(event.target.value)/100*timeline.duration), { signal: abort.signal });
  main.querySelector('#explorer3d-rate').addEventListener('change',event=>timeline.rate(Number(event.target.value)),{signal:abort.signal});
  main.querySelector('#explorer3d-zoom').addEventListener('input', event => { zoom = Number(event.target.value); render(); }, { signal: abort.signal });
  canvas.addEventListener('pointerdown', event => {
    if(event.pointerType==='mouse' && event.button!==0)return;
    const probing=probe.querySelector('[data-probe-mode]').checked;
    drag={x:event.clientX,y:event.clientY,yaw,elevation,pointerId:event.pointerId,probing};
    canvas.setPointerCapture(event.pointerId);event.preventDefault();
    if(probing){pause();seekProbe(event);}
  }, { signal: abort.signal });
  canvas.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if(drag.probing){seekProbe(event);return;}
    yaw = drag.yaw + (event.clientX-drag.x) * 0.008;
    elevation = clamp(drag.elevation + (event.clientY-drag.y)*0.008, -1.2,1.2);
    render();
  }, { signal: abort.signal });
  const release = event => {
    if (drag?.pointerId !== event.pointerId) return;
    drag=null;try { canvas.releasePointerCapture(event.pointerId); } catch { /* capture ended */ }
  };
  canvas.addEventListener('pointerup', release, { signal: abort.signal });
  canvas.addEventListener('pointercancel', release, { signal: abort.signal });
  canvas.addEventListener('lostpointercapture',event=>{if(drag?.pointerId===event.pointerId)drag=null;},{signal:abort.signal});
  canvas.addEventListener('keydown', event => {
    if(event.key==='+'||event.key==='='){event.preventDefault();adjustZoom(.05);return;}
    if(event.key==='-'){event.preventDefault();adjustZoom(-.05);return;}
    const rotations = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] };
    if (!rotations[event.key]) return;
    event.preventDefault();
    yaw += rotations[event.key][0];
    elevation = clamp(elevation + rotations[event.key][1], -1.2, 1.2);
    render();
  }, { signal: abort.signal });
  const resize = new ResizeObserver(render);
  resize.observe(canvas);
  const themeObserver = new MutationObserver(render);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  render();
  return () => { timeline.destroy(); abort.abort(); resize.disconnect(); themeObserver.disconnect(); };
}
