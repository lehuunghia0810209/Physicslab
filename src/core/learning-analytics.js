export function summarizeLearningProgress(lessons, categories, progress) {
  const quizzes = progress?.quizzes || {};
  const completedLessons = progress?.lessons || {};
  return categories.filter(category => category.id !== 'all').map(category => {
    const categoryLessons = lessons.filter(lesson => lesson.category === category.id);
    const attempted = categoryLessons
      .filter(lesson => Number.isFinite(quizzes[lesson.id]))
      .map(lesson => quizzes[lesson.id]);
    const completed = categoryLessons.filter(lesson => completedLessons[lesson.id] >= 4).length;
    return {
      id: category.id,
      title: category.title,
      lessonCount: categoryLessons.length,
      attemptedCount: attempted.length,
      completedCount: completed,
      averageBestScore: attempted.length
        ? Math.round(attempted.reduce((total, score) => total + score, 0) / attempted.length)
        : null
    };
  }).filter(category => category.lessonCount > 0);
}
