/** Coordinates of the two stage knobs in the 620-unit SVG viewport. */
export function magneticKnobValue(fraction,field){
 if(!Number.isFinite(fraction))throw new RangeError('Vị trí kéo không hợp lệ.');
 const x=Math.max(0,Math.min(1,fraction))*620;
 if(field==='pitchAngle')return Math.max(0,Math.min(90,Math.round((x-406)/164*90)));
 if(field==='turns')return Math.max(1,Math.min(1000,Math.round(1+(x-400)/176*999)));
 throw new RangeError('Tay nắm từ trường không hợp lệ.');
}
