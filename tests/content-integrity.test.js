import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationRegistry } from '../src/data/registry.js';
import { lessons, categories } from '../src/data/curriculum.js';
import { LAB_EXPERIMENTS } from '../src/core/lab-experiments.js';

test('Every interactive learning route refers to a functioning simulation or laboratory', () => {
  const simulations=SimulationRegistry.all();
  const ids=new Set(simulations.filter(item=>item.status==='available').map(item=>item.id));
  ids.add('lab');
  assert.equal(new Set(simulations.map(item=>item.id)).size,simulations.length);
  assert.equal(new Set(lessons.map(item=>item.id)).size,lessons.length);
  for(const lesson of lessons) {
    assert.ok(ids.has(lesson.simulation),`Missing simulation for ${lesson.id}`);
    assert.ok(lesson.predictionOptions.some(([v])=>v===lesson.predictionCorrect),`Prediction answer missing for ${lesson.id}`);
    assert.ok(lesson.quizOptions.some(([v])=>v===lesson.correct),`Quiz answer missing for ${lesson.id}`);
    assert.equal(lesson.steps.length,4);
    assert.ok(lesson.observation?.length>30);
  }
});
test('Simulation categories and experiment catalogue have valid unique identifiers', () => {
  const categoriesAvailable=new Set(categories.map(item=>item.id));
  assert.equal(new Set(LAB_EXPERIMENTS.map(item=>item.id)).size,LAB_EXPERIMENTS.length);
  for(const simulation of SimulationRegistry.all()) {
    assert.ok(categoriesAvailable.has(simulation.category),`Unknown category ${simulation.id}`);
    assert.ok([10,11,12].includes(simulation.grade));
    if(simulation.status==='available') assert.equal(typeof simulation.load,'function');
  }
});
