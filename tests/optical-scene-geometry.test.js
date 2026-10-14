import test from 'node:test';import assert from 'node:assert/strict';
import { createThinLens } from '../src/core/optics.js';
import { opticalRayGeometry,isScreenFocused } from '../src/core/optical-scene-geometry.js';
for(const d of [.05,.08,.15,.3,1.2])test(`Paraxial rays intersect at computed ${d}m image (${d>.1?'real':'virtual'})`,()=>{
 const parameters={focalLength:.1,objectDistance:d,objectHeight:.02};
 const state=createThinLens(parameters).at(d);
 const rays=opticalRayGeometry(parameters,state,350);
 assert.ok(Math.abs(rays.outgoingParallelY(rays.imageX)-rays.imageY)<1e-8);
 assert.ok(Math.abs(rays.outgoingCentralY(rays.imageX)-rays.imageY)<1e-8);
});
test('At focal plane rays are parallel and image is infinity, not a screen image',()=>{
 const p={focalLength:.1,objectDistance:.1,objectHeight:.02};const state=createThinLens(p).at(.1);
 const rays=opticalRayGeometry(p,state,350);
 assert.equal(rays.imageX,null);assert.equal(rays.imageY,null);assert.equal(isScreenFocused(state.imageDistance,.4),false);
 assert.ok(Math.abs(rays.firstSlope-rays.centralSlope)<1e-12);
});
test('Real image can be focused onto screen; virtual image cannot',()=>{
 const p={focalLength:.1,objectDistance:.3,objectHeight:.02};const model=createThinLens(p);
 assert.ok(isScreenFocused(model.imageDistance,model.imageDistance));
 assert.equal(isScreenFocused(model.imageDistance,model.imageDistance+.1),false);
 assert.equal(isScreenFocused(createThinLens({...p,objectDistance:.05}).imageDistance,.12),false);
});
