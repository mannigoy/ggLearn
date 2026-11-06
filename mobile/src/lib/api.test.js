import { ApiError, apiFetch, configureApi } from './api.js';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (body === undefined) throw new SyntaxError('Unexpected end of JSON input');
    return body;
  }
});
const badJson = (status) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    throw new SyntaxError('Unexpected token <');
  }
});

describe('apiFetch', () => {
  let onUnauthorized;
  let base;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    onUnauthorized = jest.fn();
    base = {
      baseUrl: 'http://pc:8080/api',
      getToken: async () => 'tok',
      onUnauthorized,
      isOffline: async () => false
    };
    configureApi(base);
  });

  it('sends bearer token and JSON body', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(200, { id: 'c1' }));
    const result = await apiFetch('/courses', { method: 'POST', body: { title: 'Plants' } });
    expect(result).toEqual({ id: 'c1' });
    const [, init] = globalThis.fetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ title: 'Plants' }));
  });

  it('uses the configured base', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(200, []));
    await apiFetch('/courses');
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://pc:8080/api/courses');
  });

  it('sends no Authorization header when getToken returns null', async () => {
    configureApi({ ...base, getToken: async () => null });
    globalThis.fetch.mockResolvedValue(jsonResponse(200, []));
    await apiFetch('/courses');
    expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('returns null on 204', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true, status: 204, json: async () => null });
    expect(await apiFetch('/courses/c1', { method: 'DELETE' })).toBeNull();
  });

  it('throws ApiError with problem detail and fields', async () => {
    globalThis.fetch.mockResolvedValue(
      jsonResponse(400, { status: 400, detail: 'Check the form.', fields: { title: 'Too short.' } })
    );
    const error = await apiFetch('/courses', { method: 'POST', body: {} }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Check the form.');
    expect(error.fields).toEqual({ title: 'Too short.' });
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    globalThis.fetch.mockResolvedValue(badJson(500));
    const error = await apiFetch('/courses').catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.message).toBe('Something went wrong. Please try again.');
    expect(error.fields).toEqual({});
  });

  it('calls onUnauthorized on 401', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(401, { status: 401, detail: 'Sign in again.' }));
    await expect(apiFetch('/courses')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('says the server is unreachable when online', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await expect(apiFetch('/courses')).rejects.toMatchObject({
      status: 0,
      message: 'Can’t reach the GG Learn server. Is the backend running?'
    });
  });

  it('says the phone is offline when NetInfo says so', async () => {
    configureApi({ ...base, isOffline: async () => true });
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await expect(apiFetch('/courses')).rejects.toMatchObject({
      status: 0,
      message: 'You’re offline. Check your internet and try again.'
    });
  });

  it('explains a missing API URL instead of calling fetch', async () => {
    configureApi({ ...base, baseUrl: '' });
    await expect(apiFetch('/courses')).rejects.toMatchObject({
      status: 0,
      message: 'Set EXPO_PUBLIC_API_URL in mobile/.env to your PC’s address.'
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('maps a token failure to ApiError status 0', async () => {
    configureApi({
      ...base,
      getToken: async () => {
        throw new Error('token expired');
      }
    });
    const error = await apiFetch('/courses').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toBe('Something went wrong. Please try again.');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('maps an unreadable success body to ApiError with the response status', async () => {
    globalThis.fetch.mockResolvedValue(badJson(200));
    const error = await apiFetch('/courses').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(200);
    expect(error.message).toBe('Something went wrong. Please try again.');
  });
});
