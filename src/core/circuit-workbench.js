/**
 * PhysicsLab Circuit Workbench: resistive DC circuit solver (modified nodal analysis).
 * The render layer has no role in determining voltages, currents or powers.
 * Wires and closed switches are ideal; meters are explicitly modelled as finite resistors.
 * Voltmeters: 10 MΩ input; ammeters: 0.02 Ω internal resistance.
 * This is an ideal classroom DC model, NOT an electrical safety simulator.
 */
export const BENCH_PARTS = Object.freeze({
  battery: { label: 'Nguồn điện', icon: '🔋', defaultValue: 9, min: 1, max: 24, unit: 'V' },
  bulb: { label: 'Bóng đèn', icon: '💡', defaultValue: 12, min: 2, max: 200, unit: 'Ω' },
  resistor: { label: 'Điện trở', icon: '▰', defaultValue: 20, min: 1, max: 1000, unit: 'Ω' },
  switch: { label: 'Công tắc', icon: '◉', defaultValue: 0, unit: '' },
  ammeter: { label: 'Ampe kế', icon: 'Ⓐ', defaultValue: .02, unit: 'Ω' },
  voltmeter: { label: 'Vôn kế', icon: 'Ⓥ', defaultValue: 1e7, unit: 'Ω' }
});
const RESISTIVE = new Set(['bulb', 'resistor', 'ammeter', 'voltmeter']);
const wire = (id, a, b) => ({ id, a, b });
const component = (id, type, x, y, rotation = 0, extras = {}) => ({ id, type, x, y, rotation, value: BENCH_PARTS[type].defaultValue, closed: type === 'switch', ...extras });
const terminal = (id, side) => `${id}:${side}`;

export function makeBenchPreset(name = 'series') {
  if (name === 'empty') return { components: [], wires: [] };
  if (name === 'parallel') return {
    components: [component('pin', 'battery', 205, 300, 90), component('k', 'switch', 405, 150), component('den1', 'bulb', 550, 310, 90), component('den2', 'bulb', 795, 310, 90)],
    wires: [wire('w1', 'pin:a', 'k:a'), wire('w2', 'k:b', 'den1:a'), wire('w3', 'k:b', 'den2:a'), wire('w4', 'den1:b', 'pin:b'), wire('w5', 'den2:b', 'pin:b')]
  };
  return {
    components: [component('pin', 'battery', 210, 325, 90), component('k', 'switch', 460, 155), component('den', 'bulb', 765, 325, 90)],
    wires: [wire('w1', 'pin:a', 'k:a'), wire('w2', 'k:b', 'den:a'), wire('w3', 'den:b', 'pin:b')]
  };
}
export const benchPort = terminal;

/** Return a validated, safe, disconnected copy; never trust stored localStorage data. */
export function sanitizeBench(input) {
  const raw = input && typeof input === 'object' ? input : makeBenchPreset();
  const components = [];
  const ids = new Set();
  for (const part of Array.isArray(raw.components) ? raw.components.slice(0, 32) : []) {
    if (!part || typeof part !== 'object' || !Object.hasOwn(BENCH_PARTS, part.type)
      || typeof part.id !== 'string' || !/^[a-zA-Z0-9_-]{1,30}$/.test(part.id) || ids.has(part.id)) continue;
    const meta = BENCH_PARTS[part.type];
    const rawValue = Number(part.value);
    const value = Number.isFinite(rawValue) && meta.min != null ? Math.min(meta.max, Math.max(meta.min, rawValue)) : meta.defaultValue;
    ids.add(part.id);
    components.push({ id: part.id, type: part.type,
      x: Math.round(Math.min(930, Math.max(65, Number.isFinite(part.x) ? part.x : 480))),
      y: Math.round(Math.min(490, Math.max(70, Number.isFinite(part.y) ? part.y : 290))),
      rotation: part.rotation === 90 ? 90 : 0, value,
      closed: part.type === 'switch' ? part.closed === true : false });
  }
  const wires = [];
  const wireIds = new Set();
  const pairs = new Set();
  for (const item of Array.isArray(raw.wires) ? raw.wires.slice(0, 96) : []) {
    if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]{1,30}$/.test(item.id) || wireIds.has(item.id)) continue;
    const parsePort = (s) => typeof s === 'string' && /^([a-zA-Z0-9_-]{1,30}):(a|b)$/.test(s) && ids.has(s.split(':')[0]);
    if (!parsePort(item.a) || !parsePort(item.b) || item.a === item.b) continue;
    const pair = [item.a, item.b].sort().join('|');
    if (pairs.has(pair)) continue;
    pairs.add(pair); wireIds.add(item.id);
    wires.push({ id: item.id, a: item.a, b: item.b });
  }
  return { components, wires };
}

