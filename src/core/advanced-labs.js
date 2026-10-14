/** Three numerical apparatus models for PhysicsLab 2.4 (SI units).
 * No random or fabricated measurements. Approximations are documented per model.
 */
const finite=(n,name)=>{if(!Number.isFinite(n))throw new RangeError(`${name} phải hữu hạn.`);return n;};
const bounded=(n,lo,hi,name)=>{finite(n,name);if(n<lo||n>hi)throw new RangeError(`${name} ngoài giới hạn.`);return n;};
export const ADVANCED_MODES=Object.freeze(['induction','interference','calorimetry']);
export const ADVANCED_DEFAULTS=Object.freeze({
 induction:Object.freeze({turns:120,field:0.3,area:0.006,halfWidth:0.09,amplitude:0.18,frequency:0.7}),
 interference:Object.freeze({amplitude:0.15,frequency:2,wavelength:1.5,phase:0,s1x:1.1,s1y:2.0,s2x:1.1,s2y:3.8,px:4.3,py:2.9}),
 calorimetry:Object.freeze({m1:0.25,m2:0.35,c1:4180,c2:4180,T1:353.15,T2:293.15,conductance:30})
});
export function inductionSample(p,t,{x=null,velocity=null}={}){
 bounded(p.turns,1,1000,'Số vòng');bounded(p.field,0,2,'Cảm ứng từ');bounded(p.area,.0001,.5,'Tiết diện');bounded(p.halfWidth,.01,1,'Bề rộng');bounded(p.amplitude,0,.4,'Biên độ');bounded(p.frequency,.05,10,'Tần số');bounded(t,0,1000,'Thời gian');
 const omega=2*Math.PI*p.frequency;
 const pos=x===null?p.amplitude*Math.cos(omega*t):bounded(x,-.5,.5,'Vị trí');
 const v=velocity===null?-p.amplitude*omega*Math.sin(omega*t):bounded(velocity,-10,10,'Vận tốc');
 const a=pos/p.halfWidth;
 // Axial dipole-inspired normalized effective flux through a compact coil; not a detailed 3D field solver.
 const coupling=(1+a*a)**(-1.5);
 const dCouplingDx=-3*pos/(p.halfWidth**2)*(1+a*a)**(-2.5);
 const flux=p.field*p.area*coupling;
 const emf=-p.turns*p.field*p.area*dCouplingDx*v;
 return Object.freeze({t,x:pos,velocity:v,flux,fluxLinkage:p.turns*flux,emf,mode:'induction'});
}
export function interferenceSample(p,t,{px=p.px,py=p.py}={}){
 bounded(p.amplitude,.001,1,'Biên độ');bounded(p.frequency,.1,20,'Tần số');bounded(p.wavelength,.1,10,'Bước sóng');bounded(p.phase,-180,180,'Độ lệch pha');bounded(t,0,1000,'Thời gian');
 for(const [label,n] of Object.entries({s1x:p.s1x,s1y:p.s1y,s2x:p.s2x,s2y:p.s2y,px,py}))bounded(n,0,6,label);
 const r1=Math.hypot(px-p.s1x,py-p.s1y),r2=Math.hypot(px-p.s2x,py-p.s2y);
 const w=2*Math.PI*p.frequency,k=2*Math.PI/p.wavelength,phase=p.phase*Math.PI/180;
 const u1=p.amplitude*Math.sin(w*t-k*r1);
 const u2=p.amplitude*Math.sin(w*t-k*r2+phase);
 const envelope=2*p.amplitude*Math.abs(Math.cos((k*(r2-r1)-phase)/2));
 return Object.freeze({t,px,py,r1,r2,u1,u2,displacement:u1+u2,envelope,mode:'interference'});
}
export function calorimetrySample(p,t){
 bounded(p.m1,.01,2,'Khối lượng 1');bounded(p.m2,.01,2,'Khối lượng 2');bounded(p.c1,100,6000,'Nhiệt dung riêng 1');bounded(p.c2,100,6000,'Nhiệt dung riêng 2');bounded(p.T1,273.15,393.15,'Nhiệt độ 1');bounded(p.T2,273.15,393.15,'Nhiệt độ 2');bounded(p.conductance,.1,300,'Độ dẫn nhiệt');bounded(t,0,3600,'Thời gian');
 const C1=p.m1*p.c1,C2=p.m2*p.c2;
 const teq=(C1*p.T1+C2*p.T2)/(C1+C2);
 const difference=(p.T1-p.T2)*Math.exp(-p.conductance*(1/C1+1/C2)*t);
 const temperature1=teq+C2/(C1+C2)*difference;
 const temperature2=teq-C1/(C1+C2)*difference;
 return Object.freeze({t,temperature1,temperature2,equilibrium:teq,heat1:C1*(temperature1-p.T1),heat2:C2*(temperature2-p.T2),mode:'calorimetry'});
}
export function advancedSample(mode,p,t,override){
 if(mode==='induction')return inductionSample(p,t,override);
 if(mode==='interference')return interferenceSample(p,t,override);
 if(mode==='calorimetry')return calorimetrySample(p,t);
 throw new RangeError('Không tồn tại trạm thí nghiệm.');
}
export const ADVANCED_META=Object.freeze({
 induction:{title:'Cảm ứng điện từ · nam châm & cuộn dây',grade:12,simulationId:'electromagnetic-induction',description:'Kéo nam châm qua cuộn dây hoặc cho dao động. Từ thông và suất điện động được tính bằng đạo hàm giải tích.',assumptions:'Từ trường dọc trục được xấp xỉ bằng hàm ghép (1+(x/d)²)^(-3/2); cuộn dây nhỏ, diện tích không đổi; bỏ qua tự cảm, tổn hao và phân bố từ trường 3D.'},
 interference:{title:'Giao thoa sóng · hai nguồn & đầu dò',grade:11,simulationId:'wave-interference',description:'Kéo hai nguồn phát và đầu dò trên mặt phẳng. Đo li độ và biên độ giao thoa bằng nguyên lí chồng chất.',assumptions:'Hai nguồn sóng điểm kết hợp, môi trường đồng nhất; sóng điều hòa ổn định, cùng biên độ, không suy giảm theo khoảng cách hoặc phản xạ biên.'},
 calorimetry:{title:'Nhiệt lượng · hai vật trao đổi nhiệt',grade:12,simulationId:'calorimetry',description:'Thay đổi nhiệt độ, khối lượng; quan sát hai nhiệt kế tiến tới cân bằng và kiểm tra bảo toàn năng lượng.',assumptions:'Hệ cách nhiệt, nhiệt dung riêng và hệ số trao đổi nhiệt không đổi; hai vật đồng nhất nhiệt độ, không chuyển pha, không trao đổi nhiệt với bình hoặc môi trường.'}
});
