/** A 10 m inclined track, released from a selectable position with zero initial speed.
 * Acceleration and contact forces come exclusively from createInclinedPlane's physics.
 * Time stops at the end-stop (a perfectly inelastic collision with the ramp stop).
 */
export const TRACK_LENGTH = 10;
export function createInclineRelease(model, initialPosition = 0) {
  if (!model || !Number.isFinite(model.acceleration) || model.acceleration < 0) throw new RangeError('Mô hình gia tốc không hợp lệ.');
  if (!Number.isFinite(initialPosition) || initialPosition < 0 || initialPosition > TRACK_LENGTH) throw new RangeError('Vị trí thả xe phải thuộc chiều dài máng.');
  const available=TRACK_LENGTH-initialPosition;
  const a=model.acceleration;
  const duration=a>0 && available>0 ? Math.min(16,Math.sqrt(2*available/a)) : 3.5;
  const at=time=>{
    if(!Number.isFinite(time))throw new RangeError('Thời gian phải hữu hạn.');
    const t=Math.max(0,Math.min(duration,time));
    const distance=Math.min(available,.5*a*t*t);
    const position=initialPosition+distance;
    const atEnd=position>=TRACK_LENGTH-1e-9;
    return {t,time:t,velocity:atEnd?0:a*t,distance,position,acceleration:a,atEnd};
  };
  return {initialPosition,duration,at,sample:(count=140)=>{
    if(!Number.isInteger(count)||count<2||count>1000)throw new RangeError('Số mẫu không hợp lệ.');
    return Array.from({length:count+1},(_,i)=>at(duration*i/count));
  }};
}
