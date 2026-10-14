import '../styles/lab-notebook.css';
import { LAB_EXPERIMENTS } from '../core/lab-experiments.js';
import { notebookMeasurementRows, validateNotebookImport } from '../core/notebook-report.js';
import { format } from '../core/units.js';

const fields = ['objective', 'hypothesis', 'observations', 'conclusion'];

function experimentTitle(id) {
  if (id === 'ohms-law') return 'Lắp mạch điện tương tác';
  if (id === 'hooke-law') return 'Lò xo Hooke';
  if (id === 'gas-law') return 'Bình khí và piston';
  return LAB_EXPERIMENTS.find(item => item.id === id)?.title || id;
}

function experimentEvidence(data, id) {
  if (id === 'hooke-law') return data.sessions['hooke-lab']?.measurements || [];
  return (data.sessions['virtual-lab']?.measurements || []).filter(row => row.experimentId === id);
}

function setupSummary(data, id) {
  if (id === 'hooke-law') return data.sessions['hooke-lab']?.setup;
  if (id === 'gas-law') return data.sessions['ideal-gas']?.parameters;
  if (id === 'ohms-law') return null;
  const rows = experimentEvidence(data, id);
  return rows.at(-1)?.setup || (data.sessions['virtual-lab']?.setup?.experimentId === id ? data.sessions['virtual-lab'].setup.parameters : null);
}

