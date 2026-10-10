// Derive dashboard/library counts from the registry instead of hard-coding totals.
export function summarizeSimulations(items, visited = {}) {
  const available = items.filter(item => item.status === 'available');
  const byCategory = {};
  for (const item of available) byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  return {
    available: available.length,
    planned: items.length - available.length,
    visited: available.filter(item => Object.hasOwn(visited, item.id)).length,
    byCategory
  };
}
