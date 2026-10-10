import { createNewtonMotion } from './newton.js';
import { createHookeExperiment, SPRINGS } from './hooke.js';
import { createCircuit } from './circuits.js';
import { createTravelingWave } from './waves.js';
import { createThinLens } from './optics.js';
import { createIdealGas } from './ideal-gas.js';
import { createFrictionMotion } from './friction.js';
import { createWorkEnergyMotion } from './work-energy.js';
import { createCollision } from './momentum.js';
import { createOscillation } from './oscillation.js';
import { createElectromagneticModel } from './electromagnetism.js';
import { createProjectile } from './projectile.js';
import { createInclinedPlane } from './inclined.js';

export const LAB_EXPERIMENTS = Object.freeze([
  Object.freeze({
    id: 'newton-second-law', title: 'Định luật II Newton', description: 'Thay đổi lực kéo, đo gia tốc và kiểm tra a = Fnet/m.',
    apparatus: ['Xe lăn trên máng ngang', 'Cảm biến lực', 'Gia tốc kế'], xKey: 'netForce', xLabel: 'Fnet (N)', yKey: 'acceleration', yLabel: 'a (m/s²)',
    instruments: Object.freeze({ force: 'force-sensor', acceleration: 'accelerometer' }),
    axisInstruments: Object.freeze({ x: 'force', y: 'acceleration' }),
    parameters: Object.freeze([{ key: 'mass', label: 'Khối lượng', unit: 'kg', min: 1, max: 20, step: 0.5, value: 5 }, { key: 'force', label: 'Lực kéo', unit: 'N', min: 0, max: 80, step: 1, value: 30 }, { key: 'friction', label: 'Hệ số ma sát', unit: '', min: 0, max: 0.5, step: 0.01, value: 0.1 }, { key: 'gravity', label: 'Trọng trường', unit: 'm/s²', min: 1, max: 20, step: 0.1, value: 9.81 }]),
    measure: setup => {
      const model = createNewtonMotion(setup);
      const state = model.at(model.duration);
      return { x: state.netForce, y: state.acceleration, values: { force: Math.abs(setup.force), netForce: state.netForce, acceleration: state.acceleration, velocity: state.velocity } };
    }
  }),
  Object.freeze({
    id: 'hooke-law', title: 'Định luật Hooke', description: 'Thay đổi lực, đo độ dãn và xác định độ cứng lò xo từ độ dốc F–Δx.',
    apparatus: ['Giá treo lò xo', 'Bộ quả cân', 'Thước đo', 'Lực kế'], xKey: 'extension', xLabel: 'Δx (m)', yKey: 'force', yLabel: 'F (N)',
    instruments: Object.freeze({ extension: 'ruler', force: 'force-sensor' }),
    axisInstruments: Object.freeze({ x: 'extension', y: 'force' }),
    parameters: Object.freeze([{ key: 'springId', label: 'Lò xo', unit: '', type: 'select', options: SPRINGS.map(spring => ({ value: spring.id, label: `${spring.label} · ${spring.constant} N/m` })), value: 'standard' }, { key: 'force', label: 'Lực tác dụng', unit: 'N', min: 0.1, max: 29.4, step: 0.1, value: 5 }]),
    measure: setup => {
      const spring = SPRINGS.find(item => item.id === setup.springId);
      const sample = createHookeExperiment({ springId: spring.id, mass: setup.force / 9.81, gravity: 9.81 }).sample(setup.force);
      return { x: sample.extension, y: sample.force, values: { force: sample.force, extension: sample.extension, springConstant: spring.constant, elasticEnergy: 0.5 * spring.constant * sample.extension ** 2 } };
    }
  }),
  Object.freeze({
    id: 'ohms-law', title: 'Định luật Ohm', description: 'Thay đổi điện áp nguồn, đo U và I để xác định điện trở qua đồ thị I–U.',
    apparatus: ['Nguồn điện một chiều', 'Điện trở', 'Ampe kế', 'Vôn kế'], xKey: 'voltage', xLabel: 'U (V)', yKey: 'current', yLabel: 'I (A)',
    instruments: Object.freeze({ voltage: 'voltmeter', current: 'ammeter' }),
    axisInstruments: Object.freeze({ x: 'voltage', y: 'current' }),
    parameters: Object.freeze([{ key: 'voltage', label: 'Điện áp nguồn', unit: 'V', min: 0.5, max: 24, step: 0.5, value: 12 }, { key: 'resistance1', label: 'Điện trở R₁', unit: 'Ω', min: 1, max: 500, step: 1, value: 20 }, { key: 'resistance2', label: 'Điện trở R₂', unit: 'Ω', min: 1, max: 500, step: 1, value: 40 }, { key: 'topology', label: 'Cách mắc', unit: '', type: 'select', options: [{ value: 'series', label: 'Nối tiếp' }, { value: 'parallel', label: 'Song song' }], value: 'series' }]),
    measure: setup => {
      const model = createCircuit(setup);
      const state = model.at(setup.voltage);
      return { x: state.voltage, y: state.current, values: { voltage: state.voltage, current: state.current, current1: state.current1, current2: state.current2, equivalentResistance: state.equivalentResistance, power: state.power } };
    }
  }),
  Object.freeze({
    id: 'wave-speed', title: 'Đo tốc độ truyền sóng', description: 'Đo quãng đường truyền và thời gian tương ứng; xác định tốc độ từ độ dốc x–t.',
    apparatus: ['Dây đàn hồi', 'Nguồn rung', 'Thước đo quãng đường', 'Đồng hồ bấm giây'], xKey: 'travelTime', xLabel: 't (s)', yKey: 'distance', yLabel: 'd (m)',
    instruments: Object.freeze({ travelTime: 'stopwatch', distance: 'ruler' }),
    axisInstruments: Object.freeze({ x: 'travelTime', y: 'distance' }),
    parameters: Object.freeze([{ key: 'frequency', label: 'Tần số sóng', unit: 'Hz', min: 0.2, max: 5, step: 0.1, value: 2 }, { key: 'wavelength', label: 'Bước sóng', unit: 'm', min: 0.2, max: 8, step: 0.1, value: 3 }, { key: 'distance', label: 'Quãng đường truyền', unit: 'm', min: 0.5, max: 8, step: 0.1, value: 4 }]),
    measure: setup => {
      const model = createTravelingWave({ amplitude: 0.5, frequency: setup.frequency, wavelength: setup.wavelength, phase: 0 });
      const travelTime = setup.distance / model.speed;
      return { x: travelTime, y: setup.distance, values: { frequency: model.parameters.frequency, wavelength: model.parameters.wavelength, speed: model.speed, period: model.period, travelTime, distance: setup.distance } };
    }
  }),
  Object.freeze({
    id: 'thin-lens', title: 'Dựng ảnh qua thấu kính', description: 'Thay đổi khoảng cách vật và đo khoảng cách ảnh, độ phóng đại.',
    fit: false,
    apparatus: ['Nguồn sáng', 'Vật sáng', 'Thấu kính hội tụ', 'Màn ảnh', 'Thước đo'], xKey: 'objectDistance', xLabel: 'dₒ (m)', yKey: 'imageDistance', yLabel: 'dᵢ (m)',
    instruments: Object.freeze({ objectDistance: 'ruler', imageDistance: 'ruler' }),
    axisInstruments: Object.freeze({ x: 'objectDistance', y: 'imageDistance' }),
    parameters: Object.freeze([{ key: 'focalLength', label: 'Tiêu cự', unit: 'm', min: 0.02, max: 1, step: 0.01, value: 0.1 }, { key: 'objectDistance', label: 'Khoảng cách vật', unit: 'm', min: 0.02, max: 2, step: 0.01, value: 0.3 }, { key: 'objectHeight', label: 'Chiều cao vật', unit: 'm', min: 0.01, max: 0.5, step: 0.01, value: 0.05 }]),
    measure: setup => {
      const model = createThinLens(setup);
      const state = model.at(setup.objectDistance);
      if (state.imageDistance === null) throw new RangeError('Ảnh ở vô cực: không thể đo trên thước hữu hạn.');
      return { x: state.objectDistance, y: state.imageDistance, values: { objectDistance: state.objectDistance, imageDistance: state.imageDistance, magnification: state.magnification, imageHeight: state.imageHeight, imageType: state.imageType } };
    }
  }),
  Object.freeze({
    id: 'gas-law', title: 'Định luật khí lí tưởng', description: 'Thay đổi thể tích ở nhiệt độ không đổi, đo áp suất và kiểm chứng PV = nRT.',
    fit: false,
    apparatus: ['Xi lanh có piston', 'Khí lí tưởng', 'Cảm biến áp suất', 'Nhiệt kế'], xKey: 'volume', xLabel: 'V (m³)', yKey: 'pressure', yLabel: 'P (Pa)',
    instruments: Object.freeze({ pressure: 'pressure-sensor', volume: 'volume-sensor', temperature: 'thermometer' }),
    axisInstruments: Object.freeze({ x: 'volume', y: 'pressure' }),
    parameters: Object.freeze([{ key: 'amount', label: 'Lượng khí', unit: 'mol', min: 0.1, max: 5, step: 0.1, value: 1 }, { key: 'initialVolume', label: 'Thể tích đầu', unit: 'm³', min: 0.005, max: 0.2, step: 0.001, value: 0.02 }, { key: 'finalVolume', label: 'Thể tích cuối', unit: 'm³', min: 0.005, max: 0.5, step: 0.001, value: 0.04 }, { key: 'initialTemperature', label: 'Nhiệt độ', unit: 'K', min: 100, max: 800, step: 5, value: 300 }]),
    measure: setup => {
      const model = createIdealGas({ ...setup, finalTemperature: setup.initialTemperature, process: 'isothermal' });
      const state = model.at(model.duration * 0.5);
      return { x: state.volume, y: state.pressure, values: { amount: state.amount, volume: state.volume, pressure: state.pressure, temperature: state.temperature, pv: state.pressure * state.volume } };
    }
  }),
  Object.freeze({
    id: 'friction', title: 'Khảo sát lực ma sát', description: 'Thay đổi lực kéo, đo lực ma sát và xác định ngưỡng trượt.',
    fit: false,
    apparatus: ['Xe lăn', 'Mặt tiếp xúc có thể thay đổi', 'Cảm biến lực', 'Gia tốc kế'], xKey: 'force', xLabel: 'F kéo (N)', yKey: 'frictionForce', yLabel: 'F ma sát (N)',
    instruments: Object.freeze({ force: 'force-sensor', frictionForce: 'force-sensor' }),
    axisInstruments: Object.freeze({ x: 'force', y: 'frictionForce' }),
    parameters: Object.freeze([{ key: 'mass', label: 'Khối lượng', unit: 'kg', min: 1, max: 20, step: 0.5, value: 5 }, { key: 'force', label: 'Lực kéo', unit: 'N', min: 0, max: 80, step: 1, value: 22 }, { key: 'staticCoefficient', label: 'Hệ số ma sát nghỉ', unit: '', min: 0.05, max: 1, step: 0.01, value: 0.4 }, { key: 'kineticCoefficient', label: 'Hệ số ma sát trượt', unit: '', min: 0.01, max: 0.8, step: 0.01, value: 0.25 }, { key: 'gravity', label: 'Trọng trường', unit: 'm/s²', min: 1, max: 20, step: 0.1, value: 9.81 }]),
    measure: setup => {
      const model = createFrictionMotion(setup);
      const state = model.at(model.duration);
      return { x: setup.force, y: state.frictionForce, values: { normalForce: state.normalForce, staticFrictionLimit: state.staticFrictionLimit, frictionForce: state.frictionForce, netForce: state.netForce, acceleration: state.acceleration, frictionWork: state.frictionWork } };
    }
  }),
  Object.freeze({
    id: 'work-energy', title: 'Công và định lý công–động năng', description: 'Thay đổi quãng đường, đo tổng công và đối chiếu độ biến thiên động năng.',
    apparatus: ['Xe trượt', 'Lực kế', 'Thước dây 30 m', 'Máy đo công'], xKey: 'position', xLabel: 'd (m)', yKey: 'netWork', yLabel: 'W tổng (J)',
    instruments: Object.freeze({ position: 'distance-tape', netWork: 'energy-meter' }),
    axisInstruments: Object.freeze({ x: 'position', y: 'netWork' }),
    parameters: Object.freeze([{ key: 'mass', label: 'Khối lượng', unit: 'kg', min: 1, max: 20, step: 0.5, value: 4 }, { key: 'force', label: 'Lực kéo', unit: 'N', min: 0, max: 100, step: 1, value: 24 }, { key: 'distance', label: 'Quãng đường', unit: 'm', min: 1, max: 30, step: 0.5, value: 12 }, { key: 'angle', label: 'Góc lực', unit: '°', min: 0, max: 90, step: 1, value: 0 }, { key: 'friction', label: 'Hệ số ma sát', unit: '', min: 0, max: 1, step: 0.01, value: 0.15 }, { key: 'initialSpeed', label: 'Tốc độ đầu', unit: 'm/s', min: 0, max: 20, step: 0.5, value: 2 }, { key: 'gravity', label: 'Trọng trường', unit: 'm/s²', min: 1, max: 20, step: 0.1, value: 9.81 }]),
    measure: setup => {
      const model = createWorkEnergyMotion(setup);
      const state = model.at(model.duration);
      return { x: state.position, y: state.netWork, values: { appliedWork: state.appliedWork, frictionWork: state.frictionWork, netWork: state.netWork, kineticEnergy: state.kineticEnergy, energyChange: state.energyChange, velocity: state.velocity } };
    }
  }),
  Object.freeze({
    id: 'momentum-collision', title: 'Bảo toàn động lượng khi va chạm', description: 'Thay đổi khối lượng và vận tốc, so sánh tổng động lượng trước và sau va chạm.',
    apparatus: ['Hai xe đệm lò xo', 'Cân', 'Cảm biến vận tốc', 'Bộ phân tích động lượng'], xKey: 'momentumBefore', xLabel: 'p trước (kg·m/s)', yKey: 'momentumAfter', yLabel: 'p sau (kg·m/s)',
    instruments: Object.freeze({ momentumBefore: 'momentum-analyzer', momentumAfter: 'momentum-analyzer' }),
    axisInstruments: Object.freeze({ x: 'momentumBefore', y: 'momentumAfter' }),
    parameters: Object.freeze([{ key: 'mass1', label: 'Khối lượng xe 1', unit: 'kg', min: 0.5, max: 20, step: 0.5, value: 2 }, { key: 'mass2', label: 'Khối lượng xe 2', unit: 'kg', min: 0.5, max: 20, step: 0.5, value: 3 }, { key: 'velocity1', label: 'Vận tốc xe 1', unit: 'm/s', min: -20, max: 20, step: 0.5, value: 4 }, { key: 'velocity2', label: 'Vận tốc xe 2', unit: 'm/s', min: -20, max: 20, step: 0.5, value: 0 }, { key: 'restitution', label: 'Hệ số đàn hồi', unit: '', min: 0, max: 1, step: 0.05, value: 0.8 }, { key: 'separation', label: 'Khoảng cách ban đầu', unit: 'm', min: 2, max: 12, step: 0.5, value: 6 }]),
    measure: setup => {
      const model = createCollision(setup);
      const state = model.at(model.duration);
      return { x: state.momentumBefore, y: state.momentum, values: { kineticBefore: state.kineticBefore, kineticEnergy: state.kineticEnergy, momentumBefore: state.momentumBefore, momentumAfter: state.momentum, velocity1After: state.velocity1After, velocity2After: state.velocity2After } };
    }
  }),
  Object.freeze({
    id: 'spring-oscillation', title: 'Dao động điều hòa của lò xo', description: 'Đo gia tốc và li độ, kiểm tra a = −ω²x và xác định chu kỳ dao động.',
    apparatus: ['Lò xo', 'Vật nặng', 'Thước đo', 'Gia tốc kế', 'Đồng hồ bấm giây'], xKey: 'position', xLabel: 'x (m)', yKey: 'acceleration', yLabel: 'a (m/s²)',
    instruments: Object.freeze({ position: 'ruler', acceleration: 'accelerometer' }),
    axisInstruments: Object.freeze({ x: 'position', y: 'acceleration' }),
    parameters: Object.freeze([{ key: 'mass', label: 'Khối lượng', unit: 'kg', min: 0.5, max: 20, step: 0.5, value: 1 }, { key: 'stiffness', label: 'Độ cứng lò xo', unit: 'N/m', min: 1, max: 200, step: 1, value: 16 }, { key: 'amplitude', label: 'Biên độ', unit: 'm', min: 0.05, max: 2, step: 0.05, value: 0.5 }, { key: 'phase', label: 'Pha ban đầu', unit: '°', min: -180, max: 180, step: 5, value: 0 }]),
    measure: setup => {
      const model = createOscillation(setup);
      const state = model.at(0);
      return { x: state.position, y: state.acceleration, values: { position: state.position, acceleration: state.acceleration, velocity: state.velocity, period: state.period, kineticEnergy: state.kineticEnergy, potentialEnergy: state.potentialEnergy } };
    }
  }),
  Object.freeze({
    id: 'wave-interference', title: 'Giao thoa hai sóng', description: 'Thay đổi độ lệch pha, đo li độ tổng và tìm điều kiện giao thoa triệt tiêu.',
    fit: false,
    apparatus: ['Hai nguồn sóng kết hợp', 'Dây đàn hồi', 'Thước đo', 'Thước đo pha'], xKey: 'phaseDifference', xLabel: 'Δφ (°)', yKey: 'displacement', yLabel: 'Li độ tổng (m)',
    instruments: Object.freeze({ phaseDifference: 'protractor', displacement: 'ruler' }),
    axisInstruments: Object.freeze({ x: 'phaseDifference', y: 'displacement' }),
    parameters: Object.freeze([{ key: 'amplitude', label: 'Biên độ mỗi sóng', unit: 'm', min: 0.05, max: 1, step: 0.05, value: 0.5 }, { key: 'frequency', label: 'Tần số', unit: 'Hz', min: 0.2, max: 10, step: 0.1, value: 1.5 }, { key: 'wavelength', label: 'Bước sóng', unit: 'm', min: 0.2, max: 20, step: 0.1, value: 4 }, { key: 'phaseDifference', label: 'Độ lệch pha', unit: '°', min: -180, max: 180, step: 5, value: 0 }]),
    measure: setup => {
      const model = createTravelingWave({ ...setup, phase: 0, mode: 'interference' });
      const state = model.at(0);
      return { x: setup.phaseDifference, y: state.displacement, values: { phaseDifference: setup.phaseDifference, displacement: state.displacement, frequency: state.frequency, wavelength: state.wavelength, speed: state.speed } };
    }
  }),
  Object.freeze({
    id: 'lorentz-force', title: 'Lực Lorentz lên hạt tích điện', description: 'Thay đổi cảm ứng từ và đo lực từ, kiểm tra F = |q|vB sinθ.',
    apparatus: ['Nguồn hạt tích điện', 'Nam châm điện', 'Đầu dò từ trường', 'Cảm biến lực'], xKey: 'magneticField', xLabel: 'B (T)', yKey: 'force', yLabel: 'F (N)',
    instruments: Object.freeze({ magneticField: 'magnetic-field-sensor', force: 'force-sensor' }),
    axisInstruments: Object.freeze({ x: 'magneticField', y: 'force' }),
    parameters: Object.freeze([{ key: 'charge', label: 'Điện tích', unit: 'C', min: 0.1, max: 10, step: 0.1, value: 1 }, { key: 'mass', label: 'Khối lượng hạt', unit: 'kg', min: 0.1, max: 20, step: 0.1, value: 1 }, { key: 'speed', label: 'Tốc độ', unit: 'm/s', min: 0, max: 50, step: 1, value: 8 }, { key: 'magneticField', label: 'Cảm ứng từ', unit: 'T', min: 0.05, max: 2, step: 0.05, value: 0.5 }, { key: 'pitchAngle', label: 'Góc với từ trường', unit: '°', min: 0, max: 90, step: 1, value: 90 }]),
    measure: setup => {
      const model = createElectromagneticModel({ ...setup, mode: 'lorentz' });
      const state = model.at(model.duration / 4);
      return { x: setup.magneticField, y: Math.abs(state.force), values: { force: state.force, radius: state.radius, angularFrequency: state.angularFrequency, period: state.period, speed: state.speed } };
    }
  }),
  Object.freeze({
    id: 'electromagnetic-induction', title: 'Suất điện động cảm ứng', description: 'Thay đổi tần số từ thông, đo suất điện động cảm ứng theo định luật Faraday.',
    apparatus: ['Cuộn dây', 'Từ trường xoay chiều', 'Vôn kế', 'Bộ đo tần số'], xKey: 'frequency', xLabel: 'f (Hz)', yKey: 'emf', yLabel: 'ε (V)',
    instruments: Object.freeze({ frequency: 'frequency-counter', emf: 'voltmeter' }),
    axisInstruments: Object.freeze({ x: 'frequency', y: 'emf' }),
    parameters: Object.freeze([{ key: 'turns', label: 'Số vòng dây', unit: '', min: 10, max: 500, step: 10, value: 100 }, { key: 'area', label: 'Diện tích cuộn dây', unit: 'm²', min: 0.0001, max: 0.005, step: 0.0001, value: 0.002 }, { key: 'frequency', label: 'Tần số từ thông', unit: 'Hz', min: 0.1, max: 5, step: 0.1, value: 1 }, { key: 'resistance', label: 'Điện trở mạch', unit: 'Ω', min: 1, max: 1000, step: 1, value: 10 }, { key: 'magneticField', label: 'Cảm ứng từ cực đại', unit: 'T', min: 0.01, max: 1, step: 0.01, value: 0.5 }]),
    measure: setup => {
      const model = createElectromagneticModel({ ...setup, mode: 'induction' });
      const state = model.at(model.period / 4);
      return { x: setup.frequency, y: state.emf, values: { frequency: setup.frequency, emf: state.emf, current: state.current, flux: state.flux, period: state.period } };
    }
  }),
  Object.freeze({
    id: 'projectile-motion', title: 'Tầm xa theo góc phóng', description: 'Thay đổi góc phóng, đo tầm xa và đối chiếu quỹ đạo ném xiên.',
    fit: false,
    apparatus: ['Máy phóng', 'Thước đo góc', 'Cổng quang', 'Thước dây'], xKey: 'angle', xLabel: 'θ (°)', yKey: 'range', yLabel: 'R (m)',
    instruments: Object.freeze({ angle: 'protractor', range: 'distance-tape' }),
    axisInstruments: Object.freeze({ x: 'angle', y: 'range' }),
    parameters: Object.freeze([{ key: 'v0', label: 'Vận tốc ban đầu', unit: 'm/s', min: 1, max: 8, step: 0.5, value: 6 }, { key: 'angle', label: 'Góc phóng', unit: '°', min: 10, max: 80, step: 1, value: 45 }, { key: 'height', label: 'Độ cao đầu', unit: 'm', min: 0, max: 10, step: 0.5, value: 0 }, { key: 'g', label: 'Trọng trường', unit: 'm/s²', min: 5, max: 20, step: 0.1, value: 9.81 }]),
    measure: setup => {
      const model = createProjectile(setup);
      const state = model.at(model.duration);
      return { x: setup.angle, y: state.x, values: { flightTime: model.duration, range: model.range, maxHeight: model.maxHeight, landingSpeed: state.speed } };
    }
  }),
  Object.freeze({
    id: 'inclined-plane', title: 'Gia tốc trên mặt phẳng nghiêng', description: 'Thay đổi góc nghiêng, đo gia tốc của vật dọc theo mặt phẳng.',
    fit: false,
    apparatus: ['Máng nghiêng điều chỉnh được', 'Xe lăn', 'Thước đo góc', 'Gia tốc kế'], xKey: 'angle', xLabel: 'θ (°)', yKey: 'acceleration', yLabel: 'a (m/s²)',
    instruments: Object.freeze({ angle: 'protractor', acceleration: 'accelerometer' }),
    axisInstruments: Object.freeze({ x: 'angle', y: 'acceleration' }),
    parameters: Object.freeze([{ key: 'angle', label: 'Góc nghiêng', unit: '°', min: 5, max: 80, step: 1, value: 35 }, { key: 'mass', label: 'Khối lượng', unit: 'kg', min: 0.5, max: 20, step: 0.5, value: 4 }, { key: 'gravity', label: 'Trọng trường', unit: 'm/s²', min: 5, max: 20, step: 0.1, value: 9.81 }, { key: 'mu', label: 'Hệ số ma sát', unit: '', min: 0, max: 1.2, step: 0.01, value: 0.25 }]),
    measure: setup => {
      const model = createInclinedPlane(setup);
      return { x: setup.angle, y: model.acceleration, values: { acceleration: model.acceleration, normalForce: model.normal, frictionForce: model.friction, netForce: model.netForce, moving: Number(model.moving) } };
    }
  })
]);