export function mountLabNotebook(root, { progress, experimentId = 'ohms-law', evidenceReport = null }) {
  const abort = new AbortController();
  let activeId = experimentId;
  let saveTimer = 0;
  root.innerHTML = `<section class="student-notebook" aria-labelledby="student-notebook-title">
    <header class="student-notebook-head"><div><p class="eyebrow">STUDENT LAB NOTEBOOK · LƯU TRÊN THIẾT BỊ</p><h2 id="student-notebook-title">Sổ thực hành điện tử</h2><p id="student-notebook-experiment"></p></div><div class="student-notebook-actions"><button type="button" class="button secondary" data-notebook-refresh>Cập nhật số liệu</button><button type="button" class="button secondary" data-notebook-export>Xuất JSON</button><button type="button" class="button secondary" data-notebook-import>Nhập JSON</button><button type="button" class="button primary" data-notebook-print>In / Lưu PDF</button><input type="file" accept="application/json,.json" data-notebook-file hidden aria-label="Chọn tệp sổ thực hành JSON"></div></header>
    <div class="student-notebook-evidence"><div><span>THÍ NGHIỆM</span><strong data-notebook-title></strong></div><div><span>SỐ PHÉP ĐO ĐÃ LƯU</span><strong data-notebook-count>0</strong></div><div><span>THIẾT LẬP GẦN NHẤT</span><strong data-notebook-setup>Chưa có dữ liệu</strong></div></div>
    <div class="student-notebook-grid">
      <label>Mục tiêu<textarea data-notebook-field="objective" maxlength="4000" rows="3" placeholder="Bạn muốn kiểm chứng quy luật hoặc mối quan hệ nào?"></textarea><span class="notebook-print-value" data-notebook-print-field="objective"></span></label>
      <label>Giả thuyết ban đầu<textarea data-notebook-field="hypothesis" maxlength="4000" rows="3" placeholder="Nếu thay đổi đại lượng…, tôi dự đoán… vì…"></textarea><span class="notebook-print-value" data-notebook-print-field="hypothesis"></span></label>
      <label>Quan sát và giải thích<textarea data-notebook-field="observations" maxlength="4000" rows="5" placeholder="Mô tả điều đã quan sát; dẫn số đo hoặc xu hướng trên đồ thị."></textarea><span class="notebook-print-value" data-notebook-print-field="observations"></span></label>
      <label>Kết luận<textarea data-notebook-field="conclusion" maxlength="4000" rows="5" placeholder="Kết quả có ủng hộ giả thuyết không? Nêu giới hạn của phép đo."></textarea><span class="notebook-print-value" data-notebook-print-field="conclusion"></span></label>
    </div>
    <section class="student-notebook-measurements" aria-label="Bảng số đo thực tế"><h3>Bảng số đo thực nghiệm</h3><p data-notebook-evidence-status>Chưa có phép đo được lưu cho thí nghiệm này.</p><div class="student-notebook-table-scroll"><table><thead><tr><th>STT</th><th data-notebook-x-label>Đại lượng x</th><th data-notebook-y-label>Đại lượng y</th><th>Δx</th><th>Δy</th></tr></thead><tbody data-notebook-table></tbody></table></div></section>
    <div class="student-notebook-footer"><label>Mức độ tự hiểu bài<select data-notebook-assessment><option value="">Chưa tự đánh giá</option><option value="1">1 · Cần hướng dẫn lại</option><option value="2">2 · Hiểu một phần</option><option value="3">3 · Hiểu ý chính</option><option value="4">4 · Có thể giải thích</option><option value="5">5 · Có thể vận dụng</option></select><span class="notebook-print-assessment" data-notebook-print-assessment></span></label><p data-notebook-status role="status" aria-live="polite">Sổ được lưu cục bộ cùng bản sao tiến độ PhysicsLab.</p></div>
  </section>`;
  const $ = selector => root.querySelector(selector);
  const status = message => { $('[data-notebook-status]').textContent = message; };

  function refreshEvidence() {
    if (evidenceReport) {
      const evidence = evidenceReport();
      $('[data-notebook-count]').textContent = String(evidence.rows.length);
      $('[data-notebook-setup]').textContent = evidence.setup || 'Chưa ghi thiết lập';
      const head = root.querySelector('.student-notebook-measurements thead tr');
      const table = $('[data-notebook-table]'); head.replaceChildren(); table.replaceChildren();
      for (const column of evidence.columns) {
        const th = document.createElement('th'); th.textContent = `${column.label}${column.unit ? ` (${column.unit})` : ''}`; head.append(th);
      }
      for (const row of evidence.rows) {
        const tr = document.createElement('tr');
        for (const column of evidence.columns) {
          const td = document.createElement('td'); td.textContent = Number.isFinite(row[column.key]) ? format(row[column.key], 6) : 'Thiếu số đo'; tr.append(td);
        }
        table.append(tr);
      }
      $('[data-notebook-evidence-status]').textContent = evidence.rows.length
        ? `${evidence.rows.length} số đo mô hình được chọn; không phải số đo từ thiết bị vật lý. Bảng được đưa vào JSON và bản in.`
        : 'Chưa chọn phép đo. Chọn các hàng trong bảng đo để đưa vào báo cáo.';
      return;
    }
    const data = progress.get();
    const rows = notebookMeasurementRows(data, activeId);
    const setup = setupSummary(data, activeId);
    $('[data-notebook-count]').textContent = String(rows.length);
    const experiment = LAB_EXPERIMENTS.find(item => item.id === activeId);
    $('[data-notebook-x-label]').textContent = activeId === 'hooke-law' ? 'Độ dãn (m)' : experiment?.xLabel || 'x';
    $('[data-notebook-y-label]').textContent = activeId === 'hooke-law' ? 'Lực (N)' : experiment?.yLabel || 'y';
    const table = $('[data-notebook-table]');
    table.replaceChildren();
    for (const [i, row] of rows.entries()) {
      const tr = document.createElement('tr');
      for (const value of [i + 1, format(row.x, 4), format(row.y, 4), row.dx === null ? '—' : format(row.dx, 4), row.dy === null ? '—' : format(row.dy, 4)]) {
        const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
      }
      table.append(tr);
    }
    $('[data-notebook-evidence-status]').textContent = rows.length
      ? `${rows.length} phép đo đã lưu. Bảng bên dưới sẽ được in đầy đủ trong báo cáo.`
      : activeId === 'ohms-law' ? 'Số đo chi tiết đang nằm ở bàn lắp mạch. Không tự tạo số đo từ sơ đồ mạch.' : 'Chưa có phép đo được lưu cho thí nghiệm này.';
    $('[data-notebook-setup]').textContent = setup
      ? Object.entries(setup).map(([key, value]) => `${key}=${value}`).join(' · ')
      : activeId === 'ohms-law' ? 'Sơ đồ mạch được lưu trong bàn lắp mạch' : 'Chưa ghi thiết lập';
  }

  function save() {
    clearTimeout(saveTimer);
    const value = Object.fromEntries(fields.map(field => {
      const content = $(`[data-notebook-field="${field}"]`).value;
      $(`[data-notebook-print-field="${field}"]`).textContent = content || 'Chưa ghi nội dung.';
      return [field, content];
    }));
    const assessment = Number($('[data-notebook-assessment]').value);
    if (assessment) value.selfAssessment = assessment;
    value.updatedAt = Date.now();
    const chosen = $('[data-notebook-assessment]');
    $('[data-notebook-print-assessment]').textContent = chosen.selectedOptions[0]?.textContent || 'Chưa tự đánh giá';
    try {
      progress.notebook(activeId, value);
      status(progress.isPersistent?.() === false ? 'Chưa ghi được xuống thiết bị. Xuất JSON trước khi rời trang.' : `Đã lưu lúc ${new Date(value.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`);
    } catch (error) { status(`Chưa lưu: ${error.message}`); }
  }

  function load() {
    clearTimeout(saveTimer);
    const notebook = progress.get().notebooks[activeId] || {};
    for (const field of fields) {
      const content = notebook[field] || '';
      $(`[data-notebook-field="${field}"]`).value = content;
      $(`[data-notebook-print-field="${field}"]`).textContent = content || 'Chưa ghi nội dung.';
    }
    $('[data-notebook-assessment]').value = notebook.selfAssessment || '';
    $('[data-notebook-print-assessment]').textContent = $('[data-notebook-assessment]').selectedOptions[0]?.textContent || 'Chưa tự đánh giá';
    const title = evidenceReport ? evidenceReport().title : experimentTitle(activeId);
    $('[data-notebook-title]').textContent = title;
    $('#student-notebook-experiment').textContent = `Đang ghi cho: ${title}`;
    status(notebook.updatedAt ? `Đã khôi phục sổ lưu lúc ${new Date(notebook.updatedAt).toLocaleString('vi-VN')}.` : 'Chưa có ghi chú cho thí nghiệm này.');
    refreshEvidence();
  }

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-notebook-field], [data-notebook-assessment]')) return;
    clearTimeout(saveTimer);
    status('Đang lưu…');
    saveTimer = setTimeout(save, 250);
  }, { signal: abort.signal });
  $('[data-notebook-refresh]').addEventListener('click', () => { refreshEvidence(); status('Đã cập nhật số liệu từ bàn thí nghiệm.'); }, { signal: abort.signal });
  $('[data-notebook-export]').addEventListener('click', () => {
    save();
    const payload = { version: 1, experimentId: activeId, title: evidenceReport ? evidenceReport().title : experimentTitle(activeId), notebook: progress.get().notebooks[activeId], ...(evidenceReport ? { evidence: evidenceReport() } : {}) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `physicslab-notebook-${activeId}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { signal: abort.signal });
  $('[data-notebook-import]').addEventListener('click', () => $('[data-notebook-file]').click(), { signal: abort.signal });
  $('[data-notebook-file]').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('Tệp quá lớn (tối đa 2 MB).');
      const payload = JSON.parse(await file.text());
      progress.notebook(activeId, validateNotebookImport(payload, activeId)); load(); status('Đã nhập và kiểm tra sổ thực hành.');
    } catch (error) { status(`Không thể nhập: ${error.message}`); }
    event.target.value = '';
  }, { signal: abort.signal });
  $('[data-notebook-print]').addEventListener('click', () => {
    save(); document.body.classList.add('notebook-printing'); window.print();
    setTimeout(() => document.body.classList.remove('notebook-printing'), 1000);
  }, { signal: abort.signal });
  window.addEventListener('afterprint', () => document.body.classList.remove('notebook-printing'), { signal: abort.signal });
  // Flush text still in the 250 ms debounce before switching to a new offline release.
  window.addEventListener('physicslab:before-update', save, { signal: abort.signal });
  window.addEventListener('physicslab:before-backup', save, { signal: abort.signal });

  load();
  return {
    select(id) { if (id === activeId) { refreshEvidence(); return; } save(); activeId = id; load(); },
    refresh: refreshEvidence,
    flush: save,
    destroy() { clearTimeout(saveTimer); save(); abort.abort(); document.body.classList.remove('notebook-printing'); }
  };
}
