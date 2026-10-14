import { createLearningStore } from './learning-store.js';
import { browserStorage } from './progress.js';

// Keep one Learning snapshot per browser tab, even when changing routes.
let store;
export function getLearningStore() { return store ||= createLearningStore(browserStorage()); }
