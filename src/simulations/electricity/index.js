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
    <div class="circuit-layout"><section class="panel circuit-workbench"><div class="circuit-topline"><span class="tag">MẠCH ĐIỆN MỘT CHIỀU</span><strong id="circuit-topology-label"></strong></div><div class="circuit-scene-toolbar"><div class="circuit-topology-buttons" role="group" aria-label="Chọn cách mắc"><button type="button" data-circuit-preset="series" aria-pressed="false">Nối tiếp</button><button type="button" data-circuit-preset="parallel" aria-pressed="false">Song song</button></div><button type="button" id="circuit-flow-toggle" class="button secondary" aria-pressed="true">⏸ Tạm dừng dòng điện</button></div><div id="circuit-schematic"></div><p class="circuit-gesture-hint">Kéo điện trở R₁ hoặc R₂ sang ngang để thay đổi giá trị. Chấm sáng chuyển động theo chiều dòng điện quy ước (tốc độ chỉ mang tính minh họa).</p>
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
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  let flowRunning = !reducedMotion;
  let flowRequest = 0;
  let lastFrame = 0;
  let accumulated = 0;
  const schematic = main.querySelector('#circuit-schematic');
  function renderSchematic(state) {
    const parallel = params.topology === 'parallel';
    const wire = 'class="circuit-wire"';
    const horizontalResistor = (x, y, key, label, value) => `<g class="circuit-resistor ${highlightedResistor===key?'active':''}" data-resistor="${key}" role="slider" tabindex="0" aria-label="Điều chỉnh ${label}, phím trái hoặc phải" aria-valuemin="1" aria-valuemax="1000" aria-valuenow="${value}"><rect x="${x}" y="${y-17}" width="106" height="34" rx="9" class="circuit-component"/><path d="M${x+12} ${y}h18l7 -8 9 16 9 -16 9 16 9 -16 7 8h16" class="circuit-resistor-zig"/><text x="${x+53}" y="${y-29}" text-anchor="middle" class="circuit-label">${label}: ${value} Ω</text><rect x="${x-6}" y="${y-34}" width="118" height="64" fill="transparent" /></g>`;
    const verticalResistor = (x, y, key, label, value) => `<g class="circuit-resistor ${highlightedResistor===key?'active':''}" data-resistor="${key}" role="slider" tabindex="0" aria-label="Điều chỉnh ${label}, phím trái hoặc phải" aria-valuemin="1" aria-valuemax="1000" aria-valuenow="${value}"><rect x="${x-17}" y="${y}" width="34" height="100" rx="9" class="circuit-component"/><path d="M${x} ${y+8}v15l-8 7 16 9 -16 9 16 9 -16 9 8 7v16" class="circuit-resistor-zig"/><text x="${x+29}" y="${y+55}" class="circuit-label">${label}</text><text x="${x+29}" y="${y+73}" class="circuit-sub-label">${value} Ω</text><rect x="${x-26}" y="${y-8}" width="94" height="116" fill="transparent" /></g>`;
    const battery = `<path d="M94 65V118 M94 161V225" ${wire}/><path d="M70 118H118" class="circuit-battery-plus"/><path d="M80 161H108" class="circuit-battery-minus"/><text x="126" y="124" class="circuit-sub-label">+</text><text x="126" y="166" class="circuit-sub-label">−</text><text x="24" y="145" class="circuit-source-label">${format(params.voltage)} V</text>`;
    const content = parallel
      ? `<path d="M94 65H520V225H94" ${wire}/><path d="M260 65V106M260 194V225M422 65V106M422 194V225" ${wire}/>${verticalResistor(260,105,'resistance1','R₁',params.resistance1)}${verticalResistor(422,105,'resistance2','R₂',params.resistance2)}<path id="flow-path-one" d="M94 65H260V225H94V65" class="circuit-flow-path"/><path id="flow-path-two" d="M94 65H422V225H94V65" class="circuit-flow-path"/>`
      : `<path d="M94 65H174 M280 65H334 M440 65H520V225H94" ${wire}/>${horizontalResistor(174,65,'resistance1','R₁',params.resistance1)}${horizontalResistor(334,65,'resistance2','R₂',params.resistance2)}<path id="flow-path-one" d="M94 65H520V225H94V65" class="circuit-flow-path"/>`;
    schematic.innerHTML = `<svg viewBox="0 0 620 290" role="img" aria-label="Mạch ${parallel?'song song':'nối tiếp'} với pin, hai điện trở và đường dòng điện có thể quan sát"><defs><pattern id="circuit-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" opacity=".06"/></pattern></defs><rect width="620" height="290" fill="url(#circuit-grid)"/><g>${battery}${content}</g><g id="circuit-charge-dots" aria-hidden="true">${Array.from({length:parallel?8:5},(_,i)=>`<circle r="5" class="circuit-charge-dot" data-charge="${i}"/>`).join('')}</g><text x="308" y="273" text-anchor="middle" class="circuit-footer-label">${parallel?'HAI NHÁNH ĐIỆN TRỞ SONG SONG':'CÁC ĐIỆN TRỞ MẮC NỐI TIẾP'} · I = ${format(state.current)} A</text></svg>`;
    main.querySelector('#circuit-topology-label').textContent = parallel ? 'MẠCH SONG SONG' : 'MẠCH NỐI TIẾP';
    main.querySelectorAll('[data-circuit-preset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.circuitPreset===params.topology)));
    main.querySelector('#circuit-flow-toggle').textContent = flowRunning ? '⏸ Tạm dừng dòng điện' : '▶ Quan sát dòng điện';
    main.querySelector('#circuit-flow-toggle').setAttribute('aria-pressed',String(flowRunning));
    moveCharges();
  }
  function moveCharges() {
    const state = model.at(params.voltage);
    const current = Math.abs(state.current);
    const dots = schematic.querySelectorAll('[data-charge]');
    dots.forEach((dot,index)=>{
      const branch = params.topology==='parallel' ? index % 2 : 0;
      const route = schematic.querySelector(branch ? '#flow-path-two' : '#flow-path-one');
      if (!route || !current) { dot.setAttribute('visibility','hidden'); return; }
      dot.setAttribute('visibility','visible');
      const count = params.topology==='parallel'?4:5;
      const slot = Math.floor(index / (params.topology==='parallel'?2:1));
      const offset = (slot / count + accumulated / (3 + Math.min(9,current))) % 1;
      const point = route.getPointAtLength(route.getTotalLength() * offset);
      dot.setAttribute('cx',point.x); dot.setAttribute('cy',point.y);
    });
  }
  function animateCharges(now) {
    if (!flowRunning) { flowRequest=0;return; }
    if (lastFrame) accumulated += Math.min((now-lastFrame)/1000,.08);
    lastFrame = now;
    moveCharges();
    flowRequest = requestAnimationFrame(animateCharges);
  }
  function stopFlow() { if(flowRequest) cancelAnimationFrame(flowRequest); flowRequest=0; lastFrame=0; }
  function setFlow(active) { flowRunning=active; stopFlow(); if(active) flowRequest=requestAnimationFrame(animateCharges); render(); }
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
  for (const button of main.querySelectorAll('[data-circuit-preset]')) button.addEventListener('click',()=>update({...params,topology:button.dataset.circuitPreset}),{signal:abort.signal});
  bind('#circuit-flow-toggle', 'click', () => setFlow(!flowRunning));
  schematic.addEventListener('keydown', event => {
    const target=event.target.closest('[data-resistor]');
    if(!target || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    update({...params,[target.dataset.resistor]:Math.max(1,Math.min(1000,params[target.dataset.resistor]+(event.key==='ArrowRight'?1:-1)))});
    schematic.querySelector(`[data-resistor="${target.dataset.resistor}"]`)?.focus();
  },{signal:abort.signal});
  for (const key of ['voltage', 'resistance1', 'resistance2']) bind(`#circuit-${key}`, 'input', event => update({ ...params, [key]: Number(event.target.value) }));
  graphCurrent.setModel(model);
  graphPower.setModel(model);
  main.querySelector('#topology').value = params.topology;
  render();
  if(flowRunning) flowRequest=requestAnimationFrame(animateCharges);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopFlow();} else if(flowRunning&&!flowRequest)flowRequest=requestAnimationFrame(animateCharges);},{signal:abort.signal});
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: { time: params.voltage, playing: false, rate: 1 }, measurements: model.at(params.voltage), graphs: ['current', 'power'] });
  persist();
  return () => { persist(); stopFlow(); abort.abort(); context.activeSimulation = null; };
}
