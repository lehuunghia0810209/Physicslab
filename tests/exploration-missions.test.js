import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORATION_MISSIONS,applyExplorationPreset} from '../src/data/exploration-missions.js';
import {SimulationRegistry} from '../src/data/registry.js';
test('every current simulation has three reproducible classroom scenarios',()=>{
 const actual=SimulationRegistry.all().map(v=>v.id).sort();
 assert.deepEqual(Object.keys(EXPLORATION_MISSIONS).sort(),actual);
 for(const v of Object.values(EXPLORATION_MISSIONS)){
  assert.equal(v.presets.length,3);
  assert.ok(v.correct>=0&&v.correct<v.choices.length);
  assert.ok(v.question.length>12 && v.why.length>25);
  for(const [label,changes] of v.presets){ assert.ok(label); assert.ok(changes.every(([selector])=>selector.startsWith('#'))); }
 }
});
test('applying scenarios always dispatches input/change to real widgets',()=>{
 let updates=[];
 const control={value:'1',type:'range',tagName:'INPUT',min:'0',max:'100',dispatchEvent:event=>{updates.push(event.type);}};
 const original=globalThis.Event;
 globalThis.Event=class {constructor(type){this.type=type;}};
 try{
  const n=applyExplorationPreset({querySelector:()=>control},[['#force',20],['#force',101]]);
  assert.equal(n,1);assert.equal(control.value,'20');assert.deepEqual(updates,['input']);
 }finally{globalThis.Event=original;}
});
test('button scenarios activate direct apparatus presets',()=>{
 let clicks=0;
 const button={tagName:'BUTTON',click:()=>clicks++};
 assert.equal(applyExplorationPreset({querySelector:()=>button},[['#cwb-preset-series',true]]),1);
 assert.equal(clicks,1);
});
