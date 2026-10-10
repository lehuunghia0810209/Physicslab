import test from 'node:test';
import assert from 'node:assert/strict';
import { createHelix, HELIX_DEFAULTS } from '../src/core/helix.js';
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} !== ${b}`);
test('helix obeys Lorentz acceleration, speed conservation and period for both charges', () => {
  for (const q of [-1,1]) {
    const model=createHelix({ ...HELIX_DEFAULTS, charge:q });
    const B=model.parameters.field, m=model.parameters.mass;
    for(const t of [0,0.15,1.2,5.5]) {
      const p=model.at(t);
      close(p.ax, q*B/m*p.vy);
      close(p.ay, -q*B/m*p.vx);
      close(Math.hypot(p.vx,p.vy,p.vz),model.parameters.speed);
      close(Math.hypot(p.x,p.y),model.radius);
    }
    close(model.at(model.period).z, model.pitch);
    close(model.at(model.period).x, model.at(0).x);
  }
});
test('helix degenerates to straight path for parallel velocity and validates inputs', () => {
  const model=createHelix({ ...HELIX_DEFAULTS, angle:0 });
  close(model.radius,0);
  close(model.at(4).z,model.parameters.speed*4);
  assert.throws(() => createHelix({ ...HELIX_DEFAULTS, mass:0 }));
  assert.throws(() => createHelix({ ...HELIX_DEFAULTS, charge:0 }));
  assert.throws(() => model.at(NaN));
});
