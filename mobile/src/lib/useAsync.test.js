import { FALLBACK_ERROR, failed, reloadStarted, reset, succeeded } from './useAsync.js';

describe('useAsync state transitions', () => {
  it('starts loading with no data', () => {
    expect(reset()).toEqual({ data: null, error: null, loading: true, reloading: false });
  });

  it('a first load is loading, not reloading', () => {
    expect(reloadStarted(reset())).toMatchObject({ data: null, loading: true, reloading: false });
  });

  it('a reload keeps the data, flags reloading and clears the old error', () => {
    const state = { ...succeeded(['a']), error: 'old' };
    expect(reloadStarted(state)).toEqual({ data: ['a'], error: null, loading: false, reloading: true });
  });

  it('a failed reload keeps the previous data and sets the error', () => {
    const state = reloadStarted(succeeded(['a']));
    expect(failed(state, new Error('Nope'))).toEqual({ data: ['a'], error: 'Nope', loading: false, reloading: false });
  });

  it('a failed first load has no data and an error', () => {
    expect(failed(reset(), new Error('Nope'))).toEqual({ data: null, error: 'Nope', loading: false, reloading: false });
  });

  it('falls back to a friendly message', () => {
    expect(failed(reset(), undefined).error).toBe(FALLBACK_ERROR);
    expect(failed(reset(), new Error('')).error).toBe(FALLBACK_ERROR);
  });

  it('success clears error and flags', () => {
    expect(succeeded({ id: 1 })).toEqual({ data: { id: 1 }, error: null, loading: false, reloading: false });
  });

  it('changing deps resets to a fresh load with no stale data', () => {
    expect(reset().data).toBeNull();
  });
});
