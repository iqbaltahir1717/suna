import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, EmptyState } from '@/components';
import { TOTAL_AYAT } from '@/data/quran';
import { colors, radius, spacing } from '@/theme';

import { StatusBadge } from './StatusBadge';
import { HAFALAN_STATUSES, type HafalanSummary } from './types';
import { useHafalanFormat } from './useHafalanFormat';

/** Self-reported totals. Never mixed with game activity. */
export function HafalanSummaryCard({
  summary,
  children,
}: {
  summary: HafalanSummary | null;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { formatDate } = useHafalanFormat();

  if (!summary) {
    return (
      <Card>
        <AppText color="textMuted">{t('common.loading')}</AppText>
      </Card>
    );
  }

  if (summary.entries === 0) {
    return (
      <Card>
        <EmptyState
          icon="book-outline"
          title={t('hafalan.emptyTitle')}
          body={t('hafalan.emptyBody')}
        />
        {children}
      </Card>
    );
  }

  const memorized = summary.ayatByStatus.memorized;
  return (
    <Card>
      <View style={styles.statuses}>
        {HAFALAN_STATUSES.map((status) => (
          <View key={status} style={styles.status}>
            <AppText variant="title">{String(summary.ayatByStatus[status])}</AppText>
            <StatusBadge status={status} />
          </View>
        ))}
      </View>
      <View
        style={styles.bar}
        accessible
        accessibilityLabel={t('hafalan.ofQuran', { memorized, total: TOTAL_AYAT })}
      >
        <View
          style={[styles.fill, { width: `${Math.min(100, (memorized / TOTAL_AYAT) * 100)}%` }]}
        />
      </View>
      <AppText variant="caption" color="textMuted">
        {t('hafalan.ofQuran', { memorized, total: TOTAL_AYAT })}
      </AppText>
      <View style={styles.row}>
        <Stat label={t('hafalan.surahsTracked')} value={String(summary.surahsTracked)} />
        <Stat label={t('hafalan.surahsMemorized')} value={String(summary.surahsMemorized)} />
        <Stat
          label={t('hafalan.lastActivity')}
          value={summary.lastActivityAt ? formatDate(summary.lastActivityAt) : '—'}
        />
      </View>
      {children}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statuses: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  status: { flex: 1, minWidth: 90, gap: spacing.xs },
  bar: {
    height: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: 90, gap: spacing.xxs },
});
