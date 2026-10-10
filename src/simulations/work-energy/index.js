import { WORK_ENERGY_DEFAULTS, createWorkEnergyMotion } from '../../core/work-energy.js';
import { mountMechanicsSimulation } from '../mechanics-view.js';

const config = {
  id: 'work-energy',
  title: 'Công và động năng',
  subtitle: 'Theo dõi công của lực kéo, công của ma sát và sự biến đổi động năng.',
  grade: 10,
  kind: 'work',
  sceneLabel: 'CÔNG CỦA LỰC TRÊN MẶT PHẲNG',
  defaults: WORK_ENERGY_DEFAULTS,
  create: createWorkEnergyMotion,
  parameters: [
    { key: 'mass', label: 'Khối lượng', min: 0.5, max: 30, step: 0.5, unit: 'kg' },
    { key: 'force', label: 'Độ lớn lực kéo', min: 0, max: 100, step: 1, unit: 'N' },
    { key: 'distance', label: 'Quãng đường khảo sát', min: 0.5, max: 30, step: 0.5, unit: 'm' },
    { key: 'angle', label: 'Góc với chuyển dời', min: 0, max: 90, step: 1, unit: '°' },
    { key: 'friction', label: 'Hệ số ma sát', min: 0, max: 1, step: 0.05, unit: '' },
    { key: 'initialSpeed', label: 'Tốc độ ban đầu', min: 0, max: 20, step: 0.5, unit: 'm/s' }
  ],
  readouts: [
    { key: 'appliedWork', label: 'Công lực kéo', unit: 'J' },
    { key: 'frictionWork', label: 'Công ma sát', unit: 'J' },
    { key: 'netWork', label: 'Công tổng', unit: 'J' },
    { key: 'kineticEnergy', label: 'Động năng', unit: 'J' },
    { key: 'velocity', label: 'Tốc độ', unit: 'm/s' },
    { key: 'position', label: 'Độ dời', unit: 'm' }
  ],
  graphs: [
    { key: 'appliedWork', label: 'Công lực kéo · W–t', unit: 'J', role: 'teal' },
    { key: 'kineticEnergy', label: 'Động năng · Eₖ–t', unit: 'J', role: 'blue' }
  ],
  graphHeading: 'Công và biến đổi năng lượng',
  explain: model => `Wnet = ΔEₖ = ${Number(model.at(model.duration).energyChange.toFixed(2))} J. Lực song song chuyển dời bằng F cos θ; công ma sát âm.`,
  assumptions: ['Lực kéo hợp với chuyển dời góc θ không đổi.', 'Mặt phẳng ngang, lực kéo hướng lên góc θ; N = mg − F sinθ và lực ma sát trượt có độ lớn μN.', 'Tốc độ không âm; mô hình dùng cùng hệ số cho ngưỡng ma sát nghỉ và ma sát trượt. Nếu lực kéo làm vật rời mặt phẳng, cấu hình không hợp lệ.']
};

export function mount(main, context) {
  return mountMechanicsSimulation(main, context, config);
}
