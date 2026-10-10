import './explorer3d.css';
import { format } from '../core/units.js';
import { createProjectile } from '../core/projectile.js';
import { createHelix, HELIX_DEFAULTS } from '../core/helix.js';
import { createHelixViewport } from '../core/helix-viewport.js';

export function mount(main) {
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">KHÔNG GIAN BA CHIỀU</p><h1>Khám phá mô hình vật lý không gian</h1><p>Chọn hệ vật lý, điều chỉnh điều kiện ban đầu và kéo khung vẽ để xoay góc nhìn.</p></div><a class="button secondary" href="#/tools">Quay lại bàn công cụ</a></div>
    <section class="panel explorer3d-layout"><div class="explorer3d-stage"><canvas id="explorer3d-canvas" aria-label="Mô hình ba chiều quỹ đạo hạt tích điện trong từ trường" tabindex="0"></canvas><p id="explorer3d-help">Kéo để xoay · Bấm “Vừa khung” để xem trọn quỹ đạo · Dùng phím mũi tên khi chọn canvas.</p></div>
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
          <label class="explorer3d-parameter" for="explorer3d-gravity"><span>Gia tốc trọng trường</span><strong id="explorer3d-gravity-value"></strong><input id="explorer3d-gravity" type="range" min="1" max="20" step="0.1" value="9.8" aria-label="Gia tốc trọng trường"></label>
          <dl class="explorer3d-readouts"><div><dt>Thời gian bay</dt><dd id="explorer3d-flight-time"></dd></div><div><dt>Tầm xa</dt><dd id="explorer3d-range"></dd></div><div><dt>Độ cao cực đại</dt><dd id="explorer3d-max-height"></dd></div><div><dt>Gia tốc</dt><dd id="explorer3d-projectile-acceleration"></dd></div></dl>
          <p class="explorer3d-equation">x = v₀cosθ·t · y = h₀ + v₀sinθ·t − ½gt²</p></div>
        <div class="explorer3d-playback" role="group" aria-label="Điều khiển hoạt ảnh"><button class="button secondary" id="explorer3d-fit" type="button" title="Khôi phục góc nhìn và tự căn toàn bộ quỹ đạo">⊞ Vừa khung</button><button class="button primary" id="explorer3d-play" type="button">▶ Phát</button><button class="button secondary" id="explorer3d-reset" type="button">↺ Đặt lại</button><label for="explorer3d-rate">Tốc độ<select id="explorer3d-rate"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
        <label class="explorer3d-parameter" for="explorer3d-phase"><span>Vị trí dọc quỹ đạo</span><strong id="explorer3d-phase-value"></strong><input id="explorer3d-phase" type="range" min="0" max="100" step="1" value="35" aria-label="Vị trí vật trên quỹ đạo"></label>
        <label class="explorer3d-parameter" for="explorer3d-zoom"><span>Thu phóng</span><strong id="explorer3d-zoom-value"></strong><input id="explorer3d-zoom" type="range" min="0.65" max="1.6" step="0.05" value="1" aria-label="Thu phóng mô hình ba chiều"></label></aside></section>`;

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
  let drag = null;
  let bounds;
  let rafId = null;
  let lastFrame = null;
  const playButton = main.querySelector('#explorer3d-play');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function project(point) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(elevation), sp = Math.sin(elevation);
    const rotatedX = point.x * cy - point.y * sy;
    const horizontalDepth = point.x * sy + point.y * cy;
    const rotatedY = point.z * cp - horizontalDepth * sp;
    const depth = point.z * sp + horizontalDepth * cp;
    const perspective = 520 / Math.max(160, 520 + depth * 15);
    const scale = 70 * zoom * perspective;
    return { x: bounds.width / 2 + rotatedX * scale, y: bounds.height / 2 - rotatedY * scale, depth };
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
    context.fillStyle = getComputedStyle(document.body).getPropertyValue('--surface').trim() || '#fff';
    context.fillRect(0, 0, bounds.width, bounds.height);
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
    const zEnd = view.axisEnd.z;
    const axisStart = toCanvas(view.axisStart);
    const axisEnd = toCanvas(view.axisEnd);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(74,130,164,.20)';
    for (let step = 0; step <= 6; step++) {
      const z = zEnd * step / 6;
      const left = toCanvas({ x: -radius * 1.45, y: 0, z });
      const right = toCanvas({ x: radius * 1.45, y: 0, z });
      context.beginPath(); context.moveTo(left.x, left.y); context.lineTo(right.x, right.y); context.stroke();
    }
    context.strokeStyle = '#4384ba'; context.lineWidth = 2.5;
    context.beginPath(); context.moveTo(axisStart.x, axisStart.y); context.lineTo(axisEnd.x, axisEnd.y); context.stroke();
    const direction = zEnd >= 0 ? 1 : -1;
    context.fillStyle = '#4384ba';
    context.beginPath(); context.arc(axisEnd.x, axisEnd.y, 4, 0, 2 * Math.PI); context.fill();
    context.font = '600 14px system-ui';
    context.fillText('B ↑ +z', Math.min(bounds.width - 78, Math.max(8, axisEnd.x + 8)),
      Math.min(bounds.height - 14, Math.max(20, axisEnd.y - 10 * direction)));
    const points = view.path.map(toCanvas);
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = '#138a72'; context.lineWidth = 3.5; context.stroke();
    const t = view.duration * phase;
    const state = model.at(t);
    const particle = toCanvas(state);
    // Velocity tangent: use the actual instantaneous velocity vector,
    // not an unrelated fixed time/phase increment.
    const vectorTime = Math.min(view.duration * 0.075, 0.3 / Math.abs(model.omega));
    const velocityEnd = toCanvas({
      x: state.x + state.vx * vectorTime,
      y: state.y + state.vy * vectorTime,
      z: state.z + state.vz * vectorTime
    });
    context.beginPath(); context.moveTo(particle.x, particle.y);
    context.lineTo(velocityEnd.x, velocityEnd.y);
    context.strokeStyle = '#d44f5c'; context.lineWidth = 3; context.stroke();
    context.fillStyle = '#d44f5c'; context.font = '600 13px system-ui';
    context.fillText('v', Math.min(bounds.width - 15, Math.max(8, velocityEnd.x + 5)),
      Math.min(bounds.height - 9, Math.max(16, velocityEnd.y - 8)));
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
  }

  function renderProjectile() {
    const model = createProjectile({ v0: projectile.speed, angle: projectile.angle, height: projectile.height, g: projectile.gravity });
    const { duration: flightTime, range, maxHeight } = model;
    const scale = Math.min((bounds.width - 100) / Math.max(range, 1), (bounds.height - 100) / Math.max(maxHeight, 1)) / 70;
    const atPosition = (x, height) => project({ x: (x - range / 2) * scale, y: 0, z: height * scale });
    const at = time => {
      const state = model.at(time);
      return atPosition(state.x, state.y);
    };
    const groundStart = atPosition(0, 0);
    const groundEnd = atPosition(range, 0);
    const groundBack = project({ x: -range / 2 * scale, y: -2 * scale, z: 0 });
    context.strokeStyle = 'rgba(74,130,164,.28)'; context.lineWidth = 1;
    context.beginPath(); context.moveTo(groundStart.x, groundStart.y); context.lineTo(groundEnd.x, groundEnd.y);
    context.lineTo(project({ x: range / 2 * scale, y: -2 * scale, z: 0 }).x, project({ x: range / 2 * scale, y: -2 * scale, z: 0 }).y);
    context.lineTo(groundBack.x, groundBack.y); context.closePath(); context.stroke();
    context.strokeStyle = '#638095'; context.lineWidth = 2;
    context.beginPath(); context.moveTo(groundStart.x - 14, groundStart.y); context.lineTo(groundEnd.x + 14, groundEnd.y); context.stroke();
    context.fillStyle = '#607484'; context.font = '600 13px system-ui';
    context.fillText('x · mặt đất', groundEnd.x + 5, groundEnd.y - 8);
    const points = Array.from({ length: 121 }, (_, index) => at(flightTime * index / 120));
    context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = '#138a72'; context.lineWidth = 3; context.stroke();
    const particle = at(flightTime * phase);
    context.beginPath(); context.arc(particle.x, particle.y, 8, 0, 2 * Math.PI);
    context.fillStyle = '#da842f'; context.fill();
    const maximum = at(model.apexTime);
    context.setLineDash([5, 5]); context.strokeStyle = '#4384ba'; context.lineWidth = 1.5;
    const maximumGround = atPosition(model.at(model.apexTime).x, 0);
    context.beginPath(); context.moveTo(maximum.x, maximum.y); context.lineTo(maximumGround.x, maximumGround.y); context.stroke(); context.setLineDash([]);
    context.fillStyle = '#4384ba'; context.fillText('Hmax', maximum.x + 7, maximum.y - 8);
    main.querySelector('#explorer3d-v0-value').textContent = `${format(projectile.speed)} m/s`;
    main.querySelector('#explorer3d-projectile-angle-value').textContent = `${projectile.angle}°`;
    main.querySelector('#explorer3d-height-value').textContent = `${format(projectile.height)} m`;
    main.querySelector('#explorer3d-gravity-value').textContent = `${format(projectile.gravity)} m/s²`;
    main.querySelector('#explorer3d-flight-time').textContent = `${format(flightTime)} s`;
    main.querySelector('#explorer3d-range').textContent = `${format(range)} m`;
    main.querySelector('#explorer3d-max-height').textContent = `${format(maxHeight)} m`;
    main.querySelector('#explorer3d-projectile-acceleration').textContent = `−${format(projectile.gravity)} m/s²`;
    canvas.setAttribute('aria-label', `Mô hình quỹ đạo ném xiên, tầm xa ${format(range)} mét, độ cao cực đại ${format(maxHeight)} mét`);
  }

  function pause() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastFrame = null;
    playButton.textContent = '▶ Phát';
    playButton.setAttribute('aria-pressed', 'false');
  }
  function frame(now) {
    if (rafId === null) return;
    if (lastFrame !== null && !document.hidden) {
      const elapsed = Math.min((now - lastFrame) / 1000, 0.06);
      phase = Math.min(1, phase + elapsed * Number(main.querySelector('#explorer3d-rate').value) / 8);
      main.querySelector('#explorer3d-phase').value = Math.round(phase * 100);
      render();
    }
    lastFrame = now;
    if (phase >= 1) { pause(); return; }
    rafId = requestAnimationFrame(frame);
  }
  playButton.addEventListener('click', () => {
    if (rafId !== null) { pause(); return; }
    if (phase >= 1) phase = 0;
    playButton.textContent = 'Ⅱ Tạm dừng';
    playButton.setAttribute('aria-pressed', 'true');
    lastFrame = null;
    rafId = requestAnimationFrame(frame);
  }, { signal: abort.signal });
  main.querySelector('#explorer3d-fit').addEventListener('click', () => {
    yaw = -0.55; elevation = 0.35; zoom = 1;
    main.querySelector('#explorer3d-zoom').value = '1';
    render();
    canvas.focus({ preventScroll: true });
  }, { signal: abort.signal });
  main.querySelector('#explorer3d-reset').addEventListener('click', () => {
    pause(); phase = 0; main.querySelector('#explorer3d-phase').value = 0; render();
  }, { signal: abort.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal: abort.signal });
  main.querySelector('#explorer3d-scene').addEventListener('change', event => {
    pause();
    scene = event.target.value;
    main.querySelector('#explorer3d-helix-controls').hidden = scene !== 'helix';
    main.querySelector('#explorer3d-projectile-controls').hidden = scene !== 'projectile';
    main.querySelector('#explorer3d-help').textContent = scene === 'helix'
      ? 'Kéo để xoay · Bấm “Vừa khung” để xem trọn quỹ đạo · Dùng phím mũi tên khi chọn canvas.'
      : 'Quỹ đạo trong mặt phẳng đứng · Dùng thanh trượt để thay đổi điều kiện đầu và vị trí vật.';
    canvas.setAttribute('aria-label', scene === 'helix'
      ? 'Mô hình ba chiều quỹ đạo hạt tích điện trong từ trường'
      : 'Mô hình ba chiều quỹ đạo ném xiên trong trọng trường');
    render();
  }, { signal: abort.signal });
  main.querySelector('#explorer3d-angle').addEventListener('input', event => { params.angle = Number(event.target.value); render(); }, { signal: abort.signal });
  main.querySelector('#explorer3d-charge').addEventListener('change', event => { params.charge = Number(event.target.value); render(); }, { signal: abort.signal });
  for (const [id, key] of [['explorer3d-speed', 'speed'], ['explorer3d-field', 'field'], ['explorer3d-mass', 'mass']]) {
    main.querySelector(`#${id}`).addEventListener('input', event => { params[key] = Number(event.target.value); render(); }, { signal: abort.signal });
  }
  for (const [id, key] of [['explorer3d-v0', 'speed'], ['explorer3d-projectile-angle', 'angle'], ['explorer3d-height', 'height'], ['explorer3d-gravity', 'gravity']]) {
    main.querySelector(`#${id}`).addEventListener('input', event => { projectile[key] = Number(event.target.value); render(); }, { signal: abort.signal });
  }
  main.querySelector('#explorer3d-phase').addEventListener('input', event => { pause(); phase = Number(event.target.value) / 100; render(); }, { signal: abort.signal });
  main.querySelector('#explorer3d-zoom').addEventListener('input', event => { zoom = Number(event.target.value); render(); }, { signal: abort.signal });
  canvas.addEventListener('pointerdown', event => { drag = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }; canvas.setPointerCapture(event.pointerId); }, { signal: abort.signal });
  canvas.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    yaw += (event.clientX - drag.x) * 0.008;
    elevation = clamp(elevation + (event.clientY - drag.y) * 0.008, -1.2, 1.2);
    drag = { ...drag, x: event.clientX, y: event.clientY };
    render();
  }, { signal: abort.signal });
  const release = event => { if (drag?.pointerId === event.pointerId) drag = null; };
  canvas.addEventListener('pointerup', release, { signal: abort.signal });
  canvas.addEventListener('pointercancel', release, { signal: abort.signal });
  canvas.addEventListener('keydown', event => {
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
  return () => { pause(); abort.abort(); resize.disconnect(); themeObserver.disconnect(); };
}
