import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Calls `reload` each time the screen regains focus, but not on the first focus
 * (useAsync already loaded the data on mount).
 */
export function useReloadOnFocus(reload) {
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (seen.current) reload();
      seen.current = true;
    }, [reload])
  );
}
