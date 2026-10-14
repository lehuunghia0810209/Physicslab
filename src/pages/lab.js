import '../styles/lab.css';
import { icon } from '../app/icons.js';
import { EQUIPMENT_CATALOG, getEquipment, measureWithInstrument } from '../core/equipment.js';
import { LAB_EXPERIMENTS, defaultLabSetup, getLabExperiment, measureLabExperiment } from '../core/lab-experiments.js';
import { GraphRenderer } from '../engines/graph.js';
import { format } from '../core/units.js';
import { labPreviewMarkup } from './lab-scenes.js';
import { mountLabLiveStage } from './lab-live-stage.js';
import { mountLab16Workbench } from './lab-16-workbench.js';
import { LAB16_IDS } from '../core/lab-16-physics.js';
import { installLabDiscovery } from './lab-discovery.js';
import '../styles/remake-studio.css';
import { mountCircuitWorkbench } from './circuit-workbench.js';
import { mountHookeWorkbench } from './hooke-workbench.js';
import { mountLabNotebook } from './lab-notebook.js';
import { mount as mountGasWorkbench } from '../simulations/thermal/index.js';
import { mountAdvancedLab } from './advanced-labs.js';
import { labGrade } from '../data/thpt-program.js';

const DEDICATED_LAB_IDS = new Set(['hooke-law', 'ohms-law', 'gas-law']);
const GENERIC_EXPERIMENTS = LAB_EXPERIMENTS.filter(experiment => !DEDICATED_LAB_IDS.has(experiment.id));

