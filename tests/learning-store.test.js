import test from 'node:test';import assert from 'node:assert/strict';
import {createLearningStore,LEARNING_KEY} from '../src/core/learning-store.js';
const storage=seed=>{let raw=seed;return{getItem:()=>raw,setItem:(_k,v)=>{raw=v},raw:()=>raw}};
test('Learning v1 saves attempts and notes without touching legacy progress',()=>{
 const s=storage(null),store=createLearningStore(s);store.record('newton-discovery',80,['n-2','n-2']);store.note('newton-discovery','Đối chiếu F = ma.');
 assert.equal(JSON.parse(s.raw()).version,1);assert.deepEqual(store.get().attempts['newton-discovery'].wrong,['n-2']);assert.equal(store.get().notes['newton-discovery'],'Đối chiếu F = ma.');
 assert.equal(LEARNING_KEY,'physicslab.learning.v1');
});
test('corrupt Learning storage is preserved and cannot be overwritten silently',()=>{
 const s=storage('{bad'),store=createLearningStore(s);assert.ok(store.issue());assert.throws(()=>store.record('lesson-1',50,[]));assert.equal(s.raw(),'{bad');
});

test('practice errors survive reload without creating a misleading overall exam score',()=>{
 const s=storage(null),store=createLearningStore(s);
 store.trackPractice('lesson-1','q-1',false);
 assert.equal(store.get().attempts['lesson-1'],undefined);
 assert.deepEqual(store.get().practiceWrong['lesson-1'],['q-1']);
 const restored=createLearningStore(s);
 assert.deepEqual(restored.get().practiceWrong['lesson-1'],['q-1']);
 restored.trackPractice('lesson-1','q-1',true);
 assert.deepEqual(restored.get().practiceWrong['lesson-1'],[]);
 assert.equal(restored.get().attempts['lesson-1'],undefined);
});
test('v1 attempts and notes migrate additively, exam score is preserved during wrong-only practice',()=>{
 const old={version:1,attempts:{'lesson-1':{score:60,wrong:['q-1','q-2'],at:100}},notes:{'lesson-1':'Ghi chú cũ.'}};
 const s=storage(JSON.stringify(old)),store=createLearningStore(s);
 assert.equal(store.get().attempts['lesson-1'].score,60);
 store.trackPractice('lesson-1','q-1',true);
 assert.deepEqual(store.get().practiceWrong['lesson-1'],['q-2']);
 assert.equal(store.get().attempts['lesson-1'].score,60);
 assert.equal(store.get().notes['lesson-1'],'Ghi chú cũ.');
 store.record('lesson-1',100,[]);
 assert.deepEqual(store.get().practiceWrong['lesson-1'],[]);
 assert.equal(createLearningStore(s).get().attempts['lesson-1'].score,100);
});
