import { labGrades } from '../data/thpt-program.js';
const groups={
  mechanics: ['newton-second-law','hooke-law','friction','work-energy','momentum-collision','inclined-plane','projectile-motion','spring-oscillation'],
  electricity:['ohms-law'],waves:['wave-speed','wave-interference'],optics:['thin-lens'],thermal:['gas-law','gas-first'],magnetism:['lorentz-force','electromagnetic-induction']
};
const labels=[['all','Tất cả'],['mechanics','Cơ học'],['electricity','Điện học'],['waves','Sóng'],['magnetism','Từ trường'],['optics','Quang học'],['thermal','Nhiệt học']];
const aliases={'circuit-first':'ohms-law','hooke-first':'hooke-law','gas-first':'gas-law'};
export function labTopic(id){return Object.entries(groups).find(([,values])=>values.includes(aliases[id]||id))?.[0]||'mechanics';}
export function filterLabCards(cards,filter='all',term=''){
 const normalize=text=>String(text).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 const query=normalize(term.trim());
 return cards.filter(card=>(filter==='all'||labTopic(card.id)===filter)&&normalize(`${card.title} ${card.description}`).includes(query));
}
export function filterLabCardsForGrade(cards,{grade,filter='all',term=''}={}){
 return filterLabCards(cards,filter,term).filter(card=>labGrades(card.id).includes(Number(grade)));
}
export function installLabDiscovery(section,experiments,signal,initialGrade=11){
 if(!section)return;
 const grid=section.querySelector('.lab-discovery-grid');
 const cards=[{id:'circuit-first',title:'Lắp mạch điện tương tác',description:'Lắp linh kiện, nối dây và đo dòng điện'}, {id:'hooke-first',title:'Lò xo Hooke',description:'Kéo quả nặng · Đo độ dãn · Hiệu chuẩn'}, {id:'gas-first',title:'Bình khí & piston',description:'Bơm khí, thay đổi nhiệt độ, đo áp suất'},...experiments];
 const mapping=new Map(cards.map(card=>[card.id,card]));
 const buttons=[...grid.querySelectorAll('.lab-discovery-card')];
 buttons.forEach(button=>{
   const id=button.id==='lab-open-circuit'?'circuit-first':button.id==='lab-open-gas'?'gas-first':button.dataset.openLab||'hooke-first'; const card=mapping.get(id);
   button.dataset.topic=labTopic(id==='hooke-first'?'hooke-law':id==='circuit-first'?'ohms-law':id);
   button.setAttribute('aria-label',`Mở thí nghiệm ${card?.title||id}`);
 });
 section.querySelector('.lab-discovery-head')?.insertAdjacentHTML('afterend', `<div class="lab-directory-tools"><label class="lab-directory-search">Tìm thí nghiệm<input id="lab-directory-query" type="search" placeholder="Ví dụ: điện, lực, sóng..." aria-label="Tìm thí nghiệm"/></label><div class="lab-topic-filters" role="group" aria-label="Lọc thí nghiệm theo lĩnh vực">${labels.map(([key,name])=>`<button type="button" class="lab-topic-chip" data-lab-topic="${key}" aria-pressed="${key==='all'}">${name}</button>`).join('')}<button type="button" class="lab-topic-chip" data-lab-reset>Đặt lại bộ lọc</button></div><span id="lab-directory-count" role="status"></span></div>`);
 let filter='all';let query='';
 const grades=[10,11,12];let grade=[10,11,12].includes(initialGrade)?initialGrade:11;

 section.querySelector('.lab-discovery-head')?.insertAdjacentHTML('beforebegin', `<div class="thpt-lab-program"><span class="eyebrow">CHƯƠNG TRÌNH THPT</span><h2>Chọn lớp để thực hành</h2><div class="thpt-grade-tabs" role="group" aria-label="Chọn chương trình thí nghiệm">${grades.map(g=>`<button type="button" data-thpt-grade="${g}" aria-pressed="${g===grade}">Lớp ${g}</button>`).join('')}</div><p class="thpt-lab-hint" role="status"></p></div>`);
 const update=()=>{
  const ids=new Set(filterLabCardsForGrade(cards,{grade,filter,term:query}).map(card=>card.id));
  buttons.forEach(button=>{const id=button.id==='lab-open-circuit'?'circuit-first':button.id==='lab-open-gas'?'gas-first':button.dataset.openLab||'hooke-first';button.hidden=!ids.has(id);});
  section.querySelector('#lab-directory-count').textContent=`${ids.size} thí nghiệm lớp ${grade}`;
  section.querySelector('.thpt-lab-hint').textContent=`Chương trình lớp ${grade} · Chọn một bàn thí nghiệm bên dưới, hoặc tìm theo tên và lĩnh vực.`;
  section.querySelectorAll('[data-thpt-grade]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.thptGrade)===grade)));
  section.querySelectorAll('[data-lab-topic]').forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.labTopic===filter)));
 };
 const reset=()=>{filter='all';query='';section.querySelector('#lab-directory-query').value='';update();};
 section.querySelectorAll('[data-thpt-grade]').forEach(b=>b.addEventListener('click',()=>{grade=Number(b.dataset.thptGrade);reset();const first=grid.querySelector('.lab-discovery-card:not([hidden])');if(first)first.click();},{signal}));
 section.querySelector('#lab-directory-query').addEventListener('input',event=>{query=event.target.value;update();},{signal});
 section.querySelectorAll('[data-lab-topic]').forEach(chip=>chip.addEventListener('click',()=>{filter=chip.dataset.labTopic;update();},{signal}));
 section.querySelector('[data-lab-reset]').addEventListener('click',reset,{signal});
 update();
}
