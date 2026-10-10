import { FRICTION_DEFAULTS, createFrictionMotion } from '../../core/friction.js';
import { mountMechanicsSimulation } from '../mechanics-view.js';

const config = {
  id: 'friction',
  title: 'Ma sát nghỉ và ma sát trượt',
  subtitle: 'Thay đổi lực kéo để quan sát ngưỡng bắt đầu trượt và chuyển động khi có ma sát.',
  grade: 10,
  kind: 'friction',
  sceneLabel: 'KHỐI TRÊN MẶT PHẲNG NGANG',
  defaults: FRICTION_DEFAULTS,
  create: createFrictionMotion,
  normalize: input => ({ ...input, staticCoefficient: Math.max(input.staticCoefficient, input.kineticCoefficient) }),
  parameters: [
    { key: 'mass', label: 'Khối lượng', min: 1, max: 30, step: 0.5, unit: 'kg' },
    { key: 'force', label: 'Lực kéo có hướng', min: -80, max: 80, step: 1, unit: 'N' },
    { key: 'staticCoefficient', label: 'Hệ số ma sát nghỉ', min: 0, max: 1.2, step: 0.05, unit: '' },
    { key: 'kineticCoefficient', label: 'Hệ số ma sát trượt', min: 0, max: 1.2, step: 0.05, unit: '' },
    { key: 'gravity', label: 'Gia tốc trọng trường', min: 1, max: 25, step: 0.1, unit: 'm/s²' }
  ],
  readouts: [
    { key: 'frictionForce', label: 'Lực ma sát (có hướng)', unit: 'N' },
    { key: 'staticFrictionLimit', label: 'Ngưỡng ma sát nghỉ', unit: 'N' },
    { key: 'netForce', label: 'Lực tổng', unit: 'N' },
    { key: 'acceleration', label: 'Gia tốc', unit: 'm/s²' },
    { key: 'velocity', label: 'Vận tốc', unit: 'm/s' },
    { key: 'position', label: 'Độ dời', unit: 'm' }
  ],
  graphs: [
    { key: 'position', label: 'Độ dời · x–t', unit: 'm', role: 'teal' },
    { key: 'velocity', label: 'Vận tốc · v–t', unit: 'm/s', role: 'blue' }
  ],
  graphHeading: 'Chuyển động khi có ma sát',
  explain: model => model.threshold
    ? `Lực kéo ${model.parameters.force} N chưa vượt ngưỡng ma sát nghỉ ${Number(model.staticFrictionLimit.toFixed(2))} N. Ma sát cân bằng lực kéo nên vật đứng yên.`
    : `Vật trượt; lực ma sát ${Number(Math.abs(model.frictionForce).toFixed(2))} N hướng ngược chuyển động. Gia tốc tính từ hợp lực chia khối lượng.`,
  assumptions: ['Mặt phẳng ngang, lực kéo song song mặt phẳng.', 'Ma sát nghỉ tự điều chỉnh đến giới hạn μₛN; khi trượt dùng μₖN.', 'Bỏ qua lực cản không khí.']
};

export function mount(main, context) {
  return mountMechanicsSimulation(main, context, config);
}
