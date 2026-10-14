import '../styles/circuit-workbench.css';
import { BENCH_PARTS, makeBenchPreset, sanitizeBench, solveBench } from '../core/circuit-workbench.js';

const STORAGE = 'physicslab.circuit-workbench.v1';
const STEP = 10;
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const fmt = (n, digits = 2) => Number.isFinite(n) ? (Math.abs(n) < 0.00001 ? '0' : Number(n.toFixed(digits)).toLocaleString('vi-VN')) : '—';
const snap = n => Math.round(n / STEP) * STEP;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const portOf = (part, side) => {
  const sign = side === 'a' ? -1 : 1;
  return part.rotation === 90 ? { x: part.x, y: part.y + sign * 50, dx: 0, dy: sign } : { x: part.x + sign * 50, y: part.y, dx: sign, dy: 0 };
};
function route(bench, a, b) {
  const [aid, aside] = a.split(':'), [bid, bside] = b.split(':');
  const from = bench.components.find(part => part.id === aid);
  const to = bench.components.find(part => part.id === bid);
  if (!from || !to) return '';
  const x = portOf(from, aside), y = portOf(to, bside);
  const x1 = { x: x.x + x.dx * 24, y: x.y + x.dy * 24 };
  const y1 = { x: y.x + y.dx * 24, y: y.y + y.dy * 24 };
  const middle = (x.dx !== 0 && y.dy !== 0) ? { x: y1.x, y: x1.y }
    : (x.dy !== 0 && y.dx !== 0) ? { x: x1.x, y: y1.y }
      : (x.dx !== 0 ? { x: (x1.x + y1.x) / 2, y: x1.y } : { x: x1.x, y: (x1.y + y1.y) / 2 });
  const points = [x, x1, middle];
  if (x.dx !== 0 && y.dx !== 0) points.push({ x: middle.x, y: y1.y });
  if (x.dy !== 0 && y.dy !== 0) points.push({ x: y1.x, y: middle.y });
  points.push(y1, y);
  return points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

const idSafe = name => `cwb-${name}`;
function symbol(part, solved) {
  const curr = Math.abs(solved.currents[part.id] || 0);
  const power = solved.powers[part.id] || 0;
  const lum = part.type === 'bulb' ? clamp(power / 3.5, 0, 1) : 0;
  const lit = lum > .015;
  const lead = '<path d="M-50 0H-28 M28 0H50" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>';
  const body = {
    battery: `${lead}<rect x="-30" y="-26" width="60" height="52" rx="12" class="cwb-device cwb-battery"/><path d="M-8 -14v28 M-17 0H1" class="cwb-sign-plus"/><path d="M12 0h10" class="cwb-sign-minus"/>`,
    bulb: `${lead}<circle r="30" fill="${lit ? '#ffde75' : 'var(--cwb-fill)'}" stroke="${lit ? '#f6ac36' : 'var(--cwb-stroke)'}" stroke-width="4"/><circle r="${34 + lum * 18}" fill="#f6bf48" opacity="${lum * .18}"/><path d="M-15 -15L15 15M15 -15L-15 15" stroke="${lit ? '#a65608' : 'var(--cwb-stroke)'}" stroke-width="3" stroke-linecap="round"/>`,
    resistor: `${lead}<rect x="-30" y="-20" width="60" height="40" rx="10" class="cwb-device cwb-resistor"/><path d="M-20 0L-12 -9L-4 9L4 -9L12 9L20 0" fill="none" stroke="var(--cwb-stroke)" stroke-width="3" stroke-linejoin="round"/>`,
    switch: `<path d="M-50 0H-22 M22 0H50" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="-22" r="7" class="cwb-switch-tip"/><circle cx="22" r="7" class="cwb-switch-tip"/><path d="M-22 0 L18 ${part.closed ? 0 : -22}" fill="none" stroke="${part.closed ? '#18ad81' : '#f4a35a'}" stroke-width="7" stroke-linecap="round"/><circle cx="-22" r="4" fill="var(--cwb-fill)"/>`,
    ammeter: `${lead}<circle r="31" class="cwb-device cwb-meter"/><text text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="var(--cwb-stroke)">A</text>`,
    voltmeter: `${lead}<circle r="31" class="cwb-device cwb-meter"/><text text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="var(--cwb-stroke)">V</text>`
  }[part.type];
  const vertical = part.rotation === 90;
  const annotation = part.type === 'battery' ? `${fmt(part.value, 1)} V`
    : part.type === 'resistor' || part.type === 'bulb' ? `${fmt(part.value, 1)} Ω`
      : part.type === 'switch' ? (part.closed ? 'Đã đóng' : 'Đang mở')
        : part.type === 'ammeter' ? `${fmt(curr * 1000, 2)} mA`
          : `${fmt(Math.abs(solved.voltages[part.id]), 2)} V`;
  return `<g class="cwb-part" data-id="${esc(part.id)}" transform="translate(${part.x},${part.y})">
    <g transform="rotate(${part.rotation})">${body}<rect data-move-part="${esc(part.id)}" x="-31" y="-34" width="62" height="68" rx="14" fill="transparent" stroke="none"/>
      ${['a', 'b'].map((side, i) => `<circle class="cwb-port-hit" data-terminal="${esc(part.id)}:${side}" cx="${i ? 50 : -50}" cy="0" r="24" tabindex="0" role="button" aria-label="Cực ${side === 'a' ? '1' : '2'} của ${BENCH_PARTS[part.type].label}"/><circle class="cwb-port" cx="${i ? 50 : -50}" cy="0" r="12" pointer-events="none"/><circle cx="${i ? 50 : -50}" cy="0" r="4" pointer-events="none" fill="var(--cwb-stroke)"/>`).join('')}
    </g><text x="${vertical ? -65 : 0}" y="${vertical ? -9 : part.type === 'bulb' ? -50 : -47}" text-anchor="${vertical ? 'end' : 'middle'}" class="cwb-part-name">${BENCH_PARTS[part.type].label}</text><text x="${vertical ? -65 : 0}" y="${vertical ? 13 : part.type === 'bulb' ? 59 : 52}" text-anchor="${vertical ? 'end' : 'middle'}" class="cwb-part-number">${annotation}</text></g>`;
}

/** Mount an independent workbench without destroying existing lab sessions. */
export function mountCircuitWorkbench(host, options = {}) {
  if (!host) return () => {};
  let store = null;
  try { store = JSON.parse(localStorage.getItem(STORAGE) || 'null'); } catch { /* unavailable */ }
  let bench = sanitizeBench(store?.bench || makeBenchPreset());
  let samples = Array.isArray(store?.samples) ? store.samples.filter(row => Number.isFinite(row?.current) && Number.isFinite(row?.voltage)).slice(-30) : [];
  let selected = null, pending = null, play = true, counter = 1, gesture = null;
  const controller = new AbortController();
  const signal = controller.signal;
  host.innerHTML = `<section class="cwb" aria-label="Bàn lắp mạch điện tương tác">
    <header class="cwb-heading"><div><span class="cwb-eyebrow">VIRTUAL LAB / ĐIỆN HỌC</span><h2>Hãy tự lắp một mạch điện.</h2><p>Chọn linh kiện, đặt lên bàn, <strong>chạm hai đầu nối</strong> để kéo dây. Mạch sáng lên khi bạn lắp đúng.</p></div><span class="cwb-chip">DC · Mô hình lí tưởng</span></header>
    <div class="cwb-templates" role="group" aria-label="Bài thực hành mẫu"><span>Bắt đầu với:</span><button id="cwb-preset-series" data-preset="series" aria-pressed="true">● Mạch nối tiếp</button><button id="cwb-preset-parallel" data-preset="parallel" aria-pressed="false">◎ Mạch song song</button><button id="cwb-preset-empty" data-preset="empty" aria-pressed="false">＋ Bàn trống</button></div>
    <div class="cwb-layout">
      <div class="cwb-main">
        <div class="cwb-toolbox" aria-label="Khay dụng cụ">
          <span class="cwb-tool-title">Khay dụng cụ <small>Chạm để thêm · Hoặc kéo vào bàn</small></span>
          ${Object.entries(BENCH_PARTS).map(([key, item]) => `<button type="button" data-add-part="${key}" draggable="true" class="cwb-tool"><span class="cwb-tool-icon">${item.icon}</span><span>${item.label}</span><span aria-hidden="true" class="cwb-plus">+</span></button>`).join('')}
        </div>
        <div class="cwb-stage-head"><span><span class="cwb-live-dot"></span> BÀN THỰC HÀNH</span><div><button type="button" data-play>Ⅱ Dừng hiệu ứng</button><button type="button" data-clear-wires>Xóa dây</button><button type="button" data-fit>Đặt lại mẫu</button></div></div>
        <div class="cwb-stage-shell"><svg id="cwb-stage" viewBox="0 0 1000 560" role="group" aria-label="Bàn thực hành. Di chuyển linh kiện bằng chuột; chạm hai đầu tròn để nối dây; Tab để chọn đầu nối bằng bàn phím." tabindex="0"><defs><pattern id="cwb-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="var(--cwb-grid)"/></pattern></defs><rect width="1000" height="560" fill="url(#cwb-dots)" data-stage-bg/><g id="cwb-wire-layer"></g><g id="cwb-part-layer"></g><g id="cwb-hint-layer"></g></svg>
          <div class="cwb-stage-tooltip" id="cwb-connect-tip">Chạm một đầu nối tròn để bắt đầu kéo dây.</div></div>
        <div class="cwb-status" id="cwb-status" role="status" aria-live="polite"></div>
        <div class="cwb-meter-strip"><div><small>DÒNG ĐIỆN TỪ NGUỒN</small><strong id="cwb-current">0,00 <em>A</em></strong></div><div><small>CÔNG SUẤT NGUỒN CẤP</small><strong id="cwb-power">0,00 <em>W</em></strong></div><div><small>LINH KIỆN</small><strong id="cwb-count">0</strong></div></div>
      </div>
      <aside class="cwb-side"><section class="cwb-inspector"><h3>🔎 Xem & thao tác</h3><div id="cwb-inspector-body"><p>Chạm vào một linh kiện hoặc dây nối để chỉnh sửa và xem số đo.</p></div></section><section class="cwb-challenge"><span class="cwb-eyebrow">HỌC QUA KHÁM PHÁ</span><h3>Tự kiểm tra</h3><ol><li>Đóng/ngắt công tắc: bóng đèn thay đổi thế nào?</li><li>Thử lắp hai bóng <strong>song song</strong>. Dòng nguồn có tăng không?</li><li>Thêm ampe kế <strong>nối tiếp</strong> hoặc vôn kế <strong>song song</strong> với bóng đèn.</li></ol><details><summary>Tại sao bóng đèn sáng?</summary><p>Dòng điện chạy qua điện trở của dây tóc và biến điện năng thành nhiệt, ánh sáng. Trong mô hình DC, công suất bóng đèn P = I²R. Hiệu ứng sáng chỉ minh họa định tính.</p></details></section></aside>
    </div>
    <section class="cwb-record"><div><h3>📒 Sổ tay quan sát</h3><p>Ghi dòng điện, điện áp và công suất của mạch bạn tự lắp. Các phép đo không tự ghi.</p></div><div class="cwb-record-actions"><button type="button" data-record class="button primary">＋ Ghi phép đo</button><button type="button" data-export class="button secondary">Xuất CSV</button><button type="button" data-clear-record class="button ghost">Xóa sổ</button></div><div class="cwb-scroll"><table><thead><tr><th>STT</th><th>Thời điểm</th><th>Trạng thái</th><th>U nguồn (V)</th><th>I nguồn (A)</th><th>P nguồn (W)</th></tr></thead><tbody id="cwb-record-body"></tbody></table></div></section>
    <p class="cwb-disclaimer">Mô hình mạch điện một chiều dùng định luật Ohm và Kirchhoff, dây dẫn/công tắc đóng là lí tưởng. Ampe kế có điện trở trong 0,02 Ω; vôn kế 10 MΩ. Không mô phỏng quá dòng, nhiệt độ thực, điện trở dây hoặc đặc tuyến phi tuyến của bóng đèn.</p>
  </section>`;
  const $ = selector => host.querySelector(selector);
  const stage = $('#cwb-stage');
  const persist = () => { try { localStorage.setItem(STORAGE, JSON.stringify({ bench, samples })); } catch { /* quota/privacy */ } };
  const issueId = prefix => { let id; do { id = `${prefix}${counter++}`; } while (bench.components.some(p => p.id === id) || bench.wires.some(w => w.id === id)); return id; };
  const result = () => solveBench(bench);
  function renderSamples() {
    $('#cwb-record-body').innerHTML = samples.length ? samples.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.time)}</td><td>${esc(s.status)}</td><td>${fmt(s.voltage, 2)}</td><td>${fmt(s.current, 4)}</td><td>${fmt(s.power, 2)}</td></tr>`).join('') : '<tr><td colspan="6">Chưa ghi phép đo. Hãy thử đóng công tắc rồi ghi một lần!</td></tr>';
    $('[data-export]').disabled = $('[data-clear-record]').disabled = !samples.length;
  }
  function renderInspector(solved) {
    const body = $('#cwb-inspector-body');
    if (!selected) { body.innerHTML = '<div class="cwb-nothing"><span>👆</span><p>Chọn một linh kiện để chỉnh giá trị hoặc chọn dây để tháo.</p></div>'; return; }
    if (selected.startsWith('wire:')) {
      const item = bench.wires.find(w => `wire:${w.id}` === selected);
      if (!item) { selected = null; renderInspector(solved); return; }
      body.innerHTML = `<span class="cwb-selected-type">DÂY DẪN</span><h4>Đường nối ${esc(item.id)}</h4><p>Đang nối ${esc(item.a)} đến ${esc(item.b)}.</p><button class="button secondary cwb-danger" data-remove="${esc(item.id)}">✕ Tháo dây này</button>`;
      return;
    }
    const part = bench.components.find(p => p.id === selected);
    if (!part) { selected = null; renderInspector(solved); return; }
    const meta = BENCH_PARTS[part.type];
    const changeable = meta.min !== undefined;
    const current = solved.currents[part.id] || 0;
    const voltage = solved.voltages[part.id] || 0;
    body.innerHTML = `<span class="cwb-selected-type">${meta.icon} LINH KIỆN ĐANG CHỌN</span><h4>${meta.label}</h4>
      ${part.type === 'switch' ? `<button type="button" class="button primary cwb-wide" data-toggle>${part.closed ? '⏼ Ngắt công tắc' : '⏼ Đóng công tắc'}</button>` : ''}
      ${changeable ? `<label class="cwb-value-field"><span>${part.type === 'battery' ? 'Điện áp nguồn' : 'Giá trị điện trở'}</span><span><input type="number" id="cwb-value" min="${meta.min}" max="${meta.max}" step="${part.type === 'battery' ? .5 : 1}" value="${part.value}"><b>${meta.unit}</b></span></label>` : ''}
      <div class="cwb-part-readings"><div><small>ĐIỆN ÁP</small><strong>${fmt(Math.abs(voltage), 3)} V</strong></div><div><small>DÒNG ĐIỆN</small><strong>${fmt(Math.abs(current), 4)} A</strong></div>${part.type === 'bulb' || part.type === 'resistor' ? `<div><small>CÔNG SUẤT</small><strong>${fmt(solved.powers[part.id], 3)} W</strong></div>` : ''}</div>
      <div class="cwb-inspector-buttons"><button class="button secondary" data-rotate>↻ Xoay 90°</button><button class="button ghost cwb-danger" data-remove="${esc(part.id)}">✕ Bỏ linh kiện</button></div>
      <small class="cwb-spotlight">Đặt đồng hồ đúng vị trí trong mạch để đo. Đồng hồ chưa nối dây không có giá trị đo.</small>`;
  }
  function renderStage(solved) {
    const wireLayer = $('#cwb-wire-layer');
    const partLayer = $('#cwb-part-layer');
    wireLayer.innerHTML = bench.wires.map(w => {
      const path = route(bench, w.a, w.b); const c = solved.wireCurrents[w.id] || 0;
      const isActive = solved.status === 'running' && Math.abs(c) > 1e-6;
      const duration = clamp(3 / Math.sqrt(Math.abs(c) + .05), 1.2, 5.5);
      const reversed = c < 0;
      return `<g data-wire="${esc(w.id)}" class="cwb-wire ${selected === `wire:${w.id}` ? 'is-selected' : ''}"><path d="${path}" class="cwb-wire-hit"/><path id="${idSafe(w.id)}" d="${path}" class="cwb-wire-body ${isActive ? 'is-live' : ''}"/>
        ${isActive && play ? [0, .4, .8].map(offset => `<circle r="4" class="cwb-electron"><animateMotion dur="${duration.toFixed(2)}s" begin="-${(offset * duration).toFixed(2)}s" repeatCount="indefinite" keyPoints="${reversed ? '1;0' : '0;1'}" keyTimes="0;1" calcMode="linear"><mpath href="#${idSafe(w.id)}"/></animateMotion></circle>`).join('') : ''}</g>`;
    }).join('');
    partLayer.innerHTML = bench.components.map(p => `<g class="${selected === p.id ? 'is-selected' : ''}">${symbol(p, solved)}</g>`).join('');
    const pendingTip = pending ? `Đã chọn đầu ${pending}. Chạm một đầu nối khác để nối dây. <button type="button" data-cancel-wire>Hủy</button>` : 'Chạm đầu nối tròn hoặc kéo từ đầu này sang đầu kia để nối dây.';
    $('#cwb-connect-tip').innerHTML = pendingTip;
    stage.classList.toggle('is-wiring', Boolean(pending));
    $('#cwb-hint-layer').innerHTML = pending && !gesture ? (() => { const [id, side] = pending.split(':'); const p = bench.components.find(item => item.id === id); if (!p) return ''; const xy = portOf(p, side); return `<circle cx="${xy.x}" cy="${xy.y}" r="19" class="cwb-pending-halo"/>`; })() : '';
  }
  function render() {
    const solved = result();
    renderStage(solved);
    renderInspector(solved);
    const status = $('#cwb-status');
    status.dataset.mode = solved.status;
    status.innerHTML = `<span class="cwb-state-mark" aria-hidden="true">${solved.status === 'running' ? '✓' : solved.status === 'short' || solved.status === 'conflict' ? '!' : '○'}</span><span>${esc(solved.message)}</span>`;
    $('#cwb-current').innerHTML = `${fmt(solved.totalCurrent, 3)} <em>A</em>`;
    $('#cwb-power').innerHTML = `${fmt(solved.totalPower, 2)} <em>W</em>`;
    $('#cwb-count').textContent = String(bench.components.length);
    $('[data-play]').textContent = play ? 'Ⅱ Dừng hiệu ứng' : '▶ Chạy hiệu ứng';
    options.onState?.({
      bench: structuredClone(bench), samples: structuredClone(samples), playing: play,
      measurements: { status: solved.status, message: solved.message, totalCurrent: solved.totalCurrent, totalPower: solved.totalPower,
        currents: { ...solved.currents }, voltages: { ...solved.voltages }, powers: { ...solved.powers } }
    });
  }
  function commit() { bench = sanitizeBench(bench); persist(); render(); }
  function connect(a, b) {
    pending = null;
    if (a === b) return render();
    const duplicate = bench.wires.find(w => [w.a, w.b].sort().join('|') === [a, b].sort().join('|'));
    if (duplicate) { selected = `wire:${duplicate.id}`; return render(); }
    if (bench.wires.length >= 96) return;
    bench.wires.push({ id: issueId('w'), a, b }); selected = `wire:${bench.wires.at(-1).id}`; commit();
  }
  function choosePort(port) {
    if (!pending) {
      pending = port; selected = null; render();
      // Keep focus after SVG regeneration so keyboard users can Tab to the second terminal.
      stage.querySelector(`[data-terminal="${port}"]`)?.focus();
    } else connect(pending, port);
  }
  function addPart(type, coords) {
    const meta = BENCH_PARTS[type]; if (!meta || bench.components.length >= 32) return;
    const sequence = bench.components.length;
    const x = clamp(snap(coords?.x ?? (245 + (sequence % 4) * 195)), 65, 930);
    const y = clamp(snap(coords?.y ?? (225 + Math.floor(sequence / 4) * 130)), 70, 490);
    const part = { id: issueId('part'), type, x, y, rotation: 0, value: meta.defaultValue, closed: type === 'switch' };
    bench.components.push(part); selected = part.id; pending = null; commit();
  }
  function coordinates(event) {
    const ctm = stage.getScreenCTM();
    if (!ctm) return { x: 500, y: 280 };
    const pos = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: pos.x, y: pos.y };
  }
  function reset(name) {
    bench = makeBenchPreset(name); selected = pending = null; play = true;
    host.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.preset === name)));
    commit();
  }
  function targetPart(event) { return event.target.closest('[data-move-part]')?.dataset.movePart; }
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const port = event.target.closest('[data-terminal]')?.dataset.terminal;
    const part = targetPart(event);
    if (port) gesture = { mode: 'wire', pointer: event.pointerId, from: port, started: coordinates(event), moved: false };
    else if (part) {
      const item = bench.components.find(p => p.id === part);
      gesture = { mode: 'part', pointer: event.pointerId, id: part, started: coordinates(event), x: item.x, y: item.y, moved: false };
    } else return;
    event.preventDefault(); stage.setPointerCapture(event.pointerId);
  }, { signal });
  stage.addEventListener('pointermove', event => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const xy = coordinates(event);
    const dx = xy.x - gesture.started.x, dy = xy.y - gesture.started.y;
    if (Math.hypot(dx, dy) > 8) gesture.moved = true;
    if (gesture.mode === 'part' && gesture.moved) {
      const item = bench.components.find(p => p.id === gesture.id);
      if (!item) return;
      item.x = clamp(snap(gesture.x + dx), 65, 930);
      item.y = clamp(snap(gesture.y + dy), 70, 490);
      // Repaint only SVG, to preserve the edit-field focus/selection in the inspector.
      renderStage(result());
    }
    if (gesture.mode === 'wire' && gesture.moved) {
      const [id, side] = gesture.from.split(':'); const part = bench.components.find(p => p.id === id);
      if (!part) return;
      const pos = portOf(part, side);
      $('#cwb-hint-layer').innerHTML = `<path d="M${pos.x} ${pos.y} L${xy.x.toFixed(1)} ${xy.y.toFixed(1)}" class="cwb-draft-wire"/><circle cx="${pos.x}" cy="${pos.y}" r="18" class="cwb-pending-halo"/>`;
    }
  }, { signal });
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const g = gesture; gesture = null;
    const under = document.elementFromPoint(event.clientX, event.clientY);
    const hitPort = under?.closest('[data-terminal]')?.dataset.terminal;
    if (g.mode === 'wire') {
      if (g.moved && hitPort && hitPort !== g.from) connect(g.from, hitPort);
      else if (pending && pending !== g.from) connect(pending, g.from);
      else { pending = g.from; selected = null; render(); }
    } else {
      selected = g.id;
      if (!g.moved) { const item = bench.components.find(p => p.id === g.id); if (item?.type === 'switch') item.closed = !item.closed; }
      commit();
    }
  }, { signal });
  stage.addEventListener('pointercancel', () => { gesture = null; render(); }, { signal });
  stage.addEventListener('keydown', event => {
    const port = event.target.closest('[data-terminal]')?.dataset.terminal;
    if (port && ['Enter', ' '].includes(event.key)) { event.preventDefault(); choosePort(port); }
    if (event.key === 'Escape' && pending) { pending = null; render(); }
  }, { signal });
  stage.addEventListener('click', event => {
    if (event.target.closest('[data-wire]') && !event.target.closest('[data-terminal]')) {
      selected = `wire:${event.target.closest('[data-wire]').dataset.wire}`; pending = null; render();
    }
    else if (event.target.hasAttribute('data-stage-bg')) { selected = pending = null; render(); }
  }, { signal });
  stage.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('text/physicslab-component')) event.preventDefault(); }, { signal });
  stage.addEventListener('drop', event => {
    const type = event.dataTransfer?.getData('text/physicslab-component');
    if (Object.hasOwn(BENCH_PARTS, type)) { event.preventDefault(); addPart(type, coordinates(event)); }
  }, { signal });
  host.addEventListener('dragstart', event => {
    const button = event.target.closest('[data-add-part]'); if (!button || !event.dataTransfer) return;
    event.dataTransfer.setData('text/physicslab-component', button.dataset.addPart);
    event.dataTransfer.effectAllowed = 'copy';
  }, { signal });
  host.addEventListener('click', event => {
    const add = event.target.closest('[data-add-part]'); if (add) return addPart(add.dataset.addPart);
    const preset = event.target.closest('[data-preset]'); if (preset) return reset(preset.dataset.preset);
    if (event.target.closest('[data-play]')) { play = !play; return render(); }
    if (event.target.closest('[data-clear-wires]')) { bench.wires = []; selected = pending = null; return commit(); }
    if (event.target.closest('[data-fit]')) return reset('series');
    if (event.target.closest('[data-cancel-wire]')) { pending = null; return render(); }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      const id = remove.dataset.remove;
      bench.components = bench.components.filter(item => item.id !== id);
      bench.wires = bench.wires.filter(w => w.id !== id && !w.a.startsWith(`${id}:`) && !w.b.startsWith(`${id}:`));
      selected = pending = null; return commit();
    }
    if (event.target.closest('[data-toggle]')) { const item = bench.components.find(p => p.id === selected); if (item?.type === 'switch') { item.closed = !item.closed; commit(); } return; }
    if (event.target.closest('[data-rotate]')) { const item = bench.components.find(p => p.id === selected); if (item) { item.rotation = item.rotation === 90 ? 0 : 90; commit(); } return; }
    if (event.target.closest('[data-record]')) {
      const solved = result(); const source = bench.components.find(item => item.type === 'battery');
      samples.push({ time: new Date().toLocaleTimeString('vi-VN'), status: solved.status === 'running' ? 'Kín' : solved.status === 'open' ? 'Hở' : solved.status === 'short' ? 'Đoản mạch' : solved.status === 'conflict' ? 'Lỗi' : 'Chưa có nguồn',
        voltage: source?.value || 0, current: solved.totalCurrent, power: solved.totalPower });
      samples = samples.slice(-30); persist(); renderSamples(); options.onRecord?.(structuredClone(samples.at(-1))); return;
    }
    if (event.target.closest('[data-clear-record]')) { samples = []; persist(); renderSamples(); return; }
    if (event.target.closest('[data-export]')) {
      if (!samples.length) return;
      const csv = '\uFEFFSTT,Thời gian,Trạng thái,U nguồn (V),I nguồn (A),P nguồn (W)\r\n' + samples.map((s, i) => [i + 1, s.time, s.status, s.voltage, s.current, s.power].map(x => `"${String(x).replaceAll('"', '""')}"`).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'physicslab-lap-mach-dien.csv'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }, { signal });
  host.addEventListener('change', event => {
    if (event.target.id !== 'cwb-value') return;
    const item = bench.components.find(part => part.id === selected);
    if (!item) return;
    const meta = BENCH_PARTS[item.type]; const number = Number(event.target.value);
    if (!Number.isFinite(number) || meta.min === undefined) return render();
    item.value = clamp(number, meta.min, meta.max); commit();
  }, { signal });
  // Keyboard Delete/Backspace only removes the focused SVG item, not while typing a value.
  stage.addEventListener('keydown', event => {
    if (!['Delete', 'Backspace'].includes(event.key) || !selected) return;
    event.preventDefault();
    const id = selected.replace(/^wire:/, '');
    bench.components = bench.components.filter(item => item.id !== id);
    bench.wires = bench.wires.filter(w => w.id !== id && !w.a.startsWith(`${id}:`) && !w.b.startsWith(`${id}:`));
    selected = pending = null; commit();
  }, { signal });
  renderSamples(); render();
  return () => { controller.abort(); };
}
