// Dashboard counts are derived from actual curriculum/progress, never visual placeholders.
export function summarizeDashboardLearning(lessons, data) {
  const stepsPerLesson = 4;
  const byLesson = (data && typeof data.lessons === 'object' && data.lessons) || {};
  const normalized = lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    grade: lesson.grade,
    category: lesson.category,
    completed: Math.min(stepsPerLesson, Math.max(0, Math.floor(Number(byLesson[lesson.id]) || 0)))
  }));
  const completedLessons = normalized.filter(item => item.completed === stepsPerLesson).length;
  const completedSteps = normalized.reduce((sum, item) => sum + item.completed, 0);
  const totalSteps = normalized.length * stepsPerLesson;
  return Object.freeze({
    totalLessons: normalized.length, completedLessons, completedSteps, totalSteps,
    percentage: totalSteps ? Math.round(completedSteps / totalSteps * 100) : 0,
    next: normalized.find(item => item.completed > 0 && item.completed < stepsPerLesson)
      || normalized.find(item => item.completed < stepsPerLesson) || normalized[0] || null
  });
}
