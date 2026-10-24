import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRepositories } from '@/data/DataProvider';

import type { HafalanEntry, HafalanSummary } from './types';

/** Entries and summary, reloaded from SQLite each time the screen gains focus. */
export function useHafalanData(enabled: boolean) {
  const { hafalan } = useRepositories();
  const [data, setData] = useState<{ entries: HafalanEntry[]; summary: HafalanSummary } | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let cancelled = false;
      Promise.all([hafalan.list(), hafalan.summary()])
        .then(([entries, summary]) => {
          if (!cancelled) setData({ entries, summary });
        })
        .catch((error: unknown) => console.warn('Failed to load hafalan', error));
      return () => {
        cancelled = true;
      };
    }, [hafalan, enabled]),
  );

  return data;
}
