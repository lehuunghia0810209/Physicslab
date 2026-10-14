const list=(value,min=1)=>Array.isArray(value)&&value.length>=min&&value.every(item=>typeof item==='string'&&item.trim());
export function validateLessonContents(contents,questionBank){
 const questions=new Set(questionBank.map(q=>q.id)),ids=new Set();
 for(const lesson of contents){
  if(!lesson||typeof lesson.id!=='string'||ids.has(lesson.id)||![10,11,12].includes(lesson.grade)||!lesson.programId||!lesson.title||!Number.isInteger(lesson.duration)||lesson.duration<10)throw new RangeError(`Nội dung bài học không hợp lệ: ${lesson?.id||'không rõ'}.`);ids.add(lesson.id);
  if(!list(lesson.objectives,2)||!list(lesson.prerequisites)||!Array.isArray(lesson.quantities)||!lesson.quantities.length||lesson.quantities.some(q=>!q.symbol||!q.name||!q.unit))throw new RangeError(`Thiếu mục tiêu hoặc đại lượng: ${lesson.id}.`);
  if(!lesson.warmup?.scenario||!lesson.warmup?.question||!Array.isArray(lesson.theory)||lesson.theory.length<2||lesson.theory.some(s=>!s.id||!s.title||!list(s.paragraphs)))throw new RangeError(`Thiếu phần khởi động hoặc lí thuyết: ${lesson.id}.`);
  if(!Array.isArray(lesson.examples)||lesson.examples.length<2||lesson.examples.some(x=>!x.problem||!x.analysis||!list(x.steps,3)||!x.answer||!x.meaning))throw new RangeError(`Bài ${lesson.id} cần ít nhất hai ví dụ có lời giải.`);
  if(!lesson.experiment?.goal||!list(lesson.experiment.steps,3)||!list(lesson.experiment.measurements)||!list(lesson.experiment.questions)||!lesson.experiment.conclusion)throw new RangeError(`Thiếu hoạt động thực nghiệm: ${lesson.id}.`);
  if(!list(lesson.exercises,5)||lesson.exercises.some(id=>!questions.has(id))||!list(lesson.summary?.points,3)||!list(lesson.summary?.mistakes))throw new RangeError(`Thiếu luyện tập hoặc tổng kết: ${lesson.id}.`);
 }
 return true;
}
