import test from 'node:test';import assert from 'node:assert/strict';
import {COMPLETE_LESSONS} from '../src/data/learning/lesson-content.js';
import {QUESTION_BANK} from '../src/data/learning/question-bank.js';
import {validateLessonContents} from '../src/core/lesson-content.js';
import {validateQuestionBank,scoreQuestion} from '../src/core/question-engine.js';
test('complete lessons meet the content contract across all three grades',()=>{
 assert.deepEqual([...new Set(COMPLETE_LESSONS.map(x=>x.grade))],[10,11,12]);
 assert.equal(validateQuestionBank(QUESTION_BANK,COMPLETE_LESSONS.map(x=>x.id)),true);
 assert.equal(validateLessonContents(COMPLETE_LESSONS,QUESTION_BANK),true);
 assert.equal(COMPLETE_LESSONS.filter(x=>x.grade===10).length,17);
 assert.equal(COMPLETE_LESSONS.reduce((n,x)=>n+x.examples.length,0),98);
 assert.equal(QUESTION_BANK.length,245);
});
test('independent formula checks match numeric answer keys',()=>{
 const by=id=>QUESTION_BANK.find(q=>q.id===id);
 assert.equal(by('n3-num-basic').answer,18/6);
 assert.equal(by('n3-num-friction').answer,(20-8)/4);
 assert.equal(by('w3-num-speed').answer,2*3);
 assert.equal(by('w3-num-wavelength').answer,4/8);
 assert.equal(by('g3-num-isochoric').answer,100*600/300);
 assert.equal(by('g3-num-boyle').answer,100*3/150);
 for(const q of QUESTION_BANK.filter(q=>q.type==='numeric'))assert.equal(scoreQuestion(q,String(q.answer)).correct,true);
});
test('grade 10 numeric answer keys are independently recalculated from their declared data',()=>{
 const calculate=({op,values:v})=>({mean:()=>v.reduce((a,b)=>a+b,0)/v.length,half:()=>v[0]/2,divide:()=>v[0]/v[1],differenceDivide:()=>(v[0]-v[1])/v[2],halfProductSquare:()=>v[0]*v[1]**2/2,linear:()=>v[0]+v[1]*v[2],squareDivide:()=>v[0]**2/v[1],hypot:()=>Math.hypot(...v),subtract:()=>v[0]-v[1],product3:()=>v[0]*v[1]*v[2],multiply:()=>v[0]*v[1],kinetic:()=>v[0]*v[1]**2/2,momentum:()=>v[0]*v[1]+v[2]*v[3]}[op]());
 const grade10Numeric=QUESTION_BANK.filter(q=>q.grade===10&&q.verification);
 assert.equal(grade10Numeric.length,16);
 for(const question of grade10Numeric)assert.equal(question.answer,calculate(question.verification),question.id);
});
