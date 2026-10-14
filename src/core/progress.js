const KEY = 'physicslab.progress.v1';
const fresh = () => ({ version: 1, visited: {}, experiments: {}, lessons: {}, quizzes: {}, activity: [], sessions: {}, notebooks: {} });
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
const validEquipmentId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value);
function clean(raw) {
  if (!record(raw) || raw.version !== 1) return fresh();
  const data = fresh();
  for (const key of ['visited', 'experiments', 'lessons', 'quizzes']) {
    if (record(raw[key])) for (const [id, value] of Object.entries(raw[key])) {
      if (/^[a-z0-9-]+$/.test(id) && Number.isFinite(value) && value >= 0) data[key][id] = value;
    }
  }
  if (Array.isArray(raw.activity)) data.activity = raw.activity.filter(a => record(a) && typeof a.label === 'string' && typeof a.id === 'string' && Number.isFinite(a.at) && Math.abs(a.at) <= 8.64e15).slice(0, 20);
  if (record(raw.sessions)) {
    for (const [id, value] of Object.entries(raw.sessions)) {
      if (!/^[a-z0-9-]+$/.test(id) || !record(value)) continue;
      const cleanSession = {};
      if (record(value.parameters)) {
        const params = {};
        for (const [key, param] of Object.entries(value.parameters)) {
          if (typeof key === 'string' && Number.isFinite(param)) params[key] = param;
        }
        if (Object.keys(params).length) cleanSession.parameters = params;
      }
      if (record(value.setup)) {
        const setup = {};
        for (const [key, entry] of Object.entries(value.setup)) {
          if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(key)) continue;
          if ((typeof entry === 'string' && validEquipmentId(entry)) || (Number.isFinite(entry) && Math.abs(entry) <= 1e15)) {
            setup[key] = entry;
          } else if (record(entry)) {
            const nested = {};
            for (const [nestedKey, nestedValue] of Object.entries(entry)) {
              if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(nestedKey)) continue;
              if (Number.isFinite(nestedValue) && Math.abs(nestedValue) <= 1e15) nested[nestedKey] = nestedValue;
              else if (typeof nestedValue === 'string' && validEquipmentId(nestedValue)) nested[nestedKey] = nestedValue;
            }
            if (Object.keys(nested).length) setup[key] = nested;
          }
        }
        if (Object.keys(setup).length) cleanSession.setup = setup;
      }
      if (Array.isArray(value.measurements)) {
        cleanSession.measurements = value.measurements.filter(record).slice(0, 100).map(entry => {
          const sanitized = {};
          for (const section of ['readings', 'uncertainties', 'setup', 'instruments']) {
            if (!record(entry[section])) continue;
            const values = {};
            for (const [key, item] of Object.entries(entry[section])) {
              if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(key)) continue;
              if (Number.isFinite(item) && Math.abs(item) <= 1e15) values[key] = item;
              else if (validEquipmentId(item)) values[key] = item;
            }
            if (Object.keys(values).length) sanitized[section] = values;
          }
          if (validId(entry.experimentId)) sanitized.experimentId = entry.experimentId;
          if (typeof entry.title === 'string' && entry.title.length <= 120) sanitized.title = entry.title;
          if (Number.isFinite(entry.at) && Math.abs(entry.at) <= 8.64e15) sanitized.at = entry.at;
          const validUnits = new Set(['m','s','N','A','V','Pa','K','Hz','T','J','m/s','m/s²','kg','kg·m/s','Ω','°','m³']);
          if (validUnits.has(entry.xUnit)) sanitized.xUnit = entry.xUnit;
          if (validUnits.has(entry.yUnit)) sanitized.yUnit = entry.yUnit;
          for (const key of ['mass', 'force', 'extension', 'springConstant']) {
            if (Number.isFinite(entry[key]) && Math.abs(entry[key]) <= 1e15) sanitized[key] = entry[key];
          }
          for (const key of ['rulerId', 'forceGaugeId', 'springId']) if (validEquipmentId(entry[key])) sanitized[key] = entry[key];
          return sanitized;
        }).filter(entry => id === 'hooke-lab'
          ? ['mass', 'force', 'extension', 'springConstant'].every(key => Number.isFinite(entry[key]))
            && entry.mass > 0 && entry.force >= 0 && entry.extension > 0 && entry.springConstant > 0
          : Object.keys(entry).length > 0);
      }
      if (Number.isFinite(value.time) && value.time >= 0) cleanSession.time = value.time;
      if (Object.keys(cleanSession).length) data.sessions[id] = cleanSession;
    }
  }
  if (record(raw.notebooks)) {
    for (const [id, value] of Object.entries(raw.notebooks)) {
      if (!validId(id) || !record(value)) continue;
      const notebook = {};
      for (const field of ['objective', 'hypothesis', 'observations', 'conclusion']) {
        if (typeof value[field] === 'string') notebook[field] = value[field].slice(0, 4000);
      }
      if (Number.isInteger(value.selfAssessment) && value.selfAssessment >= 1 && value.selfAssessment <= 5) notebook.selfAssessment = value.selfAssessment;
      if (Number.isFinite(value.updatedAt) && Math.abs(value.updatedAt) <= 8.64e15) notebook.updatedAt = value.updatedAt;
      if (Object.keys(notebook).length) data.notebooks[id] = notebook;
    }
  }
  return data;
}
/** Keep the v1 schema; validate imports before replacing a learner's current progress. */
export function validateProgressSnapshot(snapshot) {
  if (!record(snapshot) || snapshot.version !== 1 || !record(snapshot.visited) || !record(snapshot.lessons)) {
    throw new RangeError('Tệp tiến độ không đúng phiên bản hoặc thiếu dữ liệu PhysicsLab.');
  }
  return clean(snapshot);
}