export function mount(main, context = {}) {
  const { progress } = context;
  const savedGenericLab = progress?.get?.().sessions?.['virtual-lab'] || {};
  let activeExperimentId = GENERIC_EXPERIMENTS.some(item => item.id === savedGenericLab.setup?.experimentId) ? savedGenericLab.setup.experimentId : GENERIC_EXPERIMENTS[0].id;
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
    if (experimentId === 'friction') setup.kineticCoefficient = Math.min(setup.kineticCoefficient, setup.staticCoefficient);
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
  let liveStage = null;
  let genericAbort = new AbortController();

  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">PHÒNG THÍ NGHIỆM ẢO</p><h1>Khám phá và thực hành</h1><p>Chọn thí nghiệm, thao tác trên mô hình rồi ghi số đo. Dữ liệu của từng thí nghiệm được lưu riêng.</p></div><span class="version-pill">PHYSICSLAB 2.4 · VIRTUAL LAB 3.0</span></div>
    <section class="lab-discovery" aria-label="Chọn thí nghiệm"><div class="lab-discovery-head"><strong>Chọn bàn thí nghiệm</strong><span>Chạm một thí nghiệm để bắt đầu</span></div><div class="lab-discovery-grid"><button type="button" class="lab-discovery-card" id="lab-open-circuit" aria-pressed="true"><span class="lab-discovery-icon">🔌</span><strong>Lắp mạch điện tương tác</strong><small>Lắp linh kiện · Nối dây · Đo dòng điện</small></button><button type="button" class="lab-discovery-card" id="lab-open-hooke" aria-pressed="false"><span class="lab-discovery-icon">🪀</span><strong>Lò xo Hooke</strong><small>Treo quả cân · Quan sát dao động · Đo lực</small></button><button type="button" class="lab-discovery-card" id="lab-open-gas" aria-pressed="false"><span class="lab-card-preview gas-lab-preview" aria-hidden="true"><svg viewBox="0 0 240 90"><rect x="26" y="14" width="188" height="62" rx="12" fill="none" stroke="#66cfbf" stroke-width="3"/><g fill="#e9a34f"><circle cx="46" cy="27" r="4"/><circle cx="75" cy="42" r="4"/><circle cx="49" cy="61" r="4"/><circle cx="109" cy="37" r="4"/><circle cx="94" cy="61" r="4"/><circle cx="135" cy="26" r="4"/><circle cx="119" cy="65" r="4"/></g><rect x="155" y="14" width="12" height="62" rx="3" fill="#66cfbf"/><path d="M168 44h46" stroke="#66cfbf" stroke-width="5"/></svg></span><strong>Bình khí & piston</strong><small>Bơm khí · Gia nhiệt · Kéo piston · Đo áp suất</small></button>${GENERIC_EXPERIMENTS.map(item=>`<button type="button" class="lab-discovery-card" data-open-lab="${item.id}" aria-pressed="false"><span class="lab-discovery-icon">${({mechanics:'⚙',electricity:'⚡'})[item.category]||'◇'}</span><strong>${item.title}</strong><small>${item.description}</small></button>`).join('')}</div></section>
    <div id="circuit-workspace" hidden></div><div id="hooke-workspace" hidden></div><div id="gas-workspace" hidden></div><section class="panel generic-lab" id="lab-generic-workspace" aria-labelledby="generic-lab-title" hidden>
      <div class="header-row"><div><span class="tag">THÍ NGHIỆM THEO CHỦ ĐỀ</span><h2 id="generic-lab-title">Bàn thí nghiệm Vật lý</h2><p>Quan sát hình bố trí, điều chỉnh điều kiện, ghi số đo theo độ chia dụng cụ và rút kết luận.</p></div></div>
      <div class="generic-lab-setup lab15-layout"><label class="field"><span>Thí nghiệm</span><select id="generic-experiment">${GENERIC_EXPERIMENTS.map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select></label><div id="generic-apparatus" class="generic-apparatus"></div>
        <details class="lab15-advanced"><summary>⚙ Điều chỉnh thông số & chọn độ chia dụng cụ (nâng cao)</summary><div class="lab15-advanced-wrap"><div id="generic-parameters" class="generic-parameters"></div><div id="generic-instruments" class="generic-instruments"></div></div></details></div>
      <p id="generic-lab-status" role="status" aria-live="polite"></p>
      <div class="lab-actions"><button class="button primary" id="generic-capture">Ghi phép đo</button><button class="button secondary" id="generic-export" disabled>Xuất CSV</button><button class="button secondary" id="generic-report" disabled>Tải báo cáo</button><button class="button ghost" id="generic-clear" disabled>Xóa dữ liệu</button></div>
      <div class="generic-lab-graph"><h3 id="generic-graph-title">Đồ thị đo</h3><article id="generic-graph" class="graph-card"></article></div>
      <div class="header-row generic-table-heading"><div><h3>Sổ tay phép đo</h3><p id="generic-table-summary">Chưa ghi phép đo.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>STT</th><th id="generic-x-heading">Đại lượng x</th><th id="generic-y-heading">Đại lượng y</th><th>Độ không đảm bảo x</th><th>Độ không đảm bảo y</th><th>Dụng cụ</th></tr></thead><tbody id="generic-table-body"></tbody></table></div>
    </section><div id="advanced-physics-stations"></div><div id="student-lab-notebook"></div>`;

  const advancedRequested=location.hash.startsWith('#/lab/advanced-')?location.hash.slice('#/lab/advanced-'.length):null;
  const disposeAdvanced = mountAdvancedLab(main.querySelector('#advanced-physics-stations'),advancedRequested||'induction');
  const notebook = mountLabNotebook(main.querySelector('#student-lab-notebook'), { progress, experimentId: 'ohms-law' });

  // Visual previews are generated from our own apparatus scenes, not copied PhET assets.
  for(const button of main.querySelectorAll('.lab-discovery-card')) {
    const simulationId=button.dataset.openLab||'hooke-law';
    const experiment=LAB_EXPERIMENTS.find(item=>item.id===simulationId);
    if(!experiment)continue;
    button.insertAdjacentHTML('afterbegin',`<span class="lab-card-preview" aria-hidden="true">${labPreviewMarkup(experiment)}</span>`);
  }
  const hashLabId=location.hash.slice('#/lab/'.length);
  const initialGrade=hashLabId.startsWith('advanced-')?(hashLabId==='advanced-interference'?11:12):hashLabId?labGrade(hashLabId):11;
  installLabDiscovery(main.querySelector('.lab-discovery'), GENERIC_EXPERIMENTS, genericAbort.signal,initialGrade);
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
    const apparatus = main.querySelector('#generic-apparatus');
    liveStage?.destroy();
    apparatus.innerHTML = `<h3>${experiment.title}</h3><p class="lab-stage-lead">${experiment.description}</p><div class="lab15-shortcuts">🖱️ Kéo dụng cụ trên bàn · ⌨️ Dùng Tab để chọn điều khiển · Ghi số đo vào sổ phía dưới</div><div id="lab15-scene-host"></div><details class="lab-apparatus-details"><summary>Danh mục dụng cụ thực hành</summary><ul>${experiment.apparatus.map(item => `<li>${item}</li>`).join('')}</ul></details>`;
    liveStage = (LAB16_IDS.includes(experiment.id) ? mountLab16Workbench : mountLabLiveStage)(apparatus.querySelector('#lab15-scene-host'), {
      experiment, setup: genericSetup,
      onParameterChange: (key, value) => {
        const input = main.querySelector(`[data-generic-parameter="${key}"]`);
        if (!input) return;
        input.value = String(value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      },
      onCapture: () => main.querySelector('#generic-capture').click()
    });
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
  const circuitWorkspace = main.querySelector('#circuit-workspace');
  const circuitCard = main.querySelector('#lab-open-circuit');
  let disposeCircuit = () => {};
  let mountedCircuit = false;
  let disposeHooke = () => {};
  let mountedHooke = false;
  const hookeWorkspace = main.querySelector('#hooke-workspace');
  const genericWorkspace = main.querySelector('#lab-generic-workspace');
  const hookeCard = main.querySelector('#lab-open-hooke');
  const gasCard = main.querySelector('#lab-open-gas');
  const gasWorkspace = main.querySelector('#gas-workspace');
  let disposeGas = () => {};
  let mountedGas = false;
  function showWorkspace(mode) {
    const isHooke = mode === 'hooke';
    const isCircuit = mode === 'circuit';
    const isGas = mode === 'gas';
    const isAdvanced = mode === 'advanced';
    if (!isGas && mountedGas) { disposeGas(); mountedGas = false; gasWorkspace.replaceChildren(); }
    hookeWorkspace.hidden = !isHooke;
    circuitWorkspace.hidden = !isCircuit;
    gasWorkspace.hidden = !isGas;
    genericWorkspace.hidden = isHooke || isCircuit || isGas || isAdvanced;
    if (isHooke || isCircuit || isGas) liveStage?.pause?.();
    hookeCard.setAttribute('aria-pressed',String(isHooke));
    circuitCard.setAttribute('aria-pressed',String(isCircuit));
    gasCard.setAttribute('aria-pressed',String(isGas));
    main.querySelectorAll('[data-open-lab]').forEach(button=>button.setAttribute('aria-pressed',String(!isHooke && !isCircuit && !isGas && button.dataset.openLab===activeExperimentId)));
    notebook.select(isHooke ? 'hooke-law' : isCircuit ? 'ohms-law' : isGas ? 'gas-law' : activeExperimentId);

  }
  circuitCard.addEventListener('click', () => {
    if (!mountedCircuit) { disposeCircuit = mountCircuitWorkbench(circuitWorkspace, { progress }); mountedCircuit = true; }
    showWorkspace('circuit');
    circuitWorkspace.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, { signal: genericAbort.signal });
  hookeCard.addEventListener('click',()=>{if(!mountedHooke){disposeHooke=mountHookeWorkbench(hookeWorkspace,{progress});mountedHooke=true;}showWorkspace('hooke');hookeWorkspace.scrollIntoView({block:'start',behavior:'smooth'});},{signal:genericAbort.signal});
  gasCard.addEventListener('click',()=>{
    if(!mountedGas){disposeGas=mountGasWorkbench(gasWorkspace,context);mountedGas=true;}
    showWorkspace('gas');gasWorkspace.scrollIntoView({block:'start',behavior:'smooth'});
  },{signal:genericAbort.signal});
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
    notebook.select(activeExperimentId);
  }, { signal: genericAbort.signal });
  function updateGenericParameter(event) {
    const key = event.target.dataset.genericParameter;
    if (!key) return;
    genericSetup[key] = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
    // Coulomb friction model requires μ_kinetic ≤ μ_static; keep the apparatus valid
    // when students experiment with either coefficient independently.
    if (activeExperimentId === 'friction' && genericSetup.kineticCoefficient > genericSetup.staticCoefficient) {
      if (key === 'kineticCoefficient') genericSetup.kineticCoefficient = genericSetup.staticCoefficient;
      else genericSetup.kineticCoefficient = genericSetup.staticCoefficient;
      const k = main.querySelector('[data-generic-parameter="kineticCoefficient"]');
      if (k) k.value = String(genericSetup.kineticCoefficient);
      const display = main.querySelector('[data-generic-value="kineticCoefficient"]');
      if (display) display.textContent = String(format(genericSetup.kineticCoefficient));
    }
    const value = main.querySelector(`[data-generic-value="${key}"]`);
    if (value) value.textContent = `${format(genericSetup[key])} ${selectedExperiment().parameters.find(item => item.key === key).unit}`;
    persistGenericLab();
    liveStage?.update(genericSetup);
    genericStatus();
  }
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
      notebook.refresh();
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
    notebook.refresh();
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
  if (!mountedCircuit) { disposeCircuit = mountCircuitWorkbench(circuitWorkspace, { progress }); mountedCircuit = true; }
  if (advancedRequested) {
    showWorkspace('advanced');
    requestAnimationFrame(()=>main.querySelector('#advanced-physics-stations')?.scrollIntoView({block:'start'}));
  } else if (location.hash.startsWith('#/lab/gas')) {
    disposeGas=mountGasWorkbench(gasWorkspace,context);mountedGas=true;
    showWorkspace('gas');
  } else if (location.hash.startsWith('#/lab/hooke')) {
    disposeHooke = mountHookeWorkbench(hookeWorkspace, { progress }); mountedHooke = true;
    showWorkspace('hooke');
  } else if (GENERIC_EXPERIMENTS.some(item => location.hash === `#/lab/${item.id}`)) {
    activeExperimentId=location.hash.slice('#/lab/'.length);
    main.querySelector('#generic-experiment').value=activeExperimentId;
    main.querySelector('#generic-experiment').dispatchEvent(new Event('change',{bubbles:true}));
    showWorkspace('generic');
  } else showWorkspace('circuit');

  return () => {
    genericAbort.abort();
    disposeAdvanced();
    liveStage?.destroy();
    disposeCircuit();
    disposeHooke();
    if (mountedGas) disposeGas();
    notebook.destroy();
  };
}
