import { apiFetch } from './api.js';

export const listLessons = (courseId) => apiFetch(`/courses/${encodeURIComponent(courseId)}/lessons`);
export const getLesson = (id) => apiFetch(`/lessons/${encodeURIComponent(id)}`);
export const createLesson = (courseId, body) =>
  apiFetch(`/courses/${encodeURIComponent(courseId)}/lessons`, { method: 'POST', body });
export const updateLesson = (id, body) => apiFetch(`/lessons/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const deleteLesson = (id) => apiFetch(`/lessons/${encodeURIComponent(id)}`, { method: 'DELETE' });
