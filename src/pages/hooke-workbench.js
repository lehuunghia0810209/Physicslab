import '../styles/hooke-workbench.css';
import { SPRINGS, toCsv } from '../core/hooke.js';
import { EQUIPMENT_CATALOG, getEquipment, sanitizeHookeMeasurements } from '../core/equipment.js';
import { calibrateReading, hookeStiffnessUncertainty } from '../core/lab-calibration.js';
import { analyzeHookeRows } from '../core/hooke-analysis.js';
import { springEquilibrium, sampleDampedSpring, springCoilPath, HOOKE_STAGE, massCenterY, extensionFromStageY } from '../core/hooke-motion.js';

const WEIGHTS = [0.1, 0.2, 0.5];
const fmt = (n, digits = 3) => Number(n).toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const SPRING = id => SPRINGS.find(item => item.id === id) || SPRINGS[1];
const by = (root, selector) => root.querySelector(selector);
const defaultSettings = { springId: 'standard', mass: 0.5, gravity: 9.81, rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.01n', forceSteps: 0, rulerSteps: 0, compensated: 1 };

function rulerMarkup() {
  return Array.from({ length: 17 }, (_, i) => {
    const y = HOOKE_STAGE.naturalMassY + i * .1 * HOOKE_STAGE.pixelsPerMeter;
    return `<path d="M 471 ${y.toFixed(2)} h ${i % 2 ? 12 : 22}" stroke="currentColor" stroke-width="1.4" opacity=".7" />${i % 2 ? '' : `<text x="503" y="${(y + 5).toFixed(2)}" font-size="13" fill="currentColor">${fmt(i * .1, 1)} m</text>`}`;
  }).join('');
}
function graphMarkup(rows, springId) {
  const analysis = analyzeHookeRows(rows, springId);
  const maxX = Math.max(0.4, ...analysis.points.map(p => p.extension * 1.14));
  const maxY = Math.max(6, ...analysis.points.map(p => p.force * 1.18));
  const x = v => 64 + v / maxX * 560;
  const y = v => 250 - v / maxY * 197;
  return {
    svg: `<svg viewBox="0 0 690 305" role="img" aria-label="Đồ thị lực và độ dãn lò xo, ${analysis.points.length} điểm đo"><g stroke="currentColor" stroke-opacity=".1">${Array.from({length:5},(_,i)=>`<line x1="64" x2="628" y1="${250-i*49}" y2="${250-i*49}"/>`).join('')}</g><g stroke="currentColor" stroke-opacity=".6" stroke-width="2"><path d="M64 42V250H634" fill="none"/></g>${analysis.fit ? `<line x1="64" y1="250" x2="${x(Math.min(maxX, maxY/analysis.fit.stiffness))}" y2="${y(Math.min(maxY, maxX*analysis.fit.stiffness))}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="8 6"/>` : ''}${analysis.points.map(p=>`<circle cx="${x(p.extension)}" cy="${y(p.force)}" r="7" fill="var(--primary)" stroke="var(--surface)" stroke-width="3"><title>Δx=${fmt(p.extension,4)} m; F=${fmt(p.force)} N</title></circle>`).join('')}<g fill="currentColor" font-size="14"><text x="60" y="271">0</text><text x="310" y="290">Độ dãn Δx (m)</text><text x="54" y="32">Lực F (N)</text><text x="${x(maxX)-34}" y="272">${fmt(maxX,2)}</text><text x="13" y="62">${fmt(maxY,1)}</text></g></svg>`,
    description: analysis.fit ? `Độ dốc k ≈ ${fmt(analysis.fit.stiffness,2)} N/m · R² = ${analysis.fit.rSquared === null ? '—' : fmt(analysis.fit.rSquared,3)} · ${analysis.fit.count} điểm của ${SPRING(springId).label}.` : 'Ghi ít nhất hai phép đo có độ dãn khác nhau với cùng một lò xo để tìm độ cứng từ độ dốc F–Δx.'
  };
}

export function mountHookeWorkbench(root, { progress } = {}) {
  const stored = progress?.get?.().sessions?.['hooke-lab'] || {};
  const saved = stored.setup || {};
  const safeSpringId = SPRINGS.some(s => s.id === saved.springId) ? saved.springId : defaultSettings.springId;
  const safeType = (id, type, fallback) => EQUIPMENT_CATALOG.some(e => e.id === id && e.type === type) ? id : fallback;
  const state = {
    springId: safeSpringId,
    mass: Number.isFinite(saved.mass) && saved.mass >= 0 ? Math.min(HOOKE_STAGE.maxMass, Math.round(saved.mass * 20) / 20) : defaultSettings.mass,
    gravity: [9.81, 1.62, 3.71].includes(saved.gravity) ? saved.gravity : 9.81,
    rulerId: safeType(saved.rulerId, 'ruler', defaultSettings.rulerId),
    forceGaugeId: safeType(saved.forceGaugeId, 'force-sensor', defaultSettings.forceGaugeId),
    forceSteps: Number.isInteger(saved.forceSteps) ? Math.max(-2,Math.min(2,saved.forceSteps)) : 0,
    rulerSteps: Number.isInteger(saved.rulerSteps) ? Math.max(-2,Math.min(2,saved.rulerSteps)) : 0,
    compensated: saved.compensated !== 0,
    rows: sanitizeHookeMeasurements(stored.measurements, defaultSettings),
    extension: 0, velocity: 0, motion: null, elapsed: 0, playing: true, dragging: false, vectors: false,
    status: Number.isFinite(saved.mass) && saved.mass > HOOKE_STAGE.maxMass ? 'Bộ giá treo tương tác giới hạn 1 kg để lò xo luôn trong tầm quan sát. Dữ liệu đo cũ vẫn được giữ.' : 'Lò xo đã treo quả cân. Hãy kéo quả cân rồi thả để quan sát dao động.'
  };
  const abort = new AbortController();
  const listen = (element, name, fn, options={}) => element?.addEventListener(name, fn, { ...options, signal: abort.signal });
  const stiffness = () => SPRING(state.springId).constant;
  const equilibrium = () => state.mass > 0 ? springEquilibrium(state.mass, stiffness(), state.gravity) : 0;
  const stable = () => state.mass > 0 && Math.abs(state.extension - equilibrium()) < .003 && Math.abs(state.velocity) < .012 && !state.dragging;
  state.extension = equilibrium();
  const persist = () => progress?.session?.('hooke-lab', { setup: {
    springId: state.springId, mass: state.mass, gravity: state.gravity,
    rulerId: state.rulerId, forceGaugeId: state.forceGaugeId,
    forceSteps: state.forceSteps, rulerSteps: state.rulerSteps, compensated: Number(state.compensated)
  }, measurements: state.rows });
  root.innerHTML = `<section class="hw" aria-label="Bàn thí nghiệm lò xo Hooke">
    <header class="hw-heading"><div><p class="hw-eyebrow">CƠ HỌC · LỚP 10/12 · PHÒNG THÍ NGHIỆM TƯƠNG TÁC</p><h2>Lò xo & định luật Hooke</h2><p>Tự treo quả cân, kéo lò xo rồi thả. Quan sát lực, dao động và đọc thước ngay trên bàn thực nghiệm.</p></div><span class="hw-badge">Bàn thực nghiệm</span></header>
    <div class="hw-steps"><span><b>01</b> Gắn quả cân vào lò xo</span><span><b>02</b> Kéo vật xuống và thả</span><span><b>03</b> Đọc thước · Ghi kết quả</span></div>
    <div class="hw-layout"><section class="hw-bench" aria-label="Bàn treo lò xo"><div class="hw-bench-top"><div><strong>GIÁ TREO LÒ XO</strong><small id="hw-stage-status">Đang ở vị trí cân bằng</small></div><div class="hw-toolbar"><button type="button" id="hw-play">⏸ Tạm dừng</button><button type="button" id="hw-equilibrate">⊙ Về cân bằng</button><label class="hw-toggle"><input type="checkbox" id="hw-vectors"> Vectơ lực</label></div></div>
      <div class="hw-scene"><svg id="hw-svg" viewBox="0 0 800 510" role="img" aria-label="Bàn thí nghiệm. Kéo quả cân dọc theo lò xo để làm vật dao động. Dùng các nút quả cân phía dưới để thêm khối lượng.">
        <defs><pattern id="hw-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="currentColor" stroke-opacity=".05"/></pattern><linearGradient id="hw-mass-gradient" x1="0" x2=".6" y1="0" y2="1"><stop stop-color="#7ee7d3"/><stop offset="1" stop-color="#229d9b"/></linearGradient></defs>
        <rect width="800" height="510" fill="url(#hw-grid)"/>
        <path d="M116 76V455M116 76H325M67 455H179" fill="none" stroke="var(--muted)" stroke-width="13" stroke-linecap="round"/>
        <path d="M300 76V94" stroke="var(--muted)" stroke-width="7" stroke-linecap="round"/>
        <path d="M300 ${HOOKE_STAGE.naturalMassY}H447" stroke="var(--blue)" stroke-width="2" stroke-dasharray="7 7" opacity=".55"/><text x="447" y="${HOOKE_STAGE.naturalMassY-10}" text-anchor="end" font-size="14" fill="var(--blue)">Vị trí tự nhiên</text>
        <g stroke="var(--amber)" stroke-width="2" fill="none"><path d="M471 ${HOOKE_STAGE.naturalMassY-15}V${HOOKE_STAGE.naturalMassY+170}"/></g><g fill="var(--ink)">${rulerMarkup()}</g>
        <text x="470" y="215" font-size="15" font-weight="700" fill="var(--ink)">THƯỚC ĐỘ DÃN</text>
        <path id="hw-coil" d="" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
        <path id="hw-equilibrium-line" stroke="var(--primary)" stroke-width="2" stroke-dasharray="9 7" opacity=".6"/>
        <path id="hw-reading-line" stroke="var(--amber)" stroke-width="3" stroke-dasharray="5 5"/>
        <g id="hw-mass" data-hooke-weight tabindex="0" role="slider" aria-label="Quả cân: kéo lên xuống để kích thích dao động" aria-valuemin="-0.1" aria-valuemax="1.6" aria-valuenow="0" style="cursor:ns-resize;touch-action:none"><rect x="262" y="236" width="76" height="54" rx="12" fill="url(#hw-mass-gradient)" stroke="#146f72" stroke-width="3"/><rect x="285" y="228" width="30" height="12" rx="5" fill="var(--primary)"/><text id="hw-mass-label" x="300" y="270" text-anchor="middle" font-size="16" font-weight="800" fill="#073d40">0,5 kg</text></g>
        <g id="hw-force-down" fill="none" stroke="#edaa70" stroke-width="5" stroke-linecap="round"><path id="hw-g-arrow"/><text id="hw-g-label" x="355" y="337" fill="#edaa70" stroke="none" font-size="15" font-weight="700">P = mg</text></g>
        <g id="hw-force-up" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linecap="round"><path id="hw-k-arrow"/><text id="hw-k-label" x="220" y="200" fill="var(--primary)" stroke="none" font-size="15" font-weight="700">F = kΔx</text></g>
        <g id="hw-empty" hidden><circle cx="300" cy="242" r="41" fill="var(--primary)" fill-opacity=".09" stroke="var(--primary)" stroke-width="3" stroke-dasharray="7 7"/><text x="300" y="250" fill="var(--primary)" text-anchor="middle" font-size="28">+</text><text x="300" y="312" fill="var(--ink)" font-size="18" text-anchor="middle">Thêm quả cân phía dưới</text></g>
        <text x="36" y="487" fill="var(--muted)" font-size="15">Kéo quả cân ↕ · Khi thả, lò xo dao động rồi dần ổn định</text>
      </svg></div>
      <div class="hw-weights"><div><strong>KHAY QUẢ CÂN</strong><p>Kéo quả cân vào giá treo hoặc nhấn để thêm. Tối đa 1 kg.</p></div><div class="hw-weight-list">${WEIGHTS.map(w=>`<button type="button" class="hw-weight" data-add-mass="${w}" aria-label="Thêm quả cân ${fmt(w,2)} kilôgam"><span class="hw-weight-icon">${fmt(w*1000,0)}<small>g</small></span><span>+ ${fmt(w,2)} kg</span></button>`).join('')}<button type="button" class="hw-weight hw-detach" id="hw-detach">↶ Tháo hết</button></div></div>
    </section>
    <aside class="hw-side"><div class="hw-visual-readings"><div class="hw-reading-head"><strong>ĐỒNG HỒ ĐO</strong><span id="hw-motion-badge">Cân bằng</span></div><div class="hw-dials"><div class="hw-dial"><small>Khối lượng</small><strong id="hw-mass-value">0,50 kg</strong></div><div class="hw-dial"><small>Trọng lực P</small><strong id="hw-gravity-force">4,905 N</strong></div><div class="hw-dial"><small>Độ dãn hiện thời</small><strong id="hw-extension">0,196 m</strong></div><div class="hw-dial"><small>Lực đàn hồi</small><strong id="hw-spring-force">4,905 N</strong></div></div><div class="hw-gauge"><span>Vị trí so với cân bằng</span><div class="hw-gauge-track"><i id="hw-gauge-dot"></i></div><small id="hw-velocity">v = 0,000 m/s</small></div><p class="hw-reading-note">Chỉ ghi phép đo khi vật đứng yên ở vị trí cân bằng. Các mũi tên thể hiện lực tức thời khi dao động.</p></div>
      <div class="hw-panel"><div class="hw-panel-head"><strong>THỰC HÀNH & ĐO ĐẠC</strong><span>F = kΔx</span></div><button class="button primary hw-capture" id="record-measurement">◉ Ghi một phép đo</button><p id="equipment-status" class="hw-status" role="status" aria-live="polite">${state.status}</p><div class="hw-panel-actions"><button class="button secondary" id="csv-export" disabled>↓ Xuất CSV</button><button class="button ghost" id="clear-results" disabled>Xóa phép đo</button></div></div>
      <details class="hw-settings"><summary><strong>⚙ Cấu hình lò xo & dụng cụ</strong><span>Đổi lò xo, trọng trường, độ chia</span></summary><div class="hw-settings-content"><label>Lò xo<select id="spring-select">${SPRINGS.map(s=>`<option value="${s.id}">${s.label}</option>`).join('')}</select></label><label>Trọng trường<select id="gravity-select"><option value="9.81">Trái Đất · 9,81 m/s²</option><option value="1.62">Mặt Trăng · 1,62 m/s²</option><option value="3.71">Sao Hỏa · 3,71 m/s²</option></select></label><label>Thước<select id="ruler-select">${EQUIPMENT_CATALOG.filter(e=>e.type==='ruler').map(e=>`<option value="${e.id}">${e.label}</option>`).join('')}</select></label><label>Lực kế<select id="force-sensor-select">${EQUIPMENT_CATALOG.filter(e=>e.type==='force-sensor').map(e=>`<option value="${e.id}">${e.label}</option>`).join('')}</select></label><details><summary>Hiệu chuẩn điểm 0</summary><label>Lực kế<select id="force-zero-offset"><option value="-2">−2 độ chia</option><option value="-1">−1 độ chia</option><option value="0">Không lệch</option><option value="1">+1 độ chia</option><option value="2">+2 độ chia</option></select></label><label>Thước<select id="ruler-zero-offset"><option value="-2">−2 độ chia</option><option value="-1">−1 độ chia</option><option value="0">Không lệch</option><option value="1">+1 độ chia</option><option value="2">+2 độ chia</option></select></label><label class="hw-check"><input type="checkbox" id="calibration-compensate" checked> Bù lệch điểm 0 khi ghi số đo</label><p id="calibration-status" role="status" aria-live="polite"></p></details><button class="button secondary" id="hw-reset">Đặt lại điều kiện ban đầu</button></div></details>
      <details class="hw-help"><summary>❔ Vì sao vật dao động?</summary><p>Trọng lực kéo vật xuống, lực đàn hồi kéo vật lên. Hai lực bằng nhau tại <strong>x = mg/k</strong>. Khi kéo vật lệch khỏi vị trí đó và thả, hợp lực hướng vật trở lại. Mô hình có lực cản nên biên độ giảm dần. Sau khi vật đứng yên, đo độ dãn và lập đồ thị.</p><p><strong>Lưu ý:</strong> chiều dài lò xo trên hình được phóng đại để dễ thấy; độ dãn và lực hiển thị theo mô hình SI.</p></details>
    </aside></div>
    <section class="hw-notebook"><div class="hw-notebook-header"><div><p class="hw-eyebrow">SỔ THÍ NGHIỆM</p><h3>Đo nhiều quả cân để tìm độ cứng k</h3><p>Chỉ kết nối những điểm đo của cùng một lò xo. Thay quả cân, chờ cân bằng rồi ghi lại.</p></div><span id="hw-count">0 phép đo</span></div><div class="hw-notebook-grid"><div class="hw-chart"><div id="hooke-graph"></div><p id="graph-summary"></p></div><div class="hw-data"><div class="table-scroll"><table><thead><tr><th>Lần</th><th>Lò xo</th><th>m (kg)</th><th>F (N)</th><th>Δx (m)</th><th>k (N/m)</th><th>u(k)</th></tr></thead><tbody id="hooke-table-body"></tbody></table></div></div></div></section>
  </section>`;
  const svg = by(root, '#hw-svg');
  const weight = by(root, '#hw-mass');
  const coil = by(root, '#hw-coil');
  let dragPointer = null, dragVelocity = 0, dragLastTime = 0, dragLastX = 0;
  let lastTick = 0, rafId = 0;
  let ghost = null;
  let suppressClick = false;
  const setText = (selector, value) => { const element = by(root, selector); if (element) element.textContent = value; };
  const renderCalibrationStatus = () => setText('#calibration-status', state.compensated
    ? 'Đã bật bù điểm 0 khi ghi số đo.'
    : 'Chưa bù điểm 0; số đo sẽ giữ nguyên sai lệch đã chọn.');
  function stopMotion() { state.motion = null; state.elapsed = 0; state.velocity = 0; }
  function startMotion(extension, velocity = 0) {
    if (!state.mass) return;
    state.extension = extension;
    state.velocity = velocity;
    state.motion = { mass: state.mass, stiffness: stiffness(), gravity: state.gravity, initialExtension: extension, initialVelocity: velocity, damping: .85 };
    state.elapsed = 0;
    state.playing = true;
    setText('#hw-play', '⏸ Tạm dừng');
  }
  function renderScene() {
    const attached = state.mass > 0;
    const y = massCenterY(state.extension);
    const yEq = massCenterY(equilibrium());
    coil.setAttribute('d', springCoilPath(300, HOOKE_STAGE.springTop, (attached ? y-30 : 223)));
    weight.setAttribute('transform', `translate(0 ${state.extension * HOOKE_STAGE.pixelsPerMeter})`);
    weight.hidden = !attached;
    by(root,'#hw-empty').hidden = attached;
    by(root,'#hw-reading-line').setAttribute('d', attached ? `M 341 ${y} H 466` : '');
    by(root,'#hw-equilibrium-line').setAttribute('d', attached ? `M 185 ${yEq} H 440` : '');
    weight.setAttribute('aria-valuenow',state.extension.toFixed(3));
    weight.setAttribute('tabindex', attached ? '0' : '-1');
    weight.setAttribute('aria-valuetext',`Độ dãn ${fmt(state.extension,3)} mét. Khối lượng ${fmt(state.mass,2)} kilôgam.`);
    setText('#hw-mass-label', `${fmt(state.mass,2)} kg`);
    setText('#hw-mass-value',`${fmt(state.mass,2)} kg`);
    setText('#hw-gravity-force', `${fmt(state.mass*state.gravity,3)} N`);
    setText('#hw-extension',`${attached ? fmt(state.extension,3) : '—'} m`);
    setText('#hw-spring-force',`${attached ? fmt(stiffness()*state.extension,3) : '—'} N`);
    setText('#hw-velocity',`v = ${fmt(state.velocity,3)} m/s`);
    setText('#hw-motion-badge',!attached?'Chưa có quả cân':state.dragging?'Đang kéo':stable()?'Cân bằng':state.playing?'Đang dao động':'Đang tạm dừng');
    setText('#hw-stage-status', !attached ? 'Chọn một quả cân để bắt đầu' : `k = ${fmt(stiffness(),0)} N/m · g = ${fmt(state.gravity,2)} m/s²`);
    const d = Math.max(-1,Math.min(1,(state.extension-equilibrium()) / .5));
    by(root,'#hw-gauge-dot').style.left = `${50+d*45}%`;
    const visible = state.vectors && attached;
    by(root,'#hw-force-down').style.display = visible?'':'none';
    by(root,'#hw-force-up').style.display = visible?'':'none';
    if(visible) {
      const down = Math.min(100, 14+Math.abs(state.mass*state.gravity)*7);
      const up = Math.min(100, 14+Math.abs(stiffness()*state.extension)*7);
      by(root,'#hw-g-arrow').setAttribute('d',`M356 ${y} v${down} m-8 -11 m8 11 8 -11`);
      by(root,'#hw-k-arrow').setAttribute('d',`M237 ${y} v${state.extension >= 0 ? -up : up} m-8 ${state.extension >= 0 ? 11 : -11} m8 ${state.extension >= 0 ? -11 : 11} 8 ${state.extension >= 0 ? 11 : -11}`);
      by(root,'#hw-g-label').setAttribute('y',Math.min(480,y+down+26));
      by(root,'#hw-k-label').setAttribute('y',Math.max(20,y-up-14));
    }
    by(root, '#record-measurement').disabled = !stable();
  }
  function renderNotebook() {
    const graph = graphMarkup(state.rows, state.springId);
    by(root,'#hooke-graph').innerHTML = graph.svg;
    setText('#graph-summary', graph.description);
    setText('#hw-count', `${state.rows.length} phép đo`);
    by(root,'#hooke-table-body').innerHTML = state.rows.length ? state.rows.map((r,i)=>{
      const gauge = getEquipment(r.forceGaugeId), ruler = getEquipment(r.rulerId);
      const uncertainty = hookeStiffnessUncertainty(r.force, r.extension, gauge.resolution/2, ruler.resolution/2).uncertainty;
      return `<tr><td>${i+1}</td><td>${r.springId ? SPRING(r.springId).label : 'Dữ liệu cũ'}</td><td>${fmt(r.mass,2)}</td><td>${fmt(r.force)}</td><td>${fmt(r.extension,4)}</td><td>${fmt(r.springConstant,2)}</td><td>± ${fmt(uncertainty,2)}</td></tr>`;
    }).join('') : '<tr><td colspan="7" class="hw-empty-data">Chưa có phép đo. Hãy treo quả cân và ghi kết quả khi lò xo đứng yên.</td></tr>';
    by(root,'#csv-export').disabled = !state.rows.length;
    by(root,'#clear-results').disabled = !state.rows.length;
  }
  function syncConfig() {
    for (const [id, field] of [['#spring-select','springId'], ['#gravity-select','gravity'], ['#ruler-select','rulerId'], ['#force-sensor-select','forceGaugeId'], ['#force-zero-offset','forceSteps'], ['#ruler-zero-offset','rulerSteps']]) by(root,id).value=String(state[field]);
    by(root,'#calibration-compensate').checked=state.compensated;
    renderCalibrationStatus();
  }
  function settle() { if(state.mass) { stopMotion(); state.extension=equilibrium(); } renderScene(); }
  function tick(timestamp) {
    if (abort.signal.aborted) return;
    const dt = lastTick ? Math.min((timestamp - lastTick)/1000,.05) : 0;
    lastTick = timestamp;
    if (!root.hidden && !document.hidden && state.playing && state.motion && !state.dragging) {
      state.elapsed += dt;
      const sample = sampleDampedSpring(state.motion,state.elapsed);
      state.extension=sample.extension; state.velocity=sample.velocity;
      if (Math.abs(state.extension - equilibrium()) < .001 && Math.abs(state.velocity) < .006) settle();
      renderScene();
    }
    rafId = requestAnimationFrame(tick);
  }
  function addMass(amount) {
    if (state.mass+amount > HOOKE_STAGE.maxMass + 1e-8) { setText('#equipment-status','Giới hạn khay treo là 1 kg. Hãy tháo bớt quả cân để thử lại.'); return; }
    const before = state.extension;
    state.mass = Math.round((state.mass + amount)*100)/100;
    startMotion(before);
    setText('#equipment-status',`Đã treo thêm ${fmt(amount,2)} kg. Quan sát lò xo dao động, rồi đưa về cân bằng để ghi số đo.`);
    renderScene(); persist();
  }
  function stagePoint(clientX, clientY) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());
  }
  listen(svg,'pointerdown',event=>{
    if (!event.target.closest('[data-hooke-weight]') || !state.mass || (event.pointerType==='mouse' && event.button!==0)) return;
    event.preventDefault();
    dragPointer=event.pointerId; state.dragging=true; stopMotion();
    dragLastTime=event.timeStamp;dragLastX=state.extension;dragVelocity=0;
    svg.setPointerCapture?.(event.pointerId); renderScene();
  });
  listen(svg,'pointermove',event=>{
    if(event.pointerId!==dragPointer) return;
    const point=stagePoint(event.clientX,event.clientY); if(!point)return;
    const x=Math.min(1.7,Math.max(-.1,extensionFromStageY(point.y)));
    const dt=(event.timeStamp-dragLastTime)/1000;
    if(dt>.005) dragVelocity=Math.max(-.6,Math.min(.6,(x-dragLastX)/dt));
    dragLastTime=event.timeStamp;dragLastX=x;
    state.extension=x;state.velocity=dragVelocity;renderScene();
  });
  const stopDrag=event=>{
    if(event.pointerId!==dragPointer)return;
    dragPointer=null;state.dragging=false;startMotion(state.extension,dragVelocity);renderScene();
    setText('#equipment-status','Bạn đã thả quả cân. Quan sát lực và vị trí thay đổi, chờ lò xo đứng yên trước khi đo.');
  };
  listen(svg,'pointerup',stopDrag);listen(svg,'pointercancel',stopDrag);
  listen(weight,'keydown',event=>{
    if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key)||!state.mass)return;
    event.preventDefault();
    let x=state.extension;
    if(event.key==='ArrowUp')x-=.05;else if(event.key==='ArrowDown')x+=.05;
    else x=event.key==='Home' ? -.1 : 1.6;
    state.extension=Math.max(-.1,Math.min(1.6,x)); stopMotion();renderScene();
    setText('#equipment-status','Đã thay đổi độ dãn bằng bàn phím. Nhấn Enter để thả vật.');
  });
  listen(weight,'keyup',event=>{
    if(event.key==='Enter'||event.key===' ') {event.preventDefault();startMotion(state.extension);renderScene();}
  });
  function clearGhost(){ghost?.remove();ghost=null;}
  root.querySelectorAll('[data-add-mass]').forEach(button=>{
    const amount=Number(button.dataset.addMass);
    let start=null;
    listen(button,'pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0)return;
      start={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
      button.setPointerCapture?.(event.pointerId);
    });
    listen(button,'pointermove',event=>{
      if(start?.id!==event.pointerId)return;
      if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>8){
        start.moved=true;
        if(!ghost){ghost=document.createElement('div');ghost.className='hw-drag-ghost';ghost.textContent=`${fmt(amount,2)} kg`;document.body.appendChild(ghost);}
        ghost.style.transform=`translate(${event.clientX+12}px,${event.clientY-15}px)`;
      }
    });
    listen(button,'pointerup',event=>{
      if(start?.id!==event.pointerId)return;
      const wasDragging=start.moved;start=null;clearGhost();
      if(wasDragging){
        suppressClick=true;
        setTimeout(()=>{suppressClick=false;},0);
        const p=stagePoint(event.clientX,event.clientY);
        if(p && p.x>175 && p.x<420 && p.y>130 && p.y<475)addMass(amount);
        else setText('#equipment-status','Thả quả cân gần lò xo trong vùng thí nghiệm, hoặc nhấn vào quả cân để thêm.');
      }
    });
    listen(button,'pointercancel',()=>{start=null;clearGhost();});
    listen(button,'click',()=>{if(suppressClick){suppressClick=false;return;}addMass(amount);});
  });
  listen(by(root,'#hw-detach'),'click',()=>{state.mass=0;state.extension=0;stopMotion();renderScene();persist();setText('#equipment-status','Đã tháo tất cả quả cân. Chọn quả cân từ khay để treo lên lò xo.');});
  listen(by(root,'#hw-play'),'click',()=>{state.playing=!state.playing;lastTick=0;setText('#hw-play',state.playing?'⏸ Tạm dừng':'▶ Tiếp tục');renderScene();});
  listen(by(root,'#hw-equilibrate'),'click',()=>{settle();setText('#equipment-status','Vật đã về trạng thái cân bằng; có thể đo và ghi kết quả.');});
  listen(by(root,'#hw-vectors'),'change',event=>{state.vectors=event.target.checked;renderScene();});
  for(const [id,key] of [['#spring-select','springId'], ['#gravity-select','gravity'], ['#ruler-select','rulerId'], ['#force-sensor-select','forceGaugeId'], ['#force-zero-offset','forceSteps'], ['#ruler-zero-offset','rulerSteps']]) {
    listen(by(root,id),'change',event=>{
      const before=state.extension;
      state[key] = ['gravity','forceSteps','rulerSteps'].includes(key) ? Number(event.target.value) : event.target.value;
      if(key==='springId'||key==='gravity'){if(state.mass)startMotion(before);renderNotebook();}
      setText('#equipment-status','Đã cập nhật thiết bị. Đợi lò xo về cân bằng trước khi ghi phép đo.');
      renderCalibrationStatus();
      renderScene();persist();
    });
  }
  listen(by(root,'#calibration-compensate'),'change',event=>{state.compensated=event.target.checked;renderCalibrationStatus();persist();});
  listen(by(root,'#hw-reset'),'click',()=>{
    Object.assign(state,{springId:defaultSettings.springId,mass:defaultSettings.mass,gravity:defaultSettings.gravity,rulerId:defaultSettings.rulerId,forceGaugeId:defaultSettings.forceGaugeId,forceSteps:0,rulerSteps:0,compensated:true,playing:true});
    settle();syncConfig();persist();renderNotebook();setText('#hw-play','⏸ Tạm dừng');setText('#equipment-status','Đã đặt lại điều kiện ban đầu. Các số liệu đã ghi được giữ lại.');
  });
  listen(by(root,'#record-measurement'),'click',()=>{
    if(!stable()){setText('#equipment-status','Chờ lò xo đứng yên hoặc nhấn “Về cân bằng” để đo chính xác.');return;}
    try {
      const forceReading=calibrateReading(state.forceGaugeId,state.mass*state.gravity,state.forceSteps,state.compensated);
      const extensionReading=calibrateReading(state.rulerId,equilibrium(),state.rulerSteps,state.compensated);
      if(forceReading.value<=0||extensionReading.value<=0)throw new Error('Số đo sau hiệu chuẩn phải dương.');
      const row={mass:state.mass,force:forceReading.value,extension:extensionReading.value,springConstant:forceReading.value/extensionReading.value,springId:state.springId,rulerId:state.rulerId,forceGaugeId:state.forceGaugeId};
      state.rows.push(row);state.rows=state.rows.slice(-100);
      renderNotebook();persist();
      setText('#equipment-status',`${state.compensated ? '' : 'Chưa bù điểm 0. '}Đã ghi lần ${state.rows.length}: F = ${fmt(row.force)} ± ${fmt(forceReading.bound,4)} N; Δx = ${fmt(row.extension,4)} ± ${fmt(extensionReading.bound,5)} m.`);
    } catch(error) {setText('#equipment-status',`Chưa thể đo: ${error.message}`);}
  });
  listen(by(root,'#clear-results'),'click',()=>{state.rows=[];renderNotebook();persist();setText('#equipment-status','Đã xóa các phép đo Hooke; không ảnh hưởng thí nghiệm mạch điện và những mục khác.');});
  listen(by(root,'#csv-export'),'click',()=>{
    const blob=new Blob(['\uFEFF'+toCsv(state.rows)],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='physicslab-hooke.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  syncConfig();renderScene();renderNotebook();
  rafId=requestAnimationFrame(tick);
  return ()=>{abort.abort();cancelAnimationFrame(rafId);clearGhost();persist();};
}
