/** Camera-fit orthographic projection of a trajectory in a vertical plane.
 * Distances stay in SI; only screen coordinates are projected. No perspective
 * distortion is applied to physical measurements.
 */
const valid = Number.isFinite;
export function createProjectileViewport(model, { width, height, yaw = -0.55, elevation = 0.35, zoom = 1 } = {}) {
  if (!model || typeof model.at !== 'function' || ![width,height,yaw,elevation,zoom].every(valid)
    || width <= 0 || height <= 0 || zoom <= 0) throw new RangeError('Kích thước hoặc góc nhìn không hợp lệ.');
  const range = model.range;
  const maxHeight = model.maxHeight;
  if (![range,maxHeight].every(valid)) throw new RangeError('Quỹ đạo không hợp lệ.');
  const ref = Math.max(Math.abs(range),maxHeight,model.parameters?.height || 0,1);
  const depth = ref * .19;
  const ground = [
    { x:0,y:-depth,z:0 },{ x:range,y:-depth,z:0 },
    { x:range,y:depth,z:0 },{ x:0,y:depth,z:0 }
  ];
  const path = model.sample(180).map(p => ({ x:p.x,y:0,z:p.y,t:p.t }));
  const origin={x:0,y:0,z:0};
  const axes=Object.freeze({
    x:Object.freeze([origin,{x:Math.max(range,ref*.65),y:0,z:0}]),
    y:Object.freeze([origin,{x:0,y:depth,z:0}]),
    z:Object.freeze([origin,{x:0,y:0,z:Math.max(maxHeight,ref*.4)}])
  });
  const cy=Math.cos(yaw),sy=Math.sin(yaw),ce=Math.cos(elevation),se=Math.sin(elevation);
  function rotate({x,y,z}) {
    const lateral=x*sy+y*cy;
    return {x:x*cy-y*sy,y:z*ce-lateral*se};
  }
  const measured=[...path,...ground,...Object.values(axes).flat()].map(rotate);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of measured){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
  const margin=Math.min(52,Math.max(28,Math.min(width,height)*.09));
  const spanX=Math.max(1e-6,maxX-minX),spanY=Math.max(1e-6,maxY-minY);
  const scale=zoom*Math.min(Math.max(1,width-2*margin)/spanX,Math.max(1,height-2*margin)/spanY);
  const cx=(minX+maxX)/2,cy2=(minY+maxY)/2;
  function project(point){const p=rotate(point);return {x:width/2+(p.x-cx)*scale,y:height/2-(p.y-cy2)*scale};}
  return Object.freeze({project,path,ground,axes,margin,apex:{x:model.at(model.apexTime).x,y:0,z:model.maxHeight},
    sampleAt(t){const p=model.at(t);return {x:p.x,y:0,z:p.y,t:p.t};}});
}
