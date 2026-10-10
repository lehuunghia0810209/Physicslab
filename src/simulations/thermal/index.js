import './thermal.css';
import { createIdealGas, IDEAL_GAS_DEFAULTS } from '../../core/ideal-gas.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';
import { Timeline } from '../../engines/timeline.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'ideal-gas';
  let params = { ...IDEAL_GAS_DEFAULTS };
  let savedTime = 0;
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try {
      const restored = createIdealGas(saved.parameters);
      params = restored.parameters;
      savedTime = Number.isFinite(saved.time) ? saved.time : 0;
    } catch {
      params = { ...IDEAL_GAS_DEFAULTS };
    }
  }
  let model = createIdealGas(params);
  progress.visit(id, 'Khám phá định luật khí lí tưởng');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">NHIỆT HỌC · LỚP 12</p><h1>Khí lí tưởng và các quá trình</h1><p>Điều khiển piston và quan sát mối liên hệ giữa áp suất, thể tích, nhiệt độ cùng trao đổi năng lượng.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="gas-layout"><section class="panel gas-workbench"><div class="gas-topline"><span class="tag">MÔ HÌNH KHÍ LÍ TƯỞNG ĐƠN NGUYÊN TỬ</span><strong id="gas-time"></strong></div>
      <svg id="gas-scene" viewBox="0 0 620 300" role="img" aria-label="Piston chứa khí lí tưởng"><rect class="gas-cylinder" x="100" y="55" width="420" height="190" rx="12"/><g id="gas-particles"></g><rect id="gas-piston" class="gas-piston" x="300" y="55" width="24" height="190"/><text id="gas-piston-label" y="272"></text></svg>
      <div class="gas-readouts">${[['pressure','Áp suất P','Pa'],['volume','Thể tích V','m³'],['temperature','Nhiệt độ T','K'],['internalEnergy','Nội năng U','J'],['work','Công W','J'],['heat','Nhiệt lượng Q','J']].map(([key,label,unit])=>`<div><span>${label}</span><strong id="gas-${key}"></strong><small>${unit}</small></div>`).join('')}</div>
      <div class="gas-playback"><button class="button primary" id="play">Chạy</button><button class="button secondary" id="reset">Đặt lại</button><label class="speed-control">Tốc độ<select id="playback-rate" aria-label="Tốc độ phát"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
      <label class="timeline-label" for="scrubber">Tiến trình <span id="duration-label"></span></label><input id="scrubber" type="range" min="0" max="1000" step="1" value="0" aria-label="Tiến trình quá trình nhiệt"></section>
      <aside class="panel gas-controls"><h2>Điều kiện ban đầu và quá trình</h2><label class="gas-process" for="gas-process"><span>Quá trình nhiệt</span><select id="gas-process" aria-label="Chọn quá trình nhiệt"><option value="isothermal">Đẳng nhiệt</option><option value="isobaric">Đẳng áp</option><option value="isochoric">Đẳng tích</option></select></label>
        ${[['amount','Lượng chất n',0.1,10,0.1,'mol'],['initialVolume','Thể tích đầu V₀',0.001,0.2,0.001,'m³'],['finalVolume','Thể tích cuối V₁',0.001,0.4,0.001,'m³'],['initialTemperature','Nhiệt độ đầu T₀',100,1000,5,'K'],['finalTemperature','Nhiệt độ cuối T₁',100,1000,5,'K']].map(([key,label,min,max,step,unit])=>`<label class="gas-parameter" data-gas-field="${key}" for="gas-${key}"><span>${label}</span><strong data-gas-param="${key}"></strong><input id="gas-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
        <p id="gas-equation" class="gas-equation"></p><p class="gas-assumption">PV = nRT, khí lí tưởng đơn nguyên tử: U = 3nRT/2. Quy ước W dương khi khí sinh công, Q = ΔU + W.</p></aside></div>
    <section class="gas-graph"><div class="section-heading"><div><h2>Đồ thị trạng thái P–V</h2><p>Đường đi nhiệt động lực học ứng với quá trình đã chọn.</p></div></div><article id="graph-pv" class="graph-card"></article></section>`;

  const graph = new GraphRenderer(main.querySelector('#graph-pv'), { key: 'pressure', label: 'Áp suất theo thể tích · P–V', unit: 'Pa', role: 'blue', xKey: 'volume', xLabel: 'V (m³)' });
  const scrubber = main.querySelector('#scrubber');
  const play = main.querySelector('#play');
  const abort = new AbortController();
  const timeline = new Timeline(model.duration, frame, () => { progress.complete(id); persist(); });
  function persist() { progress.session(id, { parameters: { ...params }, time: timeline.state.get().time }); }

  function frame(time) {
    const state = model.at(time);
    for (const key of ['pressure','volume','temperature','internalEnergy','work','heat']) main.querySelector(`#gas-${key}`).textContent = format(state[key]);
    main.querySelector('#gas-time').textContent = `t = ${format(state.time)} s`;
    main.querySelector('#duration-label').textContent = `/ ${format(model.duration)} s`;
    scrubber.value = String(state.progress * 1000);
    play.textContent = timeline.state.get().playing ? 'Tạm dừng' : (state.time >= model.duration ? 'Chạy lại' : 'Chạy');
    const minVolume = Math.min(params.initialVolume, state.volume);
    const maxVolume = Math.max(params.initialVolume, params.finalVolume);
    const fraction = maxVolume === minVolume ? 0.5 : (state.volume - minVolume) / (maxVolume - minVolume);
    const pistonX = 185 + 250 * fraction;
    main.querySelector('#gas-piston').setAttribute('x', pistonX);
    main.querySelector('#gas-piston-label').setAttribute('x', pistonX + 12);
    main.querySelector('#gas-piston-label').textContent = `Piston · V = ${format(state.volume, 3)} m³`;
    const width = pistonX - 112;
    main.querySelector('#gas-particles').innerHTML = Array.from({ length: 16 }, (_, index) => {
      const column = index % 4, row = Math.floor(index / 4);
      const x = 126 + (width - 28) * (column + 0.5) / 4;
      const y = 90 + row * 38 + ((index * 17 + Math.floor(time * 6)) % 11) - 5;
      return `<circle class="gas-particle" cx="${x}" cy="${y}" r="${4 + (state.temperature - 100) / 450}"/>`;
    }).join('');
    main.querySelector('#gas-equation').textContent = `PV = nRT · P = ${format(state.pressure)} Pa · W = ${format(state.work)} J · ΔU = ${format(state.changeInInternalEnergy)} J · Q = ΔU + W`;
    graph.update(time);
  }

  function replaceModel(next) {
    try {
      model = createIdealGas(next);
      params = { ...model.parameters };
      main.querySelector('#gas-process').value = params.process;
      renderApplicableControls();
      for (const key of Object.keys(IDEAL_GAS_DEFAULTS)) {
        const input = main.querySelector(`#gas-${key}`);
        if (input) input.value = params[key];
      }
      graph.setModel(model);
      timeline.reset(model.duration);
      frame(0);
      persist();
    } catch (error) {
      main.querySelector('#gas-equation').textContent = error.message;
    }
  }

  function renderApplicableControls() {
    main.querySelector('[data-gas-field="finalVolume"]').hidden = params.process === 'isochoric';
    main.querySelector('[data-gas-field="finalTemperature"]').hidden = params.process !== 'isochoric';
  }

  for (const key of ['amount','initialVolume','finalVolume','initialTemperature','finalTemperature']) {
    main.querySelector(`#gas-${key}`).addEventListener('input', event => replaceModel({ ...params, [key]: Number(event.target.value) }), { signal: abort.signal });
    main.querySelector(`[data-gas-param="${key}"]`).textContent = `${format(params[key])} ${key.includes('Volume') ? 'm³' : key.includes('Temperature') ? 'K' : key === 'amount' ? 'mol' : ''}`;
  }
  main.querySelector('#gas-process').value = params.process;
  renderApplicableControls();
  main.querySelector('#gas-process').addEventListener('change', event => replaceModel({ ...params, process: event.target.value }), { signal: abort.signal });
  main.querySelector('#play').addEventListener('click', () => timeline.state.get().playing ? timeline.pause() : timeline.play(), { signal: abort.signal });
  main.querySelector('#reset').addEventListener('click', () => { timeline.reset(model.duration); persist(); }, { signal: abort.signal });
  scrubber.addEventListener('input', event => { timeline.seek(Number(event.target.value) / 1000 * model.duration); persist(); }, { signal: abort.signal });
  main.querySelector('#playback-rate').addEventListener('change', event => timeline.rate(Number(event.target.value)), { signal: abort.signal });
  graph.setModel(model);
  timeline.reset(model.duration);
  timeline.seek(savedTime);
  frame(savedTime);
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: timeline.state.get(), measurements: model.at(timeline.state.get().time), graphs: ['pressure'] });
  persist();
  return () => { persist(); abort.abort(); timeline.destroy(); context.activeSimulation = null; };
}
