export const LEARNING_KEY='physicslab.learning.v1';
const fresh=()=>({version:1,attempts:{},notes:{},practiceWrong:{}});
const id=value=>typeof value==='string'&&/^[a-z0-9-]{1,80}$/.test(value);
const validIds=value=>[...new Set(value.filter(id))].slice(0,50);
export function validateLearningBackup(raw){
 if(!raw||raw.version!==1||typeof raw!=='object'||Array.isArray(raw))throw new RangeError('Kho Learning không đúng phiên bản 1.');
 const data=fresh();
 if(raw.attempts&&typeof raw.attempts==='object'&&!Array.isArray(raw.attempts))for(const [lessonId,value] of Object.entries(raw.attempts).slice(0,100)){
  if(!id(lessonId)||!value||!Number.isInteger(value.score)||value.score<0||value.score>100||!Number.isFinite(value.at))continue;
  const wrong=Array.isArray(value.wrong)?validIds(value.wrong):[];
  data.attempts[lessonId]={score:value.score,wrong,at:value.at};
 }
 if(raw.notes&&typeof raw.notes==='object'&&!Array.isArray(raw.notes))for(const [lessonId,value] of Object.entries(raw.notes).slice(0,100))if(id(lessonId)&&typeof value==='string')data.notes[lessonId]=value.slice(0,4000);
 // Optional additive field. Older v1 backups that lack it remain readable, and the legacy keys stay intact.
 if(raw.practiceWrong&&typeof raw.practiceWrong==='object'&&!Array.isArray(raw.practiceWrong))for(const [lessonId,value] of Object.entries(raw.practiceWrong).slice(0,100))if(id(lessonId)&&Array.isArray(value))data.practiceWrong[lessonId]=validIds(value);
 return data;
}
export function createLearningStore(storage){
 let data=fresh(),persistent=!!storage,blocked=false,readable=!!storage,raw=null,issue='';
 if(storage){
  try{raw=storage.getItem(LEARNING_KEY);if(raw!==null)data=validateLearningBackup(JSON.parse(raw));}
  catch(error){blocked=raw!==null;readable=raw!==null; // if read failed, never attempt a blind write
   persistent=false;issue=blocked?'Không thể đọc kho Learning cũ; dữ liệu gốc chưa bị ghi đè.':`Không thể truy cập kho Learning. ${error.message}`;}
 }
 const save=next=>{
  data=next;
  if(blocked)throw new Error(issue);
  if(!storage||!readable){persistent=false;return false;}
  let current;
  try{current=storage.getItem(LEARNING_KEY);}catch(error){persistent=false;issue=`Không thể kiểm tra dữ liệu Learning hiện tại. ${error.message}`;return false;}
  if(current!==raw){persistent=false;issue='Dữ liệu Learning đã thay đổi ở tab khác. Hãy xuất bản sao phiên này và tải lại trước khi sửa tiếp.';throw new Error(issue);}
  try{const serialized=JSON.stringify(next);storage.setItem(LEARNING_KEY,serialized);raw=serialized;persistent=true;issue='';return true;}
  catch(error){persistent=false;issue=`Không lưu được Learning, dữ liệu vẫn ở bộ nhớ. ${error.message}`;return false;}
 };
 return {get:()=>structuredClone(data),isPersistent:()=>persistent&&!blocked,isDamaged:()=>blocked,issue:()=>issue,rescue:()=>raw,
  // Full assessments only. A partial practice click must not be reported as a graded attempt.
  record(lessonId,score,wrong=[]){if(!id(lessonId)||!Number.isInteger(score)||score<0||score>100||!Array.isArray(wrong)||wrong.some(x=>!id(x)))throw new RangeError('Kết quả luyện tập không hợp lệ.');const next=structuredClone(data);const valid=validIds(wrong);next.attempts[lessonId]={score,wrong:valid,at:Date.now()};next.practiceWrong[lessonId]=valid;save(next);return structuredClone(data.attempts[lessonId]);},
  // Track a question for revision without inventing an overall quiz score.
  trackPractice(lessonId,questionId,correct){if(!id(lessonId)||!id(questionId)||typeof correct!=='boolean')throw new RangeError('Câu luyện tập không hợp lệ.');const next=structuredClone(data);const previous=next.practiceWrong[lessonId]??next.attempts[lessonId]?.wrong??[];const wrong=new Set(previous);if(correct)wrong.delete(questionId);else wrong.add(questionId);next.practiceWrong[lessonId]=[...wrong].slice(-50);save(next);return [...data.practiceWrong[lessonId]];},
  note(lessonId,value){if(!id(lessonId)||typeof value!=='string')throw new TypeError('Ghi chú không hợp lệ.');const next=structuredClone(data);next.notes[lessonId]=value.slice(0,4000);save(next);}
 };
}
