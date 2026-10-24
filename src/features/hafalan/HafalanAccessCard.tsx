import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card } from '@/components';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';

import { HafalanSummaryCard } from './HafalanSummaryCard';
import { useHafalanData } from './useHafalanData';

/**
 * Hafalan preview for Home and Statistik: the locked premium card, or the
 * self-reported summary with a link to the tracker when `hafalan_tracker` is
 * active.
 */
export function HafalanAccessCard({
  showDescription = true,
  showOpen = true,
}: {
  showDescription?: boolean;
  showOpen?: boolean;
}) {
  const { has } = useEntitlements();
  if (has('hafalan_tracker')) return <UnlockedPreview showOpen={showOpen} />;
  return <HafalanLockedCard showDescription={showDescription} />;
}

function UnlockedPreview({ showOpen }: { showOpen: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const data = useHafalanData(true);
  return (
    <HafalanSummaryCard summary={data?.summary ?? null}>
      {showOpen ? (
        <Button
          label={t('hafalan.open')}
          variant="secondary"
          onPress={() => router.navigate('/hafalan')}
        />
      ) : null}
    </HafalanSummaryCard>
  );
}

export function HafalanLockedCard({ showDescription = true }: { showDescription?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
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
