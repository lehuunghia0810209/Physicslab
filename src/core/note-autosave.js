/** Debounced lesson notes with explicit flush on navigation, backup or page exit. */
export function installLessonNoteAutosave({ note, status, store, lessonId, host = window, delay = 350 }) {
  let lastSaved = note.value;
  let timer = null;
  const abort = new AbortController();
  const flush = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (note.value === lastSaved) return;
    try {
      store.note(lessonId, note.value);
      lastSaved = note.value;
      status.textContent = store.isPersistent()
        ? 'Đã lưu ghi chú trên thiết bị.'
        : 'Đã giữ ghi chú trong phiên; hãy sao lưu trước khi rời trang.';
    } catch (error) { status.textContent = `Không thể lưu ghi chú: ${error.message}`; }
  };
  const dispose = () => { if (timer !== null) clearTimeout(timer); timer = null; abort.abort(); };
  note.addEventListener('input', () => {
    status.textContent = 'Đang lưu ghi chú…';
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  }, { signal: abort.signal });
  note.addEventListener('change', flush, { signal: abort.signal });
  note.addEventListener('blur', flush, { signal: abort.signal });
  host.addEventListener('hashchange', () => { flush(); dispose(); }, { signal: abort.signal });
  host.addEventListener('pagehide', () => { flush(); dispose(); }, { signal: abort.signal });
  host.addEventListener('physicslab:before-backup', flush, { signal: abort.signal });
  return { flush, dispose };
}
