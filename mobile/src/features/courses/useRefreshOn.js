import { useEffect, useRef } from 'react';

// Reloads (keeping the content on screen) each time the parent bumps refreshKey.
export function useRefreshOn(refreshKey, reload) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    reload();
  }, [refreshKey, reload]);
}
