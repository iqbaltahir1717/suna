import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText, Card, EmptyState, Screen } from '@/components';
import { useRepositories } from '@/data/DataProvider';
import type { InboxNotification } from '@/data/repositories/notificationsRepository';

/** Local inbox only. No push service and no permission request. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const { notifications } = useRepositories();
  const [items, setItems] = useState<InboxNotification[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      notifications
        .list()
        .then((list) => {
          if (!cancelled) setItems(list);
        })
        .catch((error: unknown) => console.warn('Failed to load notifications', error));
      return () => {
        cancelled = true;
      };
    }, [notifications]),
  );

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      {items === null ? (
        <AppText color="textMuted">{t('common.loading')}</AppText>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon="notifications-off-outline"
            title={t('notifications.emptyTitle')}
            body={t('notifications.emptyBody')}
          />
        </Card>
      ) : (
        // No notification kinds exist yet; rendering is added with the first kind.
        items.map((item) => (
          <Card key={item.id}>
            <AppText>{item.kind}</AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}
