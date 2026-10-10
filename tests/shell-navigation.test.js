import test from 'node:test';
import assert from 'node:assert/strict';
import { shell, navigation, updateNavigation } from '../src/app/shell.js';
import { SimulationRegistry } from '../src/data/registry.js';

test('shell exports navigation integration and renders all six routes without removed topbar arrows', () => {
  const oldWindow = globalThis.window;
  try {
    globalThis.window = { PHYSICSLAB_VERSION: '1.2.0-beta.1' };
    const root = {
      innerHTML: '',
      querySelector(selector) { return selector === '#main' ? { id: 'main' } : null; }
    };
    const main = shell(root);
    assert.equal(main.id, 'main');
    assert.equal(navigation.length, 6);
    for (const [id] of navigation) assert.match(root.innerHTML, new RegExp(`data-nav="${id}"`));
    assert.match(root.innerHTML, /id="progress-import-file"/);
    assert.doesNotMatch(root.innerHTML, /id="progress-(?:export|import)"/);
    assert.match(root.innerHTML, /v1\.2\.0-beta\.1/);
    assert.match(root.innerHTML, new RegExp(`class="nav-count">${SimulationRegistry.all().filter(s => s.status === 'available').length}<`));
  } finally {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  }
});

test('router navigation highlights active item, sets aria-current and updates breadcrumb', () => {
  const previous = globalThis.document;
  const links = navigation.map(([id]) => ({
    dataset: { nav: id },
    classList: { active: false, toggle(_name, state) { this.active = state; } },
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; }
  }));
  const breadcrumb = { textContent: '' };
  try {
    globalThis.document = {
      querySelectorAll: selector => selector === '[data-nav]' ? links : [],
      querySelector: selector => selector === '#breadcrumb' ? breadcrumb : null
    };
    updateNavigation('simulation', 'Chuyển động ném xiên');
    assert.equal(breadcrumb.textContent, 'Chuyển động ném xiên');
    assert.equal(links.filter(link => link.classList.active).length, 1);
    assert.equal(links.find(link => link.classList.active).dataset.nav, 'simulations');
    assert.equal(links.find(link => link.classList.active).attributes['aria-current'], 'page');
    updateNavigation('lab');
    assert.equal(breadcrumb.textContent, 'Thí nghiệm');
    assert.equal(links.find(link => link.classList.active).dataset.nav, 'lab');
    assert.ok(links.every(link => link.dataset.nav === 'lab' || !('aria-current' in link.attributes)));
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
