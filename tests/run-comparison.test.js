import test from 'node:test';
import assert from 'node:assert/strict';
import { recordedRunModels, compareRecordedValues } from '../src/core/run-comparison.js';

const run=(ys,times=[0,1,2])=>({simulationId:'newton',columns:[{key:'t',unit:'s'},{key:'v',unit:'m/s'}],rows:ys.map((v,i)=>({t:times[i],v}))});
test('comparison preserves real samples and never interpolates missing measurements',()=>{
  const a=run([0,2,4]),b=run([0,4,8]);
  const models=recordedRunModels([a,b],'t','v');
  assert.deepEqual(models[0].at(.8),{t:1,v:2});
  assert.deepEqual(compareRecordedValues([a,b],'t','v',1)[1],{point:{t:1,v:4},difference:2,relative:100});
  assert.equal(compareRecordedValues([a,b],'t','v',0)[1].relative,null);
  assert.equal(compareRecordedValues([a,run([0,4,8],[0,1.2,2])],'t','v',1)[1].difference,null);
  models[0].sample()[0].v=99;
  assert.equal(a.rows[0].v,0);
});
test('comparison supports three runs, sorts snapshots, rejects incompatible or insufficient data',()=>{
  const a=run([4,0,2],[2,0,1]);
  assert.deepEqual(recordedRunModels([a,run([0,4,8]),run([0,6,12])],'t','v')[0].sample().map(p=>p.t),[0,1,2]);
  for(const runs of [[a],[a,a,a,a],[a,run([0])],[a,{...a,simulationId:'other'}],[a,{...a,columns:[{key:'t',unit:'ms'},{key:'v',unit:'m/s'}]}],[a,run([0,NaN,2])]])assert.throws(()=>recordedRunModels(runs,'t','v'));
  assert.throws(()=>recordedRunModels([a,a],'t','t'));
});
