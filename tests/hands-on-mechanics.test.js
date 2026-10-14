import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneParameterFromPoint, velocityFromDrag, parameterFromDragDelta, momentumBalance } from '../src/core/hands-on-mechanics.js';
import { createCollision, COLLISION_DEFAULTS } from '../src/core/momentum.js';
const rect={left:100,width:400};
const bounds={min:-80,max:80,step:1,key:'force'};
test('direct force drag supports both directions, clipped to bounds',()=>{
 assert.deepEqual(sceneParameterFromPoint('friction',100,rect,bounds),{force:-80});
 assert.deepEqual(sceneParameterFromPoint('friction',300,rect,bounds),{force:0});
 assert.deepEqual(sceneParameterFromPoint('friction',500,rect,bounds),{force:80});
});
test('oscillator grab gives positive amplitude and direction phase',()=>{
 const p={key:'amplitude',min:.05,max:2,step:.05};
 assert.deepEqual(sceneParameterFromPoint('oscillation',100,rect,p),{amplitude:2,phase:180});
 assert.deepEqual(sceneParameterFromPoint('oscillation',500,rect,p),{amplitude:2,phase:0});
 assert.equal(sceneParameterFromPoint('oscillation',300,rect,p).amplitude,.05);
});
test('velocity drag clamps and preserves sign',()=>{
 const p={key:'velocity1',min:-20,max:20,step:.5};
 assert.equal(velocityFromDrag(-500,400,4,p),-20);
 assert.equal(velocityFromDrag(500,400,4,p),20);
 assert.equal(velocityFromDrag(0,400,-3,p),-3);
});
test('collision momentum conserved with asymmetric masses and restitution',()=>{
 for(const restitution of [0,.2,.6,1]){
   const model=createCollision({...COLLISION_DEFAULTS,mass1:2,mass2:6,velocity1:8,velocity2:-3,restitution});
   assert.ok(Math.abs(momentumBalance(model).drift)<1e-8);
 }
});

test('dragging initially preserves force and distance without jumping to center value',()=>{
 const force={key:'force',min:-80,max:80,step:1};
 assert.equal(parameterFromDragDelta(0,400,22,force),22);
 assert.equal(parameterFromDragDelta(100,400,22,force),62);
 const distance={key:'distance',min:.5,max:30,step:.5};
 assert.equal(parameterFromDragDelta(0,400,12,distance),12);
 assert.ok(parameterFromDragDelta(90,400,12,distance)>12);
});
