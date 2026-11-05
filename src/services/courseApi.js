import { apiFetch } from './api.js';

export const listCourses = ({ mine } = {}) => apiFetch(mine ? '/courses?mine=true' : '/courses');
export const getCourse = (id) => apiFetch(`/courses/${encodeURIComponent(id)}`);
export const createCourse = (body) => apiFetch('/courses', { method: 'POST', body });
export const updateCourse = (id, body) => apiFetch(`/courses/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const deleteCourse = (id) => apiFetch(`/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
