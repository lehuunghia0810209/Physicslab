import { format } from '../core/units.js';
import { MeasurementSystem } from '../engines/measurements.js';
import { sameExperimentSetup, EXPERIMENT_LIMITS } from '../core/experiment-store.js';
import { getExperimentStore } from '../core/experiment-session.js';
import { escapeHtml } from './icons.js';
import { mountLabNotebook } from '../pages/lab-notebook.js';
import { mountRunComparison } from './run-comparison.js';
import '../styles/measurement-panel.css';

/** A small, shared data probe: every row is copied from the active physics model. */
export function mountMeasurementPanel(root, { columns, state, filename, signal, experiment }) {
  const store = getExperimentStore();
  columns = columns.map(c => ({ ...c, unit: c.unit || '', csv: c.csv || c.key }));
  const measurements = new MeasurementSystem(100, columns);
  const fresh = () => ({ id: crypto.randomUUID(), simulationId: experiment.id,
    name: `${experiment.title} · ${new Date().toLocaleTimeString('vi-VN')}`, createdAt: Date.now(),
    modelVersion: '2.2.0-dev', assumptions: experiment.assumptions, parameters: { ...experiment.parameters() },
    columns, rows: [], selected: [], notebook: { objective: `Khảo sát ${experiment.title.toLowerCase()}. Thay đổi một đại lượng và đối chiếu kết quả.` } });
  let draft = store.get().drafts[experiment.id] || fresh();
  let notebook;
  let comparison;
  root.className = 'simulation-measurement-panel panel';
  root.innerHTML = `<div class="simulation-measurement-heading"><div><span class="tag">EXPERIMENT STUDIO · 2.2</span><h2>Thực nghiệm và sổ đo</h2><p>Giả thuyết → Thiết lập → Đo lường → Phân tích → Kết luận. Số đo lấy từ mô hình lý tưởng.</p></div></div>
    <label class="experiment-name">Tên lần chạy<input data-run-name maxlength="120" aria-label="Tên lần chạy"></label>
    <details><summary>Thiết lập và giới hạn mô hình</summary><p data-experiment-setup></p><p>${escapeHtml(experiment.assumptions)}</p><p>Hiển thị 6 chữ số thập phân; đây không phải độ chính xác của dụng cụ vật lý.</p></details>
    <div class="simulation-measurement-actions"><button class="button primary" type="button" data-measure-capture>＋ Ghi phép đo</button><button class="button secondary" type="button" data-run-save>Lưu lần chạy</button><button class="button secondary" type="button" data-run-new>Thí nghiệm mới</button><button class="button secondary" type="button" data-measure-export disabled>Xuất CSV</button><button class="button ghost" type="button" data-measure-clear disabled>Xóa bảng</button></div>
    <p data-measure-status role="status" aria-live="polite"></p>
    <details open><summary>Bảng đo · chọn hàng đưa vào Notebook</summary><div class="table-scroll"><table><caption class="sr-only">Số đo mô hình và lựa chọn bằng chứng</caption><thead><tr><th>Notebook</th>${columns.map(c => `<th>${escapeHtml(c.label)}${c.unit ? ` (${escapeHtml(c.unit)})` : ''}</th>`).join('')}</tr></thead><tbody data-measure-body></tbody></table></div></details>
    <details class="experiment-runs"><summary>Các lần chạy đã lưu <span data-run-count></span></summary><p>Tối đa 30 lần chạy, 100 mẫu/lần và 1 MB toàn kho. “Thí nghiệm mới” lưu bảng hiện tại trước khi đặt lại thời gian.</p><div data-run-list></div><div data-run-preview></div><div class="simulation-measurement-actions"><button type="button" class="button secondary" data-run-backup>Sao lưu toàn bộ JSON</button><button type="button" class="button secondary" data-run-import>Nhập bản sao JSON</button><button type="button" class="button secondary" data-run-rescue hidden>Tải kho gốc để cứu hộ</button><input type="file" accept="application/json,.json" data-run-file hidden aria-label="Bản sao thí nghiệm JSON"></div></details>
    <details class="experiment-comparison"><summary>So sánh 2–3 lần chạy</summary><div data-experiment-comparison></div></details>
    <details class="experiment-notebook"><summary>Student Notebook · giả thuyết, nhận xét và kết luận</summary><div data-experiment-notebook></div></details>`;
  const $ = selector => root.querySelector(selector);
  const body = root.querySelector('[data-measure-body]');
  const status = root.querySelector('[data-measure-status]');
  const exportButton = root.querySelector('[data-measure-export]');
  const clearButton = root.querySelector('[data-measure-clear]');
  const message = value => { status.textContent = `${value}${store.issue() ? ` ${store.issue()}` : ''}`; };
  const persist = () => store.draft(draft);
  const action = fn => { try { fn(); } catch (error) { message(error.message); } };
  const download = (content, name, type) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const render = () => {
    measurements.rows = draft.rows.map(row => ({ ...row }));
    $('[data-run-name]').value = draft.name;
    $('[data-experiment-setup]').textContent = Object.entries(draft.parameters).map(([key,value]) => `${key} = ${value}`).join(' · ');
    body.innerHTML = draft.rows.length
      ? draft.rows.map((row,i) => `<tr><td><label class="experiment-select"><input type="checkbox" data-measure-select="${i}" aria-label="Đưa mẫu ${i+1} vào Notebook" ${draft.selected.includes(i) ? 'checked' : ''}><span>${i+1}</span></label></td>${columns.map(({ key }) => `<td>${Number.isFinite(row[key]) ? format(row[key],6) : 'Thiếu'}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${columns.length+1}" class="empty-cell">Chạy hoặc tua tới điểm cần khảo sát rồi chọn “Ghi phép đo”.</td></tr>`;
    exportButton.disabled = clearButton.disabled = !measurements.rows.length;
    $('[data-run-save]').disabled = !draft.rows.length;
    const runs = store.get().runs.filter(run => run.simulationId === experiment.id);
    $('[data-run-count]').textContent = `(${runs.length})`;
    $('[data-run-list]').innerHTML = runs.length ? runs.map(run => `<article class="experiment-run"><div><strong>${escapeHtml(run.name)}</strong><small>${run.rows.length} mẫu · ${new Date(run.createdAt).toLocaleString('vi-VN')}</small></div><div class="simulation-measurement-actions"><button type="button" class="button secondary" data-run-view="${run.id}">Xem báo cáo</button><button type="button" class="button secondary" data-run-edit="${run.id}">Mở để chỉnh sửa</button><button type="button" class="button secondary" data-run-rename="${run.id}">Đổi tên</button><button type="button" class="button ghost" data-run-delete="${run.id}">Xóa</button></div></article>`).join('') : '<p>Chưa lưu lần chạy nào.</p>';
    notebook?.refresh();
    comparison?.refresh();
  };
  function mountNotebook() {
    const notebookId = `studio-${experiment.id}`;
    notebook = mountLabNotebook($('[data-experiment-notebook]'), {
      experimentId: notebookId,
      progress: { get: () => ({ notebooks: { [notebookId]: structuredClone(draft.notebook) } }),
        notebook: (_id,value) => { draft.notebook = structuredClone(value); persist(); }, isPersistent: () => store.isPersistent() },
      evidenceReport: () => ({ title: draft.name, runId: draft.id, simulationId: draft.simulationId,
        modelVersion: draft.modelVersion, assumptions: draft.assumptions, parameters: { ...draft.parameters },
        setup: Object.entries(draft.parameters).map(([key,value]) => `${key}=${value}`).join(' · '),
        columns: draft.columns, rows: draft.selected.map(i => draft.rows[i]).filter(Boolean) })
    });
  }
  root.querySelector('[data-measure-capture]').addEventListener('click', () => action(() => {
    if (JSON.stringify(draft.columns) !== JSON.stringify(columns)) throw new Error('Cột đo cũ khác phiên bản hiện tại. Sao lưu rồi bắt đầu thí nghiệm mới.');
    const parameters = experiment.parameters();
    if (draft.rows.length && !sameExperimentSetup(draft.parameters,parameters)) throw new Error('Thiết lập đã thay đổi. Chọn “Thí nghiệm mới” để giữ riêng số đo của hai lần chạy.');
    const snapshot = state();
    if (!measurements.capture(snapshot)) throw new Error('Không thể ghi: số đo không hữu hạn hoặc đã đủ 100 mẫu.');
    draft.parameters = { ...parameters }; draft.rows = measurements.rows.map(row => ({ ...row })); draft.selected.push(draft.rows.length-1);
    persist(); render(); message(`Đã ghi mẫu ${draft.rows.length}${Number.isFinite(snapshot.t) ? ` tại t = ${format(snapshot.t,6)} s` : ''}.`);
    root.dispatchEvent(new CustomEvent('physicslab:measurement-recorded',{bubbles:true}));
  }), { signal });
  $('[data-run-name]').addEventListener('change', event => action(() => {
    if (!event.target.value.trim()) throw new Error('Tên lần chạy không được để trống.');
    draft.name = event.target.value.trim(); persist(); message('Đã cập nhật tên bản nháp.');
  }), { signal });
  root.addEventListener('change', event => {
    if (!event.target.matches('[data-measure-select]')) return;
    action(() => { const i=Number(event.target.dataset.measureSelect); draft.selected=draft.selected.filter(index=>index!==i); if(event.target.checked)draft.selected.push(i); draft.selected.sort((a,b)=>a-b); persist(); notebook.refresh(); });
  }, { signal });
  $('[data-run-save]').addEventListener('click', () => action(() => { notebook.flush(); store.save(draft); render(); message('Đã lưu lần chạy và báo cáo. Kết quả là mẫu cuối đã ghi; không suy đoán phần chưa đo.'); }), { signal });
  $('[data-run-new]').addEventListener('click', () => action(() => {
    notebook.flush();
    if (draft.rows.length) store.save(draft);
    else if (['hypothesis','observations','conclusion'].some(key=>draft.notebook[key]) && !window.confirm('Bản nháp chưa có số đo. Bắt đầu mới sẽ bỏ phần ghi chú này. Tiếp tục?')) return;
    const next=fresh();store.draft(next);
    notebook.destroy(); notebook=null; draft=next; persist(); experiment.reset(); render(); mountNotebook(); message('Đã bắt đầu thí nghiệm mới. Các lần chạy đã lưu vẫn được giữ.');
  }), { signal });
  clearButton.addEventListener('click', () => action(() => {
    if (!window.confirm('Xóa bảng đo bản nháp? Các lần chạy đã lưu không bị xóa.')) return;
    draft.rows=[]; draft.selected=[]; persist(); render(); message('Đã xóa bảng đo bản nháp.');
  }), { signal });
  exportButton.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob(['\ufeff' + measurements.csv()], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { signal });
  root.addEventListener('click', event => action(() => {
    const button=event.target.closest('[data-run-view],[data-run-edit],[data-run-rename],[data-run-delete]'); if(!button)return;
    const id=button.dataset.runView||button.dataset.runEdit||button.dataset.runRename||button.dataset.runDelete;
    const run=store.get().runs.find(item=>item.id===id); if(!run)return;
    if(button.hasAttribute('data-run-delete')){
      if(!window.confirm(`Xóa lần chạy “${run.name}”? Bản nháp và các lần chạy khác vẫn được giữ.`))return;
      store.remove(id); $('[data-run-preview]').replaceChildren(); render(); message('Đã xóa lần chạy đã chọn; có thể khôi phục từ bản sao JSON đã xuất.');
    }else if(button.hasAttribute('data-run-rename')){
      const name=window.prompt('Tên mới của lần chạy',run.name); if(name===null)return;
      store.rename(id,name); if(draft.id===id){draft.name=name;persist();} render();
    }else if(button.hasAttribute('data-run-edit')){
      notebook.flush(); if(draft.rows.length)store.save(draft);
      if(!draft.rows.length && ['hypothesis','observations','conclusion'].some(key=>draft.notebook[key]) && !window.confirm('Thay bản nháp chưa có số đo bằng lần chạy đã lưu?'))return;
      const next=store.get().runs.find(item=>item.id===id);store.draft(next);
      notebook.destroy();notebook=null;draft=next;persist();render();mountNotebook();
      message('Đã mở báo cáo để chỉnh sửa. Thiết lập mô phỏng không đổi; cần khớp thiết lập trước khi ghi thêm mẫu.');
    }else{
      $('[data-run-preview]').innerHTML=`<h3>${escapeHtml(run.name)}</h3><p>${escapeHtml(run.assumptions)}</p><p>${escapeHtml(Object.entries(run.parameters).map(([k,v])=>`${k}=${v}`).join(' · '))}</p><p>Mẫu cuối đã ghi: ${escapeHtml(JSON.stringify(run.rows.at(-1)))}</p>${['objective','hypothesis','observations','conclusion'].map(key=>`<p class="experiment-note">${escapeHtml(run.notebook[key]||'')}</p>`).join('')}<div class="table-scroll"><table><thead><tr>${run.columns.map(c=>`<th>${escapeHtml(c.label)} (${escapeHtml(c.unit)})</th>`).join('')}</tr></thead><tbody>${run.rows.map(row=>`<tr>${run.columns.map(c=>`<td>${format(row[c.key],6)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
  }),{signal});
  $('[data-run-backup]').addEventListener('click',()=>{notebook.flush();const backup=store.get();backup.drafts[experiment.id]=draft;download(JSON.stringify(backup,null,2),'physicslab-experiments-v1.json','application/json');},{signal});
  $('[data-run-import]').addEventListener('click',()=>$('[data-run-file]').click(),{signal});
  $('[data-run-file]').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(file.size>EXPERIMENT_LIMITS.bytes)throw new Error('Tệp vượt 1 MB.');
      const content=await file.text();if(signal.aborted)return;
      store.import(content);render();message('Đã nhập bản sao và giữ các lần chạy hiện có. Tải lại trang để mở bản nháp đã nhập.');
    }catch(error){message(`Không thể nhập: ${error.message}`);}
    event.target.value='';
  },{signal});
  if(store.issue() && store.rescue()){
    $('[data-run-rescue]').hidden=false;
    $('[data-run-rescue]').addEventListener('click',()=>download(store.rescue(),'physicslab-experiments-rescue.json','application/json'),{signal});
  }
  render();mountNotebook();
  comparison=mountRunComparison($('[data-experiment-comparison]'),{getRuns:()=>store.get().runs.filter(run=>run.simulationId===experiment.id),experiment,signal});
  message(draft.rows.length?`Đã khôi phục ${draft.rows.length} mẫu và thiết lập bản nháp.`:'Bắt đầu bằng mục tiêu và giả thuyết trong Notebook bên dưới.');
  window.addEventListener('physicslab:before-backup', () => {
    notebook?.flush();
    persist();
  }, {signal});
  signal.addEventListener('abort',()=>notebook.destroy(),{once:true});
  return measurements;
}
