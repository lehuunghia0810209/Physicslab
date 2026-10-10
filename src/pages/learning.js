import { categories, lessons } from '../data/curriculum.js';
import { summarizeLearningProgress } from '../core/learning-analytics.js';
import { icon } from '../app/icons.js';
import { filterLessons, isExperimentVerified } from '../core/lesson-filter.js';

export function mount(main, context) {
  const { progress } = context;
  const savedLessonId = progress.get().sessions['learning-active']?.setup?.lessonId;
  let activeId = lessons.some(item => item.id === savedLessonId) ? savedLessonId : lessons[0].id;
  let catalogFilters = { grade: 'all', category: 'all', query: '' };

  function renderTopicProgress(data) {
    return `<h3>Kết quả theo chủ đề</h3><p>Điểm tốt nhất trung bình của các bài đã kiểm tra.</p>${summarizeLearningProgress(lessons, categories, data).map(topic => {
      const score = topic.averageBestScore;
      return `<div class="learning-mastery-item"><div><strong>${topic.title}</strong><span>${score === null ? 'Chưa kiểm tra' : `Điểm tốt nhất TB: ${score}%`}</span></div><progress max="100" value="${score ?? 0}" aria-label="${topic.title}: ${score === null ? 'chưa kiểm tra' : `${score}%`}"></progress><small>Đã kiểm tra ${topic.attemptedCount}/${topic.lessonCount} · Hoàn thành ${topic.completedCount}/${topic.lessonCount}</small></div>`;
    }).join('')}`;
  }

  function renderLesson() {
    const lesson = lessons.find(item => item.id === activeId) || lessons[0];
    const data = progress.get();
    const completed = data.lessons[lesson.id] || 0;
    let savedPrediction = data.sessions[`learning-${lesson.id}`]?.setup?.prediction;
    const experimentBaseline = data.sessions[`learning-${lesson.id}`]?.setup?.experimentBaseline;
    const simulationHref = lesson.simulation === 'lab' ? '#/lab' : `#/simulation/${lesson.simulation}`;
    main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">HỌC TỪ NHỮNG GÌ BẠN QUAN SÁT</p><h1>Học tập tương tác</h1><p>${lessons.length} bài khám phá · Dự đoán, thử nghiệm, giải thích và kiểm tra.</p></div></div>
      <section class="learning-filters" aria-label="Tìm và lọc bài học">
        <label for="learning-search">Tìm bài học<input id="learning-search" type="search" placeholder="Ví dụ: ném xiên, điện trường..." autocomplete="off"></label>
        <label for="learning-grade">Khối lớp<select id="learning-grade"><option value="all">Tất cả lớp</option><option value="10">Lớp 10</option><option value="11">Lớp 11</option><option value="12">Lớp 12</option></select></label>
        <label for="learning-topic">Chủ đề<select id="learning-topic"><option value="all">Tất cả chủ đề</option>${categories.filter(item => item.id !== 'all').map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select></label>
        <p id="learning-filter-count" role="status" aria-live="polite"></p>
      </section>
      <section class="learning-catalog" aria-label="Chọn bài khám phá">${lessons.map(item => `<button type="button" class="learning-choice ${item.id === lesson.id ? 'selected' : ''}" data-lesson="${item.id}" aria-pressed="${item.id === lesson.id}"><span>LỚP ${item.grade} · ${Math.min(4, data.lessons[item.id] || 0)}/4 bước</span><strong>${item.title}</strong></button>`).join('')}</section>
      <p id="learning-filter-empty" class="learning-filter-empty" hidden>Không tìm thấy bài học phù hợp. Hãy thử thay đổi bộ lọc.</p>
      <div class="learning-layout"><section class="panel lesson-content">
        <span class="tag">01 / DỰ ĐOÁN</span><h2>${lesson.prompt}</h2>
        <form id="prediction-form"><fieldset><legend>Chọn dự đoán của bạn trước khi mở mô phỏng hoặc thí nghiệm</legend>${lesson.predictionOptions.map(([value, text]) => `<label class="quiz-option"><input type="radio" name="prediction" value="${value}" ${savedPrediction === value ? 'checked' : ''} required> ${text}</label>`).join('')}</fieldset>
          <button class="button secondary" id="prediction" type="submit">Lưu dự đoán ${icon('check')}</button><p id="prediction-result" role="status">${savedPrediction ? 'Đã lưu dự đoán. Hãy kiểm tra bằng mô phỏng.' : ''}</p>
        </form>
        <hr><span class="tag">02 / THỬ NGHIỆM</span><h2>Thay đổi tham số và quan sát hiện tượng</h2><p>Trong mô phỏng, thay đổi một đại lượng mỗi lần để so sánh công bằng. Ghi nhận thời gian, đồ thị hoặc kết quả đo trước khi kết luận.</p>
        <a class="button primary" id="lesson-simulation-link" href="${simulationHref}">Mở mô phỏng hoặc thí nghiệm liên quan ${icon('arrow')}</a>
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

    main.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
      activeId = button.dataset.lesson;
      progress.session('learning-active', { setup: { lessonId: activeId } });
      renderLesson();
    }));
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
