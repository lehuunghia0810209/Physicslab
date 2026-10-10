export function normalizeLessonText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
export function filterLessons(lessons, { grade = 'all', category = 'all', query = '' } = {}) {
  const needle = normalizeLessonText(query);
  return lessons.filter(lesson => (grade === 'all' || String(lesson.grade) === String(grade))
    && (category === 'all' || lesson.category === category)
    && (!needle || normalizeLessonText(`${lesson.title} ${lesson.prompt} ${lesson.observation}`).includes(needle)));
}
export function isExperimentVerified({ predictionSaved, baseline, interactions, progressStep }) {
  return Boolean(predictionSaved) && Number.isFinite(baseline)
    && Number.isFinite(interactions) && interactions > baseline && progressStep >= 1;
}
