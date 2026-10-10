import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS } from '../src/core/projectile.js';
import { projectileShareURL, parseProjectileShare } from '../src/core/projectile-share.js';

test('Liên kết chỉ chia sẻ thông số ném xiên, không tiết lộ tiến độ', () => {
  const url = projectileShareURL(DEFAULTS, 'https://physicslab-aoc.pages.dev/#/home');
  const parsed = new URL(url);
  assert.equal(parsed.hash, '#/simulation/projectile-motion');
  assert.deepEqual(parseProjectileShare(parsed.search), DEFAULTS);
  assert.equal(parsed.searchParams.size, 1);
});
test('Tham số được chia sẻ không hợp lệ hoặc vượt biên bị từ chối', () => {
  assert.equal(parseProjectileShare('?pm=20,100,0,9.81'), null);
  assert.equal(parseProjectileShare('?pm=20,abc,0,9.81'), null);
  assert.equal(parseProjectileShare('?pm=20,45,0'), null);
  assert.equal(parseProjectileShare('?other=1'), null);
});
test('Liên kết tương thích với tham số thay đổi của giáo viên', () => {
  const input = { v0: 38.5, angle: 32, height: 5, g: 1.62 };
  const url = new URL(projectileShareURL(input, 'https://example.edu/?lang=vi#/learning'));
  assert.equal(url.searchParams.get('lang'), 'vi');
  assert.deepEqual(parseProjectileShare(url.search), input);
  assert.deepEqual(input, { v0: 38.5, angle: 32, height: 5, g: 1.62 });
});