export function getLabExperiment(id) {
  const experiment = LAB_EXPERIMENTS.find(item => item.id === id);
  if (!experiment) throw new RangeError(`Không tìm thấy thí nghiệm “${id}”.`);
  return experiment;
}

export function defaultLabSetup(id) {
  const experiment = getLabExperiment(id);
  return Object.fromEntries(experiment.parameters.map(parameter => [parameter.key, parameter.value]));
}

export function measureLabExperiment(id, input) {
  const experiment = getLabExperiment(id);
  if (!input || typeof input !== 'object') throw new TypeError('Thiếu thông số thí nghiệm.');
  const setup = Object.fromEntries(experiment.parameters.map(parameter => {
    const value = input[parameter.key] ?? parameter.value;
    return [parameter.key, parameter.type === 'select' ? value : Number(value)];
  }));
  const result = experiment.measure(setup);
  if (!Number.isFinite(result.x) || !Number.isFinite(result.y) || !Object.values(result.values).filter(value => typeof value === 'number').every(Number.isFinite)) {
    throw new RangeError('Phép đo tạo ra giá trị không hữu hạn.');
  }
  return Object.freeze({
    experimentId: id, title: experiment.title, xKey: experiment.xKey, xLabel: experiment.xLabel,
    yKey: experiment.yKey, yLabel: experiment.yLabel, x: result.x, y: result.y,
    values: Object.freeze(result.values), setup: Object.freeze(setup)
  });
}
