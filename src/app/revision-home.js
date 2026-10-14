import {escapeHtml} from './icons.js';
import {mountLessonAssessment} from './lesson-assessment.js';
import {buildRevisionTest,revisionPool,revisionTopics,wrongRevisionQuestions} from '../core/revision-engine.js';

export function mountRevisionHome(root,{contents,questions,store,progress}){
 let grade=10,topic='all',mode='test';
 const render=()=>{
  const lessons=contents.filter(x=>x.grade===grade&&(topic==='all'||x.topic===topic));
  const pool=revisionPool(contents,questions,{grade,topic}),wrong=wrongRevisionQuestions(pool,store.get());
  const selected=mode==='wrong'?wrong:buildRevisionTest(pool,10),attempt=store.get().attempts[`revision-${grade}-${topic==='all'?'all':lessons[0]?.id||'all'}`];
  root.innerHTML=`<section class="revision-home"><header><span class="tag">REVISION HOME</span><h2>Ôn tập theo lớp và chủ đề</h2><p>Đề lấy câu không trùng từ ngân hàng đã kiểm chứng. Kết quả lưu trên thiết bị hiện tại.</p></header><div class="revision-filters"><label>Lớp<select data-revision-grade>${[10,11,12].map(x=>`<option value="${x}" ${x===grade?'selected':''}>Lớp ${x}</option>`).join('')}</select></label><label>Chủ đề<select data-revision-topic><option value="all">Tất cả chủ đề</option>${revisionTopics(contents,grade).map(x=>`<option ${x===topic?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></label></div><section class="revision-summary"><h3>Kiến thức và công thức trọng tâm</h3>${lessons.map(x=>`<details><summary>${escapeHtml(x.title)}</summary><ul>${x.summary.points.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul><p class="lesson-formula"><strong>${escapeHtml(x.summary.formulas.join(' · '))}</strong></p></details>`).join('')}</section><div class="revision-actions"><button type="button" class="button primary" data-revision-mode="test" aria-pressed="${mode==='test'}">Đề tổng hợp (${Math.min(10,pool.length)} câu)</button><button type="button" class="button secondary" data-revision-mode="wrong" aria-pressed="${mode==='wrong'}" ${wrong.length?'':'disabled'}>Luyện câu sai (${wrong.length})</button></div>${attempt?`<p class="lesson-attempt-summary">Lần kiểm tra gần nhất: ${attempt.score}% · ${attempt.wrong.length} câu cần ôn.</p>`:''}<div class="complete-lesson" data-revision-assessment></div></section>`;
  root.querySelector('[data-revision-grade]').addEventListener('change',event=>{grade=Number(event.target.value);topic='all';mode='test';render();});
  root.querySelector('[data-revision-topic]').addEventListener('change',event=>{topic=event.target.value;mode='test';render();});
  root.querySelectorAll('[data-revision-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.revisionMode;render();}));
  if(selected.length)mountLessonAssessment(root.querySelector('[data-revision-assessment]'),{lessonId:`revision-${grade}-${topic==='all'?'all':lessons[0]?.id||'all'}`,questions:selected,progress,store,initialMode:'test'});
  else root.querySelector('[data-revision-assessment]').innerHTML='<p class="learning-filter-empty">Chưa có câu sai trong phạm vi này. Hãy làm đề tổng hợp trước.</p>';
 };
 render();
}
