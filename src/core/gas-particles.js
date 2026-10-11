// A deterministic, explicitly illustrative kinetic view. Gas pressure/temperature
// are ALWAYS calculated by ideal-gas.js, never inferred from these tracer dots.
const fractional = value => value - Math.floor(value);
const bounce = value => 1 - Math.abs(2 * fractional(value) - 1);
export function particlePositions({ time = 0, temperature = 300, count = 28 } = {}) {
  if (![time, temperature].every(Number.isFinite) || time < 0 || temperature <= 0 || !Number.isInteger(count) || count < 1 || count > 100) throw new RangeError('Trạng thái hạt minh họa không hợp lệ.');
  const thermalSpeed = Math.sqrt(temperature / 300);
  return Array.from({ length: count }, (_, i) => {
    const seedX = fractional(Math.sin((i + 1) * 127.1) * 43758.5453);
    const seedY = fractional(Math.sin((i + 1) * 311.7) * 12578.8217);
    const direction = 2 * Math.PI * fractional(Math.sin((i + 3) * 58.87) * 23432.774);
    const speed = (0.15 + (i % 7) * 0.024) * thermalSpeed;
    return {
      x: 0.06 + 0.88 * bounce(seedX + Math.cos(direction) * speed * time),
      y: 0.08 + 0.84 * bounce(seedY + Math.sin(direction) * speed * time),
      radius: 3.8 + (i % 3) * 0.55
    };
  });
}
