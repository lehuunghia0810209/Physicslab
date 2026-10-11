import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationRegistry } from '../src/data/registry.js';
import { guideForSimulation } from '../src/data/experiment-guides.js';
test('all 13 simulations have three actionable, non-empty exploration steps', () => {
  const active = SimulationRegistry.all().filter(s => s.status === 'available');
  assert.equal(active.length, 13);
  for (const simulation of active) {
    const steps = guideForSimulation(simulation.id);
    assert.equal(steps?.length, 3, simulation.id);
    assert.ok(steps.every(s => typeof s === 'string' && s.length >= 30), simulation.id);
  }
});
