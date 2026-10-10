import { categories } from '../data/curriculum.js';
import { icon, escapeHtml } from '../app/icons.js';
import { summarizeSimulations } from '../data/simulation-stats.js';

function simulationIllustration(simulation) {
  const label = escapeHtml(simulation.title);
  const art = {
    'projectile-motion': '<path d="M32 126H284" class="art-ground"/><path d="M46 120Q102 32 168 34T270 120" class="art-dash"/><path d="M46 120Q98 60 155 45" class="art-main"/><circle cx="155" cy="45" r="8" class="art-accent"/><path d="M155 45l42-18m-12 0 12-18 2 18" class="art-vector"/><path d="M155 45V84M155 45H203" class="art-guides"/>',
    'inclined-plane': '<path d="M42 122h242" class="art-ground"/><path d="M90 122 202 56 202 122Z" class="art-main-fill"/><rect x="150" y="76" width="34" height="28" rx="6" class="art-accent-fill" transform="rotate(-28 167 90)"/><path d="M160 66l30-16" class="art-vector"/><path d="M168 90v40" class="art-guides"/>',
    newton: '<path d="M34 124H286" class="art-ground"/><rect x="118" y="88" width="56" height="36" rx="10" class="art-accent-fill"/><path d="M68 106h44" class="art-vector"/><path d="M174 106h48" class="art-main"/><text x="74" y="97" class="art-label">F</text><text x="190" y="97" class="art-label faint">a</text>',
    friction: '<path d="M34 124H286" class="art-ground"/><rect x="102" y="88" width="60" height="36" rx="10" class="art-accent-fill"/><path d="M174 106h44" class="art-main"/><path d="M90 106H58" class="art-vector"/><text x="179" y="96" class="art-label">F</text><text x="63" y="96" class="art-label faint">f</text><path d="M34 132c8-10 16 10 24 0s16 10 24 0 16 10 24 0 16 10 24 0 16 10 24 0 16 10 24 0 16 10 24 0 16 10 24 0" class="art-ground-detail"/>',
    'work-energy': '<path d="M40 124H286" class="art-ground"/><path d="M54 116Q122 48 170 72T270 48" class="art-main"/><circle cx="110" cy="86" r="7" class="art-accent"/><path d="M110 86l54 12" class="art-dash"/><rect x="206" y="82" width="18" height="30" rx="4" class="art-accent-fill"/><rect x="230" y="68" width="18" height="44" rx="4" class="art-main-fill"/>',
    'momentum-collision': '<path d="M30 124H290" class="art-ground"/><rect x="70" y="90" width="44" height="34" rx="8" class="art-accent-fill"/><rect x="202" y="90" width="44" height="34" rx="8" class="art-main-fill"/><path d="M38 107H64" class="art-vector"/><path d="M276 107H250" class="art-main"/><path d="M120 107h72" class="art-dash"/>',
    'spring-oscillation': '<path d="M46 94H94" class="art-ground"/><path d="M94 94c8-20 12 20 20 0s12 20 20 0 12 20 20 0 12 20 20 0 12 20 20 0" class="art-main"/><rect x="202" y="76" width="40" height="36" rx="8" class="art-accent-fill"/><path d="M222 46V132" class="art-guides"/><circle cx="222" cy="94" r="42" class="art-orbit"/>',
    'wave-on-string': '<path d="M24 98c22-40 44-40 66 0s44 40 66 0 44-40 66 0 44 40 66 0" class="art-main"/><path d="M24 98c22-24 44-24 66 0s44 24 66 0 44-24 66 0 44 24 66 0" class="art-dash"/><circle cx="90" cy="98" r="7" class="art-accent"/><path d="M90 98v-34" class="art-guides"/>',
    'electric-circuits': '<path d="M44 54v72h58M238 54h38v72H132" class="art-main"/><path d="M102 54h22m0 14V40m0 14 18 14-18 14" class="art-vector"/><path d="M132 126h56" class="art-main"/><rect x="188" y="114" width="40" height="24" rx="6" class="art-accent-fill"/><rect x="112" y="42" width="14" height="26" rx="3" class="art-main-fill"/><rect x="132" y="34" width="10" height="42" rx="2" class="art-accent-fill"/>',
    'electric-field': '<circle cx="92" cy="92" r="16" class="art-accent-fill"/><circle cx="228" cy="92" r="16" class="art-main-fill"/><text x="92" y="98" text-anchor="middle" class="art-symbol">+</text><text x="228" y="98" text-anchor="middle" class="art-symbol">−</text><path d="M110 74C142 58 180 58 210 74M110 110c32 16 70 16 100 0" class="art-main"/><path d="M124 92h72" class="art-dash"/>',
    'magnetic-field': '<path d="M68 50h164v84H68z" class="art-main-fill soft"/><path d="M84 66h132M84 94h132M84 122h132" class="art-guides"/><path d="M116 42c28 20 50 54 76 84" class="art-main"/><circle cx="186" cy="108" r="8" class="art-accent"/><text x="250" y="86" class="art-label">B</text><path d="M246 66l18 18m0-18-18 18" class="art-vector"/>',
    lens: '<path d="M36 92H284" class="art-guides"/><path d="M148 42Q130 92 148 142M172 42Q190 92 172 142" class="art-main"/><path d="M42 72H144M42 108H144" class="art-accent-line"/><path d="M176 92h82" class="art-main"/><path d="M176 92 258 54" class="art-dash"/><path d="M176 92 258 130" class="art-dash"/>',
    'ideal-gas': '<rect x="76" y="44" width="150" height="92" rx="12" class="art-main-fill soft"/><path d="M84 68h134" class="art-main"/><path d="M226 44v92" class="art-guides"/><circle cx="110" cy="84" r="6" class="art-accent"/><circle cx="138" cy="112" r="6" class="art-accent"/><circle cx="182" cy="90" r="6" class="art-accent"/><path d="M236 52V128" class="art-vector"/><text x="246" y="94" class="art-label">p</text>'
  }[simulation.id] || '<path d="M40 124H280" class="art-ground"/><circle cx="160" cy="88" r="36" class="art-orbit"/><path d="M128 88h64" class="art-main"/>';

  return `<svg class="simulation-illustration" viewBox="0 0 320 180" role="img" aria-label="Minh họa cho ${label}">
    <defs>
      <linearGradient id="art-fill-${simulation.id}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="var(--art-fill-start)"/>
        <stop offset="100%" stop-color="var(--art-fill-end)"/>
      </linearGradient>
    </defs>
    ${art.replaceAll('class="art-main-fill"', `fill="url(#art-fill-${simulation.id})" class="art-main-fill"`).replaceAll('class="art-accent-fill"', `fill="var(--art-accent-fill)" class="art-accent-fill"`)}
  </svg>`;
}

