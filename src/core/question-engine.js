const TYPES=new Set(['single','true-false','numeric','short']);
const LEVELS=new Set(['nhận biết','thông hiểu','vận dụng','vận dụng cao']);
const text=value=>typeof value==='string'&&value.trim().length>0;
export function normalizeLearningAnswer(value){return String(value??'').trim().toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ');}
// Parse the entire response: a number and (optionally) a physical unit. Never accept
// a valid-looking numeric prefix followed by arbitrary text or a second value.
function parseNumericResponse(value){
 const source=String(value??'').trim().replace(/[−–]/g,'-');
 const match=source.match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?)(.*)$/u);
 if(!match)return {value:NaN,unit:''};
 const unit=match[2].trim();
 if(unit&&!/^[\p{L}\p{M}\d%°Ωλµμ·/²³^\- ]+$/u.test(unit))return {value:NaN,unit:''};
 const number=Number(match[1].replace(',','.'));
 return {value:Number.isFinite(number)?number:NaN,unit};
}
const normalizeUnit=unit=>String(unit).replace(/\s+/g,'').replace(/²/g,'2').replace(/³/g,'3');
export function parseNumericAnswer(value){return parseNumericResponse(value).value;}

export function validateQuestionBank(questions,lessonIds){
 if(!Array.isArray(questions))throw new TypeError('Ngân hàng câu hỏi phải là một mảng.');
 const ids=new Set(),known=lessonIds?new Set(lessonIds):null;
 for(const q of questions){
  if(!q||!text(q.id)||!text(q.lessonId)||!TYPES.has(q.type)||![10,11,12].includes(q.grade)||!LEVELS.has(q.level)||!text(q.prompt)||!text(q.explanation)||!text(q.review))throw new RangeError(`Câu hỏi không đủ metadata: ${q?.id||'không rõ'}.`);
  if(ids.has(q.id))throw new RangeError(`Trùng mã câu hỏi: ${q.id}.`);ids.add(q.id);
  if(known&&!known.has(q.lessonId))throw new RangeError(`Câu hỏi ${q.id} không liên kết được bài học.`);
  if(q.type==='single'){
   if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options.map(x=>x.id)).size!==q.options.length||q.options.some(x=>!text(x.id)||!text(x.text))||!q.options.some(x=>x.id===q.answer))throw new RangeError(`Đáp án lựa chọn không hợp lệ: ${q.id}.`);
  }else if(q.type==='true-false'){
   if(!Array.isArray(q.statements)||q.statements.length<2||new Set(q.statements.map(x=>x.id)).size!==q.statements.length||q.statements.some(x=>!text(x.id)||!text(x.text)||typeof x.answer!=='boolean'||!text(x.explanation)))throw new RangeError(`Mệnh đề đúng/sai không hợp lệ: ${q.id}.`);
  }else if(q.type==='numeric'){
   const tolerance=q.tolerance||{};
   if(!Number.isFinite(q.answer)||!text(q.unit)||!text(q.formula)||(!Number.isFinite(tolerance.absolute)&&!Number.isFinite(tolerance.relative))||[tolerance.absolute,tolerance.relative].some(x=>x!==undefined&&(!Number.isFinite(x)||x<0)))throw new RangeError(`Đáp án số hoặc sai số không hợp lệ: ${q.id}.`);
  }else if(!Array.isArray(q.accepted)||!q.accepted.length||q.accepted.some(x=>!text(x)))throw new RangeError(`Đáp án ngắn không hợp lệ: ${q.id}.`);
 }
 return true;
}
export function scoreQuestion(q,response){
 if(q.type==='single')return {correct:response===q.answer,score:response===q.answer?100:0,explanation:q.explanation};
 if(q.type==='true-false'){
  const details=q.statements.map(statement=>({id:statement.id,correct:response?.[statement.id]===statement.answer,explanation:statement.explanation}));
  const score=Math.round(details.filter(x=>x.correct).length/details.length*100);
  return {correct:score===100,score,details,explanation:q.explanation};
 }
 if(q.type==='numeric'){
  const {value,unit}=parseNumericResponse(response),absolute=q.tolerance?.absolute??0,relative=(q.tolerance?.relative??0)*Math.abs(q.answer);
  const correct=Number.isFinite(value)&&(!unit||normalizeUnit(unit)===normalizeUnit(q.unit))&&Math.abs(value-q.answer)<=Math.max(absolute,relative,Number.EPSILON);
  return {correct,score:correct?100:0,value,explanation:q.explanation};
 }
 const correct=q.accepted.some(answer=>normalizeLearningAnswer(answer)===normalizeLearningAnswer(response));
 return {correct,score:correct?100:0,explanation:q.explanation};
}
