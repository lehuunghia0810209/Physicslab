import test from 'node:test';
import assert from 'node:assert/strict';
import {gasWorkbenchAction} from '../src/core/gas-workbench-actions.js';
import {createIdealGas,IDEAL_GAS_DEFAULTS} from '../src/core/ideal-gas.js';
test('pumping and venting change n and thus pressure without fake readouts',()=>{
 const source={...IDEAL_GAS_DEFAULTS};
 const p0=createIdealGas(source).at(0).pressure;
 const next=gasWorkbenchAction(source,'pump');
 assert.ok(createIdealGas(next).at(0).pressure>p0);
 assert.equal(gasWorkbenchAction(next,'vent').amount,source.amount);
});
test('heating at fixed volume increases final pressure but not volume',()=>{
 const p={...IDEAL_GAS_DEFAULTS,process:'isochoric'};
 const before=createIdealGas(p).at(10);
 const next=createIdealGas(gasWorkbenchAction(p,'heat')).at(10);
 assert.equal(next.volume,before.volume);
 assert.ok(next.pressure>before.pressure);
});
test('invalid action rejects and safety limits hold',()=>{
 assert.throws(()=>gasWorkbenchAction(IDEAL_GAS_DEFAULTS,'explode'));
 assert.equal(gasWorkbenchAction({...IDEAL_GAS_DEFAULTS,amount:10},'pump').amount,10);
 assert.equal(gasWorkbenchAction({...IDEAL_GAS_DEFAULTS,initialTemperature:100},'cool').initialTemperature,100);
});
