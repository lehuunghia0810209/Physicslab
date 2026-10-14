/** Fast, physical apparatus actions feeding the validated ideal-gas state model.
 * The shown molecular particles are qualitative, not a numeric particle solver.
 */
export function gasWorkbenchAction(params, action) {
  const p={...params};
  if(action==='pump' || action==='vent') {
    const change=action==='pump'?.1:-.1;
    p.amount=Math.round(Math.max(.1,Math.min(10,p.amount+change))*10)/10;
  } else if(action==='heat' || action==='cool') {
    const change=action==='heat'?25:-25;
    const key=p.process==='isochoric'?'finalTemperature':'initialTemperature';
    p[key]=Math.max(100,Math.min(1000,p[key]+change));
  } else throw new RangeError('Thao tác bình khí không hợp lệ.');
  return p;
}
