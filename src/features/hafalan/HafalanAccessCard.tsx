import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card, EmptyState } from '@/components';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';

/**
 * Locked premium preview, or the (not yet built) tracker's empty state when
 * `hafalan_tracker` is active. Used on Home, Hafalan, and Statistik.
 */
export function HafalanAccessCard({ showDescription = true }: { showDescription?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { has } = useEntitlements();

  if (has('hafalan_tracker')) {
    return (
      <Card>
        <EmptyState
          icon="book-outline"
          title={t('hafalan.unlockedTitle')}
          body={t('hafalan.unlockedBody')}
        />
        <AppText variant="caption" color="textMuted">
          {t('hafalan.statuses')}
        </AppText>
      </Card>
    );
  }

  return (
    <Card>
      <Badge label={t('common.premium')} tone="locked" icon="lock-closed" />
      {showDescription ? <AppText>{t('hafalan.description')}</AppText> : null}
      <AppText variant="caption" color="textMuted">
        {t('hafalan.lockedBody')}
      </AppText>
      <Button
        label={t('hafalan.learnMore')}
        variant="secondary"
        onPress={() => router.push('/premium')}
      />
    </Card>
  );
}
