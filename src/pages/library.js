import { categories } from '../data/curriculum.js';
import { icon, escapeHtml } from '../app/icons.js';
import { summarizeSimulations } from '../data/simulation-stats.js';
export function mount(main, { registry }) {
  let category = 'all';
  try { category = sessionStorage.getItem('physicslab.library.category') || 'all'; sessionStorage.removeItem('physicslab.library.category'); } catch { /* Optional filter preference. */ }
  const readyCount = summarizeSimulations(registry.all()).available;
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">HỌC BẰNG THỬ NGHIỆM</p><h1>Thư viện mô phỏng</h1><p>Chạm vào hiện tượng. Nhìn thấy quy luật.</p></div><span class="version-pill">${readyCount} mô phỏng sẵn sàng</span></div><div class="library-toolbar"><label class="search-field">${icon('search')}<input type="search" id="search" placeholder="Tìm hiện tượng, khái niệm…" aria-label="Tìm mô phỏng"></label><label class="grade-filter">Lớp <select id="grade" aria-label="Lọc theo lớp"><option value="all">Tất cả</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></label><label class="available-filter"><input id="available" type="checkbox"> Chỉ mô phỏng sẵn sàng</label></div><div class="filter-tabs" aria-label="Lọc lĩnh vực">${categories.map(c => `<button data-filter="${c.id}" class="filter-tab">${icon(c.icon)}${c.title}</button>`).join('')}</div><p class="library-count" role="status" id="result-count"></p><div class="simulation-grid" id="library-results"></div><p class="scope-note">${readyCount} mô phỏng tương tác đã sẵn sàng, thuộc các lĩnh vực Cơ học, Sóng, Điện từ học, Quang học và Nhiệt học. Các mô phỏng hoạt động dựa trên mô hình Vật lý có kiểm chứng và nêu rõ giả định.</p>`;
  function render() {
    const normalize = t => t.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    const query = normalize(main.querySelector('#search').value);
    const grade = main.querySelector('#grade').value;
    const onlyAvailable = main.querySelector('#available').checked;
    const items = registry.all().filter(s => (category === 'all' || s.category === category) && (grade === 'all' || String(s.grade) === grade) && (!onlyAvailable || s.status === 'available') && normalize([s.title, s.description, ...s.concepts].join(' ')).includes(query));
    main.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('selected', b.dataset.filter === category); b.setAttribute('aria-pressed', String(b.dataset.filter === category)); });
    main.querySelector('#result-count').textContent = `${items.length} kết quả · ${items.filter(s => s.status === 'available').length} sẵn sàng`;
    main.querySelector('#library-results').innerHTML = items.length ? items.map(s => `<article class="simulation-card ${s.status === 'available' ? 'ready' : ''}"><div class="simulation-art art-${s.category}">${icon(s.icon)}<span class="status-badge ${s.status}">${s.status === 'available' ? 'Sẵn sàng khám phá' : 'Dự kiến'}</span></div><div class="simulation-body"><p class="eyebrow">${escapeHtml(categories.find(c => c.id === s.category).title)} · LỚP ${s.grade}</p><h2>${s.title}</h2><p>${s.description}</p><div class="concepts">${s.concepts.map(c => `<span>${c}</span>`).join('')}</div>${s.status === 'available' ? `<a class="button primary full-width" href="#/simulation/${s.id}">Mở mô phỏng ${icon('arrow')}</a>` : '<p class="planned-label">Dự kiến phát triển trong các phiên bản tiếp theo</p>'}</div></article>`).join('') : '<div class="empty-state"><h2>Chưa có kết quả phù hợp</h2><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p><button class="button secondary" id="clear-filters">Xóa bộ lọc</button></div>';
    main.querySelector('#clear-filters')?.addEventListener('click', () => { category = 'all'; main.querySelector('#search').value = ''; main.querySelector('#grade').value = 'all'; main.querySelector('#available').checked = false; render(); });
  }
  main.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { category = b.dataset.filter; render(); }));
  for (const id of ['search', 'grade', 'available']) main.querySelector(`#${id}`).addEventListener('input', render);
  render();
}
