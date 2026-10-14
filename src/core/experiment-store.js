export const EXPERIMENT_KEY = 'physicslab.experiments.v1';
export const EXPERIMENT_LIMITS = Object.freeze({ runs: 30, rows: 100, bytes: 1_000_000 });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const idPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
const keyPattern = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;
const finite = value => Number.isFinite(value) && Math.abs(value) <= 1e15;
const text = (value, max) => typeof value === 'string' && value.length <= max;
const fail = message => { throw new Error(message); };
const bytes = value => new TextEncoder().encode(value).length;

export function validateExperiment(run) {
  if (!record(run) || typeof run.id !== 'string' || !idPattern.test(run.id) || typeof run.simulationId !== 'string' || !idPattern.test(run.simulationId)
    || !text(run.name, 120) || !run.name.trim() || !finite(run.createdAt) || run.createdAt < 0
    || !text(run.modelVersion, 40) || !text(run.assumptions, 4000)) fail('Thông tin lần chạy không hợp lệ.');
  if (!record(run.parameters) || Object.keys(run.parameters).length > 30
    || Object.entries(run.parameters).some(([key, value]) => !keyPattern.test(key) || !finite(value))) fail('Thông số ban đầu không hợp lệ.');
  if (!Array.isArray(run.columns) || !run.columns.length || run.columns.length > 20
    || run.columns.some(c => !record(c) || typeof c.key !== 'string' || !keyPattern.test(c.key) || !text(c.label, 120) || !text(c.unit, 30) || !text(c.csv, 80))
    || new Set(run.columns.map(c => c.key)).size !== run.columns.length) fail('Cột và đơn vị đo không hợp lệ.');
  if (!Array.isArray(run.rows) || run.rows.length > EXPERIMENT_LIMITS.rows
    || run.rows.some(row => !record(row) || run.columns.some(c => !finite(row[c.key])))) fail('Chỉ lưu tối đa 100 mẫu hữu hạn.');
  if (!Array.isArray(run.selected) || new Set(run.selected).size !== run.selected.length
    || run.selected.some(i => !Number.isInteger(i) || i < 0 || i >= run.rows.length)) fail('Lựa chọn số đo không hợp lệ.');
  if (!record(run.notebook) || ['objective','hypothesis','observations','conclusion'].some(key => run.notebook[key] !== undefined && !text(run.notebook[key], 4000))
    || (run.notebook.selfAssessment !== undefined && !(Number.isInteger(run.notebook.selfAssessment) && run.notebook.selfAssessment >= 1 && run.notebook.selfAssessment <= 5))) fail('Nội dung Notebook không hợp lệ.');
  const notebook = Object.fromEntries(['objective','hypothesis','observations','conclusion','selfAssessment','updatedAt']
    .filter(key => run.notebook[key] !== undefined && (key !== 'updatedAt' || finite(run.notebook[key])))
    .map(key => [key, run.notebook[key]]));
  return {
    id: run.id, simulationId: run.simulationId, name: run.name.trim(), createdAt: run.createdAt,
    parameters: { ...run.parameters }, modelVersion: run.modelVersion, assumptions: run.assumptions,
    columns: run.columns.map(({ key, label, unit, csv }) => ({ key, label, unit, csv })),
    rows: run.rows.map(row => Object.fromEntries(run.columns.map(c => [c.key, row[c.key]]))),
    selected: [...run.selected], notebook
  };
}

export function validateExperimentBackup(value) {
  if (!record(value) || value.version !== 1 || !record(value.drafts) || !Array.isArray(value.runs)
    || value.runs.length > EXPERIMENT_LIMITS.runs || Object.keys(value.drafts).length > 20) fail('Kho thí nghiệm không đúng phiên bản hoặc vượt giới hạn.');
  const drafts = Object.fromEntries(Object.entries(value.drafts).map(([id, run]) => {
    const valid = validateExperiment(run);
    if (id !== valid.simulationId) fail('Bản nháp không khớp mã mô phỏng.');
    return [id, valid];
  }));
  const runs = value.runs.map(validateExperiment);
  if (runs.some(run => !run.rows.length) || new Set(runs.map(run => run.id)).size !== runs.length) fail('Lần chạy thiếu số đo hoặc trùng mã.');
  const result = { version: 1, drafts, runs };
  if (bytes(JSON.stringify(result)) > EXPERIMENT_LIMITS.bytes) fail('Kho thí nghiệm vượt giới hạn 1 MB. Hãy sao lưu rồi xóa các lần chạy không cần thiết.');
  return result;
}

