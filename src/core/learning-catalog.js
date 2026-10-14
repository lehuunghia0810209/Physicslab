import { normalizeLessonText } from './lesson-filter.js';
/** A single reader-first catalog. Legacy exploration routes are intentionally separate. */
export function buildLearningCatalog(contents, program) {
  const byProgram = new Map();
  const ids = new Set();
  for (const lesson of contents) {
    if (!lesson?.id || !lesson?.programId || ids.has(lesson.id) || byProgram.has(lesson.programId))
      throw new Error(`Bài Learning trùng/thiếu mã: ${lesson?.id ?? '(unknown)'}`);
    ids.add(lesson.id);
    byProgram.set(lesson.programId, lesson);
  }
  const catalog = program.map(item => {
    const content = byProgram.get(item.id);
    if (!content || content.grade !== item.grade) throw new Error(`Chương trình chưa có bài đọc: ${item.id}`);
    return Object.freeze({ id: content.id, programId: item.id, title: content.title, grade: content.grade,
      topic: item.theme, elective: Boolean(item.elective), objective: item.objective,
      hasExperiment: Boolean(content.experiment?.simulationId || content.experiment?.labId || content.experiment?.stationUrl),
      duration: content.duration });
  });
  if (catalog.length !== contents.length) throw new Error('Có bài Learning không ánh xạ vào chương trình THPT.');
  return Object.freeze(catalog);
}
export function filterLearningCatalog(catalog, { grade = 'all', topic = 'all', query = '' } = {}) {
  const search = normalizeLessonText(query);
  return catalog.filter(item => (grade === 'all' || String(item.grade) === String(grade))
    && (topic === 'all' || item.topic === topic)
    && (!search || normalizeLessonText(`${item.title} ${item.topic} ${item.objective}`).includes(search)));
}
export function lessonRoute(id, readerIds, legacyIds) {
  if (id === 'revision') return { type: 'revision' };
  if (!id) return { type: 'overview' };
  if (id.startsWith('explore-')) {
    const legacyId = id.slice('explore-'.length);
    return legacyIds.has(legacyId) ? { type: 'explore', id: legacyId } : { type: 'missing', id };
  }
  // Collisions must resolve to the complete reader, never silently fall back to discovery.
  if (readerIds.has(id)) return { type: 'reader', id };
  // Preserve old, noncolliding discovery bookmarks.
  if (legacyIds.has(id)) return { type: 'explore', id };
  return { type: 'missing', id };
}
