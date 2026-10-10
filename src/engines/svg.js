export const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attributes = {}, text = '') {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, value);
  if (text) el.textContent = text;
  return el;
}
export function path(points) { return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(3)},${y.toFixed(3)}`).join(' '); }
