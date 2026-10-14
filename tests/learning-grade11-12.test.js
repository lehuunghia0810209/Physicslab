import test from 'node:test';
import assert from 'node:assert/strict';
import { THPT_PROGRAM } from '../src/data/thpt-program.js';
import { COMPLETE_LESSONS } from '../src/data/learning/lesson-content.js';
import { QUESTION_BANK } from '../src/data/learning/question-bank.js';
import { validateLessonContents } from '../src/core/lesson-content.js';
import { validateQuestionBank, scoreQuestion } from '../src/core/question-engine.js';

const arithmetic={
 springPeriod:([m,k])=>2*Math.PI*Math.sqrt(m/k),
 springEnergy:([k,a])=>k*a*a/2,
 energyRatioPct:([before,after])=>(after/before)**2*100,
 div:([a,b])=>a/b,
 twoTimesDiv:([a,b])=>2*a/b,
 field:([k,q,r])=>k*Math.abs(q)/r**2,
 mul:([a,b])=>a*b,
 capacitorEnergy:([c,u])=>c*u*u/2,
 sum:v=>v.reduce((a,b)=>a+b,0),
 minusProduct:([a,b,c])=>a-b*c,
 lens:([f,d])=>f*d/(d-f),
 gravity:([g,a,b,r])=>g*a*b/r**2,
 sub:([a,b])=>a-b,
 prod:v=>v.reduce((a,b)=>a*b,1),
 weightedT:([m1,t1,m2,t2])=>(m1*t1+m2*t2)/(m1+m2),
 ratio:([a,b,c])=>a*b/c,
 ratioProduct:([n,delta,t])=>n*delta/t,
 decay:([initial,periods])=>initial*2**(-periods),
 sinRms:([u])=>u/Math.sqrt(2)
};

test('THPT map links to 49 complete, distinct lessons across 3 grades',()=>{
 assert.equal(COMPLETE_LESSONS.length,49);
 assert.equal(THPT_PROGRAM.length,49);
 assert.deepEqual([10,11,12].map(g=>COMPLETE_LESSONS.filter(x=>x.grade===g).length),[17,16,16]);
 const ids=new Set(COMPLETE_LESSONS.map(x=>x.id));
 assert.equal(ids.size,49);
 for(const item of THPT_PROGRAM){
  const lesson=COMPLETE_LESSONS.find(l=>l.programId===item.id);
  assert.ok(lesson,`Missing complete lesson for ${item.id}`);
  assert.equal(lesson.grade,item.grade);
  assert.equal(lesson.topic,item.theme);
  assert.equal(lesson.exercises.length,5);
  if(item.elective) assert.ok(['Chuyên đề tự chọn','Học liệu mở rộng'].includes(lesson.topic));
 }
 assert.equal(validateLessonContents(COMPLETE_LESSONS,QUESTION_BANK),true);
 assert.equal(validateQuestionBank(QUESTION_BANK,ids),true);
});

test('new lessons have 60 original worked examples and 150 lesson-linked exercises',()=>{
 const added=COMPLETE_LESSONS.filter(x=>x.grade>=11&&!['wave-discovery','ideal-gas-discovery'].includes(x.id));
 const newBank=QUESTION_BANK.filter(q=>q.grade>=11&&!['wave-discovery','ideal-gas-discovery'].includes(q.lessonId));
 assert.equal(added.length,30);
 assert.equal(added.reduce((n,l)=>n+l.examples.length,0),60);
 assert.equal(newBank.length,150);
 for(const lesson of added){
  assert.ok(lesson.theory.every(t=>t.paragraphs[0].length>=100),lesson.id);
  assert.ok(lesson.examples.every(e=>e.steps.length===3&&e.analysis.length>=10),lesson.id);
  assert.deepEqual([...new Set(newBank.filter(q=>q.lessonId===lesson.id).map(q=>q.type))].sort(),['numeric','short','single','true-false']);
 }
});

test('independent calculations verify all 30 new numeric answers and units',()=>{
 const numeric=QUESTION_BANK.filter(q=>q.grade>=11&&q.verification);
 assert.equal(numeric.length,30);
 for(const q of numeric){
  const fn=arithmetic[q.verification.op];
  assert.equal(typeof fn,'function',q.id);
  const expected=fn(q.verification.values);
  const tolerance=Math.max(q.tolerance.absolute,Math.abs(expected)*1e-12);
  assert.ok(Math.abs(expected-q.answer)<=tolerance,`${q.id}: ${expected} !== ${q.answer}`);
  assert.equal(scoreQuestion(q,String(q.answer)).correct,true,q.id);
 }
});
