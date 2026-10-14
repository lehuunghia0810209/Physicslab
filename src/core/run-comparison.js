import { nearestSeriesPoint } from '../engines/graph-series.js';

export function recordedRunModels(runs, xKey, yKey) {
  if (!Array.isArray(runs) || runs.length < 2 || runs.length > 3 || xKey === yKey) throw new Error('Chọn 2–3 lần chạy và hai đại lượng khác nhau.');
  const first = runs[0];
  const column = (run,key) => run.columns.find(c=>c.key===key);
  for (const key of [xKey,yKey]) {
    const reference=column(first,key);
    if (!reference || runs.some(run=>run.simulationId!==first.simulationId || column(run,key)?.unit!==reference.unit)) throw new Error('Các lần chạy không cùng mô hình, đại lượng và đơn vị.');
  }
  return runs.map(run=>{
    if (run.rows.length<2 || run.rows.some(row=>![row[xKey],row[yKey]].every(Number.isFinite))) throw new Error('Mỗi lần chạy cần ít nhất hai mẫu hữu hạn.');
    const rows=run.rows.map(row=>({...row})).sort((a,b)=>a[xKey]-b[xKey]);
    return { sample:()=>rows, at:x=>nearestSeriesPoint(rows,xKey,x) };
  });
}

export function compareRecordedValues(runs,xKey,yKey,x) {
  const models=recordedRunModels(runs,xKey,yKey);
  const points=models.map(model=>model.at(x));
  const baseline=points[0];
  return points.map(point=>{
    const sameX=point[xKey]===baseline[xKey];
    const difference=sameX?point[yKey]-baseline[yKey]:null;
    return { point, difference, relative:sameX&&baseline[yKey]!==0?100*difference/Math.abs(baseline[yKey]):null };
  });
}
