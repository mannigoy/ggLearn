import { useCallback, useState } from 'react';

/** Checklist ticks for one experiment. Kept in memory for now; callers will not change when it is stored. */
export function useTicks(experimentId, stepCount) {
  const [all, setAll] = useState({});
  const ticked = new Set((all[experimentId] || []).filter((i) => i < stepCount));
  const toggle = useCallback(
    (index) =>
      setAll((prev) => {
        const next = new Set(prev[experimentId] || []);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return { ...prev, [experimentId]: [...next] };
      }),
    [experimentId]
  );
  return { ticked, toggle };
}
