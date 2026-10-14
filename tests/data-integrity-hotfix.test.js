import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from '../src/core/progress.js';
import { createLearningStore } from '../src/core/learning-store.js';
import { createExperimentStore } from '../src/core/experiment-store.js';
import {
  createUnifiedBackup, createRawRescue, parsePhysicsLabBackup,
  restorePhysicsLabBackup, PROGRESS_KEY, BACKUP_MAX_BYTES
} from '../src/core/unified-backup.js';

const memory = () => {
  const values = new Map();
  return {
    values,
    getItem: key => values.get(key) ?? null,
    setItem: (key,value) => values.set(key,value),
    removeItem: key => values.delete(key)
  };
};
const run = () => ({ id: 'run-1', simulationId: 'newton', name: 'Kiểm tra F=ma', createdAt: 123,
  modelVersion: '2.4.1', assumptions: 'Lực không đổi.', parameters: { mass: 2, force: 10 },
  columns: [{ key:'t', label:'Thời gian', unit:'s', csv:'t_s' }],
  rows: [{t: 0},{t:1}], selected: [1], notebook: { conclusion:'a = F/m' } });

test('AUD-002: malformed or unsupported progress is preserved byte-for-byte, even after student actions', () => {
  for (const original of ['{broken', JSON.stringify({ version: 2, lessons: {'old-lesson':4} })]) {
    const storage = memory(); storage.setItem(PROGRESS_KEY, original);
    const progress = createProgress(storage);
    assert.equal(storage.getItem(PROGRESS_KEY),original, 'startup must not overwrite');
    assert.equal(progress.isPersistent(),false);
    assert.ok(progress.issue());
    assert.equal(progress.rescue(),original);
    // Broken storage should not prevent exploring: changes are kept in memory, raw stays untouched.
    progress.lesson('new-lesson',2);
    assert.equal(progress.get().lessons['new-lesson'],2);
    assert.equal(storage.getItem(PROGRESS_KEY), original);
    assert.throws(() => progress.restore({ version:1, visited:{}, lessons:{} }), /cứu hộ/);
    progress.restore({ version:1, visited:{}, lessons:{'restored-lesson':3} }, { allowDamaged:true });
    assert.equal(createProgress(storage).get().lessons['restored-lesson'], 3);
  }
});

test('AUD-003: progress concurrency preserves previous tab and exposes draft on conflict', () => {
  const storage=memory(), a=createProgress(storage), b=createProgress(storage);
  a.lesson('lesson-a',1);
  b.lesson('lesson-b',2);
  assert.equal(createProgress(storage).get().lessons['lesson-a'],1);
  assert.equal(createProgress(storage).get().lessons['lesson-b'],undefined);
  assert.equal(b.get().lessons['lesson-b'],2, 'unsaved local draft can be rescued');
  assert.ok(b.issue().includes('tab khác'));
});

test('AUD-003: Learning multi-tab conflict does not overwrite the first tab', () => {
  const storage=memory(),a=createLearningStore(storage),b=createLearningStore(storage);
  a.note('lesson-a','first tab');
  assert.throws(()=>b.note('lesson-b','second tab'),/tab khác/);
  assert.equal(createLearningStore(storage).get().notes['lesson-a'],'first tab');
  assert.equal(createLearningStore(storage).get().notes['lesson-b'],undefined);
  assert.equal(b.get().notes['lesson-b'],'second tab');
});

test('AUD-004: one unified backup restores all three stores and is valid for import', () => {
  const storage=memory(),progress=createProgress(storage),learning=createLearningStore(storage),experiments=createExperimentStore(storage);
  progress.lesson('lesson-a',3);
  learning.note('lesson-a','Nhớ công thức.');
  learning.record('lesson-a',80,['q-2']);
  experiments.save(run());
  const backup=createUnifiedBackup(progress,learning,experiments);
  assert.equal(parsePhysicsLabBackup(backup).kind,'unified');
  const target=memory();
  const restored=restorePhysicsLabBackup(target,backup);
  assert.equal(restored.importedStores.length,3);
  assert.equal(createProgress(target).get().lessons['lesson-a'],3);
  assert.equal(createLearningStore(target).get().notes['lesson-a'],'Nhớ công thức.');
  assert.deepEqual(createLearningStore(target).get().attempts['lesson-a'].wrong,['q-2']);
  assert.equal(createExperimentStore(target).get().runs[0].rows.length,2);
});

