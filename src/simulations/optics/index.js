import './optics.css';
import { createThinLens, OPTICS_DEFAULTS } from '../../core/optics.js';
import { format } from '../../core/units.js';
import { GraphRenderer } from '../../engines/graph.js';

export function mount(main, context) {
  const { progress } = context;
  const id = 'lens';
  let params = { ...OPTICS_DEFAULTS };
  const saved = progress.get().sessions[id];
  if (saved?.parameters) {
    try { params = createThinLens(saved.parameters).parameters; } catch { params = { ...OPTICS_DEFAULTS }; }
  }
  let model = createThinLens(params);
  progress.visit(id, 'Khám phá ảnh qua thấu kính hội tụ');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">QUANG HỌC · LỚP 11</p><h1>Thấu kính hội tụ</h1><p>Điều chỉnh vị trí vật và tiêu cự; dựng ảnh, kiểm tra phương trình thấu kính và độ phóng đại.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div>
    <div class="optics-layout"><section class="panel optics-workbench"><span class="tag">DỰNG ẢNH BẰNG TIA SÁNG</span><svg id="optics-scene" viewBox="0 0 640 300" role="img" aria-label="Sơ đồ dựng ảnh qua thấu kính"><line class="optics-axis" x1="20" y1="150" x2="620" y2="150"/><g id="optics-rays"></g><path class="optics-lens" d="M320 38 Q276 150 320 262 Q364 150 320 38Z"/><g id="optics-marks"></g></svg>
      <div class="optics-readouts"><div><span>Khoảng cách ảnh dᵢ</span><strong id="optics-di"></strong><small>m</small></div><div><span>Độ phóng đại m</span><strong id="optics-mag"></strong><small>lần</small></div><div><span>Chiều cao ảnh hᵢ</span><strong id="optics-hi"></strong><small>m</small></div><div><span>Tính chất ảnh</span><strong id="optics-type"></strong><small id="optics-orientation"></small></div></div></section>
      <aside class="panel optics-controls"><h2>Thông số</h2>${[['focalLength','Tiêu cự f',0.02,1,0.01,'m'],['objectDistance','Khoảng cách vật dₒ',0.02,2,0.01,'m'],['objectHeight','Chiều cao vật hₒ',0.01,1,0.01,'m']].map(([key,label,min,max,step,unit]) => `<label class="optics-parameter" for="optics-${key}"><span>${label}</span><strong data-optics-param="${key}"></strong><input id="optics-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${params[key]}" aria-label="${label}"></label>`).join('')}
        <p id="optics-equation" class="optics-equation"></p><p id="optics-status" role="status"></p><p class="optics-assumption">Thấu kính mỏng hội tụ trong không khí; quy ước chiều dương cùng chiều truyền ánh sáng. Ảnh ảo có dᵢ &lt; 0 và cùng chiều vật.</p></aside></div>
    <section class="optics-graph"><div class="section-heading"><div><h2>Khoảng cách ảnh theo vị trí vật</h2><p>Đường cong biểu diễn dᵢ theo dₒ, tránh điểm kỳ dị tại tiêu diện.</p></div></div><article id="graph-image-distance" class="graph-card"></article></section>`;
  const graph = new GraphRenderer(main.querySelector('#graph-image-distance'), { key: 'imageDistance', label: 'Khoảng cách ảnh · dᵢ–dₒ', unit: 'm', xKey: 'objectDistance', xLabel: 'dₒ (m)', role: 'blue' });
  const abort = new AbortController();
  function render() {
    const state = model.at(params.objectDistance);
    const displayedImageDistance = state.imageDistance ?? 0;
    const xScale = Math.min(75, 220 / Math.max(params.objectDistance, Math.abs(displayedImageDistance), params.focalLength));
    const heightScale = Math.min(250, 100 / Math.max(params.objectHeight, Math.abs(state.imageHeight ?? params.objectHeight)));
    const objectX = 320 - params.objectDistance * xScale;
    const imageX = state.imageDistance === null ? 600 : Math.max(24, Math.min(616, 320 + displayedImageDistance * xScale));
    const objectY = 150 - params.objectHeight * heightScale;
    const imageY = 150 - (state.imageHeight ?? 0) * heightScale;
    const focusLeft = 320 - params.focalLength * xScale, focusRight = 320 + params.focalLength * xScale;
    const imageType = state.imageType === 'real' ? 'Ảnh thật' : state.imageType === 'virtual' ? 'Ảnh ảo' : 'Ảnh ở vô cực';
    main.querySelector('#optics-di').textContent = state.imageDistance === null ? '∞' : format(state.imageDistance);
    main.querySelector('#optics-mag').textContent = state.magnification === null ? '∞' : format(state.magnification);
    main.querySelector('#optics-hi').textContent = state.imageHeight === null ? '—' : format(state.imageHeight);
    main.querySelector('#optics-type').textContent = imageType;
    main.querySelector('#optics-orientation').textContent = state.magnification === null ? '' : state.magnification < 0 ? 'ngược chiều' : 'cùng chiều';
    main.querySelector('#optics-equation').textContent = state.imageDistance === null
      ? `1/f = 1/dₒ + 1/dᵢ · Vật tại tiêu điểm, tia ló song song.`
      : `1/f = 1/dₒ + 1/dᵢ · ${format(1 / params.focalLength)} = ${format(1 / params.objectDistance)} + ${format(1 / state.imageDistance)} m⁻¹`;
    main.querySelector('#optics-status').textContent = `${imageType}${state.magnification === null ? '' : state.magnification < 0 ? ', ngược chiều vật' : ', cùng chiều vật'}.`;
    for (const [key, unit] of [['focalLength','m'],['objectDistance','m'],['objectHeight','m']]) {
      main.querySelector(`[data-optics-param="${key}"]`).textContent = `${format(params[key])} ${unit}`;
    }
    const focalPlane = state.imageDistance === null;
    const outgoingY = objectY + (150 - objectY) * ((610 - 320) / Math.max(1, 320 - objectX));
    const outgoingSecondaryY = 150 + (150 - objectY) * ((610 - 320) / Math.max(1, 320 - objectX));
    main.querySelector('#optics-rays').innerHTML = `<line class="optics-ray" x1="${objectX}" y1="${objectY}" x2="320" y2="${objectY}"/><line class="${state.imageType === 'virtual' ? 'optics-ray virtual' : 'optics-ray'}" x1="320" y1="${objectY}" x2="${focalPlane ? 610 : imageX}" y2="${focalPlane ? outgoingY : imageY}"/><line class="optics-ray secondary" x1="${objectX}" y1="${objectY}" x2="320" y2="150"/><line class="${state.imageType === 'virtual' ? 'optics-ray secondary virtual' : 'optics-ray secondary'}" x1="320" y1="150" x2="${focalPlane ? 610 : imageX}" y2="${focalPlane ? outgoingSecondaryY : imageY}"/><line class="optics-object" x1="${objectX}" y1="150" x2="${objectX}" y2="${objectY}"/><polygon class="optics-object" points="${objectX},${objectY} ${objectX - 6},${objectY + 12} ${objectX + 6},${objectY + 12}"/>${focalPlane ? `<text x="600" y="35" text-anchor="end">Tia ló song song · ảnh ở vô cực</text>` : `<line class="optics-image" x1="${imageX}" y1="150" x2="${imageX}" y2="${imageY}"/><polygon class="optics-image" points="${imageX},${imageY} ${imageX - 6},${imageY + (state.imageHeight < 0 ? -12 : 12)} ${imageX + 6},${imageY + (state.imageHeight < 0 ? -12 : 12)}"/>`}`;
    main.querySelector('#optics-marks').innerHTML = `<line class="optics-focus" x1="${focusLeft}" y1="142" x2="${focusLeft}" y2="158"/><line class="optics-focus" x1="${focusRight}" y1="142" x2="${focusRight}" y2="158"/><text x="${focusLeft}" y="178" text-anchor="middle">F</text><text x="${focusRight}" y="178" text-anchor="middle">F</text><text x="${objectX}" y="282" text-anchor="middle">Vật</text><text x="${imageX}" y="282" text-anchor="middle">Ảnh</text>`;
    if (state.imageDistance === null) {
      graph.cursor.setAttribute('visibility', 'hidden');
      graph.dot.setAttribute('visibility', 'hidden');
      graph.live.textContent = `dₒ = ${format(params.objectDistance)} m · dᵢ → ∞ tại tiêu diện`;
    } else {
      graph.cursor.removeAttribute('visibility');
      graph.dot.removeAttribute('visibility');
      graph.update(params.objectDistance);
    }
  }
  function update(next) {
    try {
      model = createThinLens(next); params = { ...model.parameters };
      for (const key of Object.keys(OPTICS_DEFAULTS)) main.querySelector(`#optics-${key}`).value = params[key];
      graph.setModel(model); render(); progress.session(id, { parameters: { ...params } });
    } catch (error) { main.querySelector('#optics-status').textContent = error.message; }
  }
  for (const key of Object.keys(OPTICS_DEFAULTS)) main.querySelector(`#optics-${key}`).addEventListener('input', event => update({ ...params, [key]: Number(event.target.value) }), { signal: abort.signal });
  graph.setModel(model); render(); progress.session(id, { parameters: { ...params } });
  context.activeSimulation = () => ({ id, parameters: { ...params }, state: { time: params.objectDistance, playing: false, rate: 1 }, measurements: model.at(params.objectDistance), graphs: ['imageDistance'] });
  return () => { abort.abort(); context.activeSimulation = null; };
}
