import { auth } from './firebase.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';
const OFFLINE_MESSAGE = 'Can’t reach the GG Learn server. Is the backend running?';

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

let onUnauthorized = null;

/** Registers what to do when the server answers 401 (for example, sign the user out). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function readProblem(response) {
  try {
    const problem = await response.json();
    return problem && typeof problem === 'object' ? problem : {};
  } catch {
    return {};
  }
}

/** Calls the backend with the signed-in user's token. Returns parsed JSON, or null for 204. */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (auth?.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, OFFLINE_MESSAGE);
  }

  if (!response.ok) {
    const problem = await readProblem(response);
    if (response.status === 401 && onUnauthorized) onUnauthorized();
    throw new ApiError(response.status, problem.detail ?? GENERIC_MESSAGE, problem.fields ?? {});
  }
  if (response.status === 204) return null;
  return response.json();
}
