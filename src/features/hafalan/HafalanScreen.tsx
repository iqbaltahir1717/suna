import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText, Button, Screen, Section } from '@/components';
import { QURAN_METADATA_SOURCE } from '@/data/quran';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';

import { HafalanLockedCard } from './HafalanAccessCard';
import { HafalanEntryRow } from './HafalanEntryRow';
import { HafalanSummaryCard } from './HafalanSummaryCard';
import { useHafalanData } from './useHafalanData';

export function HafalanScreen() {
  const { t } = useTranslation();
  const { has } = useEntitlements();
  const unlocked = has('hafalan_tracker');

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('hafalan.title')}
      </AppText>
      <AppText color="textMuted">{t('hafalan.description')}</AppText>
      {unlocked ? (
        <HafalanTracker />
      ) : (
        <Section title={t('home.hafalanTitle')}>
          <HafalanLockedCard showDescription={false} />
        </Section>
      )}
    </Screen>
  );
}

function HafalanTracker() {
  const { t } = useTranslation();
  const router = useRouter();
  const data = useHafalanData(true);

  return (
    <>
      <Section title={t('hafalan.summaryTitle')}>
        <HafalanSummaryCard summary={data?.summary ?? null} />
        <AppText variant="caption" color="textMuted">
          {t('hafalan.selfReported')}
        </AppText>
      </Section>
      <Button label={t('hafalan.add')} onPress={() => router.push('/hafalan-entry/new')} />
      {data && data.entries.length > 0 ? (
        <Section title={t('hafalan.listTitle')}>
          {data.entries.map((entry) => (
            <HafalanEntryRow
              key={entry.id}
              entry={entry}
              onPress={() =>
                router.push({ pathname: '/hafalan-entry/[entryId]', params: { entryId: entry.id } })
              }
            />
          ))}
        </Section>
      ) : null}
      <AppText variant="label" color="textMuted">
        {t('hafalan.source', { version: QURAN_METADATA_SOURCE.version })}
      </AppText>
    </>
  );
}
