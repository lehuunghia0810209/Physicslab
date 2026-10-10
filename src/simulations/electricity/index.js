import './electricity.css';
import { createCircuit, CIRCUIT_DEFAULTS } from '../../core/circuits.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { clampSceneValue } from '../../core/direct-manipulation.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'electric-circuits';
  let params = { ...CIRCUIT_DEFAULTS };
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try { params = createCircuit(saved.parameters).parameters; } catch { params = { ...CIRCUIT_DEFAULTS }; }
  }
  let model = createCircuit(params);
  progress.visit(id, 'Khám phá định luật Ohm và mạch điện');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">ĐIỆN HỌC · LỚP 11</p><h1>Định luật Ohm và mạch điện</h1><p>Đổi sơ đồ nối tiếp/song song, điều chỉnh điện áp và điện trở để đo dòng điện, hiệu điện thế và công suất.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="circuit-layout"><section class="panel circuit-workbench"><div class="circuit-topline"><span class="tag">MẠCH ĐIỆN MỘT CHIỀU</span><strong id="circuit-topology-label"></strong></div><div id="circuit-schematic"></div><p class="circuit-gesture-hint">Giữ và kéo điện trở R₁ hoặc R₂ theo phương ngang để thay đổi giá trị. Số đo I, U và P sẽ cập nhật tức thì.</p>
      <div class="circuit-measurements">${[
        ['equivalentResistance', 'Điện trở tương đương', 'Ω'], ['current', 'Dòng điện tổng', 'A'],
        ['current1', 'Dòng qua R₁', 'A'], ['current2', 'Dòng qua R₂', 'A'],
        ['voltage1', 'Hiệu điện thế U₁', 'V'], ['voltage2', 'Hiệu điện thế U₂', 'V'],
        ['power', 'Công suất toàn mạch', 'W'], ['power1', 'Công suất R₁', 'W']
      ].map(([key, label, unit]) => `<div><span>${label}</span><strong data-circuit-value="${key}">0</strong><small>${unit}</small></div>`).join('')}</div>
      <p id="circuit-status" role="status"></p></section>
      <aside class="panel circuit-controls"><h2>Thông số mạch</h2><label class="field"><span>Cách mắc điện trở</span><select id="topology"><option value="series">Nối tiếp</option><option value="parallel">Song song</option></select></label>
        ${[
          ['voltage', 'Điện áp nguồn', 0, 24, 0.5, 'V'],
          ['resistance1', 'Điện trở R₁', 1, 1000, 1, 'Ω'],
          ['resistance2', 'Điện trở R₂', 1, 1000, 1, 'Ω']
        ].map(([key, label, min, max, step, unit]) => `<label class="circuit-parameter" for="circuit-${key}"><span>${label}</span><strong data-circuit-param="${key}"></strong><input id="circuit-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
        <p class="circuit-equations" id="circuit-equations"></p><p class="circuit-assumptions">Nguồn điện lý tưởng, điện trở thuần và dây dẫn không có điện trở. Áp dụng định luật Ohm U = IR.</p></aside></div>
    <section class="circuit-graphs"><div class="section-heading"><div><h2>Đặc tuyến theo điện áp nguồn</h2><p>Đồ thị dòng điện và công suất khi thay đổi điện áp từ 0 đến 24 V.</p></div></div><div class="graphs-grid"><article class="graph-card" id="graph-current"></article><article class="graph-card" id="graph-power"></article></div></section>`;

  const graphCurrent = new GraphRenderer(main.querySelector('#graph-current'), {
    key: 'current', label: 'Dòng điện tổng · I–U', unit: 'A', role: 'teal', xKey: 'voltage', xLabel: 'U (V)'
  });
  const graphPower = new GraphRenderer(main.querySelector('#graph-power'), {
    key: 'power', label: 'Công suất · P–U', unit: 'W', role: 'blue', xKey: 'voltage', xLabel: 'U (V)'
  });
  const readouts = [...main.querySelectorAll('[data-circuit-value]')];
  const abort = new AbortController();
  const bind = (selector, event, handler) => main.querySelector(selector).addEventListener(event, handler, { signal: abort.signal });
  function persist() { progress.session(id, { parameters: { ...params } }); }
  let highlightedResistor = null;
  function renderSchematic(state) {
    const parallel = params.topology === 'parallel';
    const common = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
    const resistor = (x, y, label, value) => `<g data-resistor="${label === 'R₁' ? 'resistance1' : 'resistance2'}" class="circuit-resistor${highlightedResistor === (label === 'R₁' ? 'resistance1' : 'resistance2') ? ' active' : ''}" role="slider" aria-label="Kéo sang phải để tăng điện trở ${label}" aria-valuemin="1" aria-valuemax="1000" aria-valuenow="${value}"><path d="M${x} ${y} l12 -14 16 28 16 -28 16 28 16 -28 16 28 16 -28 12 14" ${common}/><rect x="${x}" y="${y - 30}" width="125" height="60" fill="transparent"/><text x="${x + 60}" y="${y - 29}" text-anchor="middle">${label} = ${value} Ω</text></g>`;
    const drawing = parallel
      ? `<path d="M130 80 H190 M310 80 H500 M130 165 H190 M310 165 H500 M500 80 V165" ${common}/>${resistor(190, 80, 'R₁', params.resistance1)}${resistor(190, 165, 'R₂', params.resistance2)}`
      : `<path d="M130 80 H190 M310 80 H340 M460 80 H500 V165 H130" ${common}/>${resistor(190, 80, 'R₁', params.resistance1)}${resistor(340, 80, 'R₂', params.resistance2)}`;
    main.querySelector('#circuit-schematic').innerHTML = `<svg viewBox="0 0 620 270" role="img" aria-label="Sơ đồ mạch ${parallel ? 'song song' : 'nối tiếp'}">
      ${drawing}
      <line x1="130" y1="80" x2="130" y2="108" ${common}/><line x1="130" y1="142" x2="130" y2="165" ${common}/>
      <line x1="112" y1="108" x2="148" y2="108" stroke="var(--amber)" stroke-width="5"/><line x1="120" y1="141" x2="140" y2="141" stroke="var(--amber)" stroke-width="3"/>
      <text x="66" y="128">U = ${format(state.voltage)} V</text><text x="510" y="135" text-anchor="end">I = ${format(state.current)} A</text>
    </svg>`;
    main.querySelector('#circuit-topology-label').textContent = parallel ? 'MẠCH SONG SONG' : 'MẠCH NỐI TIẾP';
  }
  function render() {
    const state = model.at(params.voltage);
    readouts.forEach(element => { element.textContent = format(state[element.dataset.circuitValue]); });
    graphCurrent.update(params.voltage);
    graphPower.update(params.voltage);
    renderSchematic(state);
    main.querySelector('#circuit-equations').textContent = params.topology === 'series'
      ? `Rtd = R₁ + R₂ = ${format(state.equivalentResistance)} Ω · I = U/Rtd = ${format(state.current)} A · U = U₁ + U₂`
      : `1/Rtd = 1/R₁ + 1/R₂ · Rtd = ${format(state.equivalentResistance)} Ω · I = I₁ + I₂ = ${format(state.current)} A`;
    main.querySelector('#circuit-status').textContent = params.topology === 'series'
      ? 'Mạch nối tiếp có cùng cường độ dòng điện qua mọi điện trở.'
      : 'Mạch song song có cùng hiệu điện thế trên mỗi nhánh.';
    for (const key of ['voltage', 'resistance1', 'resistance2']) {
      const unit = key === 'voltage' ? 'V' : 'Ω';
      main.querySelector(`[data-circuit-param="${key}"]`).textContent = `${format(params[key], 1)} ${unit}`;
    }
  }
  function update(next) {
    try {
      model = createCircuit(next);
      params = { ...model.parameters };
      main.querySelector('#topology').value = params.topology;
      for (const key of ['voltage', 'resistance1', 'resistance2']) main.querySelector(`#circuit-${key}`).value = params[key];
      graphCurrent.setModel(model);
      graphPower.setModel(model);
      render();
      persist();
    } catch (error) {
      main.querySelector('#circuit-status').textContent = error.message;
    }
  }
  const schematic = main.querySelector('#circuit-schematic');
  let dragResistor = null;
  function moveResistance(event) {
    if (!dragResistor) return;
    const bounds = schematic.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const virtualDx = (event.clientX - dragResistor.startX) * 620 / bounds.width;
    const value = Math.round(clampSceneValue(dragResistor.initial * Math.exp(virtualDx / 105), 1, 1000));
    if (params[dragResistor.key] !== value) update({ ...params, [dragResistor.key]: value });
  }
  schematic.addEventListener('pointerdown', event => {
    const target = event.target.closest('[data-resistor]');
    if (!target || (event.button !== 0 && event.pointerType === 'mouse')) return;
    const key = target.dataset.resistor;
    highlightedResistor = key;
    dragResistor = { key, startX: event.clientX, initial: params[key], pointerId: event.pointerId };
    schematic.setPointerCapture?.(event.pointerId);
    moveResistance(event);
  }, { signal: abort.signal });
  schematic.addEventListener('pointermove', event => { if (event.pointerId === dragResistor?.pointerId) moveResistance(event); }, { signal: abort.signal });
  const stopResistance = event => {
    if (event.pointerId !== dragResistor?.pointerId) return;
    highlightedResistor = null; dragResistor = null;
  };
  schematic.addEventListener('pointerup', stopResistance, { signal: abort.signal });
  schematic.addEventListener('pointercancel', stopResistance, { signal: abort.signal });
  bind('#topology', 'change', event => update({ ...params, topology: event.target.value }));
  for (const key of ['voltage', 'resistance1', 'resistance2']) bind(`#circuit-${key}`, 'input', event => update({ ...params, [key]: Number(event.target.value) }));
  graphCurrent.setModel(model);
  graphPower.setModel(model);
  main.querySelector('#topology').value = params.topology;
  render();
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: { time: params.voltage, playing: false, rate: 1 }, measurements: model.at(params.voltage), graphs: ['current', 'power'] });
  persist();
  return () => { persist(); abort.abort(); context.activeSimulation = null; };
}
