import { apiFetch } from '../lib/api.js';

export const listQuestions = (quizId) => apiFetch(`/quizzes/${encodeURIComponent(quizId)}/questions`);
export const createQuestion = (quizId, body) =>
  apiFetch(`/quizzes/${encodeURIComponent(quizId)}/questions`, { method: 'POST', body });
export const updateQuestion = (id, body) => apiFetch(`/questions/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const deleteQuestion = (id) => apiFetch(`/questions/${encodeURIComponent(id)}`, { method: 'DELETE' });
