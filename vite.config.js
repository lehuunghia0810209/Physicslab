import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function outputFiles(directory, prefix = '') {
  const entries = await readdir(resolve(directory, prefix), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await outputFiles(directory, name));
    else if (name !== 'sw.js') files.push(name);
  }
  return files.sort();
}

function offlineWorker() {
  return { name: 'physicslab-offline-worker', apply: 'build',
    async closeBundle() {
      const directory = resolve('dist');
      const files = await outputFiles(directory);
      const hash = createHash('sha256');
      for (const file of files) hash.update(file).update(await readFile(resolve(directory, file)));
      const cache = `physicslab-static-${hash.digest('hex').slice(0, 12)}`;
      const assets = files.map(file => `./${file}`);
      const source = `const CACHE=${JSON.stringify(cache)};\nconst ASSETS=${JSON.stringify(assets)};\n`
        + await readFile(resolve('scripts/service-worker-runtime.js'), 'utf8');
      await writeFile(resolve(directory, 'sw.js'), source);
    }
  };
}

export default defineConfig({ base: './', plugins: [offlineWorker()], build: { target: 'es2022' } });
