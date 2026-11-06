import { apiFetch } from '../lib/api.js';

export const listExperiments = (lessonId) => apiFetch(`/lessons/${encodeURIComponent(lessonId)}/experiments`);
export const createExperiment = (lessonId, body) =>
  apiFetch(`/lessons/${encodeURIComponent(lessonId)}/experiments`, { method: 'POST', body });
export const updateExperiment = (id, body) =>
  apiFetch(`/experiments/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const deleteExperiment = (id) => apiFetch(`/experiments/${encodeURIComponent(id)}`, { method: 'DELETE' });
