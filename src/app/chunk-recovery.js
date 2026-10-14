/** Distinguish a missing lazy-loaded deployment chunk from application errors. */
export function isLazyModuleLoadFailure(error) {
  const message = String(error?.message || '');
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script|loading (?:css )?chunk [^ ]+ failed/i.test(message);
}