test('AUD-004: importing old progress-only backup keeps new Learning and Experiment data', () => {
  const target=memory();
  const learning=createLearningStore(target),experiment=createExperimentStore(target);
  learning.note('lesson-a','not erased');experiment.save(run());
  const progress=createProgress(target);progress.lesson('lesson-before',2);
  const older=JSON.stringify(progress.get());
  progress.clear();
  const beforeLearning=target.getItem('physicslab.learning.v1');
  const beforeExperiments=target.getItem('physicslab.experiments.v1');
  assert.equal(parsePhysicsLabBackup(older).kind,'legacy');
  restorePhysicsLabBackup(target,older);
  assert.equal(createProgress(target).get().lessons['lesson-before'],2);
  assert.equal(target.getItem('physicslab.learning.v1'),beforeLearning);
  assert.equal(target.getItem('physicslab.experiments.v1'),beforeExperiments);
});

test('AUD-004: bad unified import validates all three stores before touching browser data', () => {
  const storage=memory(),p=createProgress(storage),l=createLearningStore(storage),e=createExperimentStore(storage);
  p.lesson('lesson-1',2);l.note('lesson-1','keep');e.save(run());
  const existing=[...storage.values.entries()];
  const invalid=JSON.parse(createUnifiedBackup(p,l,e));
  invalid.stores.experiments.runs[0].rows[0].t = 'malformed';
  assert.throws(()=>restorePhysicsLabBackup(storage,JSON.stringify(invalid)),/hợp lệ|hữu hạn|100 mẫu/);
  assert.deepEqual([...storage.values.entries()],existing);
  assert.throws(()=>parsePhysicsLabBackup('x'.repeat(BACKUP_MAX_BYTES+1)),/5 MB/);
});

test('AUD-004: failed multi-key restore rolls back keys that were written', () => {
  const source=memory();
  const backup=createUnifiedBackup(createProgress(source),createLearningStore(source),createExperimentStore(source));
  const target=memory();
  const first=createProgress(target);first.lesson('lesson-original',1);
  const before=[...target.values.entries()];
  const realSet=target.setItem;
  target.setItem=(key,v)=>{
    if(key==='physicslab.experiments.v1')throw new Error('quota reached');
    realSet(key,v);
  };
  assert.throws(()=>restorePhysicsLabBackup(target,backup),/hoàn nguyên/);
  assert.deepEqual([...target.values.entries()],before);
  assert.equal(createProgress(target).get().lessons['lesson-original'],1);
});

test('raw rescue includes unchanged original bytes for all stores, including invalid JSON', () => {
  const storage=memory();
  storage.setItem(PROGRESS_KEY,'{invalid');
  storage.setItem('physicslab.learning.v1','{"version":2}');
  const rescue=JSON.parse(createRawRescue(storage));
  assert.equal(rescue.stores[PROGRESS_KEY],'{invalid');
  assert.equal(rescue.stores['physicslab.learning.v1'],'{"version":2}');
  assert.equal(rescue.stores['physicslab.experiments.v1'],null);
});

test('quota failure keeps local student progress and Learning notes available for export',()=>{
  const storage=memory(),p=createProgress(storage),l=createLearningStore(storage),e=createExperimentStore(storage);
  storage.setItem=()=>{throw new Error('QuotaExceededError');};
  p.lesson('local-only',2);l.note('local-only','unsaved-note');
  assert.equal(p.isPersistent(),false);assert.equal(l.isPersistent(),false);
  const backup=JSON.parse(createUnifiedBackup(p,l,e));
  assert.equal(backup.stores.progress.lessons['local-only'],2);
  assert.equal(backup.stores.learning.notes['local-only'],'unsaved-note');
});

test('AUD-005: note input is debounced, backup flushes, and leaving lesson preserves latest text',async()=>{
  const { installLessonNoteAutosave } = await import('../src/core/note-autosave.js');
  const note=new EventTarget(),host=new EventTarget(),status={textContent:''};note.value='';
  const storage=memory(),store=createLearningStore(storage);
  const installed=installLessonNoteAutosave({note,status,store,lessonId:'lesson-a',host,delay:12});
  note.value='Lý';note.dispatchEvent(new Event('input'));
  note.value='Lý thuyết';note.dispatchEvent(new Event('input'));
  assert.equal(store.get().notes['lesson-a'],undefined);
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(store.get().notes['lesson-a'],'Lý thuyết');
  note.value='Cập nhật trước khi sao lưu';note.dispatchEvent(new Event('input'));
  host.dispatchEvent(new Event('physicslab:before-backup'));
  assert.equal(store.get().notes['lesson-a'],'Cập nhật trước khi sao lưu');
  note.value='Dòng cuối';note.dispatchEvent(new Event('input'));
  host.dispatchEvent(new Event('hashchange'));
  assert.equal(createLearningStore(storage).get().notes['lesson-a'],'Dòng cuối');
  installed.dispose();
});
