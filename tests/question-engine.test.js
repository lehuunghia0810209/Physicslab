import test from 'node:test';import assert from 'node:assert/strict';
import {validateQuestionBank,scoreQuestion,parseNumericAnswer} from '../src/core/question-engine.js';
const base={id:'q-1',lessonId:'lesson-1',grade:10,level:'vận dụng',prompt:'Tính đại lượng.',explanation:'Lời giải đủ bước.',review:'Ôn định luật.'};
test('numeric scoring accepts decimal comma and equivalent notation within declared tolerance',()=>{
 const q={...base,type:'numeric',answer:2,tolerance:{absolute:.01},unit:'m/s²',formula:'a=F/m'};
 assert.equal(validateQuestionBank([q],['lesson-1']),true);assert.equal(parseNumericAnswer('2,00 m/s²'),2);
 assert.equal(scoreQuestion(q,'2.009 m/s²').correct,true);assert.equal(scoreQuestion(q,'2.02').correct,false);
});
test('question validation rejects duplicates, dangling lessons, bad choices and incomplete solutions',()=>{
 const q={...base,type:'single',options:[{id:'a',text:'A'},{id:'b',text:'B'}],answer:'a'};
 assert.equal(scoreQuestion(q,'a').score,100);assert.throws(()=>validateQuestionBank([q,q],['lesson-1']));
 assert.throws(()=>validateQuestionBank([{...q,lessonId:'missing'}],['lesson-1']));
 assert.throws(()=>validateQuestionBank([{...q,answer:'c'}],['lesson-1']));assert.throws(()=>validateQuestionBank([{...q,explanation:''}],['lesson-1']));
});
test('true/false grades each statement and short answers ignore accents and case',()=>{
 const tf={...base,type:'true-false',statements:[{id:'a',text:'Một',answer:true,explanation:'Đúng.'},{id:'b',text:'Hai',answer:false,explanation:'Sai.'}]};
 assert.deepEqual(scoreQuestion(tf,{a:true,b:true}).details.map(x=>x.correct),[true,false]);assert.equal(scoreQuestion(tf,{a:true,b:true}).score,50);
 const short={...base,id:'q-2',type:'short',accepted:['hợp lực']};assert.equal(scoreQuestion(short,'HOP LỰC').correct,true);
 assert.equal(validateQuestionBank([tf,short],['lesson-1']),true);
});

test('numeric grading rejects wrong or malformed physical units instead of accepting a numeric prefix',()=>{
 const q={...base,type:'numeric',answer:2,tolerance:{absolute:.01},unit:'m/s²',formula:'a=F/m'};
 for(const answer of ['2 m/s','2 s','2,0,1 m/s²','2 m/s² other','2 apples','2 + 3 m/s²','2,0 m/s²!'])
  assert.equal(scoreQuestion(q,answer).correct,false,answer);
 for(const answer of ['2','2,00 m/s²','2.000 m / s2','2e0 m/s²'])
  assert.equal(scoreQuestion(q,answer).correct,true,answer);
 assert.equal(parseNumericAnswer('2,0,1 m/s²'),NaN);
 assert.equal(parseNumericAnswer('2.0!'),NaN);
});
test('numeric tolerance metadata cannot contain NaN or Infinity even if another tolerance is valid',()=>{
 for(const invalid of [NaN,Infinity,-0.1]){
  const q={...base,type:'numeric',answer:2,tolerance:{absolute:invalid,relative:.05},unit:'m',formula:'s=vt'};
  assert.throws(()=>validateQuestionBank([q],['lesson-1']));
 }
});
