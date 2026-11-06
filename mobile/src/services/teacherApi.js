import { apiFetch } from '../lib/api.js';

/** Read-only list for the admin teacher picker. Not user management. */
export const listTeachers = async () => (await apiFetch('/users')).filter((u) => u.role === 'teacher');
