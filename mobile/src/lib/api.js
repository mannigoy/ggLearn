const GENERIC_MESSAGE = 'Something went wrong. Please try again.';
const UNREACHABLE_MESSAGE = 'Can’t reach the GG Learn server. Is the backend running?';
const OFFLINE_MESSAGE = 'You’re offline. Check your internet and try again.';
const MISSING_URL_MESSAGE = 'Set EXPO_PUBLIC_API_URL in mobile/.env to your PC’s address.';

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

const config = {
  baseUrl: '',
  getToken: async () => null,
  onUnauthorized: null,
  isOffline: async () => false
};

/** Merges settings into the client: baseUrl, getToken, onUnauthorized and isOffline. */
export function configureApi(options) {
  Object.assign(config, options);
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
  if (!config.baseUrl) throw new ApiError(0, MISSING_URL_MESSAGE);

  const headers = {};
  try {
    const token = await config.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    throw new ApiError(0, GENERIC_MESSAGE);
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    const offline = await config.isOffline().catch(() => false);
    throw new ApiError(0, offline ? OFFLINE_MESSAGE : UNREACHABLE_MESSAGE);
  }

  if (!response.ok) {
    const problem = await readProblem(response);
    if (response.status === 401 && config.onUnauthorized) config.onUnauthorized();
    throw new ApiError(response.status, problem.detail ?? GENERIC_MESSAGE, problem.fields ?? {});
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new ApiError(response.status, GENERIC_MESSAGE);
  }
}
