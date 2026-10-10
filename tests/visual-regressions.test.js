import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const file = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('The shared graph renderer explicitly disables path filling (prevents black wedge artifacts)', () => {
  const engine = file('../src/engines/graph.js');
  assert.match(engine, /class: 'graph-line', fill: 'none'/);
  assert.match(engine, /class: 'graph-comparison-line', fill: 'none'/);
  assert.match(file('../src/styles/simulation-experience.css'), /\.graph-svg \.graph-line \{ fill:none !important/);
});
test('Hero equation wraps as HTML instead of SVG text at a fixed width', () => {
  const home = file('../src/pages/home.js');
  assert.match(home, /class="hero-formula"/);
  assert.doesNotMatch(home, /<g transform="translate\(266 192\)">/);
});
test('The original simulation registry and local progress data contract remain present', () => {
  const registry = file('../src/data/registry.js');
  for (const id of ['projectile-motion','newton','inclined-plane','friction','work-energy','momentum-collision','spring-oscillation','wave-on-string','electric-circuits','electric-field','magnetic-field','lens','ideal-gas']) assert.ok(registry.includes(`id: '${id}'`), id);
  assert.match(file('../src/core/progress.js'), /physicslab\.progress\.v1/);
});
