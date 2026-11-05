import { useCallback, useEffect, useRef, useState } from 'react';

const sameDeps = (a, b) => a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

/**
 * Runs `fn` on mount and whenever `deps` change. Returns { data, error, loading, reload }.
 * `error` is the message string of the thrown error. Results that arrive after
 * unmount or after deps change are ignored.
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  const [seen, setSeen] = useState({ deps, tick });
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  // Show the loading state in the same render that deps change (no effect needed).
  if (!sameDeps(seen.deps, deps) || seen.tick !== tick) {
    setSeen({ deps, tick });
    setState((s) => ({ ...s, loading: true }));
  }

  useEffect(() => {
    let current = true;
    Promise.resolve()
      .then(() => fnRef.current())
      .then(
        (data) => current && setState({ data, error: null, loading: false }),
        (error) =>
          current &&
          setState({
            data: null,
            error: error?.message ?? 'Something went wrong. Please try again.',
            loading: false
          })
      );
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}
