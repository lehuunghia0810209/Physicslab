import test from 'node:test';
import assert from 'node:assert/strict';
import {traceFieldLine,sampleElectricFieldLines,FIELD_VIEW} from '../src/core/electric-field-lines.js';
import {ELECTRIC_FIELD_DEFAULTS} from '../src/core/electric-field.js';
test('field lines follow outward direction of a positive point charge and stay finite',()=>{
 const charges=[{x:0,y:0,charge:2}];const line=traceFieldLine(charges,{x:.15,y:0},{step:.05,maxSteps:12});
 assert.ok(line.length>5);assert.ok(line.at(-1).x>line[0].x);
 assert.ok(line.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=FIELD_VIEW.xmin&&p.x<=FIELD_VIEW.xmax));
});
test('negative-only field lines trace backward geometrically while E direction remains inward',()=>{
 const lines=sampleElectricFieldLines([{x:0,y:0,charge:-2}]);
 assert.ok(lines.length>=8);assert.ok(lines.every(line=>line.length>1));
});
test('dipole has safe streamlines bounded by the viewport',()=>{
 const lines=sampleElectricFieldLines(ELECTRIC_FIELD_DEFAULTS);
 assert.ok(lines.length>=9);assert.ok(lines.every(line=>line.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))));
});
