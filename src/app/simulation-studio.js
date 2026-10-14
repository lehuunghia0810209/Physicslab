import { EXPLORATION_MISSIONS, applyExplorationPreset } from '../data/exploration-missions.js';
import { guideForSimulation } from '../data/experiment-guides.js';
import '../styles/remake-studio.css';
import '../styles/exploration-studio.css';
/** Classroom-first controls: a reversible visual-focus mode shared by every simulation.
 * Never changes simulation model state, saved sessions, DOM control IDs or graph data.
 */
export function installSimulationStudio(main,id,context) {
 const heading=main.querySelector('.page-heading');if(!heading)return()=>{};
 const abort=new AbortController();
 const hints={
  'projectile-motion':'Kéo đầu vectơ hướng phóng để thay đổi góc và tốc độ; quan sát quỹ đạo ngay.',
  'newton':'Kéo mũi tên lực. Khi chạy, so sánh hướng gia tốc và hướng lực tổng hợp.',
  'inclined-plane':'Kéo để thay đổi độ nghiêng; theo dõi lực và vị trí của vật.',
  'friction':'Kéo lực để tìm thời điểm vật bắt đầu trượt.',
  'work-energy':'Kéo vật trên đường để chọn quãng đường thí nghiệm; chạy để quan sát công và động năng.',
  'momentum-collision':'Kéo từng xe để thay vận tốc đầu, rồi quan sát trước và sau va chạm.',
  'spring-oscillation':'Kéo vật và quan sát li độ thay đổi theo thời gian.',
  'wave-on-string':'Kéo dây lên xuống; quan sát nút, bụng và bước sóng.',
  'electric-circuits':'Chọn linh kiện, kéo lên bàn và nối hai đầu tròn để tự tạo mạch điện.',
  'electric-field':'Di chuyển điện tích và đầu dò trên mặt phẳng.',
  'magnetic-field':'Thay đổi hướng vận tốc để quan sát lực Lorentz.',
  lens:'Kéo vật lại gần hoặc ra xa thấu kính, quan sát ảnh.',
  'ideal-gas':'Kéo piston để thay đổi thể tích; theo dõi va chạm của phân tử.'
 };
 const guide=guideForSimulation(id);
 const bar=document.createElement('section');
 bar.className='simulation-studio-bar';bar.setAttribute('aria-label','Điều khiển bàn mô phỏng');
 bar.innerHTML=`<div class="simulation-studio-caption"><span class="simulation-studio-kicker">PHYSICSLAB · BÀN KHÁM PHÁ</span><p>${hints[id]||guide?.[0]||'Thử thay đổi một đại lượng và quan sát hiện tượng.'}</p></div><div class="simulation-studio-actions"><button type="button" class="button secondary" data-studio-focus aria-pressed="false">⛶ Tập trung quan sát</button><button type="button" class="button secondary" data-studio-graphs>↗ Xem đồ thị</button><button type="button" class="button secondary" data-studio-help>ⓘ Hướng dẫn</button></div>`;
 const mission=EXPLORATION_MISSIONS[id];
 if(mission){
   const missionSection=document.createElement('section');
   missionSection.className='studio-discovery';
   missionSection.setAttribute('aria-label','Thử thách khám phá vật lý');
   missionSection.innerHTML=`<div class="studio-discovery-title"><span class="studio-discovery-index">01 / KHÁM PHÁ</span><h2>Thử một tình huống thực tế</h2><p>Chạm vào một tình huống để chuẩn bị thí nghiệm, sau đó thao tác trên cảnh và quan sát.</p></div><div class="studio-presets" role="group" aria-label="Tình huống thí nghiệm">${mission.presets.map(([label],i)=>`<button class="studio-preset" type="button" data-scenario="${i}" aria-pressed="false"><span class="studio-preset-number">0${i+1}</span>${label}</button>`).join('')}</div><details class="studio-prediction"><summary>💡 Dự đoán trước khi thử</summary><p class="studio-question">${mission.question}</p><div class="studio-choices" role="group" aria-label="Chọn dự đoán">${mission.choices.map((answer,i)=>`<button type="button" data-answer="${i}">${answer}</button>`).join('')}</div><p class="studio-feedback" role="status" aria-live="polite">Hãy chọn dự đoán, rồi kiểm chứng trên mô phỏng.</p></details>${mission.labLink?'<a href="#/lab" class="studio-lab-link">↗ Đến phòng thí nghiệm lắp mạch tự do</a>':''}`;
   bar.append(missionSection);
   missionSection.addEventListener('click',event=>{
     const preset=event.target.closest('[data-scenario]');
     if(preset){
       const n=Number(preset.dataset.scenario);
       const count=applyExplorationPreset(main,mission.presets[n][1]);
       if(count){
         missionSection.querySelectorAll('[data-scenario]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===preset)));
         const play=main.querySelector('#play');
         if(play && !play.disabled && !(/tạm dừng/i.test(play.textContent))) play.click();
       }
     }
     const answer=event.target.closest('[data-answer]');
     if(answer){
       const ok=Number(answer.dataset.answer)===mission.correct;
       const feedback=missionSection.querySelector('.studio-feedback');
       feedback.textContent=`${ok?'Đúng rồi!':'Hãy thử và đối chiếu:'} ${mission.why}`;
       feedback.dataset.answerStatus=ok?'correct':'review';
       missionSection.querySelectorAll('[data-answer]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===answer)));
     }
   },{signal:abort.signal});
 }
 const previousGuide=main.querySelector('.experiment-guide');
 (previousGuide||heading).insertAdjacentElement('afterend',bar);
 const teacher=document.createElement('section');
 teacher.className='teacher-studio';teacher.setAttribute('aria-label','Teacher Studio');
 teacher.innerHTML=`<div class="teacher-studio-heading"><div><span class="simulation-studio-kicker">TEACHER STUDIO</span><h2>Điều phối tiết học</h2><p>Lưu cấu hình hiện tại, dừng tại điểm cần phân tích và chọn lớp thông tin học sinh nhìn thấy.</p></div><div class="teacher-studio-actions"><button type="button" class="button secondary" data-teacher-save>Lưu cấu hình</button><button type="button" class="button secondary" data-teacher-restore>Khôi phục</button><button type="button" class="button primary" data-teacher-pause>Dừng để phân tích</button></div></div><fieldset class="teacher-visibility"><legend>Lớp hiển thị</legend>${[['measurements','Số đo'],['vectors','Vectơ'],['graphs','Đồ thị'],['explanations','Giải thích']].map(([key,label])=>`<label><input type="checkbox" data-teacher-layer="${key}" checked> ${label}</label>`).join('')}</fieldset><p class="teacher-studio-status" data-teacher-status role="status" aria-live="polite">Cấu hình được lưu riêng trên trình duyệt này.</p>`;
 bar.insertAdjacentElement('afterend',teacher);
 const teacherStatus=teacher.querySelector('[data-teacher-status]');
 const setupId=`teacher-${id}`;
 const editableControls=()=>[...main.querySelectorAll('input[id],select[id]')].filter(control=>control.id!=='scrubber'&&control.type!=='file'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(control.id));
 teacher.querySelector('[data-teacher-save]').addEventListener('click',()=>{
   const controls={};
   for(const control of editableControls()){
     if(control.type==='number'&&control.value==='')continue;
     controls[control.id]=control.type==='checkbox'?(control.checked?1:0):control.type==='range'||control.type==='number'?Number(control.value):control.value;
   }
   if(!Object.keys(controls).length){teacherStatus.textContent='Bàn lắp mạch tự lưu cấu hình liên tục trên thiết bị này.';return;}
   context.progress.session(setupId,{setup:{controls}});
   teacherStatus.textContent=`Đã lưu ${Object.keys(controls).length} thiết lập cho mô phỏng này.`;
 },{signal:abort.signal});
 teacher.querySelector('[data-teacher-restore]').addEventListener('click',()=>{
   const controls=context.progress.get().sessions[setupId]?.setup?.controls;
   if(!controls){teacherStatus.textContent=editableControls().length?'Chưa có cấu hình đã lưu cho mô phỏng này.':'Bàn lắp mạch đã tự khôi phục cấu hình gần nhất trên thiết bị này.';return;}
   let restored=0;
   for(const [controlId,value] of Object.entries(controls)){
     const control=document.getElementById(controlId);
     if(!control||!main.contains(control))continue;
     if(control.type==='checkbox')control.checked=Boolean(value);else control.value=String(value);
     control.dispatchEvent(new Event('input',{bubbles:true}));
     control.dispatchEvent(new Event('change',{bubbles:true}));
     restored++;
   }
   teacherStatus.textContent=`Đã khôi phục ${restored} thiết lập.`;
 },{signal:abort.signal});
 teacher.querySelector('[data-teacher-pause]').addEventListener('click',()=>{
   const state=context.activeSimulation?.()?.state;
   const circuitFlow=main.querySelector('#circuit-flow-toggle[aria-pressed="true"]') || (state?.playing ? main.querySelector('[data-play]') : null);
   const pause=main.querySelector('#pause-simulation')||main.querySelector('#play');
   if(circuitFlow){circuitFlow.click();teacherStatus.textContent='Đã dừng dòng điện minh họa để phân tích.';}
   else if(state?.playing&&pause){pause.click();teacherStatus.textContent='Đã dừng mô phỏng tại trạng thái hiện tại.';}
   else teacherStatus.textContent='Mô hình đang đứng yên; có thể bắt đầu phân tích.';
 },{signal:abort.signal});
 teacher.querySelector('.teacher-visibility').addEventListener('change',event=>{
   const layer=event.target.dataset.teacherLayer;
   if(!layer)return;
   main.classList.toggle(`teacher-hide-${layer}`,!event.target.checked);
   window.dispatchEvent(new Event('resize'));
 },{signal:abort.signal});
 const focusBtn=bar.querySelector('[data-studio-focus]');
 function focus(on) {
  main.classList.toggle('sim-studio-focus',on);
  focusBtn.setAttribute('aria-pressed',String(on));
  focusBtn.textContent=on?'⤡ Hiện đầy đủ điều khiển':'⛶ Tập trung quan sát';
  window.dispatchEvent(new Event('resize'));
 }
 focusBtn.addEventListener('click',()=>focus(!main.classList.contains('sim-studio-focus')),{signal:abort.signal});
 bar.querySelector('[data-studio-graphs]').addEventListener('click',()=>{
  focus(false);
  const target=main.querySelector('.graphs-section,.mechanics-graphs,.wave-graphs,.gas-graph,.em-graph,.optics-graph,.generic-lab-graph,.graphs-grid,.graph-card');
  if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  else bar.querySelector('[data-studio-graphs]').textContent='Mô phỏng này chưa có đồ thị riêng';
 },{signal:abort.signal});
 bar.querySelector('[data-studio-help]').addEventListener('click',()=>{
  const help=main.querySelector('.experiment-guide');
  if(help){help.open=!help.open;help.scrollIntoView({behavior:'smooth',block:'start'});}
 },{signal:abort.signal});
 const escape=event=>{if(event.key==='Escape'&&main.classList.contains('sim-studio-focus'))focus(false);};
 document.addEventListener('keydown',escape,{signal:abort.signal});
 return ()=>{focus(false);['measurements','vectors','graphs','explanations'].forEach(layer=>main.classList.remove(`teacher-hide-${layer}`));abort.abort();};
}
