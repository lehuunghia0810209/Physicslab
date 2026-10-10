export function createState(initial) {
  let current = Object.freeze({ ...initial });
  const subscribers = new Set();
  return { get: () => current,
    set(patch) { current = Object.freeze({ ...current, ...patch }); subscribers.forEach(fn => fn(current)); },
    subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); } };
}
