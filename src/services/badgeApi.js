import { apiFetch } from './api.js';

export const listCourseBadges = (courseId) => apiFetch(`/badges?courseId=${encodeURIComponent(courseId)}`);
export const myBadges = () => apiFetch('/me/badges');
export const awardBadge = (body) => apiFetch('/badges', { method: 'POST', body });
export const renameBadge = (id, body) => apiFetch(`/badges/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const revokeBadge = (id) => apiFetch(`/badges/${encodeURIComponent(id)}`, { method: 'DELETE' });