function linearSolve(matrix, rhs) {
  const n = rhs.length, a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let j = 0; j < n; j++) {
    let pivot = j;
    for (let i = j + 1; i < n; i++) if (Math.abs(a[i][j]) > Math.abs(a[pivot][j])) pivot = i;
    if (Math.abs(a[pivot][j]) < 1e-12 || !Number.isFinite(a[pivot][j])) return null;
    [a[j], a[pivot]] = [a[pivot], a[j]];
    const div = a[j][j];
    for (let k = j; k <= n; k++) a[j][k] /= div;
    for (let i = 0; i < n; i++) {
      if (i === j) continue;
      const factor = a[i][j];
      if (factor === 0) continue;
      for (let k = j; k <= n; k++) a[i][k] -= factor * a[j][k];
    }
  }
  return a.map(row => row[n]);
}

export function solveBench(input) {
  const bench = sanitizeBench(input);
  const { components, wires } = bench;
  const parents = new Map();
  const portNames = [];
  for (const part of components) for (const side of ['a', 'b']) {
    const name = terminal(part.id, side); portNames.push(name); parents.set(name, name);
  }
  const find = p => {
    let root = p;
    while (parents.get(root) !== root) root = parents.get(root);
    while (p !== root) { const next = parents.get(p); parents.set(p, root); p = next; }
    return root;
  };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parents.set(rb, ra); };
  for (const { a, b } of wires) union(a, b);
  for (const part of components) if (part.type === 'switch' && part.closed) union(terminal(part.id, 'a'), terminal(part.id, 'b'));

  const endpoints = new Map(components.map(part => [part.id, [find(terminal(part.id, 'a')), find(terminal(part.id, 'b'))]]));
  const currents = Object.fromEntries(components.map(part => [part.id, 0]));
  const voltages = Object.fromEntries(components.map(part => [part.id, 0]));
  const powers = Object.fromEntries(components.map(part => [part.id, 0]));
  const wireCurrents = Object.fromEntries(wires.map(w => [w.id, 0]));
  const sources = components.filter(p => p.type === 'battery');
  if (sources.some(p => endpoints.get(p.id)[0] === endpoints.get(p.id)[1])) {
    return { status: 'short', message: 'Ngắn mạch! Hai cực của nguồn đang nối trực tiếp. Hãy tháo dây nối tắt.', bench, currents, voltages, powers, wireCurrents, totalCurrent: 0, totalPower: 0 };
  }

  // Use a second graph to identify mutually connected electrical islands.
  const allNodes = [...new Set([...endpoints.values()].flat())];
  const nodesParent = new Map(allNodes.map(node => [node, node]));
  const nfind = node => { while (nodesParent.get(node) !== node) node = nodesParent.get(node); return node; };
  const nunion = (a, b) => { const na = nfind(a), nb = nfind(b); if (na !== nb) nodesParent.set(nb, na); };
  for (const p of components) if (p.type === 'battery' || RESISTIVE.has(p.type)) {
    const [a, b] = endpoints.get(p.id); if (a !== b) nunion(a, b);
  }
  const islands = new Map();
  for (const node of allNodes) {
    const key = nfind(node);
    if (!islands.has(key)) islands.set(key, new Set());
    islands.get(key).add(node);
  }
  let invalid = false;
  for (const island of islands.values()) {
    const batteries = sources.filter(p => island.has(endpoints.get(p.id)[0]));
    if (batteries.length === 0) continue;
    const base = endpoints.get(batteries[0].id)[1];
    const unknownNodes = [...island].filter(n => n !== base);
    const m = unknownNodes.length + batteries.length;
    const matrix = Array.from({ length: m }, () => Array(m).fill(0));
    const rhs = Array(m).fill(0);
    const nodeIndex = new Map(unknownNodes.map((node, i) => [node, i]));
    const idx = node => nodeIndex.get(node);
    for (const part of components) {
      if (!RESISTIVE.has(part.type)) continue;
      const [a, b] = endpoints.get(part.id);
      if (!island.has(a) || a === b) continue;
      const g = 1 / part.value;
      const ia = idx(a), ib = idx(b);
      if (ia !== undefined) matrix[ia][ia] += g;
      if (ib !== undefined) matrix[ib][ib] += g;
      if (ia !== undefined && ib !== undefined) { matrix[ia][ib] -= g; matrix[ib][ia] -= g; }
    }
    batteries.forEach((part, i) => {
      const [a, b] = endpoints.get(part.id); const ia = idx(a), ib = idx(b);
      const c = unknownNodes.length + i;
      if (ia !== undefined) { matrix[ia][c]++; matrix[c][ia]++; }
      if (ib !== undefined) { matrix[ib][c]--; matrix[c][ib]--; }
      rhs[c] = part.value;
    });
    const solution = linearSolve(matrix, rhs);
    if (!solution) { invalid = true; continue; }
    const potential = node => node === base ? 0 : solution[idx(node)] || 0;
    for (const part of components) {
      const [a, b] = endpoints.get(part.id);
      if (!island.has(a)) continue;
      const v = potential(a) - potential(b);
      voltages[part.id] = v;
      if (RESISTIVE.has(part.type)) {
        currents[part.id] = v / part.value;
        powers[part.id] = currents[part.id] * currents[part.id] * part.value;
      }
    }
    batteries.forEach((part, i) => {
      const c = unknownNodes.length + i;
      currents[part.id] = solution[c];
      powers[part.id] = voltages[part.id] * currents[part.id]; // negative means delivered power
    });
  }
  if (invalid) {
    return { status: 'conflict', message: 'Các nguồn đang đấu xung đột hoặc có vòng nguồn lí tưởng không xác định. Hãy kiểm tra mạch.', bench, currents, voltages, powers, wireCurrents, totalCurrent: 0, totalPower: 0 };
  }

  // Determine one valid Kirchhoff flow through a spanning forest of ideal wires.
  // Wire loops have no unique individual current in the ideal-wire model.
  const injection = new Map(portNames.map(p => [p, 0]));
  for (const part of components) if (part.type === 'battery' || RESISTIVE.has(part.type)) {
    injection.set(terminal(part.id, 'a'), injection.get(terminal(part.id, 'a')) + currents[part.id]);
    injection.set(terminal(part.id, 'b'), injection.get(terminal(part.id, 'b')) - currents[part.id]);
  }
  const adjacency = new Map(portNames.map(p => [p, []]));
  const conductorEdges = [...wires.map(w => ({ ...w, isWire: true })), ...components.filter(p => p.type === 'switch' && p.closed).map(p => ({ id: p.id, a: terminal(p.id, 'a'), b: terminal(p.id, 'b'), isWire: false }))];
  for (const edge of conductorEdges) {
    adjacency.get(edge.a).push({ edge, other: edge.b });
    adjacency.get(edge.b).push({ edge, other: edge.a });
  }
  const seen = new Set();
  function traverse(port, parent = null) {
    seen.add(port);
    let outflow = injection.get(port);
    for (const { edge, other } of adjacency.get(port)) {
      if (other === parent || seen.has(other)) continue;
      const childOutflow = traverse(other, port);
      const amount = edge.a === port ? childOutflow : -childOutflow;
      if (edge.isWire) wireCurrents[edge.id] = amount;
      else currents[edge.id] = amount;
      outflow += childOutflow;
    }
    return outflow;
  }
  for (const name of portNames) if (!seen.has(name)) traverse(name);
  const totalCurrent = sources.reduce((sum, part) => sum + Math.max(0, -currents[part.id]), 0);
  const totalPower = sources.reduce((sum, part) => sum + Math.max(0, -powers[part.id]), 0);
  const status = sources.length === 0 ? 'no-source' : totalCurrent < 1e-7 ? 'open' : 'running';
  const message = status === 'no-source' ? 'Hãy thêm nguồn điện và nối thành mạch kín.'
    : status === 'open' ? 'Mạch chưa kín. Hãy kiểm tra dây nối hoặc đóng công tắc.'
      : 'Mạch kín — dòng điện đang chạy. Hãy chọn linh kiện để xem số đo.';
  return { status, message, bench, currents, voltages, powers, wireCurrents, totalCurrent, totalPower };
}
