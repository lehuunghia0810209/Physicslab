import { svg, path } from '../../engines/svg.js';
import { VectorRenderer } from '../../engines/vector.js';
import { format } from '../../core/units.js';
function nice(value) { const base = 10 ** Math.floor(Math.log10(value)); return [1, 2, 5, 10].find(n => n * base >= value) * base; }
export class ProjectileScene {
  constructor(container) {
    this.svg = svg('svg', { viewBox: '0 0 920 440', role: 'img', 'aria-label': 'Quỹ đạo ném xiên trên hệ tọa độ x ngang, y thẳng đứng; đơn vị mét.' });
    this.svg.classList.add('projectile-scene'); container.append(this.svg);
    this.grid = svg('g', { class: 'scene-grid' });
    this.comparison = svg('path', { class: 'comparison-path', 'aria-label': 'Đường ném tham chiếu' });
    this.prediction = svg('path', { class: 'predicted-path' }); this.trace = svg('path', { class: 'traced-path' });
    this.apex = svg('g', { class: 'apex-marker' }); this.ball = svg('circle', { class: 'projectile-ball', r: 7 });
    this.svg.append(this.grid, this.comparison, this.prediction, this.trace, this.apex, this.ball);
    this.vectors = new VectorRenderer(this.svg);
    // Direct launch-vector handle: physical v₀ and θ are still supplied by the validated model.
    this.aim = svg('g', { class: 'launch-aim-handle', tabindex: '0', role: 'slider', 'aria-label': 'Kéo đầu mũi tên để đổi vận tốc và góc phóng' });
    this.aimLine = svg('line', { class: 'launch-aim-line' });
    this.aimHit = svg('circle', { class: 'launch-aim-hit', r: 80 });
    this.aimPoint = svg('circle', { class: 'launch-aim-point', r: 14 });
    this.aimText = svg('text', { class: 'launch-aim-text', 'text-anchor': 'middle' }, 'KÉO');
    this.aim.append(this.aimLine, this.aimHit, this.aimPoint, this.aimText);
    this.svg.append(this.aim);
    this.options = { trajectory: true, velocity: true, components: true, grid: true };
  }
  setComparison(model = null) {
    this.compareModel = model;
    if (this.model) this.setModel(this.model);
  }
  setModel(model) {
    this.model = model;
    this.scale = Math.min(720 / Math.max(10, model.range, this.compareModel?.range || 0), 245 / Math.max(8, model.maxHeight, this.compareModel?.maxHeight || 0));
    this.position = p => [60 + p.x * this.scale, 350 - p.y * this.scale];
    const xmax = 780 / this.scale; const ymax = 260 / this.scale;
    this.grid.replaceChildren();
    for (let x = 0, step = nice(xmax / 6); x <= xmax; x += step) {
      const px = 60 + x * this.scale;
      this.grid.append(svg('line', { class: 'coordinate-grid', x1: px, x2: px, y1: 65, y2: 350 }), svg('text', { x: px, y: 375, 'text-anchor': 'middle' }, format(x, 0)));
    }
    for (let y = 0, step = nice(ymax / 4); y <= ymax; y += step) {
      const py = 350 - y * this.scale;
      this.grid.append(svg('line', { class: 'coordinate-grid', x1: 60, x2: 855, y1: py, y2: py }), svg('text', { x: 46, y: py + 4, 'text-anchor': 'end' }, format(y, 0)));
    }
    this.grid.append(svg('rect', { x: 60, y: 350, width: 795, height: 12, fill: '#d9e9e3' }), svg('path', { class: 'coordinate-axis', d: 'M60 65V350H855' }), svg('text', { x: 858, y: 374 }, 'x (m)'), svg('text', { x: 26, y: 52 }, 'y (m)'), svg('text', { x: 60, y: 405, class: 'scene-ground-label' }, 'MẶT ĐẤT · y = 0'));
    const points = model.sample(); this.prediction.setAttribute('d', path(points.map(this.position)));
    this.comparison.setAttribute('d', this.compareModel ? path(this.compareModel.sample().map(this.position)) : '');
    const [ax, ay] = this.position(model.at(model.apexTime));
    this.apex.replaceChildren(svg('circle', { cx: ax, cy: ay, r: 3 }), svg('text', { x: ax + 9, y: ay - 12 }, `H = ${format(model.maxHeight)} m`));
    this.launchOrigin = this.position({ x: 0, y: model.parameters.height });
    const launchLength = 30 + model.parameters.v0 * 2;
    const radians = model.parameters.angle * Math.PI / 180;
    const tipX = this.launchOrigin[0] + Math.cos(radians) * launchLength;
    const tipY = this.launchOrigin[1] - Math.sin(radians) * launchLength;
    this.aimLine.setAttribute('x1', this.launchOrigin[0]); this.aimLine.setAttribute('y1', this.launchOrigin[1]);
    this.aimLine.setAttribute('x2', tipX); this.aimLine.setAttribute('y2', tipY);
    this.aimHit.setAttribute('cx', tipX); this.aimHit.setAttribute('cy', tipY);
    this.aimPoint.setAttribute('cx', tipX); this.aimPoint.setAttribute('cy', tipY);
    this.aimText.setAttribute('x', tipX); this.aimText.setAttribute('y', tipY + 4);
    this.aim.setAttribute('aria-valuenow', String(model.parameters.v0));
    this.aim.setAttribute('aria-valuetext', `${model.parameters.v0} mét trên giây, góc ${model.parameters.angle} độ`);
    this.update(0);
  }
  update(time) {
    const p = this.model.at(time); const origin = this.position(p);
    this.ball.setAttribute('cx', origin[0]); this.ball.setAttribute('cy', origin[1]);
    this.trace.setAttribute('d', path(Array.from({ length: 101 }, (_, i) => this.position(this.model.at(p.t * i / 100)))));
    this.prediction.style.display = this.trace.style.display = this.apex.style.display = this.comparison.style.display = this.options.trajectory ? '' : 'none';
    this.grid.querySelectorAll('.coordinate-grid').forEach(el => { el.style.display = this.options.grid ? '' : 'none'; });
    this.vectors.render([
      { origin, magnitude: p.speed, direction: Math.atan2(p.vy, p.vx), label: 'v', scale: 1.1, role: 'velocity', visible: this.options.velocity },
      { origin, magnitude: Math.abs(p.vx), direction: p.vx >= 0 ? 0 : Math.PI, label: 'vₓ', scale: 1.1, role: 'horizontal', visible: this.options.components },
      { origin, magnitude: Math.abs(p.vy), direction: p.vy >= 0 ? Math.PI / 2 : -Math.PI / 2, label: 'vᵧ', scale: 1.1, role: 'vertical', visible: this.options.components }
    ]);
  }
}
