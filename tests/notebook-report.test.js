import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { notebookMeasurementRows, validateNotebookImport } from '../src/core/notebook-report.js';

const snapshot = {
  sessions: {
    'virtual-lab': { measurements: [
      { experimentId: 'newton-second-law', readings: { measuredX: 4.5, measuredY: 0.6 }, uncertainties: { x: 0.1, y: 0.02 } },
      { experimentId: 'friction', readings: { measuredX: 8, measuredY: 2 }, uncertainties: { x: .1, y: .1 } },
      { experimentId: 'newton-second-law', readings: { measuredX: -3.5, measuredY: 0 }, uncertainties: { x: .1, y: .02 } },
      { experimentId: 'newton-second-law', readings: { measuredX: NaN, measuredY: 5 } }
    ] },
    'hooke-lab': { measurements: [
      { mass: 0.1, force: .981, extension: .023, springConstant: 42.65 },
      { mass: .2, force: 1.962, extension: .046, springConstant: 42.65 },
      { mass: .3, force: Infinity, extension: .1 }
    ] }
  }
};

test('Notebook evidence is derived from real, finite measurements for the selected experiment only', () => {
  assert.deepEqual(notebookMeasurementRows(snapshot, 'newton-second-law'), [
    { x: 4.5, y: .6, dx: .1, dy: .02 },
    { x: -3.5, y: 0, dx: .1, dy: .02 }
  ]);
  assert.equal(notebookMeasurementRows(snapshot, 'friction').length, 1);
  assert.deepEqual(notebookMeasurementRows(snapshot, 'thin-lens'), []);
  assert.deepEqual(notebookMeasurementRows({}, 'friction'), []);
});

test('Hooke notebook reads measured force/extension without mixing with generic lab rows', () => {
  assert.deepEqual(notebookMeasurementRows(snapshot, 'hooke-law'), [
    { x: .023, y: .981, dx: null, dy: null },
    { x: .046, y: 1.962, dx: null, dy: null }
  ]);
});

test('Notebook import validator rejects mismatched IDs, invalid types and missing content', () => {
  const note = { hypothesis: 'Lực tăng thì gia tốc tăng.', selfAssessment: 4 };
  assert.equal(validateNotebookImport({ version: 1, experimentId: 'newton-second-law', notebook: note }, 'newton-second-law'), note);
  for (const payload of [
    { version: 1, experimentId: 'hooke-law', notebook: note },
    { version: 2, experimentId: 'newton-second-law', notebook: note },
    { version: 1, experimentId: 'newton-second-law', notebook: [] },
    { version: 1, experimentId: 'newton-second-law', notebook: {} },
    { version: 1, experimentId: 'newton-second-law', notebook: { observations: 34 } },
    { version: 1, experimentId: 'newton-second-law', notebook: { hypothesis: 'x', selfAssessment: 8 } }
  ]) assert.throws(() => validateNotebookImport(payload, 'newton-second-law'));
});

test('Printable notebook includes a full evidence table and full-text mirror for long notes', async () => {
  const html = await readFile(new URL('../src/pages/lab-notebook.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/styles/lab-notebook.css', import.meta.url), 'utf8');
  assert.match(html, /data-notebook-table/);
  assert.match(html, /data-notebook-print-field/);
  assert.match(html, /file\.size > 2_000_000/);
  assert.match(css, /white-space:pre-wrap/);
  assert.match(css, /max-height:none;overflow:visible/);
});
