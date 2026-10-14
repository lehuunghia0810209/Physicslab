import { escapeHtml } from './icons.js';
import { filterLearningCatalog } from '../core/learning-catalog.js';
import { THPT_GRADES, THPT_SOURCE } from '../data/thpt-program.js';

const html=escapeHtml;
// Remember the selected class/topic while switching between a reader and the catalog.
let lastFilters={grade:'10',topic:'all',query:''};
const gradeLabel = grade => grade === 'all' ? 'Tất cả lớp' : `Lớp ${grade}`;
/** One visible path: grade → topic → complete reader. Legacy adventures remain optional. */
export function mountLearningOverview(main, { catalog, legacy, learningStore, progress }) {
  const attempts=learningStore.get().attempts;
  const savedId=progress.get().sessions['learning-active']?.setup?.lessonId;
  const recent=catalog.find(item=>item.id===savedId);
  let filters={...lastFilters};
  const totals=THPT_GRADES.map(grade=>({grade,count:catalog.filter(item=>item.grade===grade).length}));
  main.innerHTML=`<div class="page-heading learning-home-heading"><div><p class="eyebrow">LEARNING 3.0 · PHYSICSLAB</p><h1>Học Vật lí THPT</h1><p>Chọn lớp, chọn chủ đề và bắt đầu bài học. Lí thuyết, ví dụ, thí nghiệm và luyện tập ở cùng một nơi.</p></div></div>
  <section class="learning-home-hero" aria-label="Lộ trình học tập"><div><span class="eyebrow">LỘ TRÌNH LỚP 10–12 · GDPT 2018</span><h2>Học để hiểu hiện tượng</h2><p>${catalog.length} bài học có nội dung · ${catalog.reduce((n,x)=>n+(x.hasExperiment?1:0),0)} bài liên kết mô phỏng hoặc thí nghiệm · Có ôn tập và chữa câu sai.</p><div class="learning-home-actions"><a class="button primary" href="#/learning/revision">Ôn tập & kiểm tra</a>${recent?`<a class="button secondary" href="#/learning/${html(recent.id)}">Tiếp tục: ${html(recent.title)}</a>`:''}</div></div><div class="learning-home-grade-summary" aria-label="Số bài theo lớp">${totals.map(x=>`<div><span>Lớp ${x.grade}</span><strong>${x.count}</strong><small>bài học</small></div>`).join('')}</div></section>
  <section class="learning-home-browser" aria-label="Danh mục bài học lớp 10 đến lớp 12"><div class="learning-home-section-heading"><div><span class="eyebrow">CHƯƠNG TRÌNH HỌC</span><h2>Chọn lớp và bài học</h2></div><p>Chọn bài theo mạch kiến thức; tìm kiếm hỗ trợ tiếng Việt không dấu.</p></div>
  <div class="learning-home-grade-tabs" role="group" aria-label="Lọc chương trình theo lớp">${[...THPT_GRADES,'all'].map(grade=>`<button type="button" data-learning-grade="${grade}" aria-pressed="${filters.grade===String(grade)}">${gradeLabel(grade)} <span>${grade==='all'?catalog.length:catalog.filter(x=>x.grade===grade).length}</span></button>`).join('')}</div>
  <div class="learning-home-filters"><label for="learning-search">Tìm bài học<input id="learning-search" type="search" autocomplete="off" placeholder="Ví dụ: dao động, lực từ, nhiệt lượng..."></label><label for="learning-topic">Chủ đề<select id="learning-topic"><option value="all">Tất cả chủ đề</option></select></label></div>
  <div class="learning-home-result-head"><p id="learning-filter-count" aria-live="polite" role="status"></p><button type="button" id="learning-reset">Đặt lại bộ lọc</button></div>
  <div class="learning-home-results" id="learning-results"></div><p class="learning-filter-empty" id="learning-filter-empty" hidden>Không có bài học phù hợp. Hãy thử từ khóa khác hoặc chọn Tất cả lớp.</p></section>
  <section class="learning-home-explore" aria-label="Khám phá nhanh"><details><summary><span><strong>16 hoạt động khám phá nhanh</strong><small>Dự đoán → mô phỏng → quan sát → kiểm tra, dành cho những lúc cần thực hành ngắn.</small></span><span aria-hidden="true">⌄</span></summary><div class="learning-home-explore-links">${legacy.map(x=>`<a href="#/learning/explore-${html(x.id)}" data-explore="${html(x.id)}">${html(x.title)} <small>· Lớp ${x.grade}</small></a>`).join('')}</div></details></section>
  <p class="thpt-course-note">Định hướng chương trình: <a target="_blank" rel="noopener noreferrer" href="${THPT_SOURCE.url}">${html(THPT_SOURCE.name)}</a>. Các bài đã có nội dung nhưng chưa được giáo viên phản biện độc lập; số bài không phải chứng nhận đã nghiệm thu học thuật.</p>`;
  const search=main.querySelector('#learning-search');
  const topic=main.querySelector('#learning-topic');
  const list=main.querySelector('#learning-results');
  const count=main.querySelector('#learning-filter-count');
  const empty=main.querySelector('#learning-filter-empty');
  const buttons=[...main.querySelectorAll('[data-learning-grade]')];
  function render() {
    buttons.forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.learningGrade===filters.grade));});
    const topics=[...new Set(catalog.filter(x=>filters.grade==='all'||String(x.grade)===filters.grade).map(x=>x.topic))];
    if (filters.topic!=='all'&&!topics.includes(filters.topic)) filters.topic='all';
    lastFilters={...filters};
    topic.innerHTML=`<option value="all">Tất cả chủ đề</option>${topics.map(x=>`<option value="${html(x)}">${html(x)}</option>`).join('')}`;
    topic.value=filters.topic;
    const visible=filterLearningCatalog(catalog,filters);
    count.textContent=`${visible.length}/${catalog.length} bài học · ${gradeLabel(filters.grade)}`;
    empty.hidden=visible.length>0;
    const groups=new Map();
    for(const item of visible){const key=`${item.grade}||${item.topic}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
    list.innerHTML=[...groups.values()].map(group=>`<section class="learning-home-topic" aria-label="${html(group[0].topic)} — Lớp ${group[0].grade}"><div class="learning-home-topic-heading"><h3>${html(group[0].topic)}</h3><span>Lớp ${group[0].grade} · ${group.length} bài</span></div><div class="learning-home-cards">${group.map(item=>{const attempt=attempts[item.id];return `<a class="learning-home-card" href="#/learning/${html(item.id)}" data-lesson="${html(item.id)}"><span class="learning-home-card-meta">LỚP ${item.grade}${item.elective?' · CHUYÊN ĐỀ TỰ CHỌN':''}${item.hasExperiment?' · CÓ THỰC NGHIỆM':''}</span><strong>${html(item.title)}</strong><span class="learning-home-card-description">${html(item.objective)}</span><span class="learning-home-card-footer">${attempt?`Đã luyện · ${attempt.score}%`:'Bắt đầu học'} <span aria-hidden="true">→</span></span></a>`;}).join('')}</div></section>`).join('');
    list.querySelectorAll('[data-lesson]').forEach(link=>link.addEventListener('click',()=>progress.session('learning-active',{setup:{lessonId:link.dataset.lesson}})));
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{filters.grade=button.dataset.learningGrade;filters.topic='all';render();}));
  search.value=filters.query;
  search.addEventListener('input',()=>{filters.query=search.value;render();});
  topic.addEventListener('change',()=>{filters.topic=topic.value;render();});
  main.querySelector('#learning-reset').addEventListener('click',()=>{filters={grade:'all',topic:'all',query:''};search.value='';render();search.focus();});
  render();
}
