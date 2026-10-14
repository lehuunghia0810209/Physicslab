/** Student-first experimentation: each situation changes the REAL simulation input.
 * No scripted measurement values and no visual-only fake state.
 */
export const EXPLORATION_MISSIONS = Object.freeze({
 'projectile-motion': { question:'Nếu ném từ cùng độ cao với cùng vận tốc, góc nào giúp vật bay xa nhất?',choices:['25°','45°','65°'],correct:1,why:'Bỏ qua cản không khí, tầm xa R = v₀² sin(2θ)/g; với độ cao đầu và cuối bằng nhau, R cực đại tại 45°.',presets:[['Góc 25°',[['#param-height',0],['#param-angle',25]]],['Góc 45°',[['#param-height',0],['#param-angle',45]]],['Góc 65°',[['#param-height',0],['#param-angle',65]]]] },
 'inclined-plane': { question:'Giữ nguyên vật và ma sát: tăng độ nghiêng đủ lớn sẽ làm thế nào?',choices:['Lực song song dốc tăng','Khối lượng giảm','Trọng lực biến mất'],correct:0,why:'Thành phần trọng lực dọc dốc bằng mg·sinθ tăng theo θ. Vật chỉ trượt khi thành phần này vượt giới hạn ma sát nghỉ.',presets:[['Dốc 10°',[['#angle',10]]],['Dốc 30°',[['#angle',30]]],['Dốc 60°',[['#angle',60]]]] },
 'newton': { question:'Với khối lượng không đổi, nếu hợp lực tăng thì gia tốc thế nào?',choices:['Giảm','Tăng theo hợp lực','Không đổi'],correct:1,why:'Định luật II Newton: a = F_hợp/m. Nếu lực chưa thắng ma sát nghỉ, vật vẫn đứng yên.',presets:[['Đứng yên',[['#force',0]]],['Lực 20 N',[['#force',20]]],['Lực 60 N',[['#force',60]]]] },
 'friction': { question:'Điều gì xảy ra khi lực kéo chưa vượt giới hạn ma sát nghỉ?',choices:['Vật tăng tốc ngay','Ma sát nghỉ cân bằng lực','Ma sát biến mất'],correct:1,why:'Ma sát nghỉ tự điều chỉnh đến giới hạn μₛN. Vượt ngưỡng thì dùng ma sát trượt và vật bắt đầu gia tốc.',presets:[['Kéo nhẹ · 10 N',[['#param-force',10]]],['Qua ngưỡng · 30 N',[['#param-force',30]]],['Kéo mạnh · 70 N',[['#param-force',70]]]] },
 'work-energy': { question:'Khi tổng công dương, động năng của vật sẽ thế nào?',choices:['Tăng','Luôn bằng 0','Giảm'],correct:0,why:'Định lý động năng: ΔEₖ = W_hợp. Ma sát sinh công âm; phải xét tổng công chứ không chỉ công lực kéo.',presets:[['Lực 5 N',[['#param-force',5]]],['Lực 25 N',[['#param-force',25]]],['Lực 50 N',[['#param-force',50]]]] },
 'momentum-collision': { question:'Trong va chạm cô lập, đại lượng nào luôn bảo toàn?',choices:['Động năng','Tổng động lượng','Vận tốc của từng xe'],correct:1,why:'Tổng động lượng bảo toàn với mọi hệ số đàn hồi e từ 0 đến 1; động năng chỉ bảo toàn khi va chạm đàn hồi hoàn toàn.',presets:[['Va chạm mềm',[['#param-restitution',0]]],['Đàn hồi một phần',[['#param-restitution',.5]]],['Đàn hồi hoàn toàn',[['#param-restitution',1]]]] },
 'spring-oscillation': { question:'Với cùng m, k, nếu tăng biên độ lên gấp đôi thì cơ năng thay đổi sao?',choices:['Gấp đôi','Gấp bốn','Không đổi'],correct:1,why:'E = ½kA². Cơ năng tăng bốn lần khi biên độ gấp đôi; chu kỳ T = 2π√(m/k) vẫn không đổi trong mô hình lý tưởng.',presets:[['Biên độ 0,25 m',[['#param-amplitude',.25]]],['Biên độ 0,5 m',[['#param-amplitude',.5]]],['Biên độ 1 m',[['#param-amplitude',1]]]] },
 'wave-on-string': { question:'Với sóng dừng, điểm nút có tính chất nào?',choices:['Dao động mạnh nhất','Luôn đứng yên','Luôn đi theo sóng'],correct:1,why:'Nút sóng dừng có biên độ dao động bằng 0. Các điểm vật chất trên dây không truyền đi cùng sóng.',presets:[['Sóng truyền',[['#wave-mode','traveling']]],['Sóng dừng',[['#wave-mode','standing']]],['Giao thoa',[['#wave-mode','interference']]]] },
 'electric-circuits': { question:'Hai điện trở dương giống nhau mắc song song có điện trở tương đương thế nào?',choices:['Nhỏ hơn mỗi điện trở','Bằng tổng điện trở','Lớn hơn tổng'],correct:0,why:'Mắc song song: 1/R = 1/R₁ + 1/R₂. Hãy chọn mẫu, tháo dây rồi tự nối lại để kiểm chứng.',presets:[['Nối tiếp',[['#cwb-preset-series',true]]],['Song song',[['#cwb-preset-parallel',true]]],['Bàn trống',[['#cwb-preset-empty',true]]]],labLink:false },
 'electric-field': { question:'Hai điện tích trái dấu tạo đường sức điện có chiều cơ bản nào?',choices:['Từ âm sang dương','Từ dương sang âm','Không có chiều'],correct:1,why:'Đường sức đi ra từ điện tích dương và đi vào điện tích âm. Kéo đầu dò để xem vectơ E tại từng vị trí.',presets:[['Trái dấu',[['#field-charge-1',-2]]],['Cùng dấu',[['#field-charge-1',2]]],['Một điện tích',[['#field-charge-1',0]]]] },
 'magnetic-field': { question:'Điện tích chuyển động song song với từ trường đều chịu lực từ bao nhiêu?',choices:['Lực cực đại','Lực bằng 0','Không xác định'],correct:1,why:'|F| = |q|vBsinθ. Khi θ = 0°, sinθ = 0; không có lực Lorentz làm lệch hướng hạt.',presets:[['Song song B',[['#em-mode','lorentz'],['#em-param-pitchAngle',0]]],['Góc 35°',[['#em-mode','lorentz'],['#em-param-pitchAngle',35]]],['Vuông góc B',[['#em-mode','lorentz'],['#em-param-pitchAngle',90]]]] },
 lens: { question:'Nếu đặt vật đúng tại tiêu điểm của thấu kính hội tụ, ảnh sẽ nằm ở đâu?',choices:['Ở vô cực','Trên thấu kính','Luôn tại 2f'],correct:0,why:'Các tia ló song song, không hội tụ ở vị trí hữu hạn. Mô hình tính dᵢ → ∞ khi dₒ = f.',presets:[['Vật trong tiêu cự',[['#optics-objectDistance',.06]]],['Tại tiêu điểm',[['#optics-objectDistance',.1]]],['Ngoài 2f',[['#optics-objectDistance',.35]]]] },
 'ideal-gas': { question:'Trong quá trình đẳng tích của khí lý tưởng, piston chuyển động thế nào?',choices:['Thể tích tăng liên tục','Piston được giữ cố định','Không có áp suất'],correct:1,why:'Đẳng tích nghĩa là V không đổi; nếu tăng T ở cùng n, áp suất P tăng theo P = nRT/V.',presets:[['Đẳng nhiệt',[['#gas-process','isothermal']]],['Đẳng áp',[['#gas-process','isobaric']]],['Đẳng tích',[['#gas-process','isochoric']]]] }
});

export function applyExplorationPreset(root, modifications){
  let applied=0;
  for(const [selector,value] of modifications){
    const el=root.querySelector(selector);
    if(!el) continue;
    if(el.tagName==='BUTTON'&&value===true){el.click();applied++;continue;}
    if(!('value' in el)) continue;
    const v=String(value);
    if(el.tagName==='SELECT' && ![...el.options].some(opt=>opt.value===v))continue;
    if(el.type==='range'||el.type==='number'){
      const min=Number(el.min),max=Number(el.max),numeric=Number(value);
      if(!Number.isFinite(numeric)||(el.min!==''&&numeric<min)||(el.max!==''&&numeric>max))continue;
    }
    el.value=v;
    el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));
    applied++;
  }
  return applied;
}
