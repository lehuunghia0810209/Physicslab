import test from 'node:test';import assert from 'node:assert/strict';
import {labTopic,filterLabCards,filterLabCardsForGrade} from '../src/pages/lab-discovery.js';
import {labGrades} from '../src/data/thpt-program.js';
test('Lab category maps correctly and search ignores Vietnamese diacritics',()=>{
 assert.equal(labTopic('gas-law'),'thermal');assert.equal(labTopic('ohms-law'),'electricity');
 const data=[{id:'ohms-law',title:'Điện trở',description:'Mạch điện'},{id:'gas-law',title:'Khí lí tưởng',description:'Piston'}];
 assert.deepEqual(filterLabCards(data,'all','dien').map(x=>x.id),['ohms-law']);
 assert.deepEqual(filterLabCards(data,'thermal','').map(x=>x.id),['gas-law']);
});
test('Lab grade filter keeps genuinely shared experiments and isolates grade-specific work',()=>{
 const data=[{id:'hooke-first',title:'Hooke',description:'Lò xo'},{id:'circuit-first',title:'Ohm',description:'Mạch'},{id:'gas-first',title:'Khí',description:'Piston'}];
 assert.deepEqual(labGrades('hooke-first'),[10,11]);
 assert.deepEqual(filterLabCardsForGrade(data,{grade:10}).map(x=>x.id),['hooke-first']);
 assert.deepEqual(filterLabCardsForGrade(data,{grade:11}).map(x=>x.id),['hooke-first','circuit-first']);
 assert.deepEqual(filterLabCardsForGrade(data,{grade:12}).map(x=>x.id),['gas-first']);
 assert.deepEqual(filterLabCardsForGrade(data,{grade:11,filter:'electricity',term:'mach'}).map(x=>x.id),['circuit-first']);
});
