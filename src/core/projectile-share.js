import { createProjectile } from './projectile.js';
const PARAMETER_KEYS = ['v0', 'angle', 'height', 'g'];
/** A share link carries only validated simulation parameters, never saved student data. */
export function projectileShareURL(parameters, baseURL) {
  const validated = createProjectile(parameters).parameters;
  const url = new URL(baseURL);
  url.searchParams.set('pm', PARAMETER_KEYS.map(key => String(validated[key])).join(','));
  url.hash = '#/simulation/projectile-motion';
  return url.toString();
}
export function parseProjectileShare(search) {
  const raw = new URLSearchParams(search).get('pm');
  if (raw === null) return null;
  const parts = raw.split(',');
  if (parts.length !== PARAMETER_KEYS.length || parts.some(part => !part.trim())) return null;
  const params = Object.fromEntries(parts.map((part, index) => [PARAMETER_KEYS[index], Number(part)]));
  try { return createProjectile(params).parameters; } catch { return null; }
}