export function sameExperimentSetup(a, b) {
  return Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([key, value]) => b[key] === value);
}

/** Separate, bounded store; never touches physicslab.progress.v1. */
export function createExperimentStore(storage) {
  let data = { version: 1, drafts: {}, runs: [] }, raw = null, persistent = false, issue = '';
  let damaged = false;
  try {
    raw = storage?.getItem(EXPERIMENT_KEY) ?? null;
    if (raw !== null) {
      if (bytes(raw) > EXPERIMENT_LIMITS.bytes) throw new Error('Kho vượt 1 MB.');
      data = validateExperimentBackup(JSON.parse(raw));
    }
    persistent = !!storage;
  } catch (error) { issue = `Không đọc được kho: ${error.message}`; damaged = raw !== null; }
  function commit(next) {
    next = validateExperimentBackup(next);
    if (damaged) fail('Kho hiện tại bị lỗi; hãy tải bản sao cứu hộ trước khi phục hồi. Dữ liệu cũ chưa bị ghi đè.');
    const encoded = JSON.stringify(next);
    // Detect other-tab writes before changing either the saved or in-memory snapshot.
    let current;
    try { current = storage?.getItem(EXPERIMENT_KEY) ?? null; }
    catch { current = raw; }
    if (current !== raw) fail('Dữ liệu đã thay đổi ở tab khác. Xuất bản sao phiên này rồi tải lại trang.');
    try {
      if (!storage) throw new Error('Trình duyệt chặn lưu trữ.');
      storage.setItem(EXPERIMENT_KEY, encoded); raw = encoded; persistent = true; issue = '';
    } catch (error) { persistent = false; issue = `Chỉ giữ trong bộ nhớ; hãy xuất JSON trước khi rời trang. ${error.message}`; }
    data = next;
    return persistent;
  }
  return {
    get: () => structuredClone(data), isPersistent: () => persistent, isDamaged: () => damaged, issue: () => issue,
    export: () => JSON.stringify(data, null, 2), rescue: () => raw,
    draft(run) { const valid = validateExperiment(run); return commit({ ...data, drafts: { ...data.drafts, [valid.simulationId]: valid } }); },
    save(run) {
      const valid = validateExperiment(run);
      if (!valid.rows.length) fail('Cần ghi ít nhất một phép đo trước khi lưu lần chạy.');
      const runs = data.runs.filter(item => item.id !== valid.id);
      return commit({ ...data, runs: [...runs, valid], drafts: { ...data.drafts, [valid.simulationId]: valid } });
    },
    remove(id) { return commit({ ...data, runs: data.runs.filter(run => run.id !== id) }); },
    rename(id, name) { return commit({ ...data, runs: data.runs.map(run => run.id === id ? { ...run, name } : run) }); },
    import(serialized) {
      if (typeof serialized !== 'string' || bytes(serialized) > EXPERIMENT_LIMITS.bytes) fail('Tệp vượt giới hạn 1 MB.');
      const incoming = validateExperimentBackup(JSON.parse(serialized));
      // Merge without replacing local runs/drafts with the same ID but different content.
      const runs = [...data.runs];
      for (const run of incoming.runs) {
        const previous = runs.find(item => item.id === run.id);
        if (previous && JSON.stringify(previous) !== JSON.stringify(run)) fail('Trùng mã lần chạy với nội dung khác; dữ liệu hiện tại được giữ nguyên.');
        if (!previous) runs.push(run);
      }
      const drafts = { ...data.drafts };
      for (const [id, draft] of Object.entries(incoming.drafts)) {
        if (drafts[id] && JSON.stringify(drafts[id]) !== JSON.stringify(draft)) {
          if (!draft.rows.length) continue;
          const previous = runs.find(run => run.id === draft.id);
          if (previous && JSON.stringify(previous) !== JSON.stringify(draft)) fail('Bản nháp nhập trùng mã với dữ liệu khác.');
          if (!previous) runs.push(draft);
        } else drafts[id] = draft;
      }
      return commit({ version: 1, drafts, runs });
    }
  };
}
