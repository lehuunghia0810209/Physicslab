/** PhysicsLab 1.5: shared, testable interaction geometry for experimental benches.
 * The graphical presentation is not used as a source of scientific measurements.
 */
import { getLabExperiment } from './lab-experiments.js';

export const BENCH_SIZE = Object.freeze({ width: 960, height: 540 });
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Handles are on the physical apparatus, not a disguised slider track.
export const BENCH_HANDLES = Object.freeze({
  'newton-second-law': { key: 'force', label: 'Kéo mũi tên lực', mode: 'horizontal', origin: 321, span: 240 },
  friction: { key: 'force', label: 'Kéo lực kế', mode: 'horizontal', origin: 321, span: 240 },
  'work-energy': { key: 'distance', label: 'Kéo mốc đích đến trên đường ray', mode: 'horizontal', origin: 185, span: 550 },
  'momentum-collision': { key: 'velocity1', label: 'Kéo mũi tên vận tốc xe A', mode: 'velocity', origin: 220, span: 9 },
  'spring-oscillation': { key: 'amplitude', label: 'Kéo vật khỏi vị trí cân bằng', mode: 'horizontal', origin: 400, span: 250 },
  'projectile-motion': { key: 'angle', label: 'Xoay nòng phóng', mode: 'angle', centerX: 146, centerY: 404 },
  'inclined-plane': { key: 'angle', label: 'Nâng hoặc hạ đầu máng', mode: 'incline' },
  'wave-speed': { key: 'distance', label: 'Kéo cổng đo quãng đường', mode: 'horizontal', origin: 170, span: 590 },
  'wave-interference': { key: 'phaseDifference', label: 'Dịch pha nguồn thứ hai', mode: 'horizontal', origin: 200, span: 500 },
  'thin-lens': { key: 'objectDistance', label: 'Dịch chuyển vật sáng', mode: 'lens', origin: 520, span: 200 },
  'lorentz-force': { key: 'pitchAngle', label: 'Đổi hướng vận tốc hạt', mode: 'angle', centerX: 310, centerY: 305 },
  'electromagnetic-induction': { key: 'frequency', label: 'Quay tay phát từ trường', mode: 'dial', centerX: 735, centerY: 395 }
});

export function benchHandleFor(id) {
  const info = BENCH_HANDLES[id];
  if (!info) return null;
  const parameter = getLabExperiment(id).parameters.find(item => item.key === info.key);
  if (!parameter) throw new Error(`Sai cấu hình điều khiển của ${id}`);
  return { ...info, parameter };
}

export function benchValueFromPoint(id, point, currentValue) {
  const info = benchHandleFor(id);
  if (!info) return null;
  const { parameter: p } = info;
  let fraction;
  if (info.mode === 'horizontal') fraction = (point.x - info.origin) / info.span;
  else if (info.mode === 'reverse') fraction = (info.origin - point.x) / info.span;
  else if (info.mode === 'velocity') fraction = ((point.x - info.origin) / info.span - p.min) / (p.max - p.min);
  else if (info.mode === 'lens') fraction = ((info.origin - point.x) / info.span - p.min) / (p.max - p.min);
  else if (info.mode === 'incline') fraction = (Math.atan2(421 - point.y, Math.max(1, point.x-170))*180/Math.PI - p.min)/(p.max-p.min);
  else if (info.mode === 'angle') {
    const angle = Math.atan2(info.centerY - point.y, point.x - info.centerX) * 180 / Math.PI;
    fraction = (angle - p.min) / (p.max - p.min);
  } else if (info.mode === 'dial') {
    // A generator dial visually connects rotation rate with the frequency parameter.
    const angle = Math.atan2(info.centerY - point.y, point.x - info.centerX);
    fraction = (clamp(angle, -2.4, 2.4) + 2.4) / 4.8;
  } else return currentValue;
  const raw = p.min + clamp(fraction, 0, 1) * (p.max - p.min);
  const digits = Math.max(0, String(p.step).split('.')[1]?.length || 0);
  const steps = Math.round((raw - p.min) / p.step);
  return Number(clamp(p.min + steps * p.step, p.min, p.max).toFixed(digits));
}

export function benchHandlePoint(id, setup) {
  const info = benchHandleFor(id);
  if (!info) return null;
  const p = info.parameter;
  const fraction = clamp((Number(setup[p.key]) - p.min) / (p.max - p.min), 0, 1);
  if (info.mode === 'horizontal') return { x: info.origin + info.span * fraction, y: id === 'wave-speed' ? 263 : id === 'wave-interference' ? 350 : id === 'spring-oscillation' ? 285 : id === 'friction' || id === 'newton-second-law' ? 330 : 350 };
  if (info.mode === 'velocity') return { x: info.origin + Number(setup[p.key]) * info.span, y: 290 };
  if (info.mode === 'lens') return { x: info.origin - Number(setup[p.key]) * info.span, y: 226 };
  if (info.mode === 'reverse') return { x: info.origin - info.span * fraction, y: 296 };
  if (info.mode === 'incline') {
    const angle=Number(setup[p.key])*Math.PI/180;
    const length=Math.min(530,260/Math.max(.001,Math.sin(angle)));
    return { x:170+length*Math.cos(angle), y:421-length*Math.sin(angle) };
  }
  if (info.mode === 'angle') {
    const angle = Number(setup[p.key]) * Math.PI / 180;
    return { x: info.centerX + 105 * Math.cos(angle), y: info.centerY - 105 * Math.sin(angle) };
  }
  if (info.mode === 'dial') { const angle = -2.4 + fraction * 4.8;return { x:info.centerX+47*Math.cos(angle),y:info.centerY-47*Math.sin(angle) }; }
  return null;
}

