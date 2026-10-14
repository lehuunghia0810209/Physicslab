import test from 'node:test';
import assert from 'node:assert/strict';
import { opticalScreenFootprint } from '../src/core/optical-scene-geometry.js';
import { createThinLens } from '../src/core/optics.js';
test('a converging real image produces zero ray separation at its screen position',()=>{
 const params={focalLength:.1,objectDistance:.3,objectHeight:.05};const model=createThinLens(params);const state=model.at(params.objectDistance);
 const focused=opticalScreenFootprint(params,state,600,state.imageDistance);
 const defocused=opticalScreenFootprint(params,state,600,.2);
 assert.ok(focused.focused);assert.ok(focused.blurRadius<1e-8);assert.ok(defocused.blurRadius>2);
});
test('virtual image or image at infinity cannot be caught by a real screen',()=>{
 for(const d of [.05,.1]){const p={focalLength:.1,objectDistance:d,objectHeight:.05};
 assert.equal(opticalScreenFootprint(p,createThinLens(p).at(d),500,.2),null);}
});
