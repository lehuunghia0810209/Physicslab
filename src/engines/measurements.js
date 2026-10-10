export class MeasurementSystem {
  constructor(limit = 100) { this.rows = []; this.limit = limit; }
  capture(state) {
    if (!state || typeof state !== 'object' || this.rows.length >= this.limit) return false;
    const values = ['t', 'x', 'y', 'vx', 'vy', 'speed'];
    if (!values.every(key => Number.isFinite(state[key]))) return false;
    this.rows.push({ t: state.t, x: state.x, y: state.y, vx: state.vx, vy: state.vy, speed: state.speed }); return true;
  }
  clear() { this.rows = []; }
  csv() { return ['t_s,x_m,y_m,vx_m_s,vy_m_s,speed_m_s', ...this.rows.map(r => [r.t, r.x, r.y, r.vx, r.vy, r.speed].map(v => Number(v).toFixed(6)).join(','))].join('\n'); }
}
