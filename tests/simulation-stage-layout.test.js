import test from 'node:test';
import assert from 'node:assert/strict';
import {SIMULATION_STAGE_SELECTORS} from '../src/core/simulation-stage-layout.js';
import {SimulationRegistry} from '../src/data/registry.js';
test('all simulation routes present the real scene before the long discovery panel',()=>{
 const ids=SimulationRegistry.all().map(s=>s.id);
 assert.equal(ids.length,13);
 assert.deepEqual(Object.keys(SIMULATION_STAGE_SELECTORS).sort(),ids.sort());
 for(const selector of Object.values(SIMULATION_STAGE_SELECTORS))assert.ok(selector.length>=5);
});
