/** Pure SI measurement model for the interactive motion ruler.
 * Maps pointer x to elapsed time without using animation pixels as physical data.
 */
import { createProjectile } from './projectile.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createMotionProbe(input){
  const model=createProjectile(input);
  const sample=(ratio)=>{
    if(!Number.isFinite(ratio))throw new RangeError('Vị trí đo phải hữu hạn.');
    const phase=clamp(ratio,0,1);
    const state=model.at(model.duration*phase);
    return Object.freeze({phase,...state,energyPerKg:.5*state.speed**2+input.g*state.y});
  };
  return Object.freeze({model,sample,
    fromX(x,left,width){if(![x,left,width].every(Number.isFinite)||width<=0)throw new RangeError('Thanh thời gian không hợp lệ.');return sample((x-left)/width);},
    points(count=100){if(!Number.isInteger(count)||count<2||count>2000)throw new RangeError('Số điểm không hợp lệ.');return Array.from({length:count+1},(_,i)=>sample(i/count));}
  });
}
