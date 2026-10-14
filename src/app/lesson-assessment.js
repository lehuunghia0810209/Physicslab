import { escapeHtml } from './icons.js';
import { scoreQuestion } from '../core/question-engine.js';

function questionMarkup(q,index){
 const head=`<legend><span>Câu ${index+1} · ${escapeHtml(q.level)}</span>${escapeHtml(q.prompt)}</legend>`;
 if(q.type==='single')return `<fieldset data-question="${q.id}">${head}${q.options.map(x=>`<label class="lesson-answer"><input type="radio" name="${q.id}" value="${x.id}"> ${escapeHtml(x.text)}</label>`).join('')}<button class="button secondary" type="button" data-check="${q.id}">Kiểm tra câu này</button><p data-feedback="${q.id}" role="status"></p></fieldset>`;
 if(q.type==='true-false')return `<fieldset data-question="${q.id}">${head}${q.statements.map(x=>`<label class="lesson-statement">${escapeHtml(x.text)}<select data-statement="${x.id}" aria-label="${escapeHtml(x.text)}"><option value="">Chọn</option><option value="true">Đúng</option><option value="false">Sai</option></select></label>`).join('')}<button class="button secondary" type="button" data-check="${q.id}">Kiểm tra câu này</button><div data-feedback="${q.id}" role="status"></div></fieldset>`;
 const label=q.type==='numeric'?`Đáp án (${escapeHtml(q.unit)})`:'Câu trả lời ngắn';
 return `<fieldset data-question="${q.id}">${head}<label class="lesson-written-answer">${label}<input data-written type="text" inputmode="${q.type==='numeric'?'decimal':'text'}" autocomplete="off"></label><button class="button secondary" type="button" data-check="${q.id}">Kiểm tra câu này</button><p data-feedback="${q.id}" role="status"></p></fieldset>`;
}
export function mountLessonAssessment(root,{lessonId,questions,progress,store,initialMode='practice'}){
 let mode=initialMode==='test'?'test':'practice',results=new Map(),wrongOnly=false;
 const snapshot=store.get(),previous=snapshot.attempts[lessonId];
 const previousWrong=snapshot.practiceWrong?.[lessonId]??previous?.wrong??[];
 root.innerHTML=`<div class="lesson-assessment-head"><div><span class="tag">LUYỆN TẬP CÓ PHẢN HỒI</span><h3>Kiểm tra kiến thức bằng ${questions.length} câu khác dạng</h3></div><div class="lesson-mode" role="group" aria-label="Chế độ làm bài"><button type="button" data-mode="practice" aria-pressed="${mode==='practice'}">Luyện tập</button><button type="button" data-mode="test" aria-pressed="${mode==='test'}">Kiểm tra</button></div></div>${previous?`<p class="lesson-attempt-summary">Lần kiểm tra gần nhất: ${previous.score}% · ${previousWrong.length} câu cần ôn.</p>`:previousWrong.length?`<p class="lesson-attempt-summary">Đang luyện tập · ${previousWrong.length} câu cần ôn. Chưa có điểm kiểm tra toàn bài.</p>`:''}<form data-assessment-form>${questions.map(questionMarkup).join('')}<div class="lesson-assessment-actions"><button class="button primary" type="submit" data-submit ${mode==='test'?'':'hidden'}>Nộp bài kiểm tra</button>${previousWrong.length?'<button class="button secondary" type="button" data-review-wrong>Chỉ ôn lại câu sai</button>':''}<button class="button ghost" type="button" data-show-all hidden>Hiện tất cả câu</button></div></form><p data-assessment-status role="status" aria-live="polite">${mode==='test'?'Lời giải chỉ hiện sau khi nộp toàn bộ bài.':''}</p>`;
 const form=root.querySelector('[data-assessment-form]'),status=root.querySelector('[data-assessment-status]');
 const modeButtons=root.querySelectorAll('[data-mode]'),feedbackNodes=root.querySelectorAll('[data-feedback]');
 const response=q=>{
  const field=form.querySelector(`[data-question="${q.id}"]`);
  if(q.type==='single')return field.querySelector(`input[name="${q.id}"]:checked`)?.value;
  if(q.type==='true-false')return Object.fromEntries([...field.querySelectorAll('[data-statement]')].map(select=>[select.dataset.statement,select.value===''?null:select.value==='true']));
  return field.querySelector('[data-written]').value;
 };
 const persistFull=()=>{
  const graded=[...results.values()],score=graded.length?Math.round(graded.reduce((sum,x)=>sum+x.score,0)/graded.length):0;
  const wrong=[...results].filter(([,value])=>!value.correct).map(([id])=>id);
  store.record(lessonId,score,wrong);
  progress.quiz(lessonId,score);
  return {score,wrong};
 };
 const check=(q,savePractice=true)=>{
  const result=scoreQuestion(q,response(q));results.set(q.id,result);
  const feedback=form.querySelector(`[data-feedback="${q.id}"]`);
  feedback.textContent=`${result.correct?'Đúng.':q.type==='true-false'?`Đúng ${result.score}% số mệnh đề.`:'Chưa đúng.'} ${result.explanation} Cần ôn: ${q.review}`;
  if(q.type==='true-false'&&result.details){
   const detailList=document.createElement('ul');
   for(const statement of q.statements){
    const detail=result.details.find(x=>x.id===statement.id),row=document.createElement('li');
    row.textContent=`${detail?.correct?'Đúng':'Chưa đúng'} — ${statement.text}: ${statement.explanation}`;
    detailList.append(row);
   }
   feedback.append(detailList);
  }
  feedback.className=result.correct?'answer-correct':'answer-review';feedback.hidden=false;
  if(savePractice){
   store.trackPractice(lessonId,q.id,result.correct);
   if(!wrongOnly&&results.size===questions.length)persistFull();
  }
  return result;
 };
 const updateMode=()=>{
  modeButtons.forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.mode===mode)));
  root.querySelectorAll('[data-check]').forEach(x=>x.hidden=mode==='test');
  root.querySelector('[data-submit]').hidden=mode!=='test';
  feedbackNodes.forEach(x=>x.hidden=mode==='test');
 };
 updateMode();
 root.querySelectorAll('[data-check]').forEach(button=>button.addEventListener('click',()=>{
  const q=questions.find(x=>x.id===button.dataset.check);
  if(q)check(q);
 }));
 modeButtons.forEach(button=>button.addEventListener('click',()=>{
  if(mode===button.dataset.mode)return;
  mode=button.dataset.mode;results=new Map();form.reset();feedbackNodes.forEach(x=>{x.hidden=true;x.textContent='';});
  updateMode();status.textContent=mode==='practice'?'Kiểm tra từng câu để nhận giải thích ngay. Chưa ghi điểm kiểm tra khi chưa hoàn thành đủ câu.':'Bắt đầu lượt kiểm tra mới. Lời giải chỉ hiện sau khi nộp bài.';
 }));
 form.addEventListener('submit',event=>{
  event.preventDefault();results=new Map();
  const activeQuestions=questions.filter(q=>!form.querySelector(`[data-question="${q.id}"]`).hidden);
  for(const q of activeQuestions)check(q,false);
  if(!wrongOnly&&activeQuestions.length===questions.length){
   const outcome=persistFull();
   status.textContent=`Đã nộp: ${outcome.score}% · ${outcome.wrong.length?`${outcome.wrong.length} câu cần ôn lại.`:'Tất cả câu đều đúng.'}`;
  }else{
   for(const [id,result] of results)store.trackPractice(lessonId,id,result.correct);
   status.textContent=`Đã nộp ${activeQuestions.length} câu ôn lại. Chưa thay đổi điểm bài kiểm tra đầy đủ.`;
  }
  feedbackNodes.forEach(x=>x.hidden=false);
 });
 root.querySelector('[data-review-wrong]')?.addEventListener('click',()=>{
  const current=store.get(),wrong=new Set(current.practiceWrong?.[lessonId]??current.attempts[lessonId]?.wrong??[]);
  wrongOnly=true;results=new Map();
  root.querySelectorAll('[data-question]').forEach(field=>field.hidden=!wrong.has(field.dataset.question));
  root.querySelector('[data-show-all]').hidden=false;
  status.textContent=`Đang ôn ${wrong.size} câu cần cải thiện. Lượt ôn riêng không ghi đè điểm kiểm tra toàn bài.`;
 });
 root.querySelector('[data-show-all]').addEventListener('click',event=>{
  wrongOnly=false;results=new Map();
  root.querySelectorAll('[data-question]').forEach(field=>field.hidden=false);
  event.currentTarget.hidden=true;status.textContent='Đã hiện toàn bộ câu hỏi. Làm đủ câu để ghi điểm mới.';
 });
 if(store.issue())status.textContent=store.issue();
}
