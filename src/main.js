import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/dashboard.css';
import './styles/library.css';
import './styles/content.css';
import './styles/polish.css';
import './styles/graph-experience.css';
import './styles/simulation-experience.css';
import './styles/phet-experience.css';
import { shell } from './app/shell.js';
import { installQuickSearch } from './app/quick-search.js';
import { createRouter } from './app/router.js';
import { createProgress, browserStorage } from './core/progress.js';
import { SimulationRegistry } from './data/registry.js';
import { version as APP_VERSION } from '../package.json';

window.PHYSICSLAB_VERSION = APP_VERSION;

const progress = createProgress(browserStorage());
const context = { progress, registry: SimulationRegistry, activeSimulation: null };
const main = shell(document.querySelector('#app'));

function preferredTheme() {
  try { return localStorage.getItem('physicslab.theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
}
function applyTheme(mode = preferredTheme()) {
  document.body.dataset.theme = mode;
  const toggle = document.querySelector('#theme-toggle');
  if (toggle) toggle.textContent = mode === 'dark' ? '🌙 Tối' : '☀️ Sáng';
  try { localStorage.setItem('physicslab.theme', mode); } catch { /* storage unavailable */ }
}
applyTheme();
document.querySelector('#theme-toggle')?.addEventListener('click', () => {
  applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

function savedRole() {
  try { return localStorage.getItem('physicslab.role') === 'teacher' ? 'teacher' : 'student'; }
  catch { return 'student'; }
}
function applyRole(role) {
  document.body.dataset.role = role;
  const teacher = role === 'teacher';
  const toggle = document.querySelector('#role-toggle');
  toggle.textContent = teacher ? 'GV' : 'HS';
  toggle.title = teacher ? 'Chế độ giáo viên · chuyển sang học sinh' : 'Chế độ học sinh · chuyển sang giáo viên';
  toggle.setAttribute('aria-pressed', String(teacher));
  toggle.setAttribute('aria-label', teacher ? 'Đang ở chế độ giáo viên. Chuyển sang học sinh' : 'Đang ở chế độ học sinh. Chuyển sang giáo viên');
  document.querySelector('.avatar').textContent = teacher ? 'GV' : 'HS';
  document.querySelector('.avatar').setAttribute('aria-label', teacher ? 'Giáo viên' : 'Học sinh');
  document.querySelector('#presentation-toggle').hidden = !teacher;
  if (!teacher) togglePresentation(false);
  try { localStorage.setItem('physicslab.role', role); } catch { /* preference is optional */ }
  window.dispatchEvent(new CustomEvent('physicslab:rolechange', { detail: { role } }));
}
function togglePresentation(enabled = !document.body.classList.contains('presentation-mode')) {
  const active = enabled && document.body.dataset.role === 'teacher';
  document.body.classList.toggle('presentation-mode', active);
  const button = document.querySelector('#presentation-toggle');
  button.setAttribute('aria-pressed', String(active));
  button.textContent = active ? '× Thoát trình chiếu' : '▣ Trình chiếu';
  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new CustomEvent('physicslab:presentationchange', { detail: { active } }));
  return active;
}

function exportProgressBackup() {
  const content = JSON.stringify(progress.get(), null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `physicslab-tien-do-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importProgressFile(file) {
  if (!file) return false;
  if (file.size > 2_000_000) throw new Error('Tệp dữ liệu quá lớn (tối đa 2 MB).');
  const snapshot = JSON.parse(await file.text());
  if (!snapshot || snapshot.version !== 1 || !snapshot.visited || !snapshot.lessons) {
    throw new Error('Tệp không phải bản sao tiến độ PhysicsLab hợp lệ.');
  }
  if (window.confirm('Nhập dữ liệu sẽ thay thế tiến độ trên trình duyệt này. Bạn đã sao lưu dữ liệu hiện tại chưa?')) {
    progress.restore(snapshot);
    window.location.reload();
    return true;
  }
  return false;
}
function promptProgressImport() {
  document.querySelector('#progress-import-file')?.click();
}

applyRole(savedRole());
document.querySelector('#role-toggle').addEventListener('click', () => {
  applyRole(document.body.dataset.role === 'teacher' ? 'student' : 'teacher');
});
document.querySelector('#presentation-toggle').addEventListener('click', () => togglePresentation());
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('presentation-mode')) togglePresentation(false);
});
const importFile = document.querySelector('#progress-import-file');
importFile.addEventListener('change', async () => {
  const file = importFile.files?.[0];
  if (!file) return;
  try {
    await importProgressFile(file);
  } catch (error) {
    window.alert(`Không thể nhập dữ liệu: ${error.message}`);
  } finally { importFile.value = ''; }
});

const router = createRouter(main, context);
installQuickSearch({ registry: SimulationRegistry, navigate: route => router.navigate(route) });
context.interactions = { ...(progress.get().sessions['simulation-interactions']?.parameters || {}) };
context.interactionCount = id => context.interactions[id] || 0;
function recordSimulationInteraction(event) {
  const current = router.current();
  const target = event.target;
  const controlAction = current.route === 'simulation'
    ? event.type === 'input' || event.type === 'change'
      ? target instanceof Element && target.matches('input, select, textarea')
      : target instanceof Element && target.closest('button') && ['play', 'reset', 'capture'].includes(target.closest('button').id)
    : current.route === 'lab' && event.type === 'click'
      && target instanceof Element && ['record-measurement', 'generic-capture'].includes(target.closest('button')?.id);
  if (!controlAction) return;
  const id = current.route === 'lab' ? 'lab' : current.id;
  context.interactions[id] = (context.interactions[id] || 0) + 1;
  progress.session('simulation-interactions', { parameters: { ...context.interactions } });
}
main.addEventListener('input', recordSimulationInteraction);
main.addEventListener('change', recordSimulationInteraction);
main.addEventListener('click', recordSimulationInteraction);
window.PhysicsLabApp = Object.freeze({
  navigate: view => router.navigate(view),
  openSimulation: id => router.navigate(`simulation/${encodeURIComponent(id)}`),
  openLesson: () => router.navigate('learning'),
  openTool: () => router.navigate('tools'),
  openExperiment: () => router.navigate('lab'),
  exportProgressBackup,
  promptProgressImport,
  setRole: role => applyRole(role === 'teacher' ? 'teacher' : 'student'),
  togglePresentation,
  context: () => ({ route: router.current(), simulation: context.activeSimulation?.() || null, progress: progress.get(), version: APP_VERSION })
});
router.start();
if (!progress.isPersistent()) document.querySelector('.local-label').textContent = 'Lưu trong phiên này';
