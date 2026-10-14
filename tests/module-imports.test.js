import test from 'node:test';
import assert from 'node:assert/strict';
import { moduleImportSpecifiers } from '../scripts/module-imports.mjs';

test('module scanner detects actual static and dynamic imports but excludes a member import call', () => {
  const code = [
    "import { sample } from './sample.js';",
    "  import './theme.css';",
    "const lazy = " + "import" + "('./dynamic.js');",
    "assert.throws(() => storage." + "import" + "('{broken'));"
  ].join('\n');
  assert.deepEqual(moduleImportSpecifiers(code), ['./sample.js', './theme.css', './dynamic.js']);
});
