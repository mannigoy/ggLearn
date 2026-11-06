import { useCallback, useEffect, useRef, useState } from 'react';

const sameDeps = (a, b) => a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

export const FALLBACK_ERROR = 'Something went wrong. Please try again.';

// State transitions, kept pure so they can be tested without rendering.

/** The deps changed: whatever we have belongs to another record, so start over. */
export const reset = () => ({ data: null, error: null, loading: true, reloading: false });

/** A reload began: keep the data on screen, drop the old error. With no data yet it is a plain load. */
export const reloadStarted = (state) => ({
  data: state.data,
  error: null,
  loading: state.data === null,
  reloading: state.data !== null
});

export const succeeded = (data) => ({ data, error: null, loading: false, reloading: false });

/** A failed reload keeps the previous data so the page doesn't blank. */
export const failed = (state, error) => ({
  data: state.data,
  error: error?.message || FALLBACK_ERROR,
  loading: false,
  reloading: false
});

/**
 * Runs `fn` on mount and whenever `deps` change. Returns { data, error, loading, reloading, reload }.
 * - `loading` is true only while there is no data yet (first load, or after deps change).
 * - `reloading` is true while `reload()` refreshes data that is already shown.
 * - A failed reload keeps the previous `data` and sets `error`; the error clears when the next reload starts.
 * - Changing deps clears `data`, so a different record never shows the previous one.
 * `error` is the message string of the thrown error. Results that arrive after
 * unmount or after deps change are ignored.
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState(reset);
  const [tick, setTick] = useState(0);
  const [seen, setSeen] = useState({ deps, tick });
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  // Update the state in the same render that deps or tick change (no effect needed).
  if (!sameDeps(seen.deps, deps)) {
    setSeen({ deps, tick });
    setState(reset());
  } else if (seen.tick !== tick) {
    setSeen({ deps, tick });
    setState(reloadStarted);
  }

  useEffect(() => {
    let current = true;
    Promise.resolve()
      .then(() => fnRef.current())
      .then(
        (data) => current && setState(succeeded(data)),
        (error) => current && setState((s) => failed(s, error))
      );
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}
