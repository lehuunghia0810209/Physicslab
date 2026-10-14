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
import './styles/polish-2-0.css';
import './styles/remake-r4-ux.css';
import { shell } from './app/shell.js';
import { installQuickSearch } from './app/quick-search.js';
import { createRouter } from './app/router.js';
import { createProgress, browserStorage } from './core/progress.js';
import { SimulationRegistry } from './data/registry.js';
import { installOfflineUpdateNotice } from './app/offline-updates.js';
import { version as APP_VERSION } from '../package.json';

window.PHYSICSLAB_VERSION = APP_VERSION;

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .then(registration => {
        installOfflineUpdateNotice(registration);
        // Updates are only applied after an explicit user action.
        registration.update().catch(() => {});
      }).catch(() => {});
  }, { once: true });
}

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

function downloadJson(content, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportProgressBackup() {
  window.dispatchEvent(new Event('physicslab:before-backup'));
  const [{ getLearningStore }, { getExperimentStore }, { createUnifiedBackup }] = await Promise.all([
    import('./core/learning-session.js'), import('./core/experiment-session.js'), import('./core/unified-backup.js')
  ]);
  const content = createUnifiedBackup(progress, getLearningStore(), getExperimentStore());
  downloadJson(content, `physicslab-full-backup-${new Date().toISOString().slice(0, 10)}.json`);
  return true;
}
async function exportRawRescue() {
  const { createRawRescue } = await import('./core/unified-backup.js');
  const content = createRawRescue(browserStorage());
  downloadJson(content, `physicslab-raw-rescue-${new Date().toISOString().slice(0, 10)}.json`);
  return true;
}
async function importProgressFile(file) {
  if (!file) return false;
  if (file.size > 5_000_000) throw new Error('Tệp dữ liệu quá lớn (tối đa 5 MB).');
  const { parsePhysicsLabBackup, restorePhysicsLabBackup, createRawRescue } = await import('./core/unified-backup.js');
  const serialized = await file.text();
  const backup = parsePhysicsLabBackup(serialized); // Full validation BEFORE confirmation or mutation.
  const scope = backup.kind === 'legacy'
    ? 'chỉ tiến độ legacy (Learning 3.0 và Experiment Studio được giữ nguyên)'
    : 'tiến độ, Learning 3.0 và Experiment Studio';
  if (window.confirm(`Bạn muốn khôi phục ${scope}? Dữ liệu hiện tại sẽ được thay thế. PhysicsLab sẽ tải bản cứu hộ dữ liệu gốc trước khi ghi.`)) {
    const storage = browserStorage();
    if (!storage) throw new Error('Không có quyền truy cập dữ liệu trình duyệt để khôi phục.');
    // Preserve exact originals, including unreadable or unsupported schemas.
    downloadJson(createRawRescue(storage), `physicslab-before-restore-${new Date().toISOString().slice(0, 10)}.json`);
    restorePhysicsLabBackup(storage, serialized);
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
      : event.type === 'physicslab:measurement-recorded' || target instanceof Element && target.closest('button') && ['play', 'reset', 'capture'].includes(target.closest('button').id)
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
main.addEventListener('physicslab:measurement-recorded', recordSimulationInteraction);
window.PhysicsLabApp = Object.freeze({
  navigate: view => router.navigate(view),
  openSimulation: id => router.navigate(`simulation/${encodeURIComponent(id)}`),
  openLesson: () => router.navigate('learning'),
  openTool: () => router.navigate('tools'),
  openExperiment: () => router.navigate('lab'),
  exportProgressBackup,
  exportRawRescue,
  promptProgressImport,
  setRole: role => applyRole(role === 'teacher' ? 'teacher' : 'student'),
  togglePresentation,
  context: () => ({ route: router.current(), simulation: context.activeSimulation?.() || null, progress: progress.get(), version: APP_VERSION })
});
router.start();
if (!progress.isPersistent()) document.querySelector('.local-label').textContent = progress.issue() ? 'Cần kiểm tra dữ liệu' : 'Lưu trong phiên này';
window.addEventListener('storage', event => {
  if (event.key?.startsWith('physicslab.') && ['physicslab.progress.v1','physicslab.learning.v1','physicslab.experiments.v1'].includes(event.key)) {
    const label = document.querySelector('.local-label');
    if (label) label.textContent = 'Dữ liệu đã đổi ở tab khác';
  }
});
