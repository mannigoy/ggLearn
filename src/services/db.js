import { STORAGE_KEY } from '../constants/index.js';

const EMPTY_DB = { lessons: [] };

/** Local-only lesson store (per browser). Swap for Firestore when lessons need sharing. */
export function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.lessons) ? saved : EMPTY_DB;
  } catch {
    return EMPTY_DB;
  }
}

export function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('[GG] failed to save local data', error);
  }
}
