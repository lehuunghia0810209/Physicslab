import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHookeWorkspace, EQUIPMENT_CATALOG, getEquipment, measureWithInstrument, readInstrument } from '../src/core/equipment.js';

test('Reusable Hooke workspace assembles compatible apparatus and measuring instruments', () => {
  const workspace = createHookeWorkspace({
    springId: 'standard', mass: 0.5, gravity: 9.81,
    rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.01n'
  });
  assert.equal(workspace.equipment.length, 5);
  assert.equal(workspace.experiment.springConstant, 25);
  assert.equal(workspace.ruler.type, 'ruler');
  assert.equal(workspace.forceSensor.type, 'force-sensor');
  assert.ok(EQUIPMENT_CATALOG.some(item => item.id === 'spring-standard'));
});

test('Instrument readings quantize to resolution and reject invalid range or device types', () => {
  assert.equal(readInstrument('ruler-1mm', 0.1962), 0.196);
  assert.equal(readInstrument('ruler-0.1mm', 0.1962), 0.1962);
  assert.equal(readInstrument('force-sensor-0.01n', 4.905), 4.91);
  assert.equal(readInstrument('force-sensor-0.01n', 81), 81);
  assert.throws(() => readInstrument('force-sensor-0.01n', 101), RangeError);
  assert.throws(() => readInstrument('stand', 1), TypeError);
  assert.throws(() => getEquipment('unknown'), RangeError);
});

test('Workspace rejects incompatible measurement equipment', () => {
  assert.throws(() => createHookeWorkspace({
    springId: 'standard', mass: 0.5, gravity: 9.81,
    rulerId: 'stand', forceGaugeId: 'force-sensor-0.01n'
  }), TypeError);
});

test('Reusable measurement instruments expose quantified readings and uncertainty', () => {
  const volts = measureWithInstrument('voltmeter-0.01v', 12.347);
  assert.equal(volts.value, 12.35);
  assert.equal(volts.uncertainty, 0.005);
  assert.equal(volts.unit, 'V');
  assert.equal(readInstrument('thermometer-0.1k', 300.06), 300.1);
  assert.equal(readInstrument('volume-sensor-0.0001m3', 0.02004), 0.02);
  assert.equal(readInstrument('stopwatch-0.01s', 1.237), 1.24);
  assert.throws(() => readInstrument('thermometer-0.1k', 2200), RangeError);
});

test('Hooke workspace respects persisted forceGaugeId and legacy forceSensorId', () => {
  const input = { springId: 'standard', mass: 0.5, gravity: 9.81, rulerId: 'ruler-1mm' };
  assert.equal(createHookeWorkspace({ ...input, forceGaugeId: 'force-sensor-0.001n' }).forceSensor.id, 'force-sensor-0.001n');
  assert.equal(createHookeWorkspace({ ...input, forceSensorId: 'force-sensor-0.001n' }).forceSensor.id, 'force-sensor-0.001n');
  assert.throws(() => createHookeWorkspace({ ...input, forceGaugeId: 'stand' }), TypeError);
});

test('Hooke table restoration discards partial records and invalid instruments', async () => {
  const { sanitizeHookeMeasurements } = await import('../src/core/equipment.js');
  const valid = { mass: 0.5, force: 4.9, extension: 0.196, springConstant: 25,
    rulerId: 'ruler-1mm', forceGaugeId: 'force-sensor-0.001n' };
  const restored = sanitizeHookeMeasurements([
    { title: 'Incomplete row' }, null, { ...valid, force: NaN },
    { ...valid, rulerId: 'stand' }, { ...valid, extension: undefined },
    valid,
    { mass: 0.7, force: 6.86, extension: 0.2744, springConstant: 25 }
  ], { rulerId: 'ruler-0.1mm', forceGaugeId: 'force-sensor-0.01n' });
  assert.equal(restored.length, 2);
  assert.equal(restored[0].forceGaugeId, 'force-sensor-0.001n');
  assert.equal(restored[1].forceGaugeId, 'force-sensor-0.01n');
  assert.equal(restored[1].rulerId, 'ruler-0.1mm');
});
