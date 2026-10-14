/**
 * Minimum transparent SVG hit radius in local viewBox units. SVG artwork shrinks
 * under responsive layout, while a pointer/touch target must remain >= targetPx.
 * Using the current screen CTM (rather than a fixed viewBox ratio) also covers
 * CSS transforms, zoom, preserveAspectRatio, and different device widths.
 */
export function minimumSvgHitRadius(screenScale, targetPx = 48, visibleRadius = 25) {
  if (!Number.isFinite(screenScale) || screenScale <= 0) return visibleRadius;
  if (!Number.isFinite(targetPx) || targetPx <= 0) return visibleRadius;
  return Math.ceil(Math.max(visibleRadius, targetPx / (2 * screenScale)));
}
