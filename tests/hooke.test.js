import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHookeExperiment, SPRINGS } from '../src/core/hooke.js';

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

test('Hooke law computes force extension and spring energy consistently', () => {
  const standard = createHookeExperiment({ springId: 'standard', mass: 1, gravity: 9.81 });
  near(standard.force, 9.81);
  near(standard.extension, 9.81 / 25);
  near(standard.energy, 0.5 * 25 * (9.81 / 25) ** 2);
  assert.equal(standard.springLabel, 'Lò xo chuẩn');
  assert.equal(standard.equilibrium, true);
});

test('Hooke law validation rejects invalid inputs and preserves spring selection', () => {
  assert.throws(() => createHookeExperiment({ springId: 'soft', mass: 0, gravity: 9.81 }));
  assert.throws(() => createHookeExperiment({ springId: 'missing', mass: 1, gravity: 0 }));
  assert.equal(SPRINGS[0].id, 'soft');
  assert.equal(createHookeExperiment({ springId: 'stiff', mass: 2, gravity: 9.81 }).springConstant, 40);
});

test('Hooke equilibrium uses a floating-point tolerance across valid setups', () => {
  for (const spring of SPRINGS) {
    for (let i = 1; i <= 30; i++) {
      for (const gravity of [1.62, 3.71, 9.81]) {
        const result = createHookeExperiment({ springId: spring.id, mass: i / 10, gravity });
        assert.equal(result.equilibrium, true, `Unexpected imbalance for ${spring.id}, m=${i / 10}, g=${gravity}`);
      }
    }
  }
});
