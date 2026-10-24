import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRepositories } from '@/data/DataProvider';

export function useUnreadCount() {
  const { notifications } = useRepositories();
  const [count, setCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      notifications
        .countUnread()
        .then((n) => {
          if (!cancelled) setCount(n);
        })
        .catch((error: unknown) => console.warn('Failed to count notifications', error));
      return () => {
        cancelled = true;
      };
    }, [notifications]),
  );
  return count;
}