export function benchGuidance(id) {
  return ({
    'newton-second-law': ['Dùng chuột kéo mũi tên lực ở đầu xe.', 'Khối lượng không đổi: lực tổng hợp càng lớn thì gia tốc càng lớn.', 'Thử đổi khối lượng để kiểm tra a = Fnet/m.'],
    friction: ['Kéo lực kế, quan sát khi nào xe bắt đầu trượt.', 'Lực ma sát nghỉ tự điều chỉnh cho đến ngưỡng cực đại.', 'So sánh với ma sát trượt khi vật đã chuyển động.'],
    'work-energy': ['Kéo mốc đích đến trên đường ray.', 'Quan sát quãng đường liên hệ với công của lực.', 'Đối chiếu công tổng với độ biến thiên động năng.'],
    'momentum-collision': ['Thay đổi vận tốc xe A bằng mũi tên trên xe.', 'Bấm Chạy để thấy hai xe tiến đến và bật ra.', 'Tổng động lượng không đổi nếu hệ cô lập.'],
    'spring-oscillation': ['Kéo vật dọc lò xo để tạo biên độ.', 'Bấm Chạy để xem dao động theo thời gian.', 'Tìm thời điểm gia tốc hướng về vị trí cân bằng.'],
    'projectile-motion': ['Xoay nòng phóng bằng đầu tay nắm phát sáng.', 'Bấm Phóng để theo dõi viên đạn và quỹ đạo.', 'Đổi góc phóng để kiểm chứng tầm xa (khi hai điểm cùng độ cao).'],
    'inclined-plane': ['Kéo đầu trên của máng để đổi góc.', 'Bấm Chạy để xem xe bắt đầu trượt hay đứng yên.', 'So sánh với góc ngưỡng của ma sát.'],
    'wave-speed': ['Kéo cổng đo sang một vị trí mới trên dây.', 'Bấm Chạy để quan sát xung sóng đi qua cổng.', 'Đo quãng đường và thời gian để tính tốc độ.'],
    'wave-interference': ['Dịch nút điều khiển pha của nguồn 2.', 'Quan sát hai sóng và sóng tổng hợp.', 'Thử pha đối nhau để tìm giao thoa triệt tiêu.'],
    'thin-lens': ['Kéo vật sáng đến gần hoặc xa thấu kính.', 'Quan sát các tia cơ bản và vị trí ảnh.', 'Khi vật gần tiêu điểm, ảnh có thể ở rất xa.'],
    'lorentz-force': ['Kéo hướng vận tốc hạt so với từ trường.', 'Quan sát quỹ đạo xoắn hoặc tròn của hạt.', 'Kiểm tra thành phần vận tốc vuông góc với B.'],
    'electromagnetic-induction': ['Kéo tay điều khiển máy phát lên/xuống để thay đổi tần số.', 'Quan sát từ trường quay và kim vôn kế.', 'Tăng số vòng dây và so sánh suất điện động.']
  })[id] || ['Tương tác trực tiếp với vật thể.', 'Quan sát và dự đoán thay đổi.', 'Ghi phép đo, so sánh kết quả.'];
}

/** Local readout at a placed probe, valid only for phenomena with position-dependent data. */
export function benchLocalObservation(id,setup,point,time=0) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(time)) return null;
  if (id === 'wave-speed' || id === 'wave-interference') {
    const x = Math.max(0,(point.x-128)/42);
    const phase=2*Math.PI*(x/setup.wavelength-setup.frequency*time);
    const local=id==='wave-speed'
      ? 0.5*Math.sin(phase)
      : setup.amplitude*(Math.sin(phase)+Math.sin(phase+(setup.phaseDifference||0)*Math.PI/180));
    return Object.freeze({label:`Li độ tại x = ${x.toFixed(2)} m`,value:local,unit:'m'});
  }
  if (id === 'projectile-motion') {
    const theta = setup.angle*Math.PI/180;
    const ux=setup.v0*Math.cos(theta);
    if(ux<=0)return null;
    const flight=(setup.v0*Math.sin(theta)+Math.sqrt((setup.v0*Math.sin(theta))**2+2*setup.g*setup.height))/setup.g;
    const range=ux*flight;
    const x=Math.max(0,Math.min(1,(point.x-146)/600))*range;
    const timeAtX=x/ux;
    const height=Math.max(0,setup.height+setup.v0*Math.sin(theta)*timeAtX-.5*setup.g*timeAtX**2);
    return Object.freeze({label:`Độ cao tại x = ${x.toFixed(2)} m`,value:height,unit:'m'});
  }
  return null;
}
