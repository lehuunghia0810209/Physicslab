import { updateNavigation } from './shell.js';
import { escapeHtml } from './icons.js';
import { addExperimentGuide } from './experiment-guide.js';
const pages = {
  home: () => import('../pages/home.js'), simulations: () => import('../pages/library.js'),
  learning: () => import('../pages/learning.js'), lab: () => import('../pages/lab.js'), tools: () => import('../pages/tools.js'),
  explorer3d: () => import('../pages/explorer3d.js')
};
export function createRouter(main, context) {
  let dispose = () => {}; let sequence = 0; let current = null;
  async function render() {
    const token = ++sequence;
    dispose(); dispose = () => {};
    const [route, id] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
    current = { route, id };
    const badge = route === 'simulation' ? context.registry.get(id)?.title || 'Mô phỏng' : null;
    updateNavigation(route, badge);
    main.innerHTML = '<div class="loading" role="status">Đang chuẩn bị không gian khám phá…</div>';
    try {
      let module;
      if (route === 'simulation') module = await context.registry.load(id);
      else if (pages[route]) module = await pages[route]();
      else throw new Error('Trang bạn tìm chưa có trong PhysicsLab.');
      if (token !== sequence) return;
      const result = module.mount(main, context);
      dispose = typeof result === 'function' ? result : () => {};
      if (route === 'simulation') addExperimentGuide(main, id);
      document.title = `${route === 'simulation' ? badge || 'Mô phỏng' : document.querySelector('[data-nav].active span')?.textContent || 'PhysicsLab'} · PhysicsLab`;
      window.scrollTo(0, 0); main.focus({ preventScroll: true });
    } catch (error) {
      if (token === sequence) main.innerHTML = `<div class="empty-state"><h1>Chưa thể mở trang này</h1><p>${escapeHtml(error.message)}</p><a class="button primary" href="#/home">Về Tổng quan</a></div>`;
    }
  }
  window.addEventListener('hashchange', render);
  return { start: render, navigate(route) { const hash = `#/${route.replace(/^#?\/?/, '')}`; if (location.hash === hash) render(); else location.hash = hash; }, current: () => ({ ...current }) };
}
