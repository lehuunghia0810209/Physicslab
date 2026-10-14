/** Read-only measured evidence for Student Lab Notebook (never fabricate data). */
const finite = value => typeof value === 'number' && Number.isFinite(value);

export function notebookMeasurementRows(snapshot, experimentId) {
  const sessions = snapshot?.sessions || {};
  const entries = experimentId === 'hooke-law'
    ? sessions['hooke-lab']?.measurements
    : sessions['virtual-lab']?.measurements;
  if (!Array.isArray(entries)) return [];
  const result = [];
  for (const record of entries) {
    if (!record || typeof record !== 'object') continue;
    if (experimentId === 'hooke-law') {
      if (!finite(record.force) || !finite(record.extension)) continue;
      result.push({ x: record.extension, y: record.force, dx: null, dy: null });
    } else {
      if (record.experimentId !== experimentId) continue;
      const r = record.readings || {}, u = record.uncertainties || {};
      if (!finite(r.measuredX) || !finite(r.measuredY)) continue;
      result.push({ x: r.measuredX, y: r.measuredY, dx: finite(u.x) ? u.x : null, dy: finite(u.y) ? u.y : null });
    }
  }
  return result.slice(-100);
}

export function validateNotebookImport(payload, experimentId) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      payload.version !== 1 || payload.experimentId !== experimentId ||
      !payload.notebook || typeof payload.notebook !== 'object' || Array.isArray(payload.notebook)) {
    throw new Error('Tệp không thuộc thí nghiệm đang mở hoặc không đúng định dạng.');
  }
  const fields = ['objective', 'hypothesis', 'observations', 'conclusion'];
  const note = payload.notebook;
  if (!fields.some(field => typeof note[field] === 'string') && !Number.isInteger(note.selfAssessment)) {
    throw new Error('Sổ thực hành không có nội dung hợp lệ.');
  }
  for (const field of fields) {
    if (note[field] !== undefined && typeof note[field] !== 'string') throw new Error('Nội dung sổ không đúng định dạng.');
  }
  if (note.selfAssessment !== undefined && !(Number.isInteger(note.selfAssessment) && note.selfAssessment >= 1 && note.selfAssessment <= 5)) {
    throw new Error('Mức tự đánh giá phải từ 1 đến 5.');
  }
  return note;
}
