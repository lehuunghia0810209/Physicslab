import './inclined.css';
import { createInclinedPlane, DEFAULT_INCLINED } from '../../core/inclined.js';
import { format } from '../../core/units.js';

export function mount(main, context) {
  const { progress } = context;
  let params = { ...DEFAULT_INCLINED };
  let model = createInclinedPlane(params);
  progress.visit('inclined-plane', 'Khám phá mặt phẳng nghiêng');

  function refreshDisplay() {
    const summary = model;
    main.querySelector('#result-accel').textContent = `${format(summary.acceleration)} m/s²`;
    main.querySelector('#result-force').textContent = `${format(summary.gravityComponent)} N`;
    main.querySelector('#result-normal').textContent = `${format(summary.normal)} N`;
    main.querySelector('#result-friction').textContent = `${format(summary.friction)} N`;
    main.querySelector('#result-state').textContent = summary.moving ? 'Khối trượt xuống dốc' : 'Ở trạng thái cân bằng tĩnh';
    main.querySelector('#result-threshold').textContent = summary.threshold ? 'Ma sát tĩnh đủ lớn để ngăn chuyển động.' : 'Lực xuống dốc vượt ngưỡng ma sát tĩnh.';
    const plane = main.querySelector('#plane-visual');
    const slopeY = 180 - Number(params.angle) * 1.2;
    plane.innerHTML = `
      <svg viewBox="0 0 420 220" aria-label="Mặt phẳng nghiêng">
        <line x1="40" y1="180" x2="355" y2="${slopeY}" stroke="#8dd8c6" stroke-width="8" stroke-linecap="round" />
        <rect x="120" y="120" width="92" height="52" rx="8" fill="#1a7f76" opacity="0.9" transform="rotate(${params.angle * -1} 166 146)" />
        <line x1="170" y1="146" x2="230" y2="146" stroke="#f4cc7b" stroke-width="4" />
        <text x="215" y="135" font-size="13" fill="#dbeae7">mg sinθ</text>
        <text x="90" y="85" font-size="13" fill="#dbeae7">N</text>
      </svg>`;
    const graph = main.querySelector('#sample-graph');
    const points = model.sample().map((entry, index) => {
      const x = 20 + index * 30;
      const y = 160 - ((entry.velocity || 0) / 4) * 120;
      return `${x},${y}`;
    }).join(' ');
    graph.innerHTML = `<svg viewBox="0 0 320 180" aria-label="Đồ thị vận tốc theo thời gian"><polyline points="${points}" fill="none" stroke="#4bb39a" stroke-width="3" /><line x1="20" y1="160" x2="300" y2="160" stroke="currentColor" stroke-opacity="0.6" /><line x1="20" y1="20" x2="20" y2="160" stroke="currentColor" stroke-opacity="0.6" /></svg>`;
  }

  function apply(next) {
    try {
      model = createInclinedPlane(next);
      params = { ...model.parameters };
      for (const key of Object.keys(DEFAULT_INCLINED)) {
        const input = main.querySelector(`#${key}`);
        if (input) input.value = params[key];
      }
      refreshDisplay();
    } catch (error) {
      main.querySelector('#result-state').textContent = error.message;
    }
  }

  main.innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">CƠ HỌC · LỚP 10</p><h1>Mặt phẳng nghiêng</h1><p>Quan sát cách lực thành phần và ma sát xác định gia tốc.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="simulation-layout">
      <section class="simulation-workbench">
        <div class="viewport-panel">
          <div id="plane-visual" class="inclined-visual"></div>
          <div class="measurement-strip">
            <div><span>Gia tốc</span><strong id="result-accel">0</strong><small>m/s²</small></div>
            <div><span>F xuống dốc</span><strong id="result-force">0</strong><small>N</small></div>
            <div><span>Phản lực</span><strong id="result-normal">0</strong><small>N</small></div>
            <div><span>Ma sát</span><strong id="result-friction">0</strong><small>N</small></div>
          </div>
        </div>
      </section>
      <aside class="control-panel">
        <div class="control-heading"><h2>Thiết lập</h2><span>SI</span></div>
        <div class="parameters">
          <div class="parameter"><label for="angle">Góc nghiêng</label><input id="angle" type="range" min="5" max="80" step="1" value="${params.angle}"><span>${params.angle}°</span></div>
          <div class="parameter"><label for="mass">Khối lượng</label><input id="mass" type="range" min="1" max="30" step="0.5" value="${params.mass}"><span>${params.mass} kg</span></div>
          <div class="parameter"><label for="gravity">Gia tốc trọng trường</label><input id="gravity" type="range" min="1" max="25" step="0.1" value="${params.gravity}"><span>${params.gravity} m/s²</span></div>
          <div class="parameter"><label for="mu">Hệ số ma sát</label><input id="mu" type="range" min="0" max="1.2" step="0.05" value="${params.mu}"><span>${params.mu}</span></div>
        </div>
        <button class="button secondary" id="reset">Đặt lại</button>
        <p id="result-state" class="helper-text">Chờ thiết lập</p>
        <p id="result-threshold" class="helper-text">Đánh giá ngưỡng ma sát sẽ hiển thị ở đây.</p>
        <details class="assumptions" open><summary>Giả định vật lý</summary><ul><li>Lực ma sát là ma sát trượt nếu khối bắt đầu trượt.</li><li>Khối vật là chất điểm trên mặt phẳng cố định.</li><li>Bỏ qua lực cản không khí và lực kéo ngoài.</li></ul></details>
      </aside>
    </div>
    <section class="panel">
      <h2>Đồ thị vận tốc theo thời gian</h2>
      <div id="sample-graph" class="graph-canvas"></div>
    </section>
  `;

  for (const key of ['angle', 'mass', 'gravity', 'mu']) {
    const input = main.querySelector(`#${key}`);
    if (!input) continue;
    input.addEventListener('input', () => {
      const next = { ...params, [key]: Number(input.value) };
      params = { ...next };
      apply(next);
    });
  }

  main.querySelector('#reset').addEventListener('click', () => {
    params = { ...DEFAULT_INCLINED };
    apply(params);
  });

  refreshDisplay();
  return () => { progress?.session?.('inclined-plane', { parameters: { ...params } }); };
}
