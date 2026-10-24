import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, EmptyState } from '@/components';
import { useSettings } from '@/features/settings/SettingsProvider';
import { spacing } from '@/theme';

import { isEmptySummary, useActivitySummary } from './useActivitySummary';

/** Real local game activity, shared by Home and Statistik. */
export function ActivitySummaryCard() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const summary = useActivitySummary();

  if (!summary) {
    return (
      <Card>
        <AppText color="textMuted">{t('common.loading')}</AppText>
      </Card>
    );
  }

  const lastActivity = summary.lastActivityAt
    ? new Date(summary.lastActivityAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
      })
    : t('stats.never');

  return (
    <Card>
      <View style={styles.row}>
        <Stat label={t('stats.completedChallenges')} value={String(summary.completedChallenges)} />
        <Stat label={t('stats.practiceSessions')} value={String(summary.practiceSessions)} />
        <Stat label={t('stats.lastActivity')} value={lastActivity} />
      </View>
      {isEmptySummary(summary) ? (
        <EmptyState
          icon="sparkles-outline"
          title={t('stats.emptyTitle')}
          body={t('stats.emptyBody')}
        />
      ) : null}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: 88, gap: spacing.xxs },
});
