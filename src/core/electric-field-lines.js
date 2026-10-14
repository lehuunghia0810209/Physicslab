/** Numerically integrate streamlines of the SAME Coulomb field used by the meter.
 * Geometry is in metres, purely illustrative density; field magnitude is not encoded
 * by drawn line spacing or pixel length. Null near point-charge singularities.
 */
import { measureElectricField, FIELD_MIN_DISTANCE } from './electric-field.js';
export const FIELD_VIEW = Object.freeze({xmin:-3.6,xmax:3.6,ymin:-2.4,ymax:2.4});
const inside = (p, box) => p.x>=box.xmin && p.x<=box.xmax && p.y>=box.ymin && p.y<=box.ymax;
const near = (p,q,r) => Math.hypot(p.x-q.x,p.y-q.y)<r;
function unit(charges,p,sign){
 try{const f=measureElectricField(charges,p), mag=f.magnitude;
  if(mag<1e-8)return null;return {x:sign*f.ex/mag,y:sign*f.ey/mag};
 }catch{return null;}
}
export function traceFieldLine(charges,start,{direction=1,step=.055,maxSteps=230,bounds=FIELD_VIEW}={}){
 if(![start?.x,start?.y,step,direction,maxSteps].every(Number.isFinite)||step<=0||maxSteps<1)throw new RangeError('Tham số đường sức không hợp lệ.');
 const points=[{x:start.x,y:start.y}];let p=points[0];
 for(let i=0;i<maxSteps;i++){
  const a=unit(charges,p,direction);if(!a)break;
  const mid={x:p.x+a.x*step/2,y:p.y+a.y*step/2};
  const b=unit(charges,mid,direction)||a;
  const next={x:p.x+b.x*step,y:p.y+b.y*step};
  if(!inside(next,bounds))break;
  points.push(next);p=next;
  if(charges.some(q=>q.charge*direction<0 && near(p,q,FIELD_MIN_DISTANCE*1.7)))break;
 }
 return points;
}
export function sampleElectricFieldLines(charges,{perCharge=11,bounds=FIELD_VIEW}={}){
 const emitters=charges.filter(q=>q.charge!==0);
 const positive=emitters.filter(q=>q.charge>0);
 const origins=positive.length?positive:emitters.filter(q=>q.charge<0);
 return origins.flatMap(q=>{
  const dir=q.charge>0?1:-1;
  const count=Math.max(3,Math.round(perCharge*Math.abs(q.charge)/2));
  return Array.from({length:count},(_,i)=>{
   const angle=2*Math.PI*(i+.25)/count;
   const start={x:q.x+Math.cos(angle)*.15,y:q.y+Math.sin(angle)*.15};
   return inside(start,bounds)?traceFieldLine(charges,start,{direction:dir,bounds}):[];
  }).filter(points=>points.length>1);
 });
}
