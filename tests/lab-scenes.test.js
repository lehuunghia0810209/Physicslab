import test from 'node:test';
import assert from 'node:assert/strict';
import {LAB_EXPERIMENTS,defaultLabSetup} from '../src/core/lab-experiments.js';
import {labSceneMarkup,labDragParameter} from '../src/pages/lab-scenes.js';
test('15 bàn thí nghiệm có hình minh họa và một đại lượng kéo được',()=>{
 assert.equal(LAB_EXPERIMENTS.length,15);
 for(const lab of LAB_EXPERIMENTS){
  const scene=labSceneMarkup(lab,defaultLabSetup(lab.id));
  assert.ok(scene.includes('<svg') && scene.includes('data-lab-drag-handle'),lab.id);
  const p=labDragParameter(lab);
  assert.ok(p && p.step>0 && p.min<p.max,lab.id);
  assert.ok(scene.includes('KHÔNG DÙNG ĐỂ ĐỌC SỐ ĐO'),lab.id);
 }
});
