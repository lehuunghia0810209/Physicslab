import '../styles/lab.css';
import { icon } from '../app/icons.js';
import { SPRINGS, createHookeExperiment, toCsv, DEFAULT_HOOKE } from '../core/hooke.js';
import { EQUIPMENT_CATALOG, createHookeWorkspace, getEquipment, readInstrument, measureWithInstrument, sanitizeHookeMeasurements } from '../core/equipment.js';
import { LAB_EXPERIMENTS, defaultLabSetup, getLabExperiment, measureLabExperiment } from '../core/lab-experiments.js';
import { GraphRenderer } from '../engines/graph.js';
import { format } from '../core/units.js';
import { analyzeHookeRows } from '../core/hooke-analysis.js';
import { quantizeParameter, clampSceneValue } from '../core/direct-manipulation.js';
import { calibrateReading, hookeStiffnessUncertainty } from '../core/lab-calibration.js';
import { labSceneMarkup, labDragParameter } from './lab-scenes.js';

export function mount(main, context = {}) {
  const { progress } = context;
  const saved = progress?.get?.().sessions?.['hooke-lab'];
  const persistedSetup = saved?.setup || {};
  const defaultSetup = {
    springId: persistedSetup.springId || DEFAULT_HOOKE.springId,
    mass: Number.isFinite(Number(persistedSetup.mass)) ? Number(persistedSetup.mass) : DEFAULT_HOOKE.mass,
    gravity: Number.isFinite(Number(persistedSetup.gravity)) ? Number(persistedSetup.gravity) : DEFAULT_HOOKE.gravity,
    rulerId: persistedSetup.rulerId || 'ruler-0.1mm',
    forceGaugeId: persistedSetup.forceGaugeId || 'force-sensor-0.01n'
  };
  // A corrupted/partial saved row must never crash renderTable() or renderGraph().
  let rows = sanitizeHookeMeasurements(saved?.measurements, defaultSetup);
  let workspace;
  try {
    workspace = createHookeWorkspace(defaultSetup);
  } catch {
    workspace = createHookeWorkspace({ ...DEFAULT_HOOKE, rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.01n' });
  }
  let current = workspace.experiment;
  const calibration = { forceSteps: Number.isInteger(persistedSetup.forceSteps) ? Math.max(-2, Math.min(2, persistedSetup.forceSteps)) : 0,
    rulerSteps: Number.isInteger(persistedSetup.rulerSteps) ? Math.max(-2, Math.min(2, persistedSetup.rulerSteps)) : 0,
    compensated: persistedSetup.compensated !== 0 };

  function persist() {
    progress?.session?.('hooke-lab', {
      setup: {
        springId: current.springId, mass: current.mass, gravity: current.gravity,
        rulerId: workspace.ruler.id, forceGaugeId: workspace.forceSensor.id,
        forceSteps: calibration.forceSteps, rulerSteps: calibration.rulerSteps, compensated: Number(calibration.compensated)
      },
      measurements: rows
    });
  }
  const savedGenericLab = progress?.get?.().sessions?.['virtual-lab'] || {};
  let activeExperimentId = LAB_EXPERIMENTS.some(item => item.id === savedGenericLab.setup?.experimentId) ? savedGenericLab.setup.experimentId : LAB_EXPERIMENTS[0].id;
  function cleanExperimentSetup(experimentId, values = {}) {
    const setup = defaultLabSetup(experimentId);
    for (const parameter of getLabExperiment(experimentId).parameters) {
      const value = values[parameter.key];
      if (parameter.type === 'select') {
        if (parameter.options.some(option => option.value === value)) setup[parameter.key] = value;
      } else if (Number.isFinite(value)) {
        const bounded = Math.min(parameter.max, Math.max(parameter.min, value));
        const decimals = Math.max(0, (String(parameter.step).split('.')[1] || '').length);
        setup[parameter.key] = Number((parameter.min + Math.round((bounded - parameter.min) / parameter.step) * parameter.step).toFixed(decimals));
      }
    }
    return setup;
  }
  let genericSetup = cleanExperimentSetup(activeExperimentId, savedGenericLab.setup?.parameters);
  let genericInstruments = { ...(savedGenericLab.setup?.instruments || {}) };
  let genericSetups = { [activeExperimentId]: { ...genericSetup } };
  let genericInstrumentSets = { [activeExperimentId]: { ...genericInstruments } };
  let genericRows = Array.isArray(savedGenericLab.measurements)
    ? savedGenericLab.measurements.filter(row => {
      const experiment = LAB_EXPERIMENTS.find(item => item.id === row.experimentId);
      if (!experiment || !Number.isFinite(row.readings?.measuredX) || !Number.isFinite(row.readings?.measuredY)
        || !Number.isFinite(row.uncertainties?.x) || !Number.isFinite(row.uncertainties?.y)) return false;
      try {
        return getEquipment(row.instruments?.xId).type === experiment.instruments[experiment.axisInstruments.x]
          && getEquipment(row.instruments?.yId).type === experiment.instruments[experiment.axisInstruments.y];
      } catch { return false; }
    }).slice(-100)
    : [];
  for (const experiment of LAB_EXPERIMENTS) {
    const savedRows = genericRows.filter(row => row.experimentId === experiment.id);
    const latest = savedRows.at(-1);
    genericSetups[experiment.id] = cleanExperimentSetup(experiment.id, latest?.setup);
    genericInstrumentSets[experiment.id] = {};
    if (latest) {
      genericInstrumentSets[experiment.id][experiment.axisInstruments.x] = latest.instruments.xId;
      genericInstrumentSets[experiment.id][experiment.axisInstruments.y] = latest.instruments.yId;
    }
  }
  if (savedGenericLab.setup?.experimentId === activeExperimentId) {
    genericSetups[activeExperimentId] = cleanExperimentSetup(activeExperimentId, savedGenericLab.setup.parameters);
    genericInstrumentSets[activeExperimentId] = { ...genericInstrumentSets[activeExperimentId], ...genericInstruments };
  }
  genericSetup = genericSetups[activeExperimentId];
  genericInstruments = genericInstrumentSets[activeExperimentId];
  let genericGraph;
  let genericAbort = new AbortController();

  function renderTable() {
    const body = rows.length ? rows.map((row, index) => `<tr><td>${index + 1}</td><td>${SPRINGS.find(item => item.id === row.springId)?.label || 'Dữ liệu cũ'}</td><td>${row.mass.toFixed(3)}</td><td>${row.force.toFixed(3)}</td><td>${row.extension.toFixed(4)}</td><td>${row.springConstant.toFixed(2)}</td><td>±${format(hookeStiffnessUncertainty(row.force,row.extension,getEquipment(row.forceGaugeId).resolution / 2,getEquipment(row.rulerId).resolution / 2).uncertainty,3)}</td><td>${getEquipment(row.rulerId).shortLabel}</td><td>${getEquipment(row.forceGaugeId).shortLabel}</td></tr>`).join('') : '<tr><td colspan="9" class="empty-cell">Chưa có dữ liệu đo nào. Ghi mẫu để bắt đầu.</td></tr>';
    main.querySelector('#hooke-table-body').innerHTML = body;
    main.querySelector('#csv-export').disabled = rows.length === 0;
    main.querySelector('#clear-results').disabled = rows.length === 0;
  }

  function renderGraph() {
    const analysis = analyzeHookeRows(rows, current.springId);
    const points = analysis.points;
    const maxExtension = Math.max(0.2, ...points.map(point => point.extension));
    const maxForce = Math.max(5, ...points.map(point => point.force));
    const coordX = value => 40 + (value / maxExtension) * 430;
    const coordY = value => 220 - (value / maxForce) * 170;
    const dots = points.map(point => `<circle cx="${coordX(point.extension)}" cy="${coordY(point.force)}" r="5" fill="var(--primary)" stroke="var(--surface)" stroke-width="1.5"><title>Δx = ${point.extension} m, F = ${point.force} N</title></circle>`).join('');
    const fit = analysis.fit ? `<line x1="40" y1="220" x2="${coordX(maxExtension)}" y2="${coordY(analysis.fit.stiffness * maxExtension)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 4" />` : '';
    main.querySelector('#hooke-graph').innerHTML = `
      <svg viewBox="0 0 500 260" role="img" aria-label="${points.length} điểm đo lực-giãn dài của ${SPRINGS.find(item => item.id === current.springId)?.label || 'lò xo'}">
        <line x1="40" x2="470" y1="220" y2="220" stroke="currentColor" stroke-opacity="0.55" />
        <line x1="40" x2="40" y1="20" y2="220" stroke="currentColor" stroke-opacity="0.55" />
        ${fit}${dots}<circle cx="40" cy="220" r="4" fill="var(--primary)" />
        <text x="40" y="238" font-size="12" fill="currentColor">0</text>
        <text x="225" y="245" font-size="13" fill="currentColor">Dãn dài Δx (m)</text>
        <text x="18" y="115" font-size="13" transform="rotate(-90 18 115)" fill="currentColor">Lực F (N)</text>
      </svg>`;
    const oldCount = rows.filter(row => !row.springId).length;
    const legacy = oldCount ? ` · ${oldCount} phép đo cũ không rõ lò xo được giữ trong bảng nhưng không dùng để khớp đường.` : '';
    main.querySelector('#graph-summary').textContent = analysis.fit
      ? `Từ ${analysis.fit.count} phép đo của lò xo đang chọn: k đo ≈ ${format(analysis.fit.stiffness,2)} N/m${analysis.fit.rSquared === null ? '' : ` · R² = ${format(analysis.fit.rSquared,3)}`}. k danh định = ${format(current.springConstant,2)} N/m.${legacy}`
      : `Ghi ít nhất hai phép đo có độ dãn khác nhau của cùng lò xo để ước lượng k từ độ dốc đồ thị.${legacy}`;
  }

  function updateSummary() {
    const spring = SPRINGS.find(item => item.id === current.springId) || SPRINGS[1];
    main.querySelector('#spring-name').textContent = spring.label;
    main.querySelector('#spring-constant').textContent = `${spring.constant.toFixed(1)} N/m`;
    main.querySelector('#applied-force').textContent = `${current.force.toFixed(3)} N`;
    main.querySelector('#extension-reading').textContent = `${current.extension.toFixed(4)} m`;
    main.querySelector('#length-reading').textContent = `${current.totalLength.toFixed(4)} m`;
    main.querySelector('#equilibrium-text').textContent = current.equilibrium ? 'Vật cân bằng theo mô hình: F = kΔx.' : 'Không xác định được trạng thái cân bằng.';
    main.querySelector('#mass-select').value = String(current.mass);
    main.querySelector('#spring-select').value = current.springId;
    main.querySelector('#gravity-select').value = String(current.gravity);
    main.querySelector('#ruler-select').value = workspace.ruler.id;
    main.querySelector('#force-sensor-select').value = workspace.forceSensor.id;
    main.querySelector('#equipment-list').innerHTML = workspace.equipment.map(item => `<li><strong>${item.label}</strong>${item.description ? ` · ${item.description}` : ''}</li>`).join('');
    main.querySelector('#instrument-info').textContent = `Độ chia thước: ${workspace.ruler.resolution * 1000} mm · Độ chia lực kế: ${workspace.forceSensor.resolution} N`;
    // Vertical illustration uses a fixed physical reference of 1 metre;
    // extension (from Hooke's model) controls the mass, not a preset animation.
    const extensionHeight = Math.max(10, Math.min(138, current.extension * 138));
    const massY = 60 + extensionHeight;
    const springTop = 44;
    main.querySelector('#hooke-apparatus').innerHTML = `<svg viewBox="0 0 500 310" role="img" aria-label="Giá treo lò xo ${spring.label}, khối lượng ${current.mass} kg, độ dãn ${current.extension.toFixed(3)} m">
      <defs><linearGradient id="hooke-weight-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--blue)"/><stop offset="1" stop-color="var(--primary)"/></linearGradient></defs>
      <path d="M75 26H350M103 26V280M70 280H160" fill="none" stroke="var(--muted)" stroke-width="9" stroke-linecap="round"/>
      <path d="M248 26V${springTop}" fill="none" stroke="var(--muted)" stroke-width="4"/>
      <path d="M248 ${springTop} ${Array.from({length:20},(_,i)=>`L${i%2?262:234} ${springTop+10+(i+1)*(massY-springTop-10)/21}`).join(' ')} L248 ${massY}" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect data-hooke-weight="true" tabindex="0" role="slider" aria-label="Kéo quả nặng để thay đổi khối lượng" aria-valuemin="0.1" aria-valuemax="3" aria-valuenow="${current.mass}" x="204" y="${massY}" width="88" height="56" rx="11" fill="url(#hooke-weight-gradient)" />
      <path d="M214 ${massY+10}h67" stroke="white" opacity=".26" stroke-width="3"/>
      <text x="248" y="${massY+35}" text-anchor="middle" fill="white" font-size="17" font-weight="700" pointer-events="none">${current.mass.toFixed(1)} kg</text>
      <path d="M346 46V260" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/>
      ${Array.from({length:13},(_,i)=>`<path d="M346 ${54+i*16}h${i%2?11:20}" stroke="var(--amber)" stroke-width="2" />`).join('')}
      <path d="M306 ${massY+25}h26" stroke="var(--primary)" stroke-width="2" stroke-dasharray="5 4" />
      <text x="378" y="72" fill="var(--ink)" font-size="16" font-weight="600">Thước</text>
      <text x="378" y="101" fill="var(--muted)" font-size="14">Δx</text>
      <text x="378" y="124" fill="var(--ink)" font-size="19" font-weight="700">${current.extension.toFixed(3)} m</text>
      <text x="248" y="291" text-anchor="middle" fill="var(--muted)" font-size="13">KÉO QUẢ NẶNG ↕</text>
    </svg>`;
    main.querySelector('#equipment-status').textContent = '';
    main.querySelector('#force-zero-offset').value = String(calibration.forceSteps);
    main.querySelector('#ruler-zero-offset').value = String(calibration.rulerSteps);
    main.querySelector('#calibration-compensate').checked = calibration.compensated;
    main.querySelector('#calibration-status').textContent = calibration.compensated
      ? 'Đã bật bù điểm 0: số đọc được hiệu chỉnh trước khi tính k. Độ chia dụng cụ vẫn giới hạn độ chính xác.'
      : 'Chưa bù điểm 0: số đọc có thể lệch giá trị đúng; hãy ghi mẫu rồi bật bù để so sánh.';
    renderGraph();
    renderTable();
  }

  function refreshFromControls() {
    workspace = createHookeWorkspace({
      springId: main.querySelector('#spring-select').value,
      mass: Number(main.querySelector('#mass-select').value),
      gravity: Number(main.querySelector('#gravity-select').value),
      rulerId: main.querySelector('#ruler-select').value,
      forceGaugeId: main.querySelector('#force-sensor-select').value
    });
    current = workspace.experiment;
    updateSummary();
    persist();
  }

  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">PHÒNG THÍ NGHIỆM ẢO</p><h1>Khám phá và thực hành</h1><p>Chọn thí nghiệm, thao tác trên mô hình rồi ghi số đo. Dữ liệu của từng thí nghiệm được lưu riêng.</p></div><span class="version-pill">16 không gian thực hành</span></div>
    <section class="lab-discovery" aria-label="Chọn thí nghiệm"><div class="lab-discovery-head"><strong>Chọn bàn thí nghiệm</strong><span>Chạm một thí nghiệm để bắt đầu</span></div><div class="lab-discovery-grid"><button type="button" class="lab-discovery-card" id="lab-open-hooke" aria-pressed="true"><span class="lab-discovery-icon">♧</span><strong>Lò xo Hooke</strong><small>Kéo quả nặng · Đo độ dãn · Hiệu chuẩn</small></button>${LAB_EXPERIMENTS.map(item=>`<button type="button" class="lab-discovery-card" data-open-lab="${item.id}" aria-pressed="false"><span class="lab-discovery-icon">${({mechanics:'⚙',electricity:'⚡'})[item.category]||'◇'}</span><strong>${item.title}</strong><small>${item.description}</small></button>`).join('')}</div></section>
    <div id="hooke-workspace"><section class="panel"><div class="lab-workspace-header"><h2>Thí nghiệm Hooke: kéo lò xo</h2><p>Kéo quả nặng hoặc chọn khối lượng, đọc số đo thực nghiệm trước khi kết luận.</p></div><div class="header-row"><div><h2>Thiết lập dụng cụ</h2><p>Chọn lò xo, khối lượng, trọng trường và thiết bị đo có độ phân giải cụ thể.</p></div><button class="button secondary" id="reset-lab">Đặt lại</button></div>
      <div class="lab-grid">
        <label class="field"><span>Lò xo</span><select id="spring-select">${SPRINGS.map(s => `<option value="${s.id}">${s.label} · k = ${s.constant} N/m</option>`).join('')}</select></label>
        <label class="field"><span>Khối lượng</span><select id="mass-select">${Array.from({ length: 30 }, (_, i) => {
          const value = (i + 1) * 0.1;
          return `<option value="${value.toFixed(1)}">${value.toFixed(1)} kg</option>`;
        }).join('')}</select></label>
        <label class="field"><span>Trọng trường</span><select id="gravity-select"><option value="1.62">Mặt Trăng · 1.62 m/s²</option><option value="9.81" selected>Trái Đất · 9.81 m/s²</option><option value="3.71">Sao Hỏa · 3.71 m/s²</option></select></label>
        <label class="field"><span>Thước đo độ dãn</span><select id="ruler-select">${EQUIPMENT_CATALOG.filter(item => item.type === 'ruler').map(item => `<option value="${item.id}">${item.label} · độ chia ${(item.resolution * 1000).toLocaleString('vi-VN')} mm</option>`).join('')}</select></label>
        <label class="field"><span>Lực kế</span><select id="force-sensor-select">${EQUIPMENT_CATALOG.filter(item => item.type === 'force-sensor').map(item => `<option value="${item.id}">${item.label}</option>`).join('')}</select></label>
      </div>
      <section class="calibration-workbench" aria-labelledby="calibration-title"><div><h3 id="calibration-title">Hiệu chuẩn dụng cụ đo · Điểm 0</h3><p>Thử tạo sai lệch điểm 0 đã biết để quan sát tác dụng của việc bù sai số. Đây là sai lệch mô phỏng do bạn chọn, không phải nhiễu cảm biến thực.</p></div><div class="calibration-controls"><label class="field">Lực kế lệch điểm 0 <select id="force-zero-offset"><option value="-2">−2 độ chia</option><option value="-1">−1 độ chia</option><option value="0">Không lệch</option><option value="1">+1 độ chia</option><option value="2">+2 độ chia</option></select></label><label class="field">Thước lệch điểm 0 <select id="ruler-zero-offset"><option value="-2">−2 độ chia</option><option value="-1">−1 độ chia</option><option value="0">Không lệch</option><option value="1">+1 độ chia</option><option value="2">+2 độ chia</option></select></label><label class="calibration-toggle"><input id="calibration-compensate" type="checkbox" checked> Bù lệch điểm 0 khi ghi số đo</label></div><p id="calibration-status" role="status" aria-live="polite"></p></section>
      <div class="virtual-lab"><div><h3>Bố trí phòng thí nghiệm</h3><p>Thiết bị được lắp thành một bộ thí nghiệm Hooke có thể cấu hình lại.</p><div id="hooke-apparatus" class="hooke-apparatus"></div><p class="hooke-gesture-hint">Kéo trực tiếp quả nặng lên/xuống để thử thay đổi khối lượng; các phép đo không tự ghi cho đến khi bấm “Ghi kết quả”.</p></div><div class="equipment-inventory"><h3>Bộ dụng cụ đang dùng</h3><ul id="equipment-list"></ul><p id="instrument-info"></p><p id="equipment-status" role="status"></p></div></div>
      <div class="summary-grid">
        <div class="stat-card"><span>Hằng số lò xo</span><strong id="spring-constant">0</strong></div>
        <div class="stat-card"><span>Lực tác dụng</span><strong id="applied-force">0</strong></div>
        <div class="stat-card"><span>Dãn dài</span><strong id="extension-reading">0</strong></div>
        <div class="stat-card"><span>Chiều dài tổng</span><strong id="length-reading">0</strong></div>
      </div>
      <div class="lab-actions"><button class="button primary" id="record-measurement">Ghi kết quả</button><button class="button secondary" id="csv-export" disabled>Xuất CSV</button><button class="button ghost" id="clear-results" disabled>Xóa dữ liệu</button></div>
      <p id="equilibrium-text" class="helper-text">Kết quả sẽ cập nhật theo mô hình đàn hồi tuyến tính.</p>
    </section>
    <section class="panel">
      <h2>Đồ thị lực - giãn dài</h2>
      <div id="hooke-graph" class="graph-canvas"></div>
      <p id="graph-summary" class="helper-text">Sử dụng các số đo mô phỏng để xác định k. u(k) là độ không đảm bảo chuẩn tổng hợp, giả sử sai số làm tròn độc lập và đều trong ± nửa độ chia.</p>
    </section>
    <section class="panel">
      <div class="header-row"><div><h2>Bảng đo</h2><p>Mỗi hàng là một lần đặt khối lượng và đọc dãn dài.</p></div><span class="tag" id="spring-name">Lò xo chuẩn</span></div>
      <div class="table-scroll"><table><thead><tr><th>STT</th><th>Lò xo</th><th>m (kg)</th><th>F (N)</th><th>Δx (m)</th><th>k đo (N/m)</th><th>u(k) (N/m)</th><th>Thước</th><th>Lực kế</th></tr></thead><tbody id="hooke-table-body"></tbody></table></div>
    </section>
    <section class="panel"><h2>Kết luận</h2><p>Trong vùng đàn hồi, lực hồi phục của lò xo tỉ lệ thuận với độ dãn dài: <strong>F = kΔx</strong>. Mỗi lần thay khối lượng sẽ làm thay đổi lực và sự giãn dài, và đồ thị sẽ cho thấy tuyến tính gần đúng trong miền hợp lý.</p></section>
    </div><section class="panel generic-lab" id="lab-generic-workspace" aria-labelledby="generic-lab-title" hidden>
      <div class="header-row"><div><span class="tag">THÍ NGHIỆM THEO CHỦ ĐỀ</span><h2 id="generic-lab-title">Bàn thí nghiệm Vật lý</h2><p>Quan sát hình bố trí, điều chỉnh điều kiện, ghi số đo theo độ chia dụng cụ và rút kết luận.</p></div></div>
      <div class="generic-lab-setup"><label class="field"><span>Thí nghiệm</span><select id="generic-experiment">${LAB_EXPERIMENTS.map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select></label><div id="generic-apparatus" class="generic-apparatus"></div>
        <div id="generic-parameters" class="generic-parameters"></div><div id="generic-instruments" class="generic-instruments"></div></div>
      <p id="generic-lab-status" role="status" aria-live="polite"></p>
      <div class="lab-actions"><button class="button primary" id="generic-capture">Ghi phép đo</button><button class="button secondary" id="generic-export" disabled>Xuất CSV</button><button class="button secondary" id="generic-report" disabled>Tải báo cáo</button><button class="button ghost" id="generic-clear" disabled>Xóa dữ liệu</button></div>
      <div class="generic-lab-graph"><h3 id="generic-graph-title">Đồ thị đo</h3><article id="generic-graph" class="graph-card"></article></div>
      <div class="header-row generic-table-heading"><div><h3>Sổ tay phép đo</h3><p id="generic-table-summary">Chưa ghi phép đo.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>STT</th><th id="generic-x-heading">Đại lượng x</th><th id="generic-y-heading">Đại lượng y</th><th>Độ không đảm bảo x</th><th>Độ không đảm bảo y</th><th>Dụng cụ</th></tr></thead><tbody id="generic-table-body"></tbody></table></div>
    </section>`;

  // A draggable mass keeps the same validated select-based apparatus logic and result recording.
  const apparatus = main.querySelector('#hooke-apparatus');
  let massPointer = null;
  function moveMassFromPointer(event) {
    const diagram = apparatus.querySelector('svg');
    const matrix = diagram?.getScreenCTM(); if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const extension = clampSceneValue((point.y - 60) / 138, 0, 1);
    const estimatedMass = extension * current.springConstant / current.gravity;
    const amount = quantizeParameter(clampSceneValue((estimatedMass - .1) / 2.9,0,1), { min: .1, max: 3, step: .1 });
    main.querySelector('#mass-select').value = String(Number(amount.toFixed(1)));
    refreshFromControls();
  }
  apparatus.addEventListener('keydown',event=>{
    if(!event.target.closest('[data-hooke-weight]')||!['ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    const next=clampSceneValue(Number((current.mass+(event.key==='ArrowDown'?.1:-.1)).toFixed(1)),.1,3);
    main.querySelector('#mass-select').value=String(next);refreshFromControls();apparatus.querySelector('[data-hooke-weight]')?.focus();
  });
  apparatus.addEventListener('pointerdown', event => {
    if (!event.target.closest('[data-hooke-weight]')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    massPointer = event.pointerId;
    apparatus.setPointerCapture?.(event.pointerId);
    moveMassFromPointer(event);
  });
  apparatus.addEventListener('pointermove', event => {
    if (event.pointerId === massPointer) moveMassFromPointer(event);
  });
  const stopMass = event => { if (event.pointerId === massPointer) massPointer = null; };
  apparatus.addEventListener('pointerup', stopMass);
  apparatus.addEventListener('pointercancel', stopMass);
  main.querySelector('#spring-select').addEventListener('change', refreshFromControls);
  main.querySelector('#mass-select').addEventListener('change', refreshFromControls);
  main.querySelector('#gravity-select').addEventListener('change', refreshFromControls);
  main.querySelector('#ruler-select').addEventListener('change', refreshFromControls);
  main.querySelector('#force-sensor-select').addEventListener('change', refreshFromControls);
  for (const id of ['force-zero-offset', 'ruler-zero-offset', 'calibration-compensate']) {
    main.querySelector(`#${id}`).addEventListener('change', () => {
      calibration.forceSteps = Number(main.querySelector('#force-zero-offset').value);
      calibration.rulerSteps = Number(main.querySelector('#ruler-zero-offset').value);
      calibration.compensated = main.querySelector('#calibration-compensate').checked;
      updateSummary(); persist();
    });
  }
  main.querySelector('#reset-lab').addEventListener('click', () => {
    calibration.forceSteps = 0; calibration.rulerSteps = 0; calibration.compensated = true;
    workspace = createHookeWorkspace({ ...DEFAULT_HOOKE, rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.01n' });
    current = workspace.experiment;
    renderTable();
    updateSummary();
    persist();
  });
  main.querySelector('#record-measurement').addEventListener('click', () => {
    try {
    const sample = createHookeExperiment({ springId: current.springId, mass: current.mass, gravity: current.gravity });
    const forceSample = calibrateReading(workspace.forceSensor.id, sample.force, calibration.forceSteps, calibration.compensated);
    const extensionSample = calibrateReading(workspace.ruler.id, sample.extension, calibration.rulerSteps, calibration.compensated);
    const force = forceSample.value;
    const extension = extensionSample.value;
    rows.push({
      mass: sample.mass, force, extension, springId: current.springId,
      springConstant: force / extension,
      rulerId: workspace.ruler.id,
      forceGaugeId: workspace.forceSensor.id
    });
    rows = rows.slice(-12);
    main.querySelector('#equipment-status').textContent = `Đã đo F = ${format(force)} ±${format(forceSample.bound,4)} N; Δx = ${format(extension,5)} ±${format(extensionSample.bound,5)} m. ${calibration.compensated ? 'Đã bù điểm 0.' : 'Chưa bù điểm 0.'}`;
    renderTable();
    renderGraph();
    persist();
    } catch (error) { main.querySelector('#equipment-status').textContent = `Không thể ghi số đo: ${error.message}`; }
  });
  main.querySelector('#clear-results').addEventListener('click', () => {
    rows = [];
    renderTable();
    renderGraph();
    persist();
  });
  main.querySelector('#csv-export').addEventListener('click', () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'physicslab-hooke-law.csv';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  function selectedExperiment() { return getLabExperiment(activeExperimentId); }
  function selectedRows() { return genericRows.filter(row => row.experimentId === activeExperimentId); }
  function persistGenericLab() {
    genericSetups[activeExperimentId] = { ...genericSetup };
    genericInstrumentSets[activeExperimentId] = { ...genericInstruments };
    progress?.session?.('virtual-lab', {
      setup: { experimentId: activeExperimentId, parameters: { ...genericSetup }, instruments: { ...genericInstruments } },
      measurements: genericRows.slice(-100)
    });
  }
  function defaultsForEquipment(type) {
    const defaults = { ruler: 'ruler-0.1mm', 'distance-tape': 'distance-tape-0.01m', 'force-sensor': 'force-sensor-0.01n', ammeter: 'ammeter-0.001a', voltmeter: 'voltmeter-0.01v', 'pressure-sensor': 'pressure-sensor-10pa', 'volume-sensor': 'volume-sensor-0.0001m3', thermometer: 'thermometer-0.1k', 'frequency-counter': 'frequency-counter-0.01hz', accelerometer: 'accelerometer-0.01ms2', 'velocity-sensor': 'velocity-sensor-0.01ms', 'energy-meter': 'energy-meter-0.01j', 'momentum-analyzer': 'momentum-analyzer-0.001kgms', 'magnetic-field-sensor': 'magnetic-field-sensor-0.001t', stopwatch: 'stopwatch-0.01s', balance: 'balance-0.001kg', protractor: 'protractor-1deg' };
    return defaults[type];
  }
  function genericStatus(message = '') {
    const savedCount = selectedRows().length;
    main.querySelector('#generic-lab-status').textContent = message || (savedCount
      ? `Đã khôi phục ${savedCount} phép đo đã lưu cho thí nghiệm này.`
      : 'Dữ liệu thí nghiệm được lưu tự động trên thiết bị này.');
  }
  function setupInstrumentSelectors(experiment) {
    const container = main.querySelector('#generic-instruments');
    container.innerHTML = Object.entries(experiment.instruments).map(([key, type]) => {
      const options = EQUIPMENT_CATALOG.filter(item => item.type === type);
      let selected = genericInstruments[key];
      if (!options.some(option => option.id === selected)) selected = defaultsForEquipment(type);
      genericInstruments[key] = selected;
      const axis = experiment.axisInstruments.x === key ? experiment.xLabel : experiment.axisInstruments.y === key ? experiment.yLabel : key;
      return `<label class="field"><span>Dụng cụ đo ${axis}</span><select data-generic-instrument="${key}">${options.map(item => `<option value="${item.id}">${item.label} · độ chia ${item.resolution} ${item.unit}</option>`).join('')}</select></label>`;
    }).join('');
    for (const select of container.querySelectorAll('[data-generic-instrument]')) select.value = genericInstruments[select.dataset.genericInstrument];
  }
  function drawGenericTable(experiment) {
    const rows = selectedRows();
    main.querySelector('#generic-x-heading').textContent = `${experiment.xLabel} (đã đo)`;
    main.querySelector('#generic-y-heading').textContent = `${experiment.yLabel} (đã đo)`;
    main.querySelector('#generic-table-summary').textContent = rows.length ? `${rows.length} phép đo đã lưu cục bộ · tối thiểu 3 phép đo để hoàn tất báo cáo.` : 'Chưa ghi phép đo.';
    main.querySelector('#generic-table-body').innerHTML = rows.length ? rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.readings.measuredX}</td><td>${row.readings.measuredY}</td><td>±${row.uncertainties.x} ${row.xUnit}</td><td>±${row.uncertainties.y} ${row.yUnit}</td><td>${getEquipment(row.instruments.xId).shortLabel} · ${getEquipment(row.instruments.yId).shortLabel}</td></tr>`).join('') : '<tr><td colspan="6" class="empty-cell">Chưa có phép đo trong thí nghiệm này.</td></tr>';
    const ready = rows.length > 0;
    main.querySelector('#generic-export').disabled = !ready;
    main.querySelector('#generic-report').disabled = rows.length < 2;
    main.querySelector('#generic-clear').disabled = !ready;
    genericGraph.setMeasurements(rows.map(row => ({
      x: row.readings.measuredX, y: row.readings.measuredY,
      xError: row.uncertainties.x, yError: row.uncertainties.y
    })), {
      xLabel: experiment.xLabel, yLabel: experiment.yLabel, xErrorKey: 'xError', yErrorKey: 'yError',
      fit: experiment.fit !== false
    });
  }
  function renderGenericExperiment() {
    const experiment = selectedExperiment();
    main.querySelector('#generic-apparatus').innerHTML = `<h3>${experiment.title}</h3>${labSceneMarkup(experiment,genericSetup)}<details class="lab-apparatus-details"><summary>Thiết bị và mô hình đo</summary><ul>${experiment.apparatus.map(item => `<li>${item}</li>`).join('')}</ul><p>${experiment.description}</p></details>`;
    main.querySelector('#generic-parameters').innerHTML = experiment.parameters.map(parameter => {
      const value = genericSetup[parameter.key] ?? parameter.value;
      if (parameter.type === 'select') return `<label class="field"><span>${parameter.label}</span><select data-generic-parameter="${parameter.key}">${parameter.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}</select></label>`;
      return `<label class="field"><span>${parameter.label} <small>(${parameter.unit})</small></span><input type="range" min="${parameter.min}" max="${parameter.max}" step="${parameter.step}" value="${value}" data-generic-parameter="${parameter.key}" aria-label="${parameter.label}"><strong data-generic-value="${parameter.key}">${format(value)} ${parameter.unit}</strong></label>`;
    }).join('');
    for (const input of main.querySelectorAll('[data-generic-parameter]')) input.value = genericSetup[input.dataset.genericParameter] ?? experiment.parameters.find(item => item.key === input.dataset.genericParameter).value;
    main.querySelector('#generic-graph-title').textContent = `${experiment.yLabel} theo ${experiment.xLabel}`;
    genericGraph = new GraphRenderer(main.querySelector('#generic-graph'), {
      key: 'y', label: `${experiment.yLabel} theo ${experiment.xLabel}`,
      unit: experiment.yLabel, xKey: 'x', xLabel: experiment.xLabel, role: 'blue'
    });
    setupInstrumentSelectors(experiment);
    drawGenericTable(experiment);
    genericStatus();
    main.querySelectorAll('[data-open-lab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.openLab===activeExperimentId && !main.querySelector('#lab-generic-workspace').hidden)));
  }
  const hookeWorkspace = main.querySelector('#hooke-workspace');
  const genericWorkspace = main.querySelector('#lab-generic-workspace');
  const hookeCard = main.querySelector('#lab-open-hooke');
  function showWorkspace(mode) {
    const isHooke = mode === 'hooke';
    hookeWorkspace.hidden = !isHooke;
    genericWorkspace.hidden = isHooke;
    hookeCard.setAttribute('aria-pressed',String(isHooke));
    main.querySelectorAll('[data-open-lab]').forEach(button=>button.setAttribute('aria-pressed',String(!isHooke && button.dataset.openLab===activeExperimentId)));

  }
  hookeCard.addEventListener('click',()=>{showWorkspace('hooke');hookeWorkspace.scrollIntoView({block:'start',behavior:'smooth'});},{signal:genericAbort.signal});
  main.querySelectorAll('[data-open-lab]').forEach(button=>button.addEventListener('click',()=>{
    main.querySelector('#generic-experiment').value = button.dataset.openLab;
    main.querySelector('#generic-experiment').dispatchEvent(new Event('change',{bubbles:true}));
    showWorkspace('generic');
    genericWorkspace.scrollIntoView({block:'start',behavior:'smooth'});
  },{signal:genericAbort.signal}));
  main.querySelector('#generic-experiment').value = activeExperimentId;
  main.querySelector('#generic-experiment').addEventListener('change', event => {
    genericSetups[activeExperimentId] = { ...genericSetup };
    genericInstrumentSets[activeExperimentId] = { ...genericInstruments };
    activeExperimentId = event.target.value;
    genericSetup = genericSetups[activeExperimentId] || { ...defaultLabSetup(activeExperimentId) };
    genericInstruments = genericInstrumentSets[activeExperimentId] || {};
    renderGenericExperiment();
    persistGenericLab();
  }, { signal: genericAbort.signal });
  function updateGenericParameter(event) {
    const key = event.target.dataset.genericParameter;
    if (!key) return;
    genericSetup[key] = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
    const value = main.querySelector(`[data-generic-value="${key}"]`);
    if (value) value.textContent = `${format(genericSetup[key])} ${selectedExperiment().parameters.find(item => item.key === key).unit}`;
    persistGenericLab();
    main.querySelector('#generic-apparatus').querySelector('.lab-figure')?.remove();
    main.querySelector('#generic-apparatus').querySelector('h3')?.insertAdjacentHTML('afterend',labSceneMarkup(selectedExperiment(),genericSetup));
    genericStatus();
  }
  // Scene manipulation is bound to the exact same quantized parameter control.
  const labScene = main.querySelector('#generic-apparatus');
  let activeScenePointer = null;
  function setSceneParameter(clientX) {
    const sceneSvg=labScene.querySelector('svg');
    const param=labDragParameter(selectedExperiment());
    if(!sceneSvg || !param) return;
    const matrix=sceneSvg.getScreenCTM(); if(!matrix) return;
    const point=new DOMPoint(clientX,0).matrixTransform(matrix.inverse());
    const fraction=clampSceneValue((point.x-90)/540,0,1);
    const value=quantizeParameter(fraction,param);
    const input=main.querySelector(`[data-generic-parameter="${param.key}"]`);
    if(input && Number(input.value)!==value){input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));}
  }
  labScene.addEventListener('pointerdown',event=>{
    if(!event.target.closest('[data-lab-drag-handle]'))return;
    if(event.pointerType==='mouse' && event.button!==0)return;
    activeScenePointer=event.pointerId;
    labScene.setPointerCapture?.(event.pointerId);
    setSceneParameter(event.clientX);
  },{signal:genericAbort.signal});
  labScene.addEventListener('pointermove',event=>{if(activeScenePointer===event.pointerId)setSceneParameter(event.clientX);},{signal:genericAbort.signal});
  const endScenePointer=event=>{if(activeScenePointer===event.pointerId)activeScenePointer=null;};
  labScene.addEventListener('pointerup',endScenePointer,{signal:genericAbort.signal});
  labScene.addEventListener('pointercancel',endScenePointer,{signal:genericAbort.signal});
  labScene.addEventListener('keydown',event=>{
    if(!event.target.closest('[data-lab-drag-handle]')|| !['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();
    const param=labDragParameter(selectedExperiment()); if(!param)return;
    const input=main.querySelector(`[data-generic-parameter="${param.key}"]`);
    if(input){input.stepUp(event.key==='ArrowRight'?1:-1);input.dispatchEvent(new Event('input',{bubbles:true}));labScene.querySelector('[data-lab-drag-handle]')?.focus();}
  },{signal:genericAbort.signal});
  main.querySelector('#generic-parameters').addEventListener('input', updateGenericParameter, { signal: genericAbort.signal });
  main.querySelector('#generic-parameters').addEventListener('change', updateGenericParameter, { signal: genericAbort.signal });
  main.querySelector('#generic-instruments').addEventListener('change', event => {
    const key = event.target.dataset.genericInstrument;
    if (!key) return;
    genericInstruments[key] = event.target.value;
    persistGenericLab();
  }, { signal: genericAbort.signal });
  main.querySelector('#generic-capture').addEventListener('click', () => {
    try {
      const experiment = selectedExperiment();
      const result = measureLabExperiment(activeExperimentId, genericSetup);
      const xKey = experiment.axisInstruments.x;
      const yKey = experiment.axisInstruments.y;
      const xInstrumentId = genericInstruments[xKey];
      const yInstrumentId = genericInstruments[yKey];
      const measureAxis = (instrumentId, value) => {
        const reading = measureWithInstrument(instrumentId, Math.abs(value));
        return Object.freeze({ ...reading, value: Math.sign(value) * reading.value });
      };
      const xMeasurement = measureAxis(xInstrumentId, result.x);
      const yMeasurement = measureAxis(yInstrumentId, result.y);
      const readings = { ...result.values, measuredX: xMeasurement.value, measuredY: yMeasurement.value };
      const row = {
        experimentId: activeExperimentId, title: experiment.title, at: Date.now(),
        readings, uncertainties: { x: xMeasurement.uncertainty, y: yMeasurement.uncertainty },
        instruments: { xId: xMeasurement.instrumentId, yId: yMeasurement.instrumentId },
        setup: { ...genericSetup }, xUnit: xMeasurement.unit, yUnit: yMeasurement.unit
      };
      genericRows.push(row);
      genericRows = genericRows.slice(-100);
      drawGenericTable(experiment);
      persistGenericLab();
      if (selectedRows().length === 3 && !progress.get().experiments[`virtual-lab-${activeExperimentId}`]) progress.complete(`virtual-lab-${activeExperimentId}`);
      genericStatus(`Đã ghi ${experiment.title}: ${experiment.xLabel} = ${format(xMeasurement.value)} ± ${format(xMeasurement.uncertainty)} ${xMeasurement.unit}; ${experiment.yLabel} = ${format(yMeasurement.value)} ± ${format(yMeasurement.uncertainty)} ${yMeasurement.unit}.`);
    } catch (error) {
      genericStatus(error.message);
    }
  }, { signal: genericAbort.signal });
  main.querySelector('#generic-clear').addEventListener('click', () => {
    genericRows = genericRows.filter(row => row.experimentId !== activeExperimentId);
    drawGenericTable(selectedExperiment());
    persistGenericLab();
    genericStatus('Các phép đo của thí nghiệm này đã được xóa.');
  }, { signal: genericAbort.signal });
  main.querySelector('#generic-export').addEventListener('click', () => {
    const experiment = selectedExperiment();
    const readingFields = Object.keys(selectedRows()[0]?.readings || {}).filter(key => !['measuredX', 'measuredY'].includes(key));
    const setupFields = experiment.parameters.map(parameter => `setup_${parameter.key}`);
    const fields = ['experimentId', 'measuredX', 'measuredY', 'uncertaintyX', 'uncertaintyY', 'xInstrument', 'yInstrument', ...readingFields, ...setupFields];
    const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [fields.join(','), ...selectedRows().map(row => [
      row.experimentId, row.readings.measuredX, row.readings.measuredY, row.uncertainties.x, row.uncertainties.y,
      row.instruments.xId, row.instruments.yId, ...readingFields.map(key => row.readings[key] ?? ''),
      ...experiment.parameters.map(parameter => row.setup[parameter.key] ?? '')
    ].map(escape).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `physicslab-${experiment.id}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { signal: genericAbort.signal });
  main.querySelector('#generic-report').addEventListener('click', () => {
    const experiment = selectedExperiment();
    const rows = selectedRows();
    const fit = genericGraph.setMeasurements(rows.map(row => ({
      x: row.readings.measuredX, y: row.readings.measuredY, xError: row.uncertainties.x, yError: row.uncertainties.y
    })), {
      xLabel: experiment.xLabel, yLabel: experiment.yLabel,
      xErrorKey: 'xError', yErrorKey: 'yError', fit: experiment.fit !== false
    });
    const report = [
      `PhysicsLab · Báo cáo thí nghiệm`,
      `Thí nghiệm: ${experiment.title}`,
      `Bố trí: ${experiment.apparatus.join(', ')}`,
      `Mô hình: ${experiment.description}`,
      `Điều kiện hiện tại: ${Object.entries(genericSetup).map(([key, value]) => `${key}=${value}`).join('; ')}`,
      `Số phép đo: ${rows.length}`,
      `Hồi quy tuyến tính: ${experiment.fit === false ? 'Không áp dụng cho quan hệ phi tuyến này.' : fit ? `slope=${fit.slope}; intercept=${fit.intercept}; R²=${fit.rSquared}` : 'Chưa đủ hai giá trị x khác nhau.'}`,
      '',
      `${experiment.xLabel},${experiment.yLabel},Δx uncertainty,Δy uncertainty,instruments,setup`,
      ...rows.map(row => `${row.readings.measuredX},${row.readings.measuredY},${row.uncertainties.x},${row.uncertainties.y},${row.instruments.xId}+${row.instruments.yId},"${Object.entries(row.setup).map(([key, value]) => `${key}=${value}`).join('; ')}"`),
      '',
      `Kết luận cần đối chiếu: ${experiment.description}`
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `physicslab-report-${experiment.id}.txt`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { signal: genericAbort.signal });
  renderGenericExperiment();
  persistGenericLab();
  showWorkspace('hooke');

  updateSummary();
  renderTable();
  persist();

  return () => {
    genericAbort.abort();
    progress?.session?.('hooke-lab', {
      setup: { springId: current.springId, mass: current.mass, gravity: current.gravity, rulerId: workspace.ruler.id, forceGaugeId: workspace.forceSensor.id, forceSteps: calibration.forceSteps, rulerSteps: calibration.rulerSteps, compensated: Number(calibration.compensated) },
      measurements: rows
    });
  };
}
