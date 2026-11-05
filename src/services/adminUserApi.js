import { apiFetch } from './api.js';

export const listUsers = () => apiFetch('/users');
export const createUser = (body) => apiFetch('/users', { method: 'POST', body });
export const updateUser = (uid, body) => apiFetch(`/users/${encodeURIComponent(uid)}`, { method: 'PUT', body });
export const setRole = (uid, role) =>
  apiFetch(`/users/${encodeURIComponent(uid)}/role`, { method: 'PATCH', body: { role } });
export const setDisabled = (uid, disabled) =>
  apiFetch(`/users/${encodeURIComponent(uid)}/disabled`, { method: 'PATCH', body: { disabled } });
export const deleteUser = (uid) => apiFetch(`/users/${encodeURIComponent(uid)}`, { method: 'DELETE' });
