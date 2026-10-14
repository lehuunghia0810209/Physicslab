import test from 'node:test';
import assert from 'node:assert/strict';
import { createExperimentStore, validateExperiment, validateExperimentBackup, sameExperimentSetup, EXPERIMENT_KEY } from '../src/core/experiment-store.js';
const memory = () => { const values = new Map(); return { getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value) }; };
const fixture = (id='run-1') => ({ id, simulationId:'newton', name:'Lực 20 N', createdAt:123, modelVersion:'2.2.0-dev', assumptions:'Lực không đổi.',
  parameters:{force:20,mass:5}, columns:[{key:'t',label:'Thời gian',unit:'s',csv:'t_s'},{key:'velocity',label:'Vận tốc',unit:'m/s',csv:'v_m_s'}],
  rows:[{t:0,velocity:0},{t:1,velocity:4}],selected:[1],notebook:{hypothesis:'Gia tốc tăng',conclusion:'Phù hợp'} });

test('experiment drafts, complete run metadata and selected notebook evidence survive reload without changing legacy storage',()=>{
  const storage=memory(); storage.setItem('physicslab.progress.v1','legacy-untouched');
  const store=createExperimentStore(storage), run=fixture(); store.draft(run); store.save(run);
  run.rows[0].velocity=999;
  const loaded=createExperimentStore(storage).get();
  assert.deepEqual(loaded.runs[0],fixture()); assert.deepEqual(loaded.drafts.newton,fixture());
  assert.equal(storage.getItem('physicslab.progress.v1'),'legacy-untouched');
  loaded.runs[0].rows[0].velocity=12; assert.equal(store.get().runs[0].rows[0].velocity,0);
});
test('run rename and deletion preserve other runs and the draft',()=>{
  const store=createExperimentStore(memory());store.save(fixture());store.save(fixture('run-2'));
  store.rename('run-1','Đối chứng');assert.equal(store.get().runs[0].name,'Đối chứng');
  store.remove('run-1');assert.equal(store.get().runs.length,1);assert.equal(store.get().drafts.newton.id,'run-2');
});
test('backup round-trip is idempotent, merges independent runs, and rejects conflicting replacements atomically',()=>{
  const a=createExperimentStore(memory()),b=createExperimentStore(memory());a.save(fixture());b.import(a.export());b.import(a.export());
  assert.equal(b.get().runs.length,1); b.save(fixture('run-2'));a.import(b.export());assert.equal(a.get().runs.length,2);
  const before=a.export(),conflict=JSON.parse(before);conflict.runs[0].rows[0].velocity=100;
  assert.throws(()=>a.import(JSON.stringify(conflict)),/Trùng mã/);assert.equal(a.export(),before);
  assert.throws(()=>a.import('{broken'));assert.equal(a.export(),before);
});
test('nonfinite or missing measurements, invalid selection and unknown versions never enter storage',()=>{
  for(const mutate of [r=>{delete r.id;},r=>{r.rows[0].velocity=NaN;},r=>{r.rows[0].velocity=Infinity;},r=>{delete r.rows[0].t;},r=>{r.selected=[5];},r=>{r.columns[1].key='t';},r=>{r.notebook.conclusion='x'.repeat(4001);}]){
    const run=fixture();mutate(run);assert.throws(()=>validateExperiment(run));
  }
  assert.throws(()=>validateExperimentBackup({version:2,drafts:{},runs:[]}));
  assert.equal(sameExperimentSetup({mass:5,force:20},{force:20,mass:5}),true);
  assert.equal(sameExperimentSetup({mass:5,force:20},{force:21,mass:5}),false);
});
test('row, run and byte limits reject the whole write without dropping old runs',()=>{
  const store=createExperimentStore(memory());for(let i=0;i<30;i++)store.save(fixture(`run-${i}`));
  const before=store.export();assert.throws(()=>store.save(fixture('run-extra')));assert.equal(store.export(),before);
  const run=fixture();run.rows=Array.from({length:101},()=>({t:0,velocity:0}));assert.throws(()=>validateExperiment(run));
  assert.throws(()=>store.import(' '.repeat(1_000_001)),/1 MB/);assert.equal(store.export(),before);
});
test('quota failure retains unsaved data in memory for export and leaves durable data intact',()=>{
  const storage=memory(),store=createExperimentStore(storage);store.save(fixture());const durable=storage.getItem(EXPERIMENT_KEY);
  storage.setItem=()=>{throw new Error('QuotaExceededError');};assert.equal(store.save(fixture('run-2')),false);
  assert.equal(store.get().runs.length,2);assert.equal(JSON.parse(store.export()).runs.length,2);
  assert.equal(storage.getItem(EXPERIMENT_KEY),durable);assert.equal(store.isPersistent(),false);assert.match(store.issue(),/bộ nhớ/);
});
test('corrupted storage is preserved verbatim and other-tab writes cannot be silently overwritten',()=>{
  const storage=memory();storage.setItem(EXPERIMENT_KEY,'{bad');const broken=createExperimentStore(storage);
  assert.throws(()=>broken.draft(fixture()));assert.equal(storage.getItem(EXPERIMENT_KEY),'{bad');assert.equal(broken.rescue(),'{bad');
  const clean=memory(),a=createExperimentStore(clean),b=createExperimentStore(clean);a.save(fixture());
  assert.throws(()=>b.save(fixture('run-2')),/tab khác/);assert.equal(createExperimentStore(clean).get().runs[0].id,'run-1');
});
test('unavailable storage provides an exportable in-memory draft',()=>{
  const store=createExperimentStore(undefined);assert.equal(store.draft(fixture()),false);
  assert.equal(JSON.parse(store.export()).drafts.newton.rows.length,2);
});
