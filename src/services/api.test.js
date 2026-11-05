import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./firebase.js', () => ({
  auth: { currentUser: { getIdToken: async () => 'tok' } }
}));

import { ApiError, apiFetch, setUnauthorizedHandler } from './api.js';

const jsonResponse = (status, body) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

describe('apiFetch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    setUnauthorizedHandler(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
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

  it('returns null on 204', async () => {
    globalThis.fetch.mockResolvedValue(new Response(null, { status: 204 }));
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
    globalThis.fetch.mockResolvedValue(new Response('<html>oops</html>', { status: 500 }));
    const error = await apiFetch('/courses').catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.message).toBe('Something went wrong. Please try again.');
    expect(error.fields).toEqual({});
  });

  it('calls the unauthorized handler on 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    globalThis.fetch.mockResolvedValue(jsonResponse(401, { status: 401, detail: 'Sign in again.' }));
    await expect(apiFetch('/courses')).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('maps network failure to the friendly message', async () => {
    globalThis.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await apiFetch('/courses').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toBe('Can’t reach the GG Learn server. Is the backend running?');
  });

  it('uses VITE_API_URL default base', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(200, []));
    await apiFetch('/courses');
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://localhost:8080/api/courses');
  });
});
