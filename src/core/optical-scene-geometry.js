/** Presentation geometry for ideal paraxial rays. All physical distances remain SI. */
export function opticalRayGeometry(parameters, imageState, scale, lensX = 360, axisY = 184) {
  const {objectDistance:d,objectHeight:hObject,focalLength:f}=parameters;
  if (![d,hObject,f,scale,lensX,axisY].every(Number.isFinite)||d<=0||hObject<=0||f<=0||scale<=0) throw new RangeError('Tọa độ quang học không hợp lệ.');
  const h=Math.min(76,Math.max(19,hObject*scale)); // explicitly enlarged drawable symbol
  const objectX=lensX-d*scale;
  const objectY=axisY-h;
  const imageX=imageState.imageDistance===null?null:lensX+imageState.imageDistance*scale;
  const imageY=imageState.magnification===null?null:axisY-imageState.magnification*h;
  const firstSlope=h/(f*scale);
  const centralSlope=h/(d*scale);
  return Object.freeze({h,objectX,objectY,imageX,imageY,firstSlope,centralSlope,
    outgoingParallelY:x=>objectY+(x-lensX)*firstSlope,
    outgoingCentralY:x=>axisY+(x-lensX)*centralSlope
  });
}
export function isScreenFocused(imageDistance,screenDistance,tolerance=.012) {
  return Number.isFinite(imageDistance)&&imageDistance>0&&Number.isFinite(screenDistance)&&screenDistance>0&&Math.abs(imageDistance-screenDistance)<tolerance;
}

/** Screen footprint from two paraxial principal rays. Only real images can be
 * collected; the separation is an illustrative geometric blur in scene pixels. */
export function opticalScreenFootprint(parameters, imageState, scale, screenDistance, lensX=360, axisY=184){
 if(!Number.isFinite(screenDistance)||screenDistance<=0)throw new RangeError('Màn phải đặt sau thấu kính.');
 if(imageState.imageDistance===null||imageState.imageDistance<=0)return null;
 const rays=opticalRayGeometry(parameters,imageState,scale,lensX,axisY);
 const x=lensX+screenDistance*scale;
 const a=rays.outgoingParallelY(x), b=rays.outgoingCentralY(x);
 return Object.freeze({x,y:(a+b)/2,blurRadius:Math.abs(a-b)/2,focused:isScreenFocused(imageState.imageDistance,screenDistance)});
}
