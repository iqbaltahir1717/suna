import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRepositories } from '@/data/DataProvider';
import type { ActivitySummary } from '@/data/repositories/progressRepository';

/** Reloads from SQLite each time the host screen gains focus. */
export function useActivitySummary(): ActivitySummary | null {
  const { progress } = useRepositories();
  const [summary, setSummary] = useState<ActivitySummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      progress
        .getActivitySummary()
        .then((next) => {
          if (!cancelled) setSummary(next);
        })
        .catch((error: unknown) => console.warn('Failed to load activity summary', error));
      return () => {
        cancelled = true;
      };
    }, [progress]),
  );

  return summary;
}

export function isEmptySummary(summary: ActivitySummary) {
  return summary.practiceSessions === 0 && summary.completedChallenges === 0;
}
