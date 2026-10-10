import { escapeHtml, icon } from './icons.js';

const destinations = [
  { id: 'home', label: 'Tổng quan', detail: 'Bảng điều khiển học tập', icon: 'home' },
  { id: 'simulations', label: 'Thư viện mô phỏng', detail: 'Khám phá những hiện tượng Vật lý', icon: 'grid' },
  { id: 'learning', label: 'Học tập tương tác', detail: 'Bài học, câu hỏi và tiến độ', icon: 'book' },
  { id: 'lab', label: 'Phòng thí nghiệm', detail: 'Dụng cụ, phép đo và báo cáo', icon: 'lab' },
  { id: 'tools', label: 'Công cụ Vật lý', detail: 'Máy tính, đơn vị và dữ liệu đo', icon: 'tools' },
  { id: 'explorer3d', label: 'Khám phá 3D', detail: 'Quan sát chuyển động trong không gian', icon: 'orbit' }
];

export function normalizeSearch(text) {
  return String(text || '').toLocaleLowerCase('vi').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function searchDestinations(query, simulations) {
  const items = [
    ...destinations.map(item => ({ ...item, route: item.id, category: 'TRANG' })),
    ...simulations.filter(item => item.status === 'available').map(item => ({
      label: item.title, detail: item.description, icon: item.icon,
      route: `simulation/${item.id}`, category: `MÔ PHỎNG · LỚP ${item.grade}`
    }))
  ];
  const q = normalizeSearch(query.trim());
  return (q ? items.filter(item => normalizeSearch(`${item.label} ${item.detail} ${item.category}`).includes(q)) : items).slice(0, 9);
}

export function installQuickSearch({ registry, navigate }) {
  const trigger = document.querySelector('#quick-search-toggle');
  if (!trigger) return;
  const overlay = document.createElement('div');
  overlay.className = 'quick-search-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `<section class="quick-search-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-search-title">
    <div class="quick-search-heading"><div><p class="eyebrow">ĐIỀU HƯỚNG NHANH</p><h2 id="quick-search-title">Bạn muốn khám phá gì?</h2></div><button class="quick-search-close" type="button" aria-label="Đóng tìm kiếm">✕</button></div>
    <label class="quick-search-field">${icon('search')}<span class="sr-only">Tìm trang hoặc mô phỏng</span><input type="search" id="quick-search-input" autocomplete="off" placeholder="Thử: ném xiên, điện, thí nghiệm…"></label>
    <div class="quick-search-results" id="quick-search-results" aria-live="polite"></div>
    <p class="quick-search-hint">↑ ↓ Di chuyển · Enter Mở · Esc Đóng · Ctrl K Tìm nhanh</p>
  </section>`;
  document.body.append(overlay);
  const input = overlay.querySelector('#quick-search-input');
  const results = overlay.querySelector('#quick-search-results');
  let previousFocus = null;

  function render() {
    const items = searchDestinations(input.value, registry.all());
    results.innerHTML = items.length ? items.map(item => `<a class="quick-search-result" href="#/${encodeURI(item.route)}">
      <span class="quick-search-result-icon">${icon(item.icon)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.detail)}</small></span>${icon('arrow')}</a>`).join('')
      : '<p class="quick-search-empty">Không có kết quả phù hợp. Hãy thử từ khóa khác.</p>';
  }
  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('search-open');
    previousFocus?.focus?.({ preventScroll: true });
  }
  function open() {
    if (!overlay.hidden) return;
    previousFocus = document.activeElement;
    input.value = '';
    render();
    overlay.hidden = false;
    document.body.classList.add('search-open');
    input.focus();
  }
  trigger.addEventListener('click', open);
  overlay.querySelector('.quick-search-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  results.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    event.preventDefault();
    const route = decodeURI(link.getAttribute('href').slice(2));
    close();
    navigate(route);
  });
  input.addEventListener('input', render);
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    const anchors = [...results.querySelectorAll('a')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = anchors.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') (anchors[index + 1] || anchors[0])?.focus();
      else if (index <= 0) input.focus(); else anchors[index - 1]?.focus();
    }
    if (event.key === 'Enter' && document.activeElement === input) {
      event.preventDefault(); anchors[0]?.click();
    }
    if (event.key === 'Tab') {
      const focusable = [input, ...anchors, overlay.querySelector('.quick-search-close')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); overlay.hidden ? open() : close();
    }
  });
  window.addEventListener('hashchange', close);
}
