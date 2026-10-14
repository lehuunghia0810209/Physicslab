import { createExperimentStore } from './experiment-store.js';
import { browserStorage } from './progress.js';

// Keep unsaved Experiment Studio drafts across simulation/laboratory routes.
let store;
export function getExperimentStore() { return store ||= createExperimentStore(browserStorage()); }
