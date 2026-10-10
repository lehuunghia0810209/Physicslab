const shapes = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>',
  lab: '<path d="M8 3h8M9 3v7L4 19q-1 2 2 2h12q3 0 2-2l-5-9V3M7 15h10"/>',
  tools: '<path d="m4 20 7-7M14 4a6 6 0 0 0-7 8l5 5a6 6 0 0 0 8-7l-4 4-6-6z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  play: '<path d="m8 4 12 8-12 8z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
  reset: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
  orbit: '<ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/><circle cx="12" cy="12" r="2"/>',
  trajectory: '<path d="M3 20Q10-5 21 12M3 20h18"/><circle cx="21" cy="12" r="1.5"/>',
  wave: '<path d="M2 12c3-12 7-12 10 0s7 12 10 0"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-8z"/>',
  magnet: '<path d="M4 3v10a8 8 0 0 0 16 0V3h-5v10a3 3 0 0 1-6 0V3zM4 7h5m6 0h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  heat: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0M12 8v10"/>',
  force: '<path d="M3 12h18m-5-5 5 5-5 5"/><rect x="3" y="7" width="7" height="10" rx="2"/>',
  check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  chart: '<path d="M3 3v18h18M6 16l5-8 5 3 5-6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
};
export function icon(name, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.orbit}</svg>`; }
export function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
