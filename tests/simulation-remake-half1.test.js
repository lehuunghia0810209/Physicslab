/** Phase 1 acceptance: scientific properties that direct manipulation must preserve. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createNewtonMotion } from '../src/core/newton.js';
import { createFrictionMotion } from '../src/core/friction.js';
import { createWorkEnergyMotion } from '../src/core/work-energy.js';
import { createCollision } from '../src/core/momentum.js';
import { createOscillation } from '../src/core/oscillation.js';
import { createProjectile } from '../src/core/projectile.js';
import { createInclinedPlane } from '../src/core/inclined.js';
import { createInclineRelease, TRACK_LENGTH } from '../src/core/incline-release.js';

const close = (actual, expected, tol=1e-7) => assert.ok(Math.abs(actual-expected)<=tol,`${actual} != ${expected}`);

test('Newton force changes direction correctly; slider readouts render number and SI unit separately',()=>{
 const right=createNewtonMotion({mass:5,force:40,friction:0.1,gravity:9.81});
 const left=createNewtonMotion({mass:5,force:-40,friction:0.1,gravity:9.81});
 assert.ok(right.at(1).position>0 && left.at(1).position<0);
 close(right.at(1).acceleration,-left.at(1).acceleration);
 const held=createNewtonMotion({mass:5,force:2,friction:0.1,gravity:9.81});
 assert.equal(held.at(1).acceleration,0);
 const code=readFileSync(new URL('../src/simulations/newton/index.js',import.meta.url),'utf8');
 assert.match(code,/data-newton-value/);
 assert.doesNotMatch(code,/result-accel[^\n]*`\$\{format\(current\.acceleration\)\} m\/s²`/);
});

test('Friction: static threshold holds until force exceeds friction limit',()=>{
 const params={mass:5,force:10,staticCoefficient:.4,kineticCoefficient:.2,gravity:9.81};
 const still=createFrictionMotion(params);assert.equal(still.at(.5).acceleration,0);
 const sliding=createFrictionMotion({...params,force:30});assert.ok(sliding.at(.5).acceleration>0);
});

test('Work and energy: Wnet = ΔEk at multiple sampled times',()=>{
 const model=createWorkEnergyMotion({mass:4,force:25,distance:12,angle:20,friction:.1,initialSpeed:2,gravity:9.81});
 for(const t of [0,.2,.5,1].map(n=>n*model.duration)){const s=model.at(t);close(s.netWork,s.energyChange,1e-5);}
});

test('Collision: momentum conserved for e=0, e=0.6 and e=1',()=>{
 for(const restitution of [0,.6,1]){
  const model=createCollision({mass1:2,mass2:3,velocity1:4,velocity2:-3,restitution,separation:6});
  close(model.at(model.duration).momentum,model.at(0).momentum);
  assert.ok(model.at(model.duration).kineticEnergy<=model.at(0).kineticEnergy+1e-6);
 }
});

test('Oscillator: model keeps constant mechanical energy throughout its cycle',()=>{
 const model=createOscillation({mass:2,stiffness:20,amplitude:.7,phase:180});
 for(const t of [0,.25,.5,.75,1].map(q=>q*model.period)){
  const s=model.at(t);close(s.kineticEnergy+s.potentialEnergy,s.totalEnergy,1e-5);
 }
});

test('Projectile: at 45 degrees and zero height, launch range matches analytic formula',()=>{
 const m=createProjectile({v0:20,angle:45,height:0,g:9.81});
 close(m.range,20*20/9.81,1e-7);
 close(m.at(m.duration).y,0);
});

test('Ramp: release from a chosen position never exceeds the 10 m end-stop',()=>{
 const m=createInclinedPlane({angle:35,mass:5,gravity:9.81,mu:.15});
 const release=createInclineRelease(m,3.5);
 assert.equal(release.at(0).position,3.5);
 assert.ok(release.at(release.duration).position<=TRACK_LENGTH);
 assert.ok(release.at(release.duration).distance<=6.5);
});
