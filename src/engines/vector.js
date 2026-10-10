import { svg } from './svg.js';

// Shared screen-space renderer; direction uses physics coordinates (+y upward).
export class VectorRenderer {
  constructor(parent) { this.group = svg('g', { class: 'vectors' }); parent.append(this.group); }
  render(vectors) {
    this.group.replaceChildren();
    for (const { origin, magnitude, direction, label, scale = 1, role = 'velocity', visible = true } of vectors) {
      if (!visible || magnitude < 1e-8) continue;
      const dx = Math.cos(direction) * magnitude * scale;
      const dy = -Math.sin(direction) * magnitude * scale;
      const [x, y] = origin; const ex = x + dx; const ey = y + dy;
      const unitX = dx / Math.hypot(dx, dy); const unitY = dy / Math.hypot(dx, dy);
      const head = Math.min(8, Math.hypot(dx, dy) * 0.4);
      const g = svg('g', { class: `vector vector--${role}` });
      g.append(svg('line', { x1: x, y1: y, x2: ex, y2: ey }), svg('path', { d: `M${ex - unitX * head - unitY * head * 0.45},${ey - unitY * head + unitX * head * 0.45} L${ex},${ey} L${ex - unitX * head + unitY * head * 0.45},${ey - unitY * head - unitX * head * 0.45}` }), svg('text', { x: ex + 9, y: ey - 8 }, label));
      this.group.append(g);
    }
  }
}