export function mount(main, { registry }) {
  let category = 'all';
  try {
    category = sessionStorage.getItem('physicslab.library.category') || 'all';
    sessionStorage.removeItem('physicslab.library.category');
  } catch { /* Optional filter preference. */ }
  const readyCount = summarizeSimulations(registry.all()).available;
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">HỌC BẰNG THỬ NGHIỆM</p><h1>Thư viện mô phỏng</h1><p>Chạm vào hiện tượng. Nhìn thấy quy luật.</p></div><span class="version-pill">${readyCount} mô phỏng sẵn sàng</span></div><div class="library-toolbar"><label class="search-field">${icon('search')}<input type="search" id="search" placeholder="Tìm hiện tượng, khái niệm…" aria-label="Tìm mô phỏng"></label><label class="grade-filter">Lớp <select id="grade" aria-label="Lọc theo lớp"><option value="all">Tất cả</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></label><label class="available-filter"><input id="available" type="checkbox"> Chỉ mô phỏng sẵn sàng</label></div><div class="filter-tabs" aria-label="Lọc lĩnh vực">${categories.map(c => `<button data-filter="${c.id}" class="filter-tab">${icon(c.icon)}${escapeHtml(c.title)}</button>`).join('')}</div><p class="library-count" role="status" id="result-count"></p><div class="simulation-grid" id="library-results"></div><p class="scope-note">${readyCount} mô phỏng tương tác đã sẵn sàng, thuộc các lĩnh vực Cơ học, Sóng, Điện từ học, Quang học và Nhiệt học. Các mô phỏng hoạt động dựa trên mô hình Vật lý có kiểm chứng và nêu rõ giả định.</p>`;

  function render() {
    const normalize = text => text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    const query = normalize(main.querySelector('#search').value);
    const grade = main.querySelector('#grade').value;
    const onlyAvailable = main.querySelector('#available').checked;
    const items = registry.all().filter(simulation => (category === 'all' || simulation.category === category)
      && (grade === 'all' || String(simulation.grade) === grade)
      && (!onlyAvailable || simulation.status === 'available')
      && normalize([simulation.title, simulation.description, ...simulation.concepts].join(' ')).includes(query));

    main.querySelectorAll('[data-filter]').forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    main.querySelector('#result-count').textContent = `${items.length} kết quả · ${items.filter(simulation => simulation.status === 'available').length} sẵn sàng`;
    main.querySelector('#library-results').innerHTML = items.length
      ? items.map(simulation => `<article class="simulation-card ${simulation.status === 'available' ? 'ready' : ''}"><div class="simulation-art art-${simulation.category}">${simulationIllustration(simulation)}<span class="status-badge ${simulation.status}">${simulation.status === 'available' ? 'Sẵn sàng khám phá' : 'Dự kiến'}</span></div><div class="simulation-body"><p class="eyebrow">${escapeHtml(categories.find(c => c.id === simulation.category).title)} · LỚP ${simulation.grade}</p><h2>${simulation.title}</h2><p>${simulation.description}</p><div class="concepts">${simulation.concepts.map(concept => `<span>${concept}</span>`).join('')}</div>${simulation.status === 'available' ? `<a class="button primary full-width" href="#/simulation/${simulation.id}">Mở mô phỏng</a>` : '<p class="planned-label">Dự kiến phát triển trong các phiên bản tiếp theo</p>'}</div></article>`).join('')
      : '<div class="empty-state"><h2>Chưa có kết quả phù hợp</h2><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p><button class="button secondary" id="clear-filters">Xóa bộ lọc</button></div>';
    main.querySelector('#clear-filters')?.addEventListener('click', () => {
      category = 'all';
      main.querySelector('#search').value = '';
      main.querySelector('#grade').value = 'all';
      main.querySelector('#available').checked = false;
      render();
    });
  }

  main.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; render(); }));
  for (const id of ['search', 'grade', 'available']) main.querySelector(`#${id}`).addEventListener('input', render);
  render();
}
