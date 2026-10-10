import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSimulations } from '../src/data/simulation-stats.js';
import { SimulationRegistry } from '../src/data/registry.js';

test('Simulation counts match active registry and exclude planned/unknown visits', () => {
  const simulations = SimulationRegistry.all();
  const available = simulations.filter(item => item.status === 'available');
  const planned = simulations.filter(item => item.status !== 'available');
  const stats = summarizeSimulations(simulations, {
    [available[0].id]: Date.now(),
    ...(planned[0] ? { [planned[0].id]: Date.now() } : {}),
    'removed-simulation': Date.now()
  });
  assert.equal(stats.available, available.length);
  assert.equal(stats.planned, planned.length);
  assert.equal(stats.visited, 1);
  assert.equal(Object.values(stats.byCategory).reduce((sum, count) => sum + count, 0), stats.available);
});
