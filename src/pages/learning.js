import { categories, lessons } from '../data/curriculum.js';
import { summarizeLearningProgress } from '../core/learning-analytics.js';
import { icon } from '../app/icons.js';
import { filterLessons, isExperimentVerified } from '../core/lesson-filter.js';
import { guideForSimulation } from '../data/experiment-guides.js';
import { THPT_PROGRAM } from '../data/thpt-program.js';
import { COMPLETE_LESSONS, completeLesson } from '../data/learning/lesson-content.js';
import { QUESTION_BANK, questionsForLesson } from '../data/learning/question-bank.js';
import { getLearningStore } from '../core/learning-session.js';
import { buildLearningCatalog, lessonRoute } from '../core/learning-catalog.js';
import { mountLearningOverview } from '../app/learning-overview.js';
import { mountLessonReader } from '../app/lesson-reader.js';
import { mountRevisionHome } from '../app/revision-home.js';
import '../styles/thpt-learning.css';

export function mount(main, context) {
  const { progress } = context;
  const learningStore=getLearningStore();
  const readerCatalog=buildLearningCatalog(COMPLETE_LESSONS,THPT_PROGRAM);
  const requestedLesson=location.hash.match(/^#\/learning\/([a-z0-9-]+)$/)?.[1];
  const route=lessonRoute(requestedLesson, new Set(readerCatalog.map(item=>item.id)), new Set(lessons.map(item=>item.id)));
  // Legacy discovery progress and the new Learning store are intentionally distinct.
  const activeId=route.type==='explore'?route.id:lessons[0].id;
  let catalogFilters = { grade: String(lessons.find(item => item.id === activeId)?.grade || 10), category: 'all', query: '' };

  function renderTopicProgress(data) {
    return `<h3>Tiến độ Khám phá nhanh theo chủ đề</h3><p>Thống kê riêng 16 hoạt động Khám phá nhanh. Tiến độ 49 bài Learning 3.0 được theo dõi trong trang Học tập và Ôn tập.</p>${summarizeLearningProgress(lessons, categories, data).map(topic => {
      const score = topic.averageBestScore;
      return `<div class="learning-mastery-item"><div><strong>${topic.title}</strong><span>${score === null ? 'Chưa kiểm tra' : `Điểm tốt nhất TB: ${score}%`}</span></div><progress max="100" value="${score ?? 0}" aria-label="${topic.title}: ${score === null ? 'chưa kiểm tra' : `${score}%`}"></progress><small>Đã kiểm tra ${topic.attemptedCount}/${topic.lessonCount} · Hoàn thành ${topic.completedCount}/${topic.lessonCount}</small></div>`;
    }).join('')}`;
  }

  function renderLesson() {
    if(route.type==='overview') {
      mountLearningOverview(main,{catalog:readerCatalog,legacy:lessons,learningStore,progress});
      return;
    }
    if(route.type==='missing') {
      main.innerHTML=`<div class="empty-state"><h1>Không tìm thấy bài học</h1><p>Đường dẫn này không nằm trong chương trình đã xuất bản.</p><a class="button primary" href="#/learning">Xem chương trình học</a></div>`;
      return;
    }
    if(requestedLesson==='revision'){
      main.innerHTML=`<div class="page-heading"><div><p class="eyebrow">LEARNING 3.0 · ÔN TẬP</p><h1>Revision Home</h1><p>Công thức trọng tâm, câu sai và đề tổng hợp theo lớp.</p></div><a class="button secondary" href="#/learning">Trở lại lộ trình</a></div><div data-revision-home></div>`;
      mountRevisionHome(main.querySelector('[data-revision-home]'),{contents:COMPLETE_LESSONS,questions:QUESTION_BANK,store:learningStore,progress});return;
    }
    const lesson = lessons.find(item => item.id === activeId) || lessons[0];
    const content=route.type==='reader'?completeLesson(route.id):null;
    const data = progress.get();
    if(route.type==='reader'){
      if (progress.get().sessions['learning-active']?.setup?.lessonId !== content.id) {
        progress.session('learning-active',{setup:{lessonId:content.id}});
      }
      const order=new Map(THPT_PROGRAM.map((item,index)=>[item.id,index]));
      const sameGrade=COMPLETE_LESSONS.filter(x=>x.grade===content.grade).sort((a,b)=>(order.get(a.programId)??999)-(order.get(b.programId)??999));
      const currentIndex=sameGrade.findIndex(x=>x.id===content.id);
      const previous=sameGrade[currentIndex-1],next=sameGrade[currentIndex+1];
      const learningAttempts=learningStore.get().attempts;
      const gradeAttempted=sameGrade.filter(item=>learningAttempts[item.id]).length;
      const legacyCompanion=lessons.find(item=>item.id===content.id);
      const gradePosition=`${currentIndex+1}/${sameGrade.length}`;
      main.innerHTML=`<div class="page-heading"><div><p class="eyebrow">LEARNING 3.0 · LỚP ${content.grade}</p><h1>${content.title}</h1><p>${gradePosition} bài · ${content.topic}. Lí thuyết, ví dụ và thực nghiệm đi kèm.</p></div></div>
        <nav class="learning-reader-tools" aria-label="Điều hướng bài học"><a href="#/learning">← Chương trình học</a><a href="#/learning/revision">Ôn tập lớp ${content.grade}</a>${previous?`<a href="#/learning/${previous.id}">← Bài trước</a>`:''}${next?`<a href="#/learning/${next.id}">Bài tiếp theo →</a>`:''}${legacyCompanion?`<a href="#/learning/explore-${legacyCompanion.id}">Khám phá nhanh ↗</a>`:''}</nav>
        <div class="learning-layout learning-reader-layout"><section class="panel lesson-content"><div data-complete-lesson></div></section><aside class="panel learning-aside"><h2>Tiến độ ôn tập lớp ${content.grade}</h2><p>Đang đọc bài ${gradePosition}. Đã có kết quả kiểm tra ở ${gradeAttempted}/${sameGrade.length} bài; số này không đồng nghĩa đã học thuộc hoặc được giáo viên xác nhận.</p><progress max="${sameGrade.length}" value="${gradeAttempted}" aria-label="${gradeAttempted} trên ${sameGrade.length} bài đã có kết quả kiểm tra"></progress><p>${learningAttempts[content.id]?`Điểm kiểm tra gần nhất của bài: ${learningAttempts[content.id].score}%.`:'Bài này chưa có kết quả kiểm tra.'}</p><a class="button secondary" href="#/learning/revision">Ôn tập lớp ${content.grade}</a><a class="button secondary" href="#/learning">Danh sách bài học</a></aside></div>`;
      mountLessonReader(main.querySelector('[data-complete-lesson]'),{content,questions:questionsForLesson(content.id),progress,store:learningStore});
      return;
    }
    const completed = data.lessons[lesson.id] || 0;
    let savedPrediction = data.sessions[`learning-${lesson.id}`]?.setup?.prediction;
    const experimentBaseline = data.sessions[`learning-${lesson.id}`]?.setup?.experimentBaseline;
    const simulationHref = lesson.simulation === 'lab' ? '#/lab/hooke' : `#/simulation/${lesson.simulation}`;
    const guide = guideForSimulation(lesson.simulation);
    const guideHtml = guide ? `<div class="lesson-experiment-tips"><strong>Nhiệm vụ quan sát trong mô phỏng</strong><ol>${guide.map(step => `<li>${step}</li>`).join('')}</ol></div>` : '';
    main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">HỌC TỪ NHỮNG GÌ BẠN QUAN SÁT</p><h1>Học tập tương tác</h1><p>${lessons.length} bài khám phá · Dự đoán, thử nghiệm, giải thích và kiểm tra.</p></div></div>
      <nav class="learning-reader-tools" aria-label="Quay lại chương trình học"><a href="#/learning">← Toàn bộ 49 bài học</a><a href="#/learning/revision">Ôn tập</a></nav>
      <p class="lesson-coverage-notice"><strong>Khám phá nhanh:</strong> hoạt động thực nghiệm 4 bước dành cho thực hành. Để đọc lí thuyết, ví dụ và luyện tập theo chương trình, chọn <a href="#/learning">Học tập THPT</a>.</p>
      <section class="learning-filters" aria-label="Tìm và lọc bài học">
        <label for="learning-search">Tìm bài học<input id="learning-search" type="search" placeholder="Ví dụ: ném xiên, điện trường..." autocomplete="off"></label>
        <label for="learning-grade">Khối lớp<select id="learning-grade"><option value="all">Tất cả lớp</option><option value="10">Lớp 10</option><option value="11">Lớp 11</option><option value="12">Lớp 12</option></select></label>
        <label for="learning-topic">Chủ đề<select id="learning-topic"><option value="all">Tất cả chủ đề</option>${categories.filter(item => item.id !== 'all').map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select></label>
        <p id="learning-filter-count" role="status" aria-live="polite"></p>
      </section>
      <section class="learning-catalog" aria-label="Chọn bài khám phá">${lessons.map(item => `<a href="#/learning/explore-${item.id}" class="learning-choice ${item.id === lesson.id ? 'selected' : ''}" data-lesson="${item.id}" aria-current="${item.id === lesson.id?'page':'false'}"><span>LỚP ${item.grade} · ${Math.min(4, data.lessons[item.id] || 0)}/4 bước</span><strong>${item.title}</strong></a>`).join('')}</section>
      <p id="learning-filter-empty" class="learning-filter-empty" hidden>Không tìm thấy bài học phù hợp. Hãy thử thay đổi bộ lọc.</p>
      <div class="learning-layout"><section class="panel lesson-content">
        <span class="tag">01 / DỰ ĐOÁN</span><h2>${lesson.prompt}</h2>
        <form id="prediction-form"><fieldset><legend>Chọn dự đoán của bạn trước khi mở mô phỏng hoặc thí nghiệm</legend>${lesson.predictionOptions.map(([value, text]) => `<label class="quiz-option"><input type="radio" name="prediction" value="${value}" ${savedPrediction === value ? 'checked' : ''} required> ${text}</label>`).join('')}</fieldset>
          <button class="button secondary" id="prediction" type="submit">Lưu dự đoán ${icon('check')}</button><p id="prediction-result" role="status">${savedPrediction ? 'Đã lưu dự đoán. Hãy kiểm tra bằng mô phỏng.' : ''}</p>
        </form>
        <hr><span class="tag">02 / THỬ NGHIỆM</span><h2>Thay đổi tham số và quan sát hiện tượng</h2><p>Trong mô phỏng, thay đổi một đại lượng mỗi lần để so sánh công bằng. Ghi nhận thời gian, đồ thị hoặc kết quả đo trước khi kết luận.</p>
        <a class="button primary" id="lesson-simulation-link" href="${simulationHref}">Mở mô phỏng hoặc thí nghiệm liên quan ${icon('arrow')}</a>${guideHtml}
        <div class="experiment-checklist" role="group" aria-label="Điều kiện hoàn thành thử nghiệm"><strong>Để xác nhận đã thử nghiệm:</strong><ul id="experiment-requirements"></ul></div>
        <button class="button secondary experiment-confirm" id="experiment-done" type="button" disabled>Tôi đã thực hiện thử nghiệm</button>
        <hr><span class="tag">03 / QUAN SÁT</span><h2>Đối chiếu với mô hình</h2><p>${lesson.observation}</p><p id="prediction-outcome" role="status"></p><button class="button secondary" id="observation" type="button">Tôi đã đối chiếu kết quả ${icon('check')}</button>
        <hr><span class="tag">04 / KIỂM TRA HIỂU BIẾT</span><h2>${lesson.quizPrompt}</h2>
        <form id="quiz"><fieldset><legend>Chọn một đáp án</legend>${lesson.quizOptions.map(([value, text]) => `<label class="quiz-option"><input type="radio" name="answer" value="${value}" required> ${text}</label>`).join('')}</fieldset>
          <button class="button primary" type="submit">Kiểm tra đáp án</button><p id="quiz-result" role="status"></p>
        </form>
      </section><aside class="panel learning-aside"><h2>Lộ trình của bạn</h2><ol>${lesson.steps.map((step, index) => `<li id="lesson-step-${index + 1}" class="${completed >= index + 1 ? 'done' : ''}"><span>${index + 1}</span>${step}</li>`).join('')}</ol><p id="lesson-status">${completed === 4 ? 'Đã hoàn thành bài khám phá này.' : `Đã hoàn thành ${completed}/4 bước. Tiến độ lưu trên thiết bị này.`}</p><section class="learning-mastery" aria-label="Kết quả học tập theo chủ đề">${renderTopicProgress(data)}</section><div class="assumption-box"><strong>Mô hình cần nhớ</strong><p>${lesson.observation}</p></div></aside></div>`;

    function mark(step) {
      const previous = progress.get().lessons[lesson.id] || 0;
      if (step > previous + 1) return false;
      progress.lesson(lesson.id, step);
      for (let index = 1; index <= step; index++) main.querySelector(`#lesson-step-${index}`)?.classList.add('done');
      const current = progress.get().lessons[lesson.id] || 0;
      main.querySelector('#lesson-status').textContent = current === 4
        ? 'Đã hoàn thành bài khám phá này.'
        : `Đã hoàn thành ${current}/4 bước. Tiến độ lưu trên thiết bị này.`;
      return true;
    }

    function updateCatalog() {
      const visibleIds = new Set(filterLessons(lessons, catalogFilters).map(item => item.id));
      main.querySelectorAll('[data-lesson]').forEach(button => { button.hidden = !visibleIds.has(button.dataset.lesson); });
      main.querySelector('#learning-filter-count').textContent = `Hiển thị ${visibleIds.size}/${lessons.length} bài học`;
      main.querySelector('#learning-filter-empty').hidden = visibleIds.size !== 0;
    }
    const gradeSelect = main.querySelector('#learning-grade');
    const topicSelect = main.querySelector('#learning-topic');
    const searchInput = main.querySelector('#learning-search');
    gradeSelect.value = catalogFilters.grade;
    topicSelect.value = catalogFilters.category;
    searchInput.value = catalogFilters.query;
    gradeSelect.addEventListener('change', () => { catalogFilters.grade = gradeSelect.value; updateCatalog(); });
    topicSelect.addEventListener('change', () => { catalogFilters.category = topicSelect.value; updateCatalog(); });
    searchInput.addEventListener('input', () => { catalogFilters.query = searchInput.value; updateCatalog(); });
    updateCatalog();
    function refreshExperimentGate() {
      const currentStep = progress.get().lessons[lesson.id] || 0;
      const predictionSaved = Boolean(savedPrediction && savedPrediction !== 'not-recorded');
      const baselineReady = typeof experimentBaseline === 'number';
      const interactions = context.interactionCount(lesson.simulation);
      const verified = isExperimentVerified({ predictionSaved, baseline: experimentBaseline, interactions, progressStep: currentStep });
      const items = [
        [predictionSaved, 'Lưu dự đoán ở bước 1'],
        [baselineReady, 'Mở mô phỏng qua liên kết của bài học'],
        [verified || (baselineReady && interactions > experimentBaseline), 'Thay đổi tham số hoặc ghi ít nhất một phép đo']
      ];
      main.querySelector('#experiment-requirements').innerHTML = items.map(([done, label]) => `<li class="${done ? 'verified' : ''}">${done ? '✓' : '○'} ${label}</li>`).join('');
      const button = main.querySelector('#experiment-done');
      button.disabled = currentStep < 2 && !verified;
      button.title = button.disabled ? 'Hoàn thành các điều kiện trong danh sách trước khi xác nhận' : '';
      if (currentStep >= 2) button.textContent = '✓ Đã ghi nhận thử nghiệm';
    }
    refreshExperimentGate();

    main.querySelectorAll('[data-thpt-open-lesson],[data-lesson]').forEach(link=>link.addEventListener('click',()=>progress.session('learning-active',{setup:{lessonId:link.dataset.thptOpenLesson||link.dataset.lesson}})));
    main.querySelector('#prediction-form').addEventListener('submit', event => {
      event.preventDefault();
      const prediction = new FormData(event.target).get('prediction');
      if (!lesson.predictionOptions.some(([value]) => value === prediction)) return;
      progress.session(`learning-${lesson.id}`, { setup: { prediction } });
      savedPrediction = prediction;
      main.querySelector('#prediction-result').textContent = 'Đã lưu dự đoán. Hãy thử nghiệm để xem kết quả có phù hợp không.';
      mark(1);
      refreshExperimentGate();
    });
    main.querySelector('#lesson-simulation-link').addEventListener('click', () => {
      progress.session(`learning-${lesson.id}`, {
        setup: { prediction: savedPrediction || 'not-recorded', experimentBaseline: context.interactionCount(lesson.simulation) }
      });
    });
    main.querySelector('#experiment-done').addEventListener('click', () => {
      if (typeof experimentBaseline !== 'number' || context.interactionCount(lesson.simulation) <= experimentBaseline) {
        main.querySelector('#lesson-status').textContent = 'Mở mô phỏng hoặc thí nghiệm từ liên kết, rồi thay đổi một thông số hoặc ghi một phép đo trước khi xác nhận thử nghiệm.';
        return;
      }
      if (!mark(2)) main.querySelector('#lesson-status').textContent = 'Hãy lưu dự đoán trước khi ghi nhận đã thử nghiệm.';
      refreshExperimentGate();
    });
    main.querySelector('#observation').addEventListener('click', () => {
      if (!mark(3)) {
        main.querySelector('#lesson-status').textContent = 'Hãy hoàn thành thử nghiệm trước khi ghi nhận quan sát.';
        return;
      }
      const expected = savedPrediction === lesson.predictionCorrect;
      main.querySelector('#prediction-outcome').textContent = savedPrediction
        ? expected ? 'Dự đoán ban đầu phù hợp với kết quả.' : 'Kết quả khác dự đoán ban đầu — đối chiếu lại các đại lượng trong mô phỏng.'
        : 'Bạn chưa lưu dự đoán trước khi thử nghiệm.';
    });
    main.querySelector('#quiz').addEventListener('submit', event => {
      event.preventDefault();
      const answer = new FormData(event.target).get('answer');
      const correct = answer === lesson.correct;
      progress.quiz(lesson.id, correct ? 100 : 0);
      main.querySelector('.learning-mastery').innerHTML = renderTopicProgress(progress.get());
      const completed = correct && mark(4);
      main.querySelector('#quiz-result').textContent = correct
        ? `Đúng! ${lesson.explanation}${completed ? '' : ' Hãy hoàn thành các bước dự đoán, thử nghiệm và quan sát để ghi nhận hoàn tất bài học.'}`
        : `Chưa đúng. ${lesson.explanation}`;
    });
  }

  renderLesson();
}
