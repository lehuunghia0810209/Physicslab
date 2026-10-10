const KEY = 'physicslab.progress.v1';
const fresh = () => ({ version: 1, visited: {}, experiments: {}, lessons: {}, quizzes: {}, activity: [], sessions: {} });
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
  return data;
}
export function createProgress(storage) {
  let data = fresh();
  let persistent = !!storage;
  try {
    const raw = storage?.getItem(KEY);
    try { data = clean(JSON.parse(raw ?? 'null')); } catch { /* Corrupted data starts clean. */ }
  } catch { persistent = false; }
  function save() { try { storage?.setItem(KEY, JSON.stringify(data)); } catch { persistent = false; } }
  function activity(id, label) {
    data.activity = [{ id, label, at: Date.now() }, ...data.activity].slice(0, 20); save();
  }
  save(); // Probe persistence now so the shell can report a storage fallback immediately.
  return { get: () => structuredClone(data), isPersistent: () => persistent,
    restore(snapshot) {
      if (!record(snapshot) || snapshot.version !== 1) throw new RangeError('Tệp tiến độ không đúng phiên bản PhysicsLab.');
      const cleanSnapshot = clean(snapshot);
      data = cleanSnapshot; save();
      return structuredClone(data);
    },
    visit(id, label) {
      if (!validId(id) || typeof label !== 'string') throw new TypeError('Mã và tên hoạt động phải hợp lệ.');
      if (!data.visited[id]) { data.visited[id] = Date.now(); activity(id, label); }
    },
    complete(id) {
      if (!validId(id)) throw new TypeError('Mã mô phỏng không hợp lệ.');
      data.experiments[id] = (data.experiments[id] || 0) + 1; activity(id, 'Hoàn thành một lượt mô phỏng');
    },
    lesson(id, step) {
      if (!validId(id) || !Number.isInteger(step) || step < 1 || step > 4) throw new RangeError('Tiến độ bài học phải có mã hợp lệ và bước nguyên từ 1 đến 4.');
      data.lessons[id] = Math.max(data.lessons[id] || 0, step); save();
    },
    quiz(id, score) {
      if (!validId(id) || !Number.isInteger(score) || score < 0 || score > 100) throw new RangeError('Điểm câu hỏi phải là số nguyên từ 0 đến 100.');
      data.quizzes[id] = Math.max(data.quizzes[id] || 0, score); activity(id, `Trả lời câu hỏi: ${score}%`);
    },
    session(id, value) {
      if (!validId(id) || !record(value)) throw new TypeError('Mã phiên và dữ liệu phiên phải hợp lệ.');
      const sanitized = clean({ version: 1, sessions: { [id]: value } }).sessions[id];
      if (!sanitized) throw new RangeError('Dữ liệu phiên không chứa thông tin hợp lệ.');
      data.sessions[id] = sanitized; save();
    },
    clear() { data = fresh(); save(); }
  };
}
export function browserStorage() { try { return window.localStorage; } catch { return undefined; } }
