import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/pages/home.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/thpt-learning.css', import.meta.url), 'utf8');

test('PhysicsLab home clearly offers free student and teacher access without billing controls', () => {
  assert.match(home, /PhysicsLab miễn phí cho mọi người/);
  assert.match(home, /Bắt đầu học miễn phí/);
  assert.match(home, /href="#\/learning"/);
  assert.match(home, /href="#\/lab"/);
  assert.doesNotMatch(home, /data-billing|pricing-plans|Chưa công bố giá|Theo tháng|Theo năm|Pricing toggle/i);
  assert.doesNotMatch(styles, /\.pricing-billing|\.pricing-plans|\.pricing-plan\b/);
});
