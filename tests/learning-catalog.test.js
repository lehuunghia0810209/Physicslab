import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningCatalog, filterLearningCatalog, lessonRoute } from '../src/core/learning-catalog.js';
import { COMPLETE_LESSONS } from '../src/data/learning/lesson-content.js';
import { THPT_PROGRAM } from '../src/data/thpt-program.js';
import { lessons } from '../src/data/curriculum.js';
const catalog=buildLearningCatalog(COMPLETE_LESSONS,THPT_PROGRAM);
const readers=new Set(catalog.map(x=>x.id));
const legacy=new Set(lessons.map(x=>x.id));
test('AUD-001: canonical catalog exposes each of the 49 complete readers exactly once',()=>{
 assert.equal(catalog.length,49);
 assert.equal(new Set(catalog.map(x=>x.id)).size,49);
 assert.deepEqual([10,11,12].map(grade=>filterLearningCatalog(catalog,{grade}).length),[17,16,16]);
 for (const x of catalog) {
  assert.equal(lessonRoute(x.id,readers,legacy).type,'reader',x.id);
  assert.ok(COMPLETE_LESSONS.find(y=>y.id===x.id));
 }
});
test('AUD-001: legacy collision resolves to full reader, guided exploration has an explicit alias',()=>{
 for (const x of lessons) {
  assert.deepEqual(lessonRoute(`explore-${x.id}`,readers,legacy),{type:'explore',id:x.id});
  if(readers.has(x.id))assert.deepEqual(lessonRoute(x.id,readers,legacy),{type:'reader',id:x.id});
  else assert.deepEqual(lessonRoute(x.id,readers,legacy),{type:'explore',id:x.id});
 }
 assert.equal(lessonRoute('not-a-real-lesson',readers,legacy).type,'missing');
 assert.equal(lessonRoute(undefined,readers,legacy).type,'overview');
 assert.equal(lessonRoute('revision',readers,legacy).type,'revision');
});
test('learning catalog supports exact grade/topic, accent-insensitive search and all-classes reset',()=>{
 assert.ok(filterLearningCatalog(catalog,{grade:'11',query:'dao dong'}).some(item=>item.topic==='Dao động'));
 assert.ok(filterLearningCatalog(catalog,{grade:'12',query:'cam ung dien tu'}).some(item=>item.id==='12-induction'));
 assert.equal(filterLearningCatalog(catalog,{grade:'10',topic:'Dao động'}).length,0);
 assert.equal(filterLearningCatalog(catalog,{grade:'all',topic:'all',query:''}).length,49);
});
test('incomplete, duplicate or unmapped lessons cannot be advertised as a complete course',()=>{
 assert.throws(()=>buildLearningCatalog([...COMPLETE_LESSONS,COMPLETE_LESSONS[0]],THPT_PROGRAM));
 assert.throws(()=>buildLearningCatalog(COMPLETE_LESSONS.slice(1),THPT_PROGRAM));
 assert.throws(()=>buildLearningCatalog(COMPLETE_LESSONS,THPT_PROGRAM.slice(1)));
});

test('AUD-001: actual catalog template renders all lessons by selected class and exposes 16 optional discovery links',async()=>{
 const { mountLearningOverview } = await import('../src/app/learning-overview.js');
 const handlers = new Map();
 const node=(id)=>({id, value:'', innerHTML:'', hidden:false, textContent:'',focus(){},addEventListener(event,handler){handlers.set(`${id}:${event}`,handler);},querySelectorAll:()=>[]});
 const nodes=new Map(['#learning-search','#learning-topic','#learning-results','#learning-filter-count','#learning-filter-empty','#learning-reset'].map(id=>[id,node(id)]));
 const buttons=['10','11','12','all'].map(grade=>({dataset:{learningGrade:grade},setAttribute(){},addEventListener(event,handler){handlers.set(`grade:${grade}:${event}`,handler);}}));
 const main={innerHTML:'',querySelector:id=>nodes.get(id),querySelectorAll:selector=>selector==='[data-learning-grade]'?buttons:[]};
 mountLearningOverview(main,{catalog,legacy:lessons,learningStore:{get:()=>({attempts:{}})},progress:{get:()=>({sessions:{}}),session(){}}});
 const count=()=>[...nodes.get('#learning-results').innerHTML.matchAll(/class="learning-home-card"/g)].length;
 assert.equal(count(),17);
 for(const [grade,n] of [['11',16],['12',16],['all',49]]){
  handlers.get(`grade:${grade}:click`)();assert.equal(count(),n);
 }
 const links=[...nodes.get('#learning-results').innerHTML.matchAll(/href="#\/learning\/([a-z0-9-]+)" data-lesson/g)].map(x=>x[1]);
 assert.equal(new Set(links).size,49);
 assert.match(main.innerHTML,/16 hoạt động khám phá nhanh/);
 nodes.get('#learning-search').value='cam ung dien tu';handlers.get('#learning-search:input')();
 assert.match(nodes.get('#learning-results').innerHTML,/12-induction/);
 handlers.get('#learning-reset:click')();assert.equal(count(),49);
});
