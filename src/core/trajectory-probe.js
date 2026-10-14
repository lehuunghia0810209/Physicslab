/** Canonical 3D point: the helix model reports `time`, the projectile model `t`. */
export function normalizeTrajectoryPoint(point) {
  const t = point?.t ?? point?.time;
  if (!point || !['x', 'y', 'z'].every(axis => Number.isFinite(point[axis])) || !Number.isFinite(t)) {
    throw new TypeError('Cần tọa độ và thời gian hữu hạn để đo quỹ đạo.');
  }
  return { ...point, t };
}

/** Pick only a real sample; distinguish projected overlaps by physical time. */
export function pickTrajectorySample(points, project, target, currentTime = 0, radius = 22) {
  let picked = null;
  let best = radius;
  for (const point of points) {
    const t = point?.t ?? point?.time;
    if (!Number.isFinite(t)) continue;
    const screen = project(point);
    if (!Number.isFinite(screen?.x) || !Number.isFinite(screen?.y)) continue;
    const distance = Math.hypot(screen.x - target.x, screen.y - target.y);
    if (distance < best - 1e-7 ||
        (Math.abs(distance - best) < 1e-7 && (!picked || Math.abs(t - currentTime) < Math.abs(picked.t - currentTime)))) {
      picked = normalizeTrajectoryPoint(point);
      best = distance;
    }
  }
  return picked;
}

/** Straight SI displacement between two genuine samples, not arc length. */
export function markerSeparation(a, b) {
  const p = normalizeTrajectoryPoint(a);
  const q = normalizeTrajectoryPoint(b);
  return { distance: Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z), elapsed: Math.abs(q.t - p.t) };
}
