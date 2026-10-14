/** Pure SI vector model for the interactive force workbench. Angles in degrees. */
export function resolveForceVectors({f1, a1, f2, a2}) {
  const values = [f1, a1, f2, a2];
  if (values.some(v => typeof v !== 'number' || !Number.isFinite(v))) throw new RangeError('Thông số lực phải là số hữu hạn.');
  if (f1 < 0 || f2 < 0 || f1 > 100 || f2 > 100 || Math.abs(a1) > 360 || Math.abs(a2) > 360) throw new RangeError('Lực hoặc góc ngoài miền cho phép.');
  const v = (f,deg) => ({ x: f * Math.cos(deg*Math.PI/180), y: f * Math.sin(deg*Math.PI/180) });
  const first = v(f1, a1), second = v(f2, a2);
  const x = first.x + second.x, y = first.y + second.y;
  const magnitude = Math.hypot(x, y);
  const angle = magnitude < 1e-10 ? null : Math.atan2(y,x)*180/Math.PI;
  return { first, second, resultant: {x,y,magnitude,angle}, forces: {f1,a1,f2,a2} };
}
export function forceFromPointer(x, y, cx=280, cy=184, pxPerNewton=10, maxForce=20) {
  if (![x,y,cx,cy,pxPerNewton,maxForce].every(Number.isFinite) || pxPerNewton<=0 || maxForce<=0) throw new RangeError('Tọa độ không hợp lệ.');
  const dx=x-cx, dy=cy-y, magnitude=Math.min(maxForce, Math.hypot(dx,dy)/pxPerNewton);
  return {magnitude: Math.round(magnitude*10)/10, angle:Math.round(Math.atan2(dy,dx)*180/Math.PI)};
}
