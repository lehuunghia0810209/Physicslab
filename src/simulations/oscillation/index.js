import { OSCILLATION_DEFAULTS, createOscillation } from '../../core/oscillation.js';
import { mountMechanicsSimulation } from '../mechanics-view.js';

const config = {
  id: 'spring-oscillation',
  title: 'Lò xo và dao động điều hòa',
  subtitle: 'Khảo sát li độ, vận tốc và trao đổi động năng – thế năng trong dao động lò xo.',
  grade: 11,
  kind: 'oscillation',
  sceneLabel: 'DAO ĐỘNG CỦA VẬT GẮN LÒ XO',
  defaults: OSCILLATION_DEFAULTS,
  create: createOscillation,
  parameters: [
    { key: 'mass', label: 'Khối lượng vật', min: 0.2, max: 20, step: 0.2, unit: 'kg' },
    { key: 'stiffness', label: 'Độ cứng lò xo', min: 1, max: 200, step: 1, unit: 'N/m' },
    { key: 'amplitude', label: 'Biên độ', min: 0.05, max: 2, step: 0.05, unit: 'm' },
    { key: 'phase', label: 'Pha ban đầu', min: -180, max: 180, step: 5, unit: '°' }
  ],
  readouts: [
    { key: 'position', label: 'Li độ', unit: 'm' },
    { key: 'velocity', label: 'Vận tốc', unit: 'm/s' },
    { key: 'acceleration', label: 'Gia tốc', unit: 'm/s²' },
    { key: 'kineticEnergy', label: 'Động năng', unit: 'J' },
    { key: 'potentialEnergy', label: 'Thế năng đàn hồi', unit: 'J' },
    { key: 'totalEnergy', label: 'Cơ năng', unit: 'J' }
  ],
  graphs: [
    { key: 'position', label: 'Li độ · x–t', unit: 'm', role: 'teal' },
    { key: 'velocity', label: 'Vận tốc · v–t', unit: 'm/s', role: 'blue' }
  ],
  graphHeading: 'Đồ thị dao động điều hòa',
  explain: model => `ω = √(k/m) = ${Number(model.angularFrequency.toFixed(2))} rad/s; chu kỳ T = ${Number(model.period.toFixed(2))} s. Cơ năng không đổi khi bỏ qua ma sát.`,
  assumptions: ['Lò xo tuân theo định luật Hooke trong miền đàn hồi.', 'Dao động không tắt dần; bỏ qua ma sát và lực cản.', 'Li độ đo từ vị trí cân bằng, pha tính theo radian trong mô hình.']
};

export function mount(main, context) {
  return mountMechanicsSimulation(main, context, config);
}
