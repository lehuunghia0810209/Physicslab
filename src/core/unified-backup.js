import { validateProgressSnapshot } from './progress.js';
import { validateLearningBackup, LEARNING_KEY } from './learning-store.js';
import { validateExperimentBackup, EXPERIMENT_KEY } from './experiment-store.js';

export const UNIFIED_BACKUP_VERSION = 2;
export const UNIFIED_BACKUP_FORMAT = 'physicslab-unified-backup';
export const BACKUP_MAX_BYTES = 5_000_000;
export const PROGRESS_KEY = 'physicslab.progress.v1';
const keys = [PROGRESS_KEY, LEARNING_KEY, EXPERIMENT_KEY];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const encodedBytes = text => new TextEncoder().encode(text).length;

function validateSnapshot(snapshot) {
  if (!record(snapshot) || snapshot.version !== 1 || !record(snapshot.visited) || !record(snapshot.lessons)) {
    throw new Error('Tiến độ trong bản sao không hợp lệ.');
  }
  return validateProgressSnapshot(snapshot);
}

/** Validation is performed in full before any browser key is modified. */
export function parsePhysicsLabBackup(input) {
  if (typeof input !== 'string' || encodedBytes(input) > BACKUP_MAX_BYTES) {
    throw new Error('Bản sao phải là JSON không quá 5 MB.');
  }
  const parsed = JSON.parse(input);
  if (record(parsed) && parsed.format === UNIFIED_BACKUP_FORMAT && parsed.version === UNIFIED_BACKUP_VERSION) {
    if (!record(parsed.stores)) throw new Error('Bản sao tổng hợp thiếu kho dữ liệu.');
    return {
      kind: 'unified',
      stores: {
        [PROGRESS_KEY]: validateSnapshot(parsed.stores.progress),
        [LEARNING_KEY]: validateLearningBackup(parsed.stores.learning),
        [EXPERIMENT_KEY]: validateExperimentBackup(parsed.stores.experiments)
      }
    };
  }
  // Older Tools backups only contained Progress. Do NOT erase Learning or Experiment Studio.
  if (record(parsed) && parsed.version === 1 && record(parsed.visited) && record(parsed.lessons)) {
    return { kind: 'legacy', stores: { [PROGRESS_KEY]: validateSnapshot(parsed) } };
  }
  throw new Error('Không nhận diện được định dạng bản sao PhysicsLab.');
}

/** Export from the active in-memory stores as well as the Progress instance. */
export function createUnifiedBackup(progress, learningStore, experimentStore) {
  if (!progress || !learningStore || !experimentStore) throw new Error('Thiếu kho dữ liệu để sao lưu.');
  // Unknown/corrupted source is not silently replaced with empty data in a "complete" backup.
  for (const [name, store] of [['Progress', progress], ['Learning', learningStore], ['Experiment Studio', experimentStore]]) {
    if (store.isDamaged?.()) {
      throw new Error(`Kho ${name} có dữ liệu không đọc được hoặc khác phiên bản. Hãy tải bản cứu hộ nguyên gốc trước khi sửa chữa.`);
    }
  }
  const backup = {
    format: UNIFIED_BACKUP_FORMAT, version: UNIFIED_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    stores: {
      progress: progress.get(),
      learning: learningStore.get(),
      experiments: experimentStore.get()
    }
  };
  const json = JSON.stringify(backup, null, 2);
  if (encodedBytes(json) > BACKUP_MAX_BYTES) throw new Error('Bản sao vượt 5 MB. Hãy xuất riêng các thí nghiệm trước khi tiếp tục.');
  parsePhysicsLabBackup(json); // ensure what is downloaded is also importable
  return json;
}

/** Rescue records literal browser bytes, even if JSON parsing failed. Never imports automatically. */
export function createRawRescue(storage) {
  if (!storage) throw new Error('Không có quyền truy cập dữ liệu trình duyệt.');
  const stores = {};
  for (const key of keys) stores[key] = storage.getItem(key);
  return JSON.stringify({ format: 'physicslab-raw-rescue', version: 1,
    exportedAt: new Date().toISOString(), stores }, null, 2);
}

/** Best-effort transactional restore across three localStorage keys.
 * Prevalidates ALL stores, snapshots originals, and rolls back successful writes on failure.
 * Browser localStorage does not offer ACID multi-key transactions; never claim stronger guarantees.
 */
export function restorePhysicsLabBackup(storage, serialized) {
  const backup = parsePhysicsLabBackup(serialized);
  if (!storage) throw new Error('Trình duyệt không cung cấp localStorage để khôi phục.');
  const planned = Object.entries(backup.stores).map(([key, value]) => [key, JSON.stringify(value)]);
  const originals = new Map(planned.map(([key]) => [key, storage.getItem(key)]));
  const written = [];
  try {
    for (const [key, value] of planned) {
      if (storage.getItem(key) !== originals.get(key)) throw new Error('Dữ liệu đã thay đổi ở tab khác trong khi khôi phục.');
      storage.setItem(key, value);
      written.push([key, value]);
    }
  } catch (error) {
    const failures = [];
    for (const [key, writtenValue] of written.reverse()) {
      try {
        if (storage.getItem(key) !== writtenValue) throw new Error('Dữ liệu đã bị tab khác cập nhật');
        const original = originals.get(key);
        if (original === null) storage.removeItem(key);
        else storage.setItem(key, original);
      } catch (rollbackError) { failures.push(`${key}: ${rollbackError.message}`); }
    }
    if (failures.length) throw new Error(`Khôi phục thất bại; không thể hoàn nguyên toàn bộ. Hãy dùng bản cứu hộ. ${failures.join('; ')}`);
    throw new Error(`Không thể khôi phục bản sao; dữ liệu cũ đã được hoàn nguyên. ${error.message}`);
  }
  return { kind: backup.kind, importedStores: planned.map(([key]) => key) };
}
