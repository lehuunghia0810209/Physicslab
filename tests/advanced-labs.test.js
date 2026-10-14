import test from 'node:test';
import assert from 'node:assert/strict';
import {ADVANCED_DEFAULTS,inductionSample,interferenceSample,calorimetrySample,advancedSample} from '../src/core/advanced-labs.js';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('cảm ứng: nam châm đứng yên có emf=0',()=>{
 for(const x of [-.25,0,.2])close(inductionSample(ADVANCED_DEFAULTS.induction,0,{x,velocity:0}).emf,0);
});
test('cảm ứng: đổi hướng vận tốc đổi dấu suất điện động',()=>{
 const p=ADVANCED_DEFAULTS.induction;
 const a=inductionSample(p,0,{x:.08,velocity:.3}).emf;
 const b=inductionSample(p,0,{x:.08,velocity:-.3}).emf;
 close(a,-b);assert.notEqual(a,0);
});
test('cảm ứng: emf = -N dPhi/dt, kiểm tra sai phân',()=>{
 const p=ADVANCED_DEFAULTS.induction,t=.12,h=1e-5;
 const actual=inductionSample(p,t).emf;
 const expected=-p.turns*(inductionSample(p,t+h).flux-inductionSample(p,t-h).flux)/(2*h);
 close(actual,expected,1e-6);
});
test('giao thoa: hai nguồn cùng pha tại cùng vị trí tạo biên độ gấp đôi',()=>{
 const p={...ADVANCED_DEFAULTS.interference,s1x:1,s1y:1,s2x:1,s2y:1};
 const a=interferenceSample(p,.15);close(a.displacement,2*a.u1);close(a.envelope,2*p.amplitude);
});
test('giao thoa: hai nguồn ngược pha ở cùng vị trí triệt tiêu',()=>{
 const p={...ADVANCED_DEFAULTS.interference,s1x:1,s1y:1,s2x:1,s2y:1,phase:180};
 for(const t of [0,.1,.4])close(interferenceSample(p,t).displacement,0);
 close(interferenceSample(p,.3).envelope,0);
});
test('nhiệt lượng: nhiệt độ cân bằng, năng lượng hai vật bảo toàn',()=>{
 const p=ADVANCED_DEFAULTS.calorimetry;
 const e=(p.m1*p.c1*p.T1+p.m2*p.c2*p.T2);
 for(const t of [0,1,10,100,500]){
  const s=calorimetrySample(p,t);
  close(s.heat1+s.heat2,0,1e-7);
  close(p.m1*p.c1*s.temperature1+p.m2*p.c2*s.temperature2,e,1e-7);
 }
 const end=calorimetrySample(p,3600);
 close(end.temperature1,end.equilibrium,1e-6);
});
test('tất cả trạm loại bỏ giá trị phi vật lý',()=>{
 assert.throws(()=>inductionSample({...ADVANCED_DEFAULTS.induction,turns:0},0),RangeError);
 assert.throws(()=>interferenceSample({...ADVANCED_DEFAULTS.interference,px:Infinity},0),RangeError);
 assert.throws(()=>calorimetrySample({...ADVANCED_DEFAULTS.calorimetry,m1:-2},0),RangeError);
 assert.throws(()=>advancedSample('ghost',{},0),RangeError);
});

test('trạm 2.4 lưu bằng schema Experiment Studio 2.2 không làm mất tiến độ',async()=>{
 const {createExperimentStore}=await import('../src/core/experiment-store.js');
 const backing=new Map([['physicslab.progress.v1','{legacy-progress-do-not-change}']]);
 const storage={getItem:k=>backing.get(k)??null,setItem:(k,v)=>backing.set(k,v)};
 const store=createExperimentStore(storage),p=ADVANCED_DEFAULTS.induction,s=inductionSample(p,.1);
 const run={id:'v24-unit-induction',simulationId:'electromagnetic-induction',name:'Dữ liệu đo từ mô hình',createdAt:Date.now(),parameters:{...p},modelVersion:'2.4.0-dev',assumptions:'Cuộn dây nhỏ, từ thông hiệu dụng.',columns:[{key:'t',label:'Thời gian',unit:'s',csv:'t'},{key:'emf',label:'Suất điện động',unit:'V',csv:'emf'}],rows:[{t:s.t,emf:s.emf}],selected:[0],notebook:{objective:'Quan sát định luật Faraday'}};
 assert.equal(store.save(run),true);
 const reloaded=createExperimentStore(storage);assert.equal(reloaded.get().runs[0].rows[0].emf,s.emf);
 assert.equal(backing.get('physicslab.progress.v1'),'{legacy-progress-do-not-change}');
});
