import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeDashboardLearning } from '../src/data/dashboard-stats.js';
import { searchDestinations, normalizeSearch } from '../src/app/quick-search.js';

const curriculum = [
  { id: 'a', title: 'Chuyển động', grade: 10 },
  { id: 'b', title: 'Sóng', grade: 11 },
  { id: 'c', title: 'Điện', grade: 11 }
];

test('dashboard summarizes real learning progress, never hard-coded one lesson', () => {
  const summary = summarizeDashboardLearning(curriculum, { lessons: { a: 4, b: 2 } });
  assert.equal(summary.totalLessons, 3);
  assert.equal(summary.completedLessons, 1);
  assert.equal(summary.completedSteps, 6);
  assert.equal(summary.totalSteps, 12);
  assert.equal(summary.percentage, 50);
  assert.equal(summary.next.id, 'b');
});
test('dashboard clamps invalid lesson data and handles empty curriculum', () => {
  const summary = summarizeDashboardLearning(curriculum, { lessons: { a: 1e8, b: -17, c: NaN } });
  assert.equal(summary.completedSteps, 4);
  assert.equal(summary.completedLessons, 1);
  assert.equal(summarizeDashboardLearning([], {}).percentage, 0);
});
test('quick search matches Vietnamese without diacritics and excludes planned simulations', () => {
  const data = [{ id: 'nem-xien', title: 'Ném xiên', description: 'Chuyển động', icon: 'trajectory', grade: 10, status: 'available' }, { id: 'sau', title: 'Dự kiến', status: 'planned' }];
  assert.equal(normalizeSearch('ĐỊNH LUẬT'), 'dinh luat');
  assert.equal(searchDestinations('nem xien', data)[0].route, 'simulation/nem-xien');
  assert.equal(searchDestinations('Du kien', data).length, 0);
});
