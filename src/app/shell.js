import { icon } from './icons.js';
import { summarizeSimulations } from '../data/simulation-stats.js';
import { SimulationRegistry } from '../data/registry.js';
export const navigation = [
  ['home', 'Tổng quan', 'home'], ['simulations', 'Mô phỏng', 'grid'], ['learning', 'Học tập', 'book'], ['lab', 'Thí nghiệm', 'lab'], ['tools', 'Công cụ', 'tools'], ['explorer3d', 'Khám phá 3D', 'orbit']
];
export function shell(root) {
  const ready = summarizeSimulations(SimulationRegistry.all()).available;
  root.innerHTML = `<aside class="sidebar"><a href="#/home" class="brand" aria-label="PhysicsLab, về Tổng quan"><span class="brand-mark">${icon('trajectory')}</span><span>Physics<span class="brand-light">Lab</span><small>KHÁM PHÁ QUY LUẬT TỰ NHIÊN</small></span></a>
    <p class="nav-caption">KHÔNG GIAN CỦA BẠN</p><nav aria-label="Điều hướng chính">${navigation.map(([id, title, glyph]) => `<a class="nav-link" data-nav="${id}" href="#/${id}">${icon(glyph)}<span>${title}</span>${id === 'simulations' ? `<span class="nav-count">${ready}</span>` : ''}</a>`).join('')}</nav>
    <div class="sidebar-note">${icon('orbit')}<strong>Tò mò là điểm bắt đầu.</strong><p>Mỗi quy luật đều có một thế giới để khám phá.</p><span>PHYSICSLAB · PHÒNG THÍ NGHIỆM SỐ</span></div></aside>
    <div class="workspace"><header class="topbar"><span id="breadcrumb">Không gian học tập</span><div class="topbar-right"><button class="quick-search-toggle" id="quick-search-toggle" type="button" aria-label="Tìm nhanh trang và mô phỏng, phím Ctrl K">${icon('search')}<span>Tìm nhanh</span><kbd>Ctrl K</kbd></button><button class="theme-toggle" id="theme-toggle" type="button" aria-label="Chuyển đổi giao diện">☀️ Sáng</button><span class="local-label"><i></i> Lưu trên thiết bị</span><button id="role-toggle" type="button" class="role-toggle" aria-label="Chuyển chế độ học sinh hoặc giáo viên">HS</button><button id="presentation-toggle" type="button" class="presentation-toggle" hidden aria-pressed="false">▣ Trình chiếu</button><input type="file" id="progress-import-file" accept="application/json,.json" hidden><span class="avatar" aria-label="Học sinh">HS</span></div></header><main id="main" tabindex="-1"></main><footer class="page-footer"><span>PhysicsLab · Nhìn thấy Vật lý. Hiểu thế giới.</span><span>v${window.PHYSICSLAB_VERSION || "1.2.0-beta.1"} · Không gian Vật lý tương tác</span></footer></div>`;
  return root.querySelector('#main');
}
export function updateNavigation(route, label = null) {
  const selected = route === 'simulation' ? 'simulations' : route;
  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === selected; el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  document.querySelector('#breadcrumb').textContent = route === 'simulation' ? (label || 'Mô phỏng / Cơ học') : navigation.find(n => n[0] === selected)?.[1] || 'PhysicsLab';
}
