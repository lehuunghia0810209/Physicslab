import test from 'node:test';
import assert from 'node:assert/strict';
import {measureElectricField,COULOMB_K} from '../src/core/electric-field.js';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol, `${a} != ${b}`);
test('Coulomb field of +1 nC at 1 m has correct direction, potential and magnitude',()=>{
 const f=measureElectricField([{x:0,y:0,charge:1}],{x:1,y:0});
 near(f.ex, COULOMB_K*1e-9);
 near(f.ey,0);near(f.potential, COULOMB_K*1e-9);
 near(f.magnitude,COULOMB_K*1e-9);
});
test('field obeys superposition and symmetry for equal charges and dipole',()=>{
 const plus=[{x:-1,y:0,charge:1},{x:1,y:0,charge:1}];
 const symmetric=measureElectricField(plus,{x:0,y:0});
 near(symmetric.magnitude,0);near(symmetric.potential,2*COULOMB_K*1e-9);
 const dipole=measureElectricField([{x:-1,y:0,charge:1},{x:1,y:0,charge:-1}],{x:0,y:0});
 near(dipole.ex,2*COULOMB_K*1e-9);near(dipole.potential,0);
});
test('field singularities and invalid charge parameters do not produce fabricated values',()=>{
 const charges=[{x:0,y:0,charge:1}];
 assert.throws(()=>measureElectricField(charges,{x:0,y:0}),/kỳ dị/);
 assert.throws(()=>measureElectricField(charges,{x:NaN,y:0}));
 assert.throws(()=>measureElectricField([{x:0,y:0,charge:Infinity}],{x:1,y:0}));
});

test('Zero charge produces no singularity at its location',()=>{
  const result=measureElectricField([{x:0,y:0,charge:0}],{x:0,y:0});
  near(result.magnitude,0);near(result.potential,0);
});
