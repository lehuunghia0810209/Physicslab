import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectile} from '../src/core/projectile.js';
import {createProjectileViewport} from '../src/core/projectile-viewport.js';
import {createMotionProbe} from '../src/core/motion-probe.js';
test('1.8: all physical points remain in fitted 3D viewport across camera presets and vertical shots',()=>{
 for(const angle of [0,30,45,89,90])for(const yaw of [-1.2,-.55,0,.8])for(const elevation of [-.5,0,.35,1.1]){
  const m=createProjectile({v0:20,angle,height:5,g:9.81});
  const v=createProjectileViewport(m,{width:700,height:380,yaw,elevation});
  for(const pt of [...v.path,...v.ground,...Object.values(v.axes).flat()]){
   const xy=v.project(pt);
   assert.ok(xy.x>=v.margin-1e-5 && xy.x<=700-v.margin+1e-5,`${angle} ${yaw} x ${xy.x}`);
   assert.ok(xy.y>=v.margin-1e-5 && xy.y<=380-v.margin+1e-5,`${angle} ${yaw} y ${xy.y}`);
  }
 }
});
test('1.8: timeline pointer endpoints and energy remain physically consistent',()=>{
 const p=createMotionProbe({v0:20,angle:45,height:2,g:9.81});
 assert.equal(p.fromX(-200,100,600).t,0);
 assert.ok(Math.abs(p.fromX(700,100,600).t-p.model.duration)<1e-8);
 const first=p.sample(0),last=p.sample(1);
 assert.ok(Math.abs(first.energyPerKg-last.energyPerKg)<1e-6);
 assert.equal(last.y,0);
 assert.throws(()=>p.fromX(10,0,0),RangeError);
});
test('1.8: viewport rejects invalid coordinates',()=>{
 const m=createProjectile({v0:20,angle:45,height:0,g:9.81});
 assert.throws(()=>createProjectileViewport(m,{width:0,height:300}),RangeError);
 assert.throws(()=>createMotionProbe({v0:20,angle:45,height:0,g:9.81}).sample(NaN),RangeError);
});

test('2.1: projectile viewport exposes fitted SI coordinate axes',()=>{
 const model=createProjectile({v0:20,angle:90,height:5,g:9.81});
 const view=createProjectileViewport(model,{width:390,height:320});
 assert.deepEqual(Object.keys(view.axes),['x','y','z']);
 for(const point of Object.values(view.axes).flat()){
  const projected=view.project(point);
  assert.ok(projected.x>=view.margin-1e-5&&projected.x<=390-view.margin+1e-5);
  assert.ok(projected.y>=view.margin-1e-5&&projected.y<=320-view.margin+1e-5);
 }
});

test('1.8: optical bench camera does not zoom during dragging',async()=>{
 const {opticalBench}=await import('../src/core/lab-16-physics.js');
 const a=opticalBench({focalLength:.1,objectDistance:.3,objectHeight:.05},.15);
 const b=opticalBench({focalLength:.1,objectDistance:.25,objectHeight:.05},.15);
 assert.equal(a.scale,b.scale);
 assert.ok(Math.abs((a.objectX-b.objectX)-(-.05*a.scale))<1e-6);
});
