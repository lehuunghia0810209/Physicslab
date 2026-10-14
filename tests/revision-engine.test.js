import test from 'node:test';import assert from 'node:assert/strict';
import {COMPLETE_LESSONS} from '../src/data/learning/lesson-content.js';import {QUESTION_BANK} from '../src/data/learning/question-bank.js';
import {buildRevisionTest,revisionPool,revisionTopics,wrongRevisionQuestions} from '../src/core/revision-engine.js';
test('revision filters by grade and topic without repeating questions',()=>{const topics=revisionTopics(COMPLETE_LESSONS,10);assert.ok(topics.includes('Động học'));const pool=revisionPool(COMPLETE_LESSONS,QUESTION_BANK,{grade:10,topic:'Động học'});assert.ok(pool.length>=25);assert.ok(pool.every(q=>q.grade===10));const exam=buildRevisionTest(pool,10);assert.equal(exam.length,10);assert.equal(new Set(exam.map(q=>q.id)).size,10);assert.ok(new Set(exam.map(q=>q.level)).size>=3);});
test('wrong-answer revision only returns saved wrong ids in the selected pool',()=>{const pool=revisionPool(COMPLETE_LESSONS,QUESTION_BANK,{grade:10});const wrong=[pool[1].id,pool[4].id];const result=wrongRevisionQuestions(pool,{attempts:{a:{wrong:[wrong[0]]},b:{wrong:[wrong[1],'missing']}}});assert.deepEqual(result.map(q=>q.id),wrong);});

test('mixed revision test covers multiple lessons and cognitive levels instead of registry-first questions',()=>{
 const pool=revisionPool(COMPLETE_LESSONS,QUESTION_BANK,{grade:11});
 const deterministic=()=>0.475;
 const exam=buildRevisionTest(pool,10,deterministic);
 assert.equal(exam.length,10);
 assert.equal(new Set(exam.map(q=>q.id)).size,10);
 assert.equal(new Set(exam.map(q=>q.lessonId)).size,10);
 assert.ok(new Set(exam.map(q=>q.level)).size>=3);
 assert.deepEqual(buildRevisionTest(pool,10,deterministic).map(q=>q.id),exam.map(q=>q.id));
});
test('revision question recovery uses corrected practice mistakes over stale graded mistakes',()=>{
 const pool=revisionPool(COMPLETE_LESSONS,QUESTION_BANK,{grade:10});
 const q=pool[0];
 assert.deepEqual(wrongRevisionQuestions([q],{attempts:{[q.lessonId]:{wrong:[q.id]}},practiceWrong:{[q.lessonId]:[]}}),[]);
 assert.deepEqual(wrongRevisionQuestions([q],{practiceWrong:{[q.lessonId]:[q.id]}}),[q]);
});
