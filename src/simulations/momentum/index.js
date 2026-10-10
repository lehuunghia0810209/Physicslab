import { COLLISION_DEFAULTS, createCollision } from '../../core/momentum.js';
import { mountMechanicsSimulation } from '../mechanics-view.js';

const config = {
  id: 'momentum-collision',
  title: 'Động lượng và va chạm',
  subtitle: 'Quan sát va chạm một chiều và so sánh động lượng, động năng trước và sau va chạm.',
  grade: 10,
  kind: 'collision',
  sceneLabel: 'VA CHẠM MỘT CHIỀU',
  defaults: COLLISION_DEFAULTS,
  create: createCollision,
  parameters: [
    { key: 'mass1', label: 'Khối lượng vật 1', min: 0.5, max: 30, step: 0.5, unit: 'kg' },
    { key: 'mass2', label: 'Khối lượng vật 2', min: 0.5, max: 30, step: 0.5, unit: 'kg' },
    { key: 'velocity1', label: 'Vận tốc vật 1', min: -20, max: 20, step: 0.5, unit: 'm/s' },
    { key: 'velocity2', label: 'Vận tốc vật 2', min: -20, max: 20, step: 0.5, unit: 'm/s' },
    { key: 'restitution', label: 'Hệ số đàn hồi e', min: 0, max: 1, step: 0.05, unit: '' },
    { key: 'separation', label: 'Khoảng cách ban đầu', min: 2, max: 12, step: 0.5, unit: 'm' }
  ],
  readouts: [
    { key: 'v1', label: 'Vận tốc vật 1', unit: 'm/s' },
    { key: 'v2', label: 'Vận tốc vật 2', unit: 'm/s' },
    { key: 'momentum', label: 'Động lượng hệ', unit: 'kg·m/s' },
    { key: 'kineticEnergy', label: 'Động năng hệ', unit: 'J' },
    { key: 'x1', label: 'Vị trí vật 1', unit: 'm' },
    { key: 'x2', label: 'Vị trí vật 2', unit: 'm' }
  ],
  graphs: [
    { key: 'momentum', label: 'Động lượng hệ · p–t', unit: 'kg·m/s', role: 'teal' },
    { key: 'kineticEnergy', label: 'Động năng hệ · Eₖ–t', unit: 'J', role: 'blue' }
  ],
  graphHeading: 'Bảo toàn động lượng và biến thiên động năng',
  explain: model => model.approaching
    ? `Va chạm tại t = ${Number(model.collisionTime.toFixed(2))} s. Động lượng được bảo toàn; động năng chỉ bảo toàn khi e = 1.`
    : 'Hai vật không tiến lại gần nhau với các vận tốc hiện tại nên không xảy ra va chạm trong mô phỏng.',
  assumptions: ['Va chạm thẳng một chiều, thời gian va chạm coi như tức thời.', 'Hệ kín theo phương chuyển động nên tổng động lượng được bảo toàn.', 'Hệ số đàn hồi e nằm từ 0 (mềm) đến 1 (đàn hồi hoàn toàn).']
};

export function mount(main, context) {
  return mountMechanicsSimulation(main, context, config);
}
