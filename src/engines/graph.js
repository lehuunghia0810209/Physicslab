import { svg, path } from './svg.js';
import { format } from '../core/units.js';
import { sampleSeries, seriesBounds, nearestSeriesPoint } from './graph-series.js';
import { zoomBounds, scientificCsv } from './graph-tools.js';

// Arbitrary time series: pass a model with at(t), duration, and sample().
export class GraphRenderer {
  static clipId = 0;
  constructor(container, { key, label, unit, role = 'teal', xKey = 't', xLabel = 't (s)' }) {
    this.key = key; this.unit = unit; this.xKey = xKey; this.xLabel = xLabel;
    this.zoomScale = 1; this.zoomCenter = null;
    container.innerHTML = `<div class="graph-title"><h3>${label}</h3><span>${unit}</span></div>`;
    this.svg = svg('svg', { viewBox: '0 0 400 170', role: 'img', 'aria-label': `Đồ thị ${label}, đơn vị ${unit}` });
    this.svg.classList.add('graph-svg', `graph--${role}`); container.append(this.svg);
    this.live = document.createElement('p'); this.live.className = 'graph-value'; container.append(this.live);
    this.tools = document.createElement('div');
    this.tools.className = 'graph-tools';
    this.tools.innerHTML = `<span class="graph-tools-hint">Chạm vào đường để đọc số liệu</span><div role="group" aria-label="Tùy chọn đồ thị"><button type="button" data-graph-action="zoom-in" aria-label="Phóng to trục thời gian" title="Phóng trục ngang">＋</button><button type="button" data-graph-action="zoom-out" aria-label="Thu nhỏ trục thời gian" title="Thu nhỏ trục ngang">−</button><button type="button" data-graph-action="reset" aria-label="Đưa đồ thị về vừa khung" title="Vừa khung">⊞</button><button type="button" data-graph-action="csv" aria-label="Xuất dữ liệu đồ thị CSV" title="Tải số liệu CSV">CSV ↓</button></div>`;
    container.append(this.tools);
    this.tools.addEventListener('click', event => {
      const button = event.target.closest('button[data-graph-action]');
      if (!button) return;
      const action = button.dataset.graphAction;
      if (action === 'csv') { this.exportCsv(); return; }
      if (!this.model) return;
      if (action === 'reset') { this.zoomScale = 1; this.zoomCenter = null; }
      else if (action === 'zoom-in') { this.zoomCenter = (this.xMin + this.xMax) / 2; this.zoomScale = Math.min(8, this.zoomScale * 2); }
      else if (action === 'zoom-out') { this.zoomCenter = (this.xMin + this.xMax) / 2; this.zoomScale = Math.max(1, this.zoomScale / 2); }
      this.setModel(this.model);
    });
    this.syncTools();
    // A pointer or finger selects real sampled values; keyboard navigation is available too.
    const inspectFromPointer = event => {
      if (!this.series?.length) return;
      const bounds = this.svg.getBoundingClientRect();
      if (!bounds.width) return;
      const plottedX = this.xMin + ((event.clientX - bounds.left) / bounds.width * 400 - 48) / 330 * (this.xMax - this.xMin);
      const nearest = nearestSeriesPoint(this.series, this.xKey, plottedX);
      if (nearest) this.inspect(this.series.indexOf(nearest));
    };
    this.svg.addEventListener('pointermove', event => {
      if (event.pointerType !== 'touch') inspectFromPointer(event);
    });
    this.svg.addEventListener('pointerdown', inspectFromPointer);
    this.svg.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') this.clearInspection(); });
    this.svg.addEventListener('blur', () => this.clearInspection());
    this.svg.addEventListener('keydown', event => {
      if (!this.series?.length) return;
      if (event.key === 'Escape') this.clearInspection();
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = this.inspectionIndex === null ? 0 : this.inspectionIndex + (event.key === 'ArrowRight' ? 1 : -1);
        this.inspect(next);
      }
    });
  }
  syncTools() {
    if (!this.tools) return;
    const hasData = Array.isArray(this.series) && this.series.length > 0;
    this.tools.querySelector('[data-graph-action="csv"]').disabled = !hasData;
    this.tools.querySelector('[data-graph-action="zoom-in"]').disabled = !hasData || this.zoomScale >= 8;
    this.tools.querySelector('[data-graph-action="zoom-out"]').disabled = !hasData || this.zoomScale <= 1;
    this.tools.querySelector('[data-graph-action="reset"]').disabled = !hasData || this.zoomScale <= 1;
  }
  exportCsv() {
    if (!this.series?.length) return;
    const csv = scientificCsv(this.series, this.xKey, this.key, this.xLabel, `${this.key} (${this.unit})`);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `physicslab-${String(this.key).replace(/[^a-z0-9-]/gi, '-')}.csv`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  setModel(model) {
    this.model = model;
    this.currentTime = Math.min(this.currentTime ?? 0, model.duration ?? Infinity);
    const data = sampleSeries(model, this.xKey, this.key);
    this.series = data;
    let comparison = null;
    if (this.compareModel) {
      try { comparison = sampleSeries(this.compareModel, this.xKey, this.key); }
      catch { this.compareModel = null; }
    }
    const bounds = seriesBounds(comparison ? [data, comparison] : [data], this.xKey, this.key);
    // Zoom only affects the view; sampled data and all physical calculations remain unchanged.
    this.fullXMin = bounds.xMin; this.fullXMax = bounds.xMax;
    const normalizedMax = bounds.xMax > bounds.xMin ? bounds.xMax : bounds.xMin + 1;
    const view = zoomBounds(bounds.xMin, normalizedMax, this.zoomScale, this.zoomCenter ?? (bounds.xMin + normalizedMax) / 2);
    Object.assign(this, bounds, { xMin: view.min, xMax: view.max });
    this.syncTools();
    this.x = value => 48 + (value - this.xMin) / (this.xMax - this.xMin || 1) * 330;
    this.y = value => 135 - (value - this.low) / (this.high - this.low) * 115;
    this.svg.replaceChildren();
    const clipId = `graph-clip-${GraphRenderer.clipId++}`;
    const clip = svg('clipPath', { id: clipId });
    clip.append(svg('rect', { x: 48, y: 15, width: 330, height: 120 }));
    const defs = svg('defs'); defs.append(clip); this.svg.append(defs);
    for (let i = 0; i <= 4; i++) {
      const xValue = this.xMin + (this.xMax - this.xMin) * i / 4;
      const yValue = this.low + (this.high - this.low) * i / 4;
      this.svg.append(
        svg('line', { class: 'graph-grid', x1: 48, x2: 378, y1: this.y(yValue), y2: this.y(yValue) }),
        svg('text', { x: 42, y: this.y(yValue) + 3, 'text-anchor': 'end' }, format(yValue, 1)),
        svg('text', { x: this.x(xValue), y: 155, 'text-anchor': 'middle' }, format(xValue, 1))
      );
    }
    this.svg.append(svg('line', { class: 'graph-zero', x1: 48, x2: 378, y1: this.y(0), y2: this.y(0) }));
    if (comparison) {
      this.svg.append(svg('path', { class: 'graph-comparison-line', fill: 'none', 'clip-path': `url(#${clipId})`, d: path(comparison.map(p => [this.x(p[this.xKey]), this.y(p[this.key])])) }));
    }
    this.svg.append(
      svg('path', { class: 'graph-line', fill: 'none', 'clip-path': `url(#${clipId})`, d: path(data.map(p => [this.x(p[this.xKey]), this.y(p[this.key])])) }),
      svg('text', { x: 378, y: 169, 'text-anchor': 'end' }, this.xLabel)
    );
    this.cursor = svg('line', { class: 'graph-cursor', y1: 15, y2: 135 });
    this.dot = svg('circle', { class: 'graph-dot', r: 4 });
    this.inspectionCursor = svg('line', { class: 'graph-inspection-cursor', y1: 15, y2: 135, visibility: 'hidden' });
    this.inspectionDot = svg('circle', { class: 'graph-inspection-dot', r: 5, visibility: 'hidden' });
    this.svg.append(this.cursor, this.dot, this.inspectionCursor, this.inspectionDot);
    this.svg.setAttribute('tabindex', '0');
    this.svg.setAttribute('aria-description', 'Dùng phím mũi tên trái hoặc phải để đọc từng điểm; Escape để trở về thời gian đang chạy.');
    this.inspectionIndex = null;
    this.update(this.currentTime);
  }
  /** Optional second physical model. No mutation of either model or stored progress. */
  setComparison(model = null) {
    this.compareModel = model;
    this.svg.setAttribute('aria-label', `Đồ thị ${this.key}, đơn vị ${this.unit}${model ? ', có đường tham chiếu nét đứt' : ''}`);
    if (this.model) this.setModel(this.model);
  }
  inspect(index) {
    if (!this.series?.length) return;
    this.inspectionIndex = Math.max(0, Math.min(this.series.length - 1, Math.round(index)));
    const point = this.series[this.inspectionIndex];
    const cx = this.x(point[this.xKey]), cy = this.y(point[this.key]);
    this.inspectionCursor?.setAttribute('x1', cx);
    this.inspectionCursor?.setAttribute('x2', cx);
    this.inspectionCursor?.setAttribute('visibility', 'visible');
    this.inspectionDot?.setAttribute('cx', cx);
    this.inspectionDot?.setAttribute('cy', cy);
    this.inspectionDot?.setAttribute('visibility', 'visible');
    this.live.textContent = `${this.xLabel} = ${format(point[this.xKey])} · ${this.key} = ${format(point[this.key])} ${this.unit}`;
  }
  clearInspection() {
    if (this.inspectionIndex === null) return;
    this.inspectionIndex = null;
    this.inspectionCursor?.setAttribute('visibility', 'hidden');
    this.inspectionDot?.setAttribute('visibility', 'hidden');
    if (this.model) this.update(this.currentTime ?? 0);
  }
  setMeasurements(points, { xKey = 'x', yKey = 'y', xLabel = this.xLabel, yLabel = this.unit, fit = true, xErrorKey, yErrorKey } = {}) {
    if (!Array.isArray(points) || points.some(point => !Number.isFinite(point[xKey]) || !Number.isFinite(point[yKey]))) {
      throw new TypeError('Đồ thị đo cần các cặp số hữu hạn.');
    }
    if (points.some(point => [xErrorKey, yErrorKey].filter(Boolean).some(key => !Number.isFinite(point[key]) || point[key] < 0))) {
      throw new TypeError('Độ không đảm bảo trên đồ thị phải hữu hạn và không âm.');
    }
    this.model = null; this.series = [...points]; this.compareModel = null; this.inspectionIndex = null;
    this.zoomScale = 1; this.zoomCenter = null; this.syncTools();
    this.svg.removeAttribute('tabindex'); this.svg.removeAttribute('aria-description');
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
    if (!this.model) return;
    this.currentTime = time;
    const p = this.model.at(time); const x = this.x(p[this.xKey]); const y = this.y(p[this.key]);
    this.cursor.setAttribute('x1', x); this.cursor.setAttribute('x2', x);
    this.dot.setAttribute('cx', x); this.dot.setAttribute('cy', y);
    const visible = x >= 48 && x <= 378 && Number.isFinite(y);
    this.cursor.setAttribute('visibility', visible ? 'visible' : 'hidden');
    this.dot.setAttribute('visibility', visible ? 'visible' : 'hidden');
    const xValue = this.xKey === 't' ? `t = ${format(p.t)} s` : `${this.xLabel} = ${format(p[this.xKey])}`;
    if (this.inspectionIndex === null) this.live.textContent = `${xValue} · ${this.key} = ${format(p[this.key])} ${this.unit}`;
  }
}
