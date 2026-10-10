// Experimental Hooke analysis: never combine measurements from different springs.
// A fit through the physical origin F=k Δx needs at least two distinct extensions.
export function analyzeHookeRows(rows, springId) {
  const selected = (Array.isArray(rows) ? rows : []).filter(row => row?.springId === springId &&
    Number.isFinite(row.force) && row.force >= 0 && Number.isFinite(row.extension) && row.extension > 0);
  const unique = new Set(selected.map(row => row.extension.toPrecision(12)));
  if (selected.length < 2 || unique.size < 2) return Object.freeze({ points: selected, fit: null });
  const numerator = selected.reduce((sum,row) => sum + row.extension * row.force,0);
  const denominator = selected.reduce((sum,row) => sum + row.extension ** 2,0);
  const stiffness = numerator / denominator;
  if (!Number.isFinite(stiffness) || stiffness <= 0) return Object.freeze({ points: selected, fit: null });
  const meanForce = selected.reduce((sum,row) => sum + row.force,0) / selected.length;
  const residual = selected.reduce((sum,row) => sum + (row.force - stiffness * row.extension) ** 2,0);
  const total = selected.reduce((sum,row) => sum + (row.force - meanForce) ** 2,0);
  const rSquared = total > 0 ? 1 - residual/total : (residual === 0 ? 1 : null);
  return Object.freeze({ points: selected, fit: Object.freeze({ stiffness, rSquared, count: selected.length }) });
}
