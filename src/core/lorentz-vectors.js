/** Unit vector of centripetal Lorentz force in the xy orbit plane.
 * For the visualized B directed INTO the page (-z), q>0 bends toward +y.
 * In the 2D projection, use canvas dx=ux and dy=-uy.
 */
export function orbitForceDirection(state, charge){
 const radius=state?.radius;
 if(!Number.isFinite(radius)||radius<=1e-10||!Number.isFinite(charge)||charge===0)return null;
 const cx=0,cy=Math.sign(charge)*radius;
 const dx=cx-state.x,dy=cy-state.y;
 const length=Math.hypot(dx,dy);
 if(length<=1e-10)return null;
 return Object.freeze({x:dx/length,y:dy/length});
}
