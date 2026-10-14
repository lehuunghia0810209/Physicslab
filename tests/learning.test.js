import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categories, lessons } from '../src/data/curriculum.js';
import { summarizeLearningProgress } from '../src/core/learning-analytics.js';
import { SimulationRegistry } from '../src/data/registry.js';

test('Interactive lessons have valid predictions, graded quizzes, and available simulations', () => {
  const ids = new Set();
  for (const lesson of lessons) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id: ${lesson.id}`);
    ids.add(lesson.id);
    assert.equal(lesson.steps.length, 4);
    assert.ok(lesson.predictionOptions.some(([value]) => value === lesson.predictionCorrect));
    assert.ok(lesson.predictionOptions.some(([value]) => value === lesson.correct));
    assert.ok(lesson.quizOptions.some(([value]) => value === lesson.correct));
    if (lesson.simulation === 'lab') assert.equal(lesson.id, 'hooke-discovery');
    else assert.equal(SimulationRegistry.get(lesson.simulation)?.status, 'available');
    assert.ok(lesson.observation.length > 60);
    assert.ok(categories.some(category => category.id === lesson.category), `${lesson.id} has a valid topic`);
  }
  assert.ok(lessons.length >= 15, "the curriculum must preserve the established set of lessons");
  for (const grade of [10, 11, 12]) assert.ok(lessons.some(lesson => lesson.grade === grade), `grade ${grade} has lessons`);
});

test('Topic learning summaries exclude unattempted quizzes and count completed lessons', () => {
  const summary = summarizeLearningProgress(lessons, categories, {
    quizzes: { 'projectile-discovery': 100, 'newton-discovery': 0, unknown: 100 },
    lessons: { 'projectile-discovery': 4, 'newton-discovery': 3 }
  });
  const mechanics = summary.find(topic => topic.id === 'mechanics');
  assert.equal(mechanics.lessonCount, 6);
  assert.equal(mechanics.attemptedCount, 2);
  assert.equal(mechanics.averageBestScore, 50);
  assert.equal(mechanics.completedCount, 1);
  assert.equal(summary.find(topic => topic.id === 'optics').averageBestScore, null);
  assert.ok(summary.every(topic => topic.lessonCount > 0));
});


test('AUD-001 browser regression: discovery mastery counts only legacy mechanics lessons', () => {
  // The full 49-lesson reader uses physicslab.learning.v1; this legacy dashboard
  // reflects the original four-step discovery lessons in physicslab.progress.v1.
  const first = summarizeLearningProgress(lessons, categories, {
    quizzes: { 'projectile-discovery': 100, 'hooke-discovery': 0 },
    lessons: {}
  }).find(item => item.id === 'mechanics');
  assert.equal(first.lessonCount, 6);
  assert.equal(first.attemptedCount, 2);
  const second = summarizeLearningProgress(lessons, categories, {
    quizzes: { 'projectile-discovery': 100, 'hooke-discovery': 0, 'newton-discovery': 100 },
    lessons: {}
  }).find(item => item.id === 'mechanics');
  assert.equal(second.lessonCount, 6);
  assert.equal(second.attemptedCount, 3);
  assert.equal(second.averageBestScore, 67);
});
