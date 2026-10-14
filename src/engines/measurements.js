const PROJECTILE_COLUMNS = [
  { key: 't', csv: 't_s' }, { key: 'x', csv: 'x_m' }, { key: 'y', csv: 'y_m' },
  { key: 'vx', csv: 'vx_m_s' }, { key: 'vy', csv: 'vy_m_s' }, { key: 'speed', csv: 'speed_m_s' }
];

export class MeasurementSystem {
  constructor(limit = 100, columns = PROJECTILE_COLUMNS) {
    if (!Number.isInteger(limit) || limit < 1 || !Array.isArray(columns) || !columns.length
      || columns.some(column => !column || typeof column.key !== 'string' || !column.key)) {
      throw new RangeError('Cấu hình sổ đo không hợp lệ.');
    }
    this.rows = []; this.limit = limit; this.columns = columns.map(column => ({ ...column }));
  }
  capture(state) {
    if (!state || typeof state !== 'object' || this.rows.length >= this.limit) return false;
    if (!this.columns.every(({ key }) => Number.isFinite(state[key]))) return false;
    this.rows.push(Object.fromEntries(this.columns.map(({ key }) => [key, state[key]]))); return true;
  }
  clear() { this.rows = []; }
  csv() {
    return [this.columns.map(column => column.csv || column.key).join(','),
      ...this.rows.map(row => this.columns.map(({ key }) => Number(row[key]).toFixed(6)).join(','))].join('\n');
  }
}
