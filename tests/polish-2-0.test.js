import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { format } from '../src/core/units.js';
import { installOfflineUpdateNotice } from '../src/app/offline-updates.js';
import { SimulationRegistry } from '../src/data/registry.js';

const root = resolve(import.meta.dirname, '..');
test('Scientific readouts use a normalized zero, never negative zero', () => {
 assert.equal(format(-0), '0,00');
 assert.equal(format(-0.00001), '0,00');
 assert.equal(format(-0.0049), '0,00');
 assert.equal(format(-0.0051), '-0,01');
 assert.equal(format(0.00001), '0,00');
 assert.equal(format(-Infinity), '—');
 assert.equal(format(NaN), '—');
 assert.equal(format(2.5, 1), '2,5');
});

test('The mechanics scene is an accessible group, not a nested slider widget', async () => {
 const s = await readFile(resolve(root,'src/simulations/mechanics-view.js'),'utf8');
 assert.match(s, /physics-stage" tabindex="0" role="group"/);
 assert.doesNotMatch(s, /physics-stage" tabindex="0" role="slider"/);
 assert.match(s, /lostpointercapture/);
 assert.match(s, /if\(run &&/);
});

test('The installed web app manifest points to actual same-origin assets', async () => {
 const manifest=JSON.parse(await readFile(resolve(root,'public/manifest.webmanifest'),'utf8'));
 assert.equal(manifest.start_url,'./');
 assert.equal(manifest.display,'standalone');
 for(const entry of manifest.icons){
  const image = await readFile(resolve(root,'public',entry.src.replace(/^\.\//,'')));
  assert.ok(image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  assert.ok(image.length>500);
 }
});

test('PWA update notification does not reload until the user explicitly accepts', () => {
 class Action extends EventTarget { constructor(){super();this.disabled=false;this.textContent='';}click(){this.dispatchEvent(new Event('click'));} }
 let el, reloads=0, posted=[];
 const registration=new EventTarget();registration.waiting={postMessage:message=>posted.push(message)};
 const nav={serviceWorker:new EventTarget()};nav.serviceWorker.controller={};
 const rootDoc={body:{appendChild(node){el=node;}},createElement(){
   const later=new Action(),refresh=new Action();
   return {setAttribute(){},innerHTML:'',querySelector(sel){return sel==='[data-offline-later]'?later:refresh;},remove(){el=null;}};
 }};
 const release=installOfflineUpdateNotice(registration,{documentRoot:rootDoc,nav,reload:()=>reloads++});
 assert.ok(el);
 nav.serviceWorker.dispatchEvent(new Event('controllerchange'));
 assert.equal(reloads,0);
 el.querySelector('[data-offline-refresh]').click();
 assert.deepEqual(posted,['SKIP_WAITING']);
 nav.serviceWorker.dispatchEvent(new Event('controllerchange'));
 assert.equal(reloads,1);
 release();
 assert.equal(el,null);
});

test('Postponing an update never sends an activation message', () => {
 class Action extends EventTarget {click(){this.dispatchEvent(new Event('click'));}}
 let el, count=0;
 const registration=new EventTarget();registration.waiting={postMessage(){count++}};
 const nav={serviceWorker:new EventTarget()};nav.serviceWorker.controller={};
 const doc={body:{appendChild(node){el=node;}},createElement(){const buttons={later:new Action(),refresh:new Action()};return {setAttribute(){},querySelector(k){return k.includes('later')?buttons.later:buttons.refresh;},remove(){el=null;}};}};
 const stop=installOfflineUpdateNotice(registration,{documentRoot:doc,nav});
 el.querySelector('[data-offline-later]').click();
 assert.equal(el,null);assert.equal(count,0);
 stop();
});

test('All 13 simulation identifiers remain available for the learning and classroom routes',()=>{
 assert.equal(SimulationRegistry.all().filter(item=>item.status==='available').length,13);
});
