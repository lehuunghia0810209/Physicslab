import test from 'node:test';
import assert from 'node:assert/strict';
import { BENCH_PARTS, makeBenchPreset, sanitizeBench, solveBench } from '../src/core/circuit-workbench.js';
const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `expected ${expected}, got ${actual}`);

test('series: Kirchhoff/Ohm, closed switch, source power and wire flows', () => {
  const solved = solveBench(makeBenchPreset('series'));
  assert.equal(solved.status, 'running');
  close(solved.totalCurrent, .75);
  close(solved.totalPower, 6.75);
  close(solved.voltages.den, 9);
  close(solved.currents.den, .75);
  close(solved.currents.pin, -.75);
  for (const wire of Object.values(solved.wireCurrents)) close(Math.abs(wire), .75);
});
test('parallel: both bulbs get source voltage; source current is sum', () => {
  const solved = solveBench(makeBenchPreset('parallel'));
  assert.equal(solved.status, 'running');
  close(solved.totalCurrent, 1.5);
  close(Math.abs(solved.currents.den1), .75);
  close(Math.abs(solved.currents.den2), .75);
  close(Math.abs(solved.voltages.den1), 9);
  close(Math.abs(solved.voltages.den2), 9);
});
test('opening switch interrupts circuit; closed bulb receives zero power', () => {
  const bench = makeBenchPreset('series');
  bench.components.find(x => x.type === 'switch').closed = false;
  const solved = solveBench(bench);
  assert.equal(solved.status, 'open');
  close(solved.totalCurrent, 0);
  close(solved.powers.den, 0);
});
test('direct short across ideal battery triggers warning, never Infinity/NaN', () => {
  const bench = makeBenchPreset('empty');
  bench.components = [{ id: 'bat', type: 'battery', x: 200, y: 200, value: 9, rotation: 0 }];
  bench.wires = [{ id: 'short', a: 'bat:a', b: 'bat:b' }];
  const solved = solveBench(bench);
  assert.equal(solved.status, 'short');
  assert.equal(solved.totalCurrent, 0);
  assert.ok(!Object.values(solved.currents).some(v => !Number.isFinite(v)));
});
test('finite internal resistance of A and V instruments', () => {
  const bench = makeBenchPreset('series');
  bench.components.push({ id: 'meter', type: 'ammeter', x: 550, y: 250, rotation: 0, value: .02 });
  bench.wires = bench.wires.filter(w => w.id !== 'w2');
  bench.wires.push({ id: 'wa', a: 'k:b', b: 'meter:a' }, { id: 'wb', a: 'meter:b', b: 'den:a' });
  const solved = solveBench(bench);
  assert.equal(solved.status, 'running');
  close(solved.totalCurrent, 9 / 12.02);
  close(Math.abs(solved.currents.meter), 9 / 12.02);
  bench.components.push({ id: 'voltmeter', type: 'voltmeter', x: 650, y: 450, rotation: 0, value: 1e7 });
  bench.wires.push({ id: 'vc', a: 'voltmeter:a', b: 'den:a' }, { id: 'vd', a: 'voltmeter:b', b: 'den:b' });
  const withVoltmeter = solveBench(bench);
  assert.equal(withVoltmeter.status, 'running');
  close(Math.abs(withVoltmeter.voltages.voltmeter), Math.abs(withVoltmeter.voltages.den), 1e-6);
  assert.ok(Math.abs(withVoltmeter.currents.voltmeter) < .000001);
});
test('voltage source conflicts cannot return bogus currents', () => {
  const bench = { components: [
    { id: 'bat1', type: 'battery', x: 100, y: 100, rotation: 0, value: 9 },
    { id: 'bat2', type: 'battery', x: 400, y: 100, rotation: 0, value: 12 }
  ], wires: [{ id: 'a', a: 'bat1:a', b: 'bat2:a' }, { id: 'b', a: 'bat1:b', b: 'bat2:b' }] };
  assert.equal(solveBench(bench).status, 'conflict');
});
test('malformed stored circuits are ignored or bounded', () => {
  const input = { components: [{ id: '<hack>', type: 'battery', x: 20, y: -300 },
    { id: 'bat', type: 'battery', x: -100, y: 900, value: Infinity },
    { id: 'bat', type: 'battery' },
    { id: 'r', type: 'resistor', x: 400, y: 200, value: -2 }],
    wires: [{ id: 'bad', a: 'bat:a', b: 'unknown:b' }, { id: 'good', a: 'bat:a', b: 'r:a' }] };
  const clean = sanitizeBench(input);
  assert.equal(clean.components.length, 2);
  assert.equal(clean.wires.length, 1);
  assert.equal(clean.components[0].x, 65);
  assert.equal(clean.components[0].y, 490);
  assert.equal(clean.components[0].value, BENCH_PARTS.battery.defaultValue);
  assert.equal(clean.components[1].value, 1);
});
test('components unpowered without battery never produce current', () => {
  const bench = makeBenchPreset('empty');
  bench.components.push({ id: 'r1', type: 'resistor', value: 10, x: 200, y: 200 });
  const solved = solveBench(bench);
  assert.equal(solved.status, 'no-source');
  close(solved.currents.r1, 0);
});
test('floating spur connected only at one end cannot drain current', () => {
  const bench = makeBenchPreset('series');
  bench.components.push({ id: 'spur', type: 'resistor', value: 17, x: 650, y: 160 });
  bench.wires.push({ id: 'w99', a: 'spur:a', b: 'den:a' });
  const solved = solveBench(bench);
  assert.equal(solved.status, 'running');
  close(solved.totalCurrent, .75);
  close(solved.currents.spur, 0);
});
