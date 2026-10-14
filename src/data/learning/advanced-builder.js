import { THPT_PROGRAM } from '../thpt-program.js';

const LEVELS = ['nhận biết','thông hiểu','vận dụng','vận dụng cao'];
const program = new Map(THPT_PROGRAM.map(item => [item.id, item]));
const makeExample = (raw, topic, i) => {
 const [problem, analysis, step1, step2, step3, answer, meaning] = raw;
 return {title:`Ví dụ ${i+1}: ${topic}`,problem,analysis,steps:[step1,step2,step3],answer,meaning};
};
export function buildAdvancedGrade(grade, seeds) {
 const lessons=[], questions=[];
 for(const s of seeds) {
  const p=program.get(s.id);
  if(!p || p.grade!==grade || lessons.some(x=>x.id===s.id)) throw new Error(`Sai mã bài học: ${s.id}`);
  const [first,second]=s.theory;
  const summary = s.summary;
  const hasLab=Boolean(p.labId), hasSim=Boolean(p.simulationId);
  const station=s.station||null;
  const experiment={goal:s.goal,prediction:s.prediction||p.question,simulationId:p.simulationId||null,labId:p.labId||null,
   setup:s.setup||(station?'Mở trạm thực nghiệm tương ứng, kiểm tra các thông số ban đầu và thang đo trước khi khảo sát.':hasLab||hasSim?'Mở đúng mô phỏng hoặc bàn thí nghiệm liên kết; ghi các điều kiện và đơn vị trước khi thay một đại lượng.':'Dùng giấy, bút và bảng giá trị. Không có mô phỏng định lượng cho thiết bị này; hãy tự tính và đối chiếu theo quy trình.'),
   steps:s.steps,measurements:s.measurements,questions:s.observations,
   conclusion:s.conclusion};
  // Stations are hosted on special routes rather than registered as legacy lab identifiers.
  if(station) experiment.stationUrl=`#/lab/${station}`;
  lessons.push({id:s.id,programId:s.id,grade,title:p.title,topic:p.theme,duration:45,
   objectives:[p.objective,s.objective],prerequisites:s.prerequisites,
   quantities:s.quantities.map(([symbol,name,unit])=>({symbol,name,unit})),
   warmup:{scenario:s.scenario,question:p.question},
   theory:[{id:`${s.id}-t1`,title:s.sections[0],paragraphs:[first],misconceptions:[s.mistakes[0]]},
           {id:`${s.id}-t2`,title:s.sections[1],paragraphs:[second],formula:{expression:s.formula,conditions:s.conditions},misconceptions:[s.mistakes[1]]}],
   examples:s.examples.map((e,i)=>makeExample(e,s.sections[i],i)),
   experiment,exercises:[1,2,3,4,5].map(n=>`${s.id}-q${n}`),
   summary:{points:summary,formulas:[s.formula],mistakes:s.mistakes,nextProgramId:s.next||undefined}});
  const common=(n,type,prompt,explanation,review)=>({id:`${s.id}-q${n}`,lessonId:s.id,grade,
    level:LEVELS[Math.min(n-1,3)],type,prompt,explanation,review});
  questions.push({...common(1,'single',s.mc[0],s.mc[3],s.sections[0]),options:s.mc[1].map((text,i)=>({id:String.fromCharCode(97+i),text})),answer:String.fromCharCode(97+s.mc[2])});
  questions.push({...common(2,'true-false',`Đánh giá các phát biểu về ${p.title.toLowerCase()}.`,s.tf[4],s.sections[1]),statements:[
     {id:'a',text:s.tf[0],answer:true,explanation:s.tf[1]},{id:'b',text:s.tf[2],answer:false,explanation:s.tf[3]}]});
  const n=s.num;
  questions.push({...common(3,'numeric',n[0],n[4],s.formula),answer:n[1],unit:n[2],formula:s.formula,
    tolerance:{absolute:n[3]},verification:n[5]});
  questions.push({...common(4,'short',s.short[0],s.short[2],s.sections[0]),accepted:s.short[1]});
  questions.push({...common(5,'single',s.mc2[0],s.mc2[3],s.sections[1]),options:s.mc2[1].map((text,i)=>({id:String.fromCharCode(97+i),text})),answer:String.fromCharCode(97+s.mc2[2])});
 }
 return {lessons:Object.freeze(lessons),questions:Object.freeze(questions)};
}
