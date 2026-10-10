import { svg, path } from './svg.js';
import { format } from '../core/units.js';

// Arbitrary time series: pass a model with at(t), duration, and sample().
export class GraphRenderer {
  constructor(container, { key, label, unit, role = 'teal', xKey = 't', xLabel = 't (s)' }) {
    this.key = key; this.unit = unit; this.xKey = xKey; this.xLabel = xLabel;
    container.innerHTML = `<div class="graph-title"><h3>${label}</h3><span>${unit}</span></div>`;
    this.svg = svg('svg', { viewBox: '0 0 400 170', role: 'img', 'aria-label': `Đồ thị ${label}, đơn vị ${unit}` });
    this.svg.classList.add('graph-svg', `graph--${role}`); container.append(this.svg);
    this.live = document.createElement('p'); this.live.className = 'graph-value'; container.append(this.live);
  }
  setModel(model) {
    this.model = model; const data = model.sample(120); const values = data.map(p => p[this.key]);
    const min = Math.min(0, ...values); const max = Math.max(0, ...values);
    const span = max - min || 1; this.low = min - span * 0.12; this.high = max + span * 0.12;
    this.xMin = Math.min(...data.map(point => point[this.xKey]));
    this.xMax = Math.max(...data.map(point => point[this.xKey]));
    this.x = value => 48 + (value - this.xMin) / (this.xMax - this.xMin || 1) * 330;
    this.y = value => 135 - (value - this.low) / (this.high - this.low) * 115;
    this.svg.replaceChildren();
    for (let i = 0; i <= 4; i++) {
      const xValue = this.xMin + (this.xMax - this.xMin) * i / 4; const y = this.low + (this.high - this.low) * i / 4;
      this.svg.append(svg('line', { class: 'graph-grid', x1: 48, x2: 378, y1: this.y(y), y2: this.y(y) }), svg('text', { x: 42, y: this.y(y) + 3, 'text-anchor': 'end' }, format(y, 1)), svg('text', { x: this.x(xValue), y: 155, 'text-anchor': 'middle' }, format(xValue, 1)));
    }
    this.svg.append(svg('line', { class: 'graph-zero', x1: 48, x2: 378, y1: this.y(0), y2: this.y(0) }), svg('path', { class: 'graph-line', d: path(data.map(p => [this.x(p[this.xKey]), this.y(p[this.key])])) }), svg('text', { x: 378, y: 169, 'text-anchor': 'end' }, this.xLabel));
    this.cursor = svg('line', { class: 'graph-cursor', y1: 15, y2: 135 });
    this.dot = svg('circle', { class: 'graph-dot', r: 4 }); this.svg.append(this.cursor, this.dot);
    this.update(0);
  }
  setMeasurements(points, { xKey = 'x', yKey = 'y', xLabel = this.xLabel, yLabel = this.unit, fit = true, xErrorKey, yErrorKey } = {}) {
    if (!Array.isArray(points) || points.some(point => !Number.isFinite(point[xKey]) || !Number.isFinite(point[yKey]))) {
      throw new TypeError('Đồ thị đo cần các cặp số hữu hạn.');
    }
    if (points.some(point => [xErrorKey, yErrorKey].filter(Boolean).some(key => !Number.isFinite(point[key]) || point[key] < 0))) {
      throw new TypeError('Độ không đảm bảo trên đồ thị phải hữu hạn và không âm.');
    }
    this.xKey = xKey; this.xLabel = xLabel; this.unit = yLabel;
    if (!points.length) {
      this.xMin = 0; this.xMax = 1; this.low = 0; this.high = 1;
      this.x = value => 48 + value / (this.xMax - this.xMin) * 330;
      this.y = value => 135 - (value - this.low) / (this.high - this.low) * 115;
      this.svg.replaceChildren(
        svg('line', { class: 'graph-zero', x1: 48, x2: 378, y1: this.y(0), y2: this.y(0) }),
        svg('text', { x: 378, y: 169, 'text-anchor': 'end' }, xLabel),
        svg('text', { x: 8, y: 15 }, yLabel)
      );
      this.live.textContent = 'Chưa có điểm đo.';
      return null;
    }
    const xs = points.map(point => point[xKey]); const ys = points.map(point => point[yKey]);
    const xBoundsData = xErrorKey ? points.flatMap(point => [point[xKey] - point[xErrorKey], point[xKey] + point[xErrorKey]]) : xs;
    const yBoundsData = yErrorKey ? points.flatMap(point => [point[yKey] - point[yErrorKey], point[yKey] + point[yErrorKey]]) : ys;
    const bounds = values => {
      const minimum = Math.min(...values); const maximum = Math.max(...values);
      const padding = (maximum - minimum || Math.abs(maximum) * 0.1 || 1) * 0.12;
      return [minimum - padding, maximum + padding];
    };
    [this.xMin, this.xMax] = bounds(xBoundsData);
    [this.low, this.high] = bounds(yBoundsData);
    this.x = value => 48 + (value - this.xMin) / (this.xMax - this.xMin || 1) * 330;
    this.y = value => 135 - (value - this.low) / (this.high - this.low || 1) * 115;
    this.svg.replaceChildren();
    for (let index = 0; index <= 4; index++) {
      const xValue = this.xMin + (this.xMax - this.xMin) * index / 4;
      const yValue = this.low + (this.high - this.low) * index / 4;
      this.svg.append(
        svg('line', { class: 'graph-grid', x1: 48, x2: 378, y1: this.y(yValue), y2: this.y(yValue) }),
        svg('text', { x: 42, y: this.y(yValue) + 3, 'text-anchor': 'end' }, format(yValue, 2)),
        svg('text', { x: this.x(xValue), y: 155, 'text-anchor': 'middle' }, format(xValue, 2))
      );
    }
    this.svg.append(
      svg('line', { class: 'graph-zero', x1: 48, x2: 378, y1: this.y(0), y2: this.y(0) }),
      svg('text', { x: 378, y: 169, 'text-anchor': 'end' }, xLabel),
      svg('text', { x: 8, y: 15 }, yLabel)
    );
    let regression = null;
    if (fit && points.length >= 2) {
      const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
      const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
      const varianceX = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
      if (varianceX > 0) {
        const slope = xs.reduce((sum, value, index) => sum + (value - meanX) * (ys[index] - meanY), 0) / varianceX;
        const intercept = meanY - slope * meanX;
        const residual = ys.reduce((sum, value, index) => sum + (value - (slope * xs[index] + intercept)) ** 2, 0);
        const varianceY = ys.reduce((sum, value) => sum + (value - meanY) ** 2, 0);
        regression = Object.freeze({ slope, intercept, rSquared: varianceY ? 1 - residual / varianceY : 1 });
        this.svg.append(svg('line', { class: 'graph-fit', x1: this.x(this.xMin), y1: this.y(slope * this.xMin + intercept), x2: this.x(this.xMax), y2: this.y(slope * this.xMax + intercept) }));
      }
    }
    for (const point of points) {
      const px = this.x(point[xKey]); const py = this.y(point[yKey]);
      if (xErrorKey) {
        const left = this.x(point[xKey] - point[xErrorKey]); const right = this.x(point[xKey] + point[xErrorKey]);
        this.svg.append(svg('line', { class: 'graph-error-bar', x1: left, x2: right, y1: py, y2: py }), svg('line', { class: 'graph-error-bar', x1: left, x2: left, y1: py - 3, y2: py + 3 }), svg('line', { class: 'graph-error-bar', x1: right, x2: right, y1: py - 3, y2: py + 3 }));
      }
      if (yErrorKey) {
        const top = this.y(point[yKey] + point[yErrorKey]); const bottom = this.y(point[yKey] - point[yErrorKey]);
        this.svg.append(svg('line', { class: 'graph-error-bar', x1: px, x2: px, y1: top, y2: bottom }), svg('line', { class: 'graph-error-bar', x1: px - 3, x2: px + 3, y1: top, y2: top }), svg('line', { class: 'graph-error-bar', x1: px - 3, x2: px + 3, y1: bottom, y2: bottom }));
      }
      this.svg.append(svg('circle', {
        class: 'graph-measurement-point', cx: px, cy: py, r: 4,
        'aria-label': `${xLabel} ${format(point[xKey])}${xErrorKey ? ` ± ${format(point[xErrorKey])}` : ''}, ${yLabel} ${format(point[yKey])}${yErrorKey ? ` ± ${format(point[yErrorKey])}` : ''}`
      }));
    }
    this.live.textContent = regression
      ? `Độ dốc = ${format(regression.slope)} ${yLabel}/${xLabel} · R² = ${format(regression.rSquared, 3)} · ${points.length} điểm đo`
      : fit
        ? `${points.length} điểm đo · cần hai giá trị x khác nhau để tính độ dốc`
        : `${points.length} điểm đo · không áp dụng hồi quy tuyến tính cho mô hình này`;
    return regression;
  }
  update(time) {
    const p = this.model.at(time); const x = this.x(p[this.xKey]); const y = this.y(p[this.key]);
    this.cursor.setAttribute('x1', x); this.cursor.setAttribute('x2', x);
    this.dot.setAttribute('cx', x); this.dot.setAttribute('cy', y);
    const xValue = this.xKey === 't' ? `t = ${format(p.t)} s` : `${this.xLabel} = ${format(p[this.xKey])}`;
    this.live.textContent = `${xValue} · ${this.key} = ${format(p[this.key])} ${this.unit}`;
  }
}
