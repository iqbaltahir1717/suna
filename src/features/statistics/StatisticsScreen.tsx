import { useTranslation } from 'react-i18next';

import { AppText, Screen, Section } from '@/components';
import { HafalanAccessCard } from '@/features/hafalan/HafalanAccessCard';

import { ActivitySummaryCard } from './ActivitySummaryCard';

/**
 * Game activity (automatic) and hafalan (self-reported) are shown as two
 * separate sections and are never combined into one number.
 */
export function StatisticsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('tabs.statistics')}
      </AppText>
      <Section title={t('statistics.gameTitle')}>
        <AppText variant="caption" color="textMuted">
          {t('statistics.gameCaption')}
        </AppText>
        <ActivitySummaryCard />
      </Section>
      <Section title={t('statistics.hafalanTitle')}>
        <AppText variant="caption" color="textMuted">
          {t('statistics.hafalanCaption')}
        </AppText>
        <HafalanAccessCard showDescription={false} />
      </Section>
    </Screen>
  );
}
