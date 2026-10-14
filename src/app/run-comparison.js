import { recordedRunModels, compareRecordedValues } from '../core/run-comparison.js';
import { sameExperimentSetup } from '../core/experiment-store.js';
import { GraphRenderer } from '../engines/graph.js';
import { format } from '../core/units.js';
import { escapeHtml } from './icons.js';

export function mountRunComparison(root,{getRuns,experiment,signal}) {
  root.innerHTML='<p>Chọn 2–3 lần chạy cùng mô hình. Đường nối chỉ liên kết các mẫu đã ghi; không tái tạo phần chưa đo.</p><div data-compare-choices></div><label>Đại lượng so sánh<select data-compare-y aria-label="Đại lượng so sánh"></select></label><button class="button secondary" type="button" data-compare-show>So sánh các lần chạy</button><p data-compare-status role="status"></p><div data-compare-chart></div><div data-compare-inspector hidden><label>Đọc mẫu gần nhất<input type="range" data-compare-x step="any" aria-label="Vị trí đọc số đo so sánh"></label><div data-compare-values></div><button class="button secondary" type="button" data-compare-seek>Tua mô phỏng tới mẫu tham chiếu</button><button class="button secondary" type="button" data-compare-csv>Xuất CSV so sánh</button></div>';
  const $=selector=>root.querySelector(selector);
  let runs=[],graph=null,xKey,yKey,selectedX=0,selection=new Set();
  const status=text=>{$('[data-compare-status]').textContent=text;};
  function inspect(x) {
    selectedX=x;$('[data-compare-x]').value=String(x);
    const readings=compareRecordedValues(runs,xKey,yKey,x);
    $('[data-compare-values]').replaceChildren();
    readings.forEach((reading,i)=>{
      const line=document.createElement('p');
      line.textContent=`${['① ━','② ┄','③ ···'][i]} ${runs[i].name}: ${xKey}=${format(reading.point[xKey],6)}, ${yKey}=${format(reading.point[yKey],6)} ${runs[i].columns.find(c=>c.key===yKey).unit}${i?reading.difference===null?' · Không tính chênh lệch: khác tọa độ mẫu.':` · |Δ|=${format(Math.abs(reading.difference),6)}; tương đối ${reading.relative===null?'không xác định (mốc bằng 0)':`${format(reading.relative)}%`}`:''}`;
      $('[data-compare-values]').append(line);
    });
    $('[data-compare-seek]').disabled=!experiment.seek||xKey!=='t'||!sameExperimentSetup(runs[0].parameters,experiment.parameters());
  }
  function refresh() {
    const available=getRuns();selection=new Set([...selection].filter(id=>available.some(run=>run.id===id)));
    $('[data-compare-choices]').innerHTML=available.length?available.map(run=>`<label class="experiment-select"><input type="checkbox" data-compare-run="${run.id}" ${selection.has(run.id)?'checked':''}>${escapeHtml(run.name)} · ${run.rows.length} mẫu</label>`).join(''):'<p>Lưu ít nhất hai lần chạy để so sánh.</p>';
    const previous=$('[data-compare-y]').value;
    $('[data-compare-y]').replaceChildren();
    for(const column of available[0]?.columns.slice(1)||[]){const option=document.createElement('option');option.value=column.key;option.textContent=`${column.label} (${column.unit})`;$('[data-compare-y]').append(option);}
    if([...$('[data-compare-y]').options].some(option=>option.value===previous))$('[data-compare-y]').value=previous;
    graph=null;runs=[];$('[data-compare-chart]').replaceChildren();$('[data-compare-inspector]').hidden=true;
    status('Chọn các lần chạy rồi mở so sánh; bỏ chọn một lần để ẩn đường đó.');
  }
  function show() {
    try{
      runs=getRuns().filter(run=>selection.has(run.id));xKey=runs[0]?.columns[0].key;yKey=$('[data-compare-y]').value;
      const models=recordedRunModels(runs,xKey,yKey),xColumn=runs[0].columns.find(c=>c.key===xKey),yColumn=runs[0].columns.find(c=>c.key===yKey);
      graph=new GraphRenderer($('[data-compare-chart]'),{key:yKey,label:yColumn.label,unit:yColumn.unit,xKey,xLabel:`${xColumn.label} (${xColumn.unit})`});
      graph.setRecordedRuns(models);graph.onInspect=inspect;
      const xs=runs.flatMap(run=>run.rows.map(row=>row[xKey]));
      $('[data-compare-x]').min=String(Math.min(...xs));$('[data-compare-x]').max=String(Math.max(...xs));
      $('[data-compare-inspector]').hidden=false;inspect(Math.min(...xs));
      status('① Nét liền · ② Nét gạch · ③ Nét chấm. Chênh lệch chỉ tính khi tọa độ hai mẫu bằng nhau.');
    }catch(error){graph=null;$('[data-compare-chart]').replaceChildren();$('[data-compare-inspector]').hidden=true;status(error.message);}
  }
  root.addEventListener('change',event=>{
    if(event.target.matches('[data-compare-run]')){
      if(event.target.checked)selection.add(event.target.dataset.compareRun);else selection.delete(event.target.dataset.compareRun);
      if(selection.size>3){selection.delete(event.target.dataset.compareRun);event.target.checked=false;status('Chỉ chọn tối đa ba lần chạy.');return;}
      if(graph)show();
    }
  },{signal});
  $('[data-compare-show]').addEventListener('click',show,{signal});
  $('[data-compare-y]').addEventListener('change',()=>{if(graph)show();},{signal});
  $('[data-compare-x]').addEventListener('input',event=>{const x=Number(event.target.value);graph?.update(x);inspect(x);},{signal});
  $('[data-compare-seek]').addEventListener('click',()=>{
    if(experiment.seek&&xKey==='t'&&sameExperimentSetup(runs[0].parameters,experiment.parameters()))experiment.seek(recordedRunModels(runs,xKey,yKey)[0].at(selectedX).t);
    else status('Thiết lập hiện tại khác lần tham chiếu nên không tua mô phỏng.');
  },{signal});
  $('[data-compare-csv]').addEventListener('click',()=>{
    const cell=value=>`"${(typeof value==='string'&&/^[=+@-]/.test(value)?"'"+value:String(value)).replaceAll('"','""')}"`;
    const lines=[['run_id','run_name',`${xKey} (${runs[0].columns.find(c=>c.key===xKey).unit})`,`${yKey} (${runs[0].columns.find(c=>c.key===yKey).unit})`],...runs.flatMap(run=>run.rows.map(row=>[run.id,run.name,row[xKey],row[yKey]]))];
    const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='physicslab-compare-runs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  },{signal});
  const unsubscribe=experiment.subscribe?.(value=>{
    if(graph&&xKey==='t'&&sameExperimentSetup(runs[0].parameters,experiment.parameters())){graph.update(value.time);inspect(value.time);}
  });
  signal.addEventListener('abort',()=>unsubscribe?.(),{once:true});
  refresh();return {refresh};
}
