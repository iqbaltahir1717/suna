import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, RowDivider } from '@/components';
import { useRepositories } from '@/data/DataProvider';
import type { GameStats } from '@/data/repositories/progressRepository';
import { useSettings } from '@/features/settings/SettingsProvider';
import { spacing } from '@/theme';

import { DIFFICULTIES, getLevel, LEVELS, PUZZLE_TYPES } from '../content';
import { levelTitle } from '../screens/levelText';
import { GAME_ID } from '../screens/usePlaySession';
import { summarizeProgress, type ProgressCount } from '../stats';

/** Real Susun Ayat statistics from this device. Game activity only. */
export function SusunAyatStatsCard() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const stats = useGameStats();

  if (!stats) {
    return (
      <Card>
        <AppText color="textMuted">{t('common.loading')}</AppText>
      </Card>
    );
  }

  const summary = summarizeProgress(LEVELS, stats);
  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <Card>
      <AppText variant="heading">
        {t('statistics.susunAyat.completed', { ...summary.overall })}
      </AppText>

      <View style={styles.grid}>
        <Figure label={t('statistics.susunAyat.attempts')} value={summary.attempts} />
        <Figure label={t('statistics.susunAyat.finished')} value={summary.completedAttempts} />
        <Figure label={t('statistics.susunAyat.noHints')} value={summary.solvedWithoutHints} />
        <Figure label={t('statistics.susunAyat.activeDays')} value={summary.activeDays} />
      </View>

      <RowDivider />
      <AppText variant="label" color="textMuted">
        {t('statistics.susunAyat.byDifficulty')}
      </AppText>
      {DIFFICULTIES.map((d) => (
        <CountRow
          key={d}
          label={t(`susunAyatEntry.difficulty.${d}`)}
          count={summary.byDifficulty[d]}
        />
      ))}

      <RowDivider />
      <AppText variant="label" color="textMuted">
        {t('statistics.susunAyat.byMode')}
      </AppText>
      {PUZZLE_TYPES.map((p) => (
        <CountRow key={p} label={t(`susunAyatEntry.mode.${p}`)} count={summary.byType[p]} />
      ))}

      <RowDivider />
      <AppText variant="label" color="textMuted">
        {t('statistics.susunAyat.recent')}
      </AppText>
      {stats.recent.length === 0 ? (
        <AppText variant="caption" color="textMuted">
          {t('statistics.susunAyat.recentEmpty')}
        </AppText>
      ) : (
        stats.recent.map((session, index) => {
          const level = session.levelId ? getLevel(session.levelId) : undefined;
          return (
            <View key={index} style={styles.row} accessible>
              <AppText variant="caption" style={styles.rowLabel}>
                {level ? levelTitle(t, level) : t('statistics.susunAyat.removedLevel')}
              </AppText>
              <AppText variant="caption" color={session.completed ? 'primary' : 'textMuted'}>
                {`${formatDate(session.startedAt)} · ${t(
                  session.completed
                    ? 'statistics.susunAyat.statusDone'
                    : 'statistics.susunAyat.statusLeft',
                )}`}
              </AppText>
            </View>
          );
        })
      )}
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.figure} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="title">{String(value)}</AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function CountRow({ label, count }: { label: string; count: ProgressCount }) {
  const value = `${count.completed}/${count.total}`;
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption" style={styles.rowLabel}>
        {label}
      </AppText>
      <AppText variant="caption">{value}</AppText>
    </View>
  );
}

function useGameStats(): GameStats | null {
  const { progress } = useRepositories();
  const [stats, setStats] = useState<GameStats | null>(null);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      progress
        .getGameStats(GAME_ID)
        .then((next) => {
          if (!cancelled) setStats(next);
        })
        .catch((error: unknown) => console.warn('Failed to load game statistics', error));
      return () => {
        cancelled = true;
      };
    }, [progress]),
  );
  return stats;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  figure: { flexGrow: 1, flexBasis: 120, gap: spacing.xxs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { flex: 1 },
});
