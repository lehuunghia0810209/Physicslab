const order=['nhận biết','thông hiểu','vận dụng','vận dụng cao'];
export function revisionTopics(contents,grade){return [...new Set(contents.filter(x=>x.grade===Number(grade)).map(x=>x.topic))].sort((a,b)=>a.localeCompare(b,'vi'));}
export function revisionPool(contents,questions,{grade,topic='all'}={}){
 const ids=new Set(contents.filter(x=>x.grade===Number(grade)&&(topic==='all'||x.topic===topic)).map(x=>x.id));
 return questions.filter(q=>ids.has(q.lessonId));
}
// Sample across lessons and cognitive levels, rather than repeatedly testing
// the first few lessons in registry order. Inject random for deterministic tests.
export function buildRevisionTest(pool,count=10,random=Math.random){
 const unique=[...new Map((Array.isArray(pool)?pool:[]).filter(q=>q&&q.id&&q.lessonId).map(q=>[q.id,q])).values()];
 const target=Math.min(Math.max(0,Number.isFinite(count)?Math.trunc(count):0),unique.length);
 const selected=[],usedLessons=new Set(),usedQuestions=new Set();
 const shuffle=array=>{const result=[...array];for(let i=result.length-1;i>0;i--){const r=Number(random()),index=Math.min(i,Math.max(0,Math.floor((Number.isFinite(r)?r:0)* (i+1))));[result[i],result[index]]=[result[index],result[i]];}return result;};
 const candidates=shuffle(unique),levels=order.filter(level=>candidates.some(q=>q.level===level));
 for(let index=0;index<target;index++){
  const remaining=candidates.filter(q=>!usedQuestions.has(q.id));
  const targetLevel=levels[index%levels.length];
  // Prefer a new lesson first; within that constraint, rotate complexity levels.
  const fresh=remaining.filter(q=>!usedLessons.has(q.lessonId));
  const eligible=fresh.filter(q=>q.level===targetLevel);
  const chosen=(eligible.length?eligible:fresh.length?fresh:remaining.filter(q=>q.level===targetLevel).length?remaining.filter(q=>q.level===targetLevel):remaining)[0];
  if(!chosen)break;
  selected.push(chosen);usedLessons.add(chosen.lessonId);usedQuestions.add(chosen.id);
 }
 return selected;
}
export function wrongRevisionQuestions(pool,data){
 const wrong=new Set();
 for(const [lessonId,attempt] of Object.entries(data?.attempts||{})){
  const ids=Object.prototype.hasOwnProperty.call(data?.practiceWrong||{},lessonId)?data.practiceWrong[lessonId]:attempt?.wrong;
  for(const id of ids||[])wrong.add(id);
 }
 for(const [lessonId,ids] of Object.entries(data?.practiceWrong||{}))if(!Object.prototype.hasOwnProperty.call(data?.attempts||{},lessonId))for(const id of ids||[])wrong.add(id);
 return pool.filter(q=>wrong.has(q.id));
}
