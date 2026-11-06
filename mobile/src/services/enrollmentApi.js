import { apiFetch } from '../lib/api.js';

export const listRoster = (courseId) => apiFetch(`/courses/${encodeURIComponent(courseId)}/enrollments`);
export const enroll = (courseId, studentUid) =>
  apiFetch(`/courses/${encodeURIComponent(courseId)}/enrollments`, {
    method: 'POST',
    body: studentUid ? { studentUid } : undefined
  });
export const unenroll = (courseId, studentUid) =>
  apiFetch(`/courses/${encodeURIComponent(courseId)}/enrollments/${encodeURIComponent(studentUid)}`, {
    method: 'DELETE'
  });
export const myEnrollments = () => apiFetch('/me/enrollments');
export const listStudents = () => apiFetch('/students');
