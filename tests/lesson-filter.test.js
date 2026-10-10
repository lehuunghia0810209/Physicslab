import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/data/curriculum.js';
import { filterLessons, normalizeLessonText, isExperimentVerified } from '../src/core/lesson-filter.js';

test('Lesson filters combine grade, topic and accent-insensitive search', () => {
  assert.equal(normalizeLessonText('Điện Trường'), 'dien truong');
  assert.ok(filterLessons(lessons, { query: 'nem xien' }).some(l => l.id === 'projectile-discovery'));
  assert.ok(filterLessons(lessons, { grade: '12' }).every(l => l.grade === 12));
  assert.ok(filterLessons(lessons, { category: 'mechanics' }).every(l => l.category === 'mechanics'));
  assert.equal(filterLessons(lessons, { grade: 10, category: 'magnetism' }).length, 0);
});
test('Experiment verification requires prediction, launch baseline and actual tracked interaction', () => {
  const req = { predictionSaved: true, baseline: 4, interactions: 5, progressStep: 1 };
  assert.equal(isExperimentVerified(req), true);
  assert.equal(isExperimentVerified({ ...req, predictionSaved: false }), false);
  assert.equal(isExperimentVerified({ ...req, baseline: undefined }), false);
  assert.equal(isExperimentVerified({ ...req, interactions: 4 }), false);
  assert.equal(isExperimentVerified({ ...req, progressStep: 0 }), false);
});
