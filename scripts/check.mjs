import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(dir, e.name)) : resolve(dir, e.name)));
  return result.flat();
}
const paths = [...await files(resolve(root, 'src')), ...await files(resolve(root, 'scripts')), ...await files(resolve(root, 'tests')), resolve(root, 'vite.config.js')];
let count = 0; let imports = 0;
for (const file of paths.filter(p => /\.[cm]?js$/.test(p))) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (check.status !== 0) throw new Error(`${relative(root, file)}\n${check.stderr}`);
  const source = await readFile(file, 'utf8');
  const pattern = /(?:^import\s+(?:[^;\n]*?\sfrom\s*)?|\bimport\s*\(\s*)['"]([^'"]+)['"]/gm;
  for (const match of source.matchAll(pattern)) {
    const spec = match[1];
    if (spec.startsWith('.')) {
      try { await access(resolve(dirname(file), spec)); } catch { throw new Error(`Missing import ${spec} in ${relative(root, file)}`); }
      imports++;
    } else if (!spec.startsWith('node:') && spec !== 'vite') throw new Error(`Undeclared dependency ${spec}`);
  }
  count++;
}
// Metadata must stay data-only: simulation implementation is only imported dynamically.
const registry = await readFile(resolve(root, 'src/data/registry.js'), 'utf8');
if (/from\s+['"].*simulations\//.test(registry)) throw new Error('Simulation must be lazy loaded.');
// Verify named exports across relative JS modules. This catches integration failures
// (e.g. an imported updateNavigation that was lost from shell.js) before Vite build.
let namedExports = 0;
function declaredExports(source) {
  const names = new Set();
  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
  for (const match of source.matchAll(/\bexport\s*\{([^}]*)\}/g)) {
    for (const spec of match[1].split(',')) {
      const words = spec.trim().split(/\s+as\s+/);
      if (words[0]) names.add((words[1] || words[0]).trim());
    }
  }
  return names;
}
for (const file of paths.filter(p => /\.[cm]?js$/.test(p))) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\bimport\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/gs)) {
    if (!match[2].startsWith('.') || !/\.js$/.test(match[2])) continue;
    const dependency = resolve(dirname(file), match[2]);
    const exports = declaredExports(await readFile(dependency, 'utf8'));
    for (const spec of match[1].split(',')) {
      const name = spec.trim().split(/\s+as\s+/)[0];
      if (!name || name === 'type') continue;
      if (!exports.has(name)) throw new Error(`Missing named export ${name} from ${relative(root, dependency)} (imported by ${relative(root, file)})`);
      namedExports++;
    }
  }
}
console.log(`Syntax OK: ${count} JS modules. Relative imports OK: ${imports}. Named exports OK: ${namedExports}. Lazy registry OK.`);
