import test from 'node:test';import assert from 'node:assert/strict';
import {THPT_GRADES,THPT_PROGRAM,programForGrade,programForLab,labGrade} from '../src/data/thpt-program.js';
import {SimulationRegistry} from '../src/data/registry.js';import {LAB_EXPERIMENTS} from '../src/core/lab-experiments.js';
import {lessons} from '../src/data/curriculum.js';
import {completeLesson} from '../src/data/learning/lesson-content.js';
test('three program grades include core and clearly marked gaps',()=>{
 assert.deepEqual(THPT_GRADES,[10,11,12]);assert.equal(new Set(THPT_PROGRAM.map(x=>x.id)).size,THPT_PROGRAM.length);
 for(const grade of THPT_GRADES){const rows=programForGrade(grade);assert.ok(rows.length>=6);assert.ok(rows.some(x=>x.status==='available'));assert.ok(rows.some(x=>x.status==='planned'));assert.ok(rows.every(x=>x.grade===grade&&x.objective&&x.question));}
});
test('all advertised simulation, laboratory, interactive lesson links actually exist',()=>{
 for(const x of THPT_PROGRAM){if(x.simulationId)assert.ok(SimulationRegistry.get(x.simulationId),x.id);if(x.labId)assert.ok(LAB_EXPERIMENTS.some(l=>l.id===x.labId),x.id);if(x.lessonId)assert.ok(lessons.some(l=>l.id===x.lessonId)||completeLesson(x.lessonId),x.id);}
});
test('grade-tagged laboratories appear in exactly one program, including special workbenches',()=>{
 for(const x of LAB_EXPERIMENTS)assert.ok(THPT_GRADES.includes(labGrade(x.id)),x.id);
 assert.equal(labGrade('ohms-law'),11);assert.equal(labGrade('hooke-law'),10);assert.equal(labGrade('electromagnetic-induction'),12);
 assert.ok(programForLab('wave-interference').some(x=>x.grade===11));
});
test('electives do not masquerade as core curriculum',()=>{
 const optional=programForGrade(12).filter(x=>x.elective);assert.ok(optional.length);
 assert.equal(programForGrade(12,{includeElectives:false}).some(x=>x.elective),false);
 assert.equal(THPT_PROGRAM.find(x=>x.id==='11-lens-extension').theme,'Học liệu mở rộng');
});
