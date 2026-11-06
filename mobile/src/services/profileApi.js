import { apiFetch } from '../lib/api.js';

export const getMe = () => apiFetch('/me');
export const registerMe = (body) => apiFetch('/me', { method: 'POST', body });
export const renameMe = (body) => apiFetch('/me', { method: 'PATCH', body });