export function createProgress(storage) {
  let data = fresh();
  let raw = null;
  let persistent = !!storage;
  let readable = !!storage;
  let damaged = false;
  let issue = '';
  if (storage) {
    try {
      raw = storage.getItem(KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!record(parsed) || parsed.version !== 1) throw new RangeError('Kho tiến độ không đúng phiên bản.');
        data = clean(parsed);
      }
    } catch (error) {
      if (raw !== null) damaged = true;
      else readable = false;
      persistent = false;
      issue = damaged
        ? 'Kho tiến độ cũ có lỗi hoặc khác phiên bản. Bản gốc được bảo vệ; hãy tải bản cứu hộ trước khi khôi phục.'
        : `Không đọc được kho tiến độ; chỉ giữ thay đổi trong bộ nhớ. ${error.message}`;
    }
  }
  /** A stale tab may retain its unsaved draft for export, never overwrite the other tab. */
  function save(next, { allowDamaged = false } = {}) {
    data = next;
    if (damaged && !allowDamaged) { persistent = false; return false; }
    if (!storage || !readable) { persistent = false; return false; }
    let current;
    try { current = storage.getItem(KEY); }
    catch (error) {
      persistent = false;
      issue = `Không đọc được kho tiến độ để kiểm tra xung đột. ${error.message}`;
      return false;
    }
    if (current !== raw) {
      persistent = false;
      issue = 'Tiến độ đã thay đổi ở tab khác. Hãy xuất dữ liệu phiên này và tải lại trang trước khi ghi tiếp.';
      return false;
    }
    try {
      const encoded = JSON.stringify(next);
      storage.setItem(KEY, encoded);
      raw = encoded;
      persistent = true;
      damaged = false;
      issue = '';
      return true;
    } catch (error) {
      persistent = false;
      issue = `Không lưu được tiến độ. Dữ liệu vẫn ở trong bộ nhớ; hãy xuất bản sao trước khi thoát. ${error.message}`;
      return false;
    }
  }
  function change(update) {
    const next = structuredClone(data);
    update(next);
    save(next);
  }
  function activity(next, id, label) {
    next.activity = [{ id, label, at: Date.now() }, ...next.activity].slice(0, 20);
  }
  // Probe only a *new* key. Never rewrite an existing/invalid/unsupported schema on startup.
  if (raw === null && readable) save(data);
  return {
    get: () => structuredClone(data),
    isPersistent: () => persistent && !damaged,
    isDamaged: () => damaged,
    issue: () => issue,
    rescue: () => raw,
    restore(snapshot, { allowDamaged = false } = {}) {
      const restored = validateProgressSnapshot(snapshot);
      if (damaged && !allowDamaged) throw new Error('Kho cũ đang được bảo vệ. Cần xác nhận khôi phục đè sau khi tải bản cứu hộ.');
      save(restored, { allowDamaged });
      return structuredClone(data);
    },
    visit(id, label) {
      if (!validId(id) || typeof label !== 'string') throw new TypeError('Mã và tên hoạt động phải hợp lệ.');
      if (!data.visited[id]) change(next => { next.visited[id] = Date.now(); activity(next, id, label); });
    },
    complete(id) {
      if (!validId(id)) throw new TypeError('Mã mô phỏng không hợp lệ.');
      change(next => { next.experiments[id] = (next.experiments[id] || 0) + 1; activity(next, id, 'Hoàn thành một lượt mô phỏng'); });
    },
    lesson(id, step) {
      if (!validId(id) || !Number.isInteger(step) || step < 1 || step > 4) throw new RangeError('Tiến độ bài học phải có mã hợp lệ và bước nguyên từ 1 đến 4.');
      change(next => { next.lessons[id] = Math.max(next.lessons[id] || 0, step); });
    },
    quiz(id, score) {
      if (!validId(id) || !Number.isInteger(score) || score < 0 || score > 100) throw new RangeError('Điểm câu hỏi phải là số nguyên từ 0 đến 100.');
      change(next => { next.quizzes[id] = Math.max(next.quizzes[id] || 0, score); activity(next, id, `Trả lời câu hỏi: ${score}%`); });
    },
    session(id, value) {
      if (!validId(id) || !record(value)) throw new TypeError('Mã phiên và dữ liệu phiên phải hợp lệ.');
      const sanitized = clean({ version: 1, sessions: { [id]: value } }).sessions[id];
      if (!sanitized) throw new RangeError('Dữ liệu phiên không chứa thông tin hợp lệ.');
      change(next => { next.sessions[id] = sanitized; });
    },
    notebook(id, value) {
      if (!validId(id) || !record(value)) throw new TypeError('Mã thí nghiệm và nội dung sổ thực hành phải hợp lệ.');
      const sanitized = clean({ version: 1, notebooks: { [id]: value } }).notebooks[id];
      if (!sanitized) throw new RangeError('Sổ thực hành không chứa nội dung hợp lệ.');
      change(next => { next.notebooks[id] = sanitized; });
      return structuredClone(sanitized);
    },
    clear() { change(next => Object.assign(next, fresh())); }
  };
}
export function browserStorage() { try { return window.localStorage; } catch { return undefined; } }
