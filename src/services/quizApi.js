import { apiFetch } from './api.js';

export const listQuizzes = (lessonId) => apiFetch(`/lessons/${encodeURIComponent(lessonId)}/quizzes`);
export const getQuiz = (id) => apiFetch(`/quizzes/${encodeURIComponent(id)}`);
export const createQuiz = (lessonId, body) =>
  apiFetch(`/lessons/${encodeURIComponent(lessonId)}/quizzes`, { method: 'POST', body });
export const updateQuiz = (id, body) => apiFetch(`/quizzes/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const deleteQuiz = (id) => apiFetch(`/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE' });
