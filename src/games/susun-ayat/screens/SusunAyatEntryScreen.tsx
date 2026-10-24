import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card, Screen, Section, SegmentedControl } from '@/components';
import { useRepositories } from '@/data/DataProvider';
import type { ChallengeCompletion, LevelStats } from '@/data/repositories/progressRepository';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { colors, spacing, typography } from '@/theme';

import {
  canPlayLevel,
  CONTENT_REVIEW_STATUS,
  DIFFICULTIES,
  getSurahText,
  LEVELS,
  listSurahs,
  pickPracticeLevel,
  SURAH_NAMES,
  type Difficulty,
  type LevelDefinition,
} from '../content';
import { levelTitle, pieceCountLabel } from './levelText';
import { GAME_ID } from './usePlaySession';

const TANZIL_URL = 'https://tanzil.net';
const MARK = require('../../../../assets/brand/susun-ayat-mark.png');

type Filter = Difficulty | 'all';

export function SusunAyatEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { has } = useEntitlements();
  const { completions, levelStats } = useLevelProgress();
  const [filter, setFilter] = useState<Filter>('all');
  const source = getSurahText(1).source;

  const visible = useMemo(
    () => LEVELS.filter((level) => filter === 'all' || level.difficulty === filter),
    [filter],
  );
  const playable = visible.filter((level) => canPlayLevel(level, has));

  const practice = () => {
    const level = pickPracticeLevel(playable, (id) => !!completions[id]);
    if (level) router.push(`/games/susun-ayat/${level.id}`);
  };

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <Hero
        completed={Object.keys(completions).length}
        noHints={Object.values(levelStats).filter((s) => s.bestHintsUsed === 0).length}
        total={LEVELS.length}
      />
      <Button
        label={t('susunAyatEntry.practice')}
        icon="shuffle"
        fullWidth
        disabled={playable.length === 0}
        onPress={practice}
      />
      <AppText color="textMuted">{t('susunAyatEntry.intro')}</AppText>

      <Section title={t('susunAyatEntry.difficultyTitle')}>
        <SegmentedControl
          accessibilityLabel={t('susunAyatEntry.difficultyTitle')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('susunAyatEntry.all') },
            ...DIFFICULTIES.map((d) => ({ value: d, label: t(`susunAyatEntry.difficulty.${d}`) })),
          ]}
        />
        <AppText variant="caption" color="textMuted">
          {filter === 'all'
            ? t('susunAyatEntry.difficultyNote')
            : t(`susunAyatEntry.difficultyRule.${filter}`)}
        </AppText>
      </Section>

      {listSurahs(visible).map((surah) => (
        <Section key={surah} title={SURAH_NAMES[surah] ?? String(surah)}>
          {visible
            .filter((level) => level.surah === surah)
            .map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                completion={completions[level.id]}
                stats={levelStats[level.id]}
                playable={canPlayLevel(level, has)}
                onPlay={() => router.push(`/games/susun-ayat/${level.id}`)}
                onLocked={() => router.push('/premium')}
              />
            ))}
        </Section>
      ))}

      <AppText variant="caption" color="textMuted">
        {t('susunAyatEntry.note')}
      </AppText>

      <Section title={t('susunAyatEntry.sourceTitle')}>
        <AppText variant="caption">
          {t('susunAyatEntry.sourceBody', { type: source.textType, version: source.version })}
        </AppText>
        {CONTENT_REVIEW_STATUS === 'pending' ? (
          <AppText variant="caption" color="textMuted">
            {t('susunAyatEntry.reviewPending')}
          </AppText>
        ) : null}
        <Button
          label={t('susunAyatEntry.sourceLink')}
          variant="secondary"
          onPress={() => void Linking.openURL(TANZIL_URL)}
        />
      </Section>
    </Screen>
  );
}

/** Title area modelled on the green Susun Ayat concept (Figma 2003:328). */
function Hero({ completed, noHints, total }: { completed: number; noHints: number; total: number }) {
  const { t } = useTranslation();
  return (
    <View style={styles.hero}>
      <Image source={MARK} style={styles.mark} accessible={false} />
      <AppText style={styles.heroTitle} accessibilityRole="header">
        {t('susunAyatEntry.heroTitleFirst')}{' '}
        <AppText style={[styles.heroTitle, styles.heroTitleSecond]}>
          {t('susunAyatEntry.heroTitleSecond')}
        </AppText>
      </AppText>
      <AppText color="textMuted">{t('susunAyatEntry.tagline')}</AppText>
      <View style={styles.stats}>
        <HeroStat value={`${completed}/${total}`} label={t('susunAyatEntry.statCompleted')} />
        <View style={styles.statDivider} />
        <HeroStat value={String(noHints)} label={t('susunAyatEntry.statNoHints')} />
      </View>
    </View>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption" color="textMuted" style={styles.center}>
        {label}
      </AppText>
      <AppText variant="display" color="primary" style={styles.center}>
        {value}
      </AppText>
    </View>
  );
}

function LevelCard({
  level,
  completion,
  stats,
  playable,
  onPlay,
  onLocked,
}: {
  level: LevelDefinition;
  completion: ChallengeCompletion | undefined;
  stats: LevelStats | undefined;
  playable: boolean;
  onPlay: () => void;
  onLocked: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <AppText variant="heading">{levelTitle(t, level)}</AppText>
      <View style={styles.badges}>
        <Badge label={t(`susunAyatEntry.mode.${level.puzzleType}`)} />
        <Badge label={t(`susunAyatEntry.difficulty.${level.difficulty}`)} />
        <Badge label={pieceCountLabel(t, level)} />
        {completion ? (
          <Badge
            label={t('susunAyatEntry.completedTimes', { count: completion.completionCount })}
            tone="primary"
            icon="checkmark"
          />
        ) : null}
        {stats?.bestHintsUsed === 0 ? (
          <Badge label={t('susunAyatEntry.noHintsBadge')} tone="primary" icon="star-outline" />
        ) : null}
        {!playable ? (
          <Badge label={t('susunAyatEntry.locked')} tone="locked" icon="lock-closed" />
        ) : null}
      </View>
      {playable ? (
        <Button
          label={completion ? t('susunAyatEntry.playAgain') : t('susunAyatEntry.play')}
          variant={completion ? 'secondary' : 'primary'}
          onPress={onPlay}
        />
      ) : (
        <Button label={t('premium.title')} variant="secondary" onPress={onLocked} />
      )}
    </Card>
  );
}

function useLevelProgress() {
  const { progress } = useRepositories();
  const [state, setState] = useState<{
    completions: Record<string, ChallengeCompletion>;
    levelStats: Record<string, LevelStats>;
  }>({ completions: {}, levelStats: {} });
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([progress.listCompletedChallenges(GAME_ID), progress.getGameStats(GAME_ID, 0)])
        .then(([completions, stats]) => {
          if (!cancelled) setState({ completions, levelStats: stats.levels });
        })
        .catch((error: unknown) => console.warn('Failed to load progress', error));
      return () => {
        cancelled = true;
      };
    }, [progress]),
  );
  return state;
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.md },
  mark: { width: 96, height: 96, marginBottom: spacing.sm },
  heroTitle: { ...typography.hero, fontSize: 40, lineHeight: 48, color: colors.primary },
  heroTitleSecond: { color: colors.sageText },
  stats: { flexDirection: 'row', alignItems: 'stretch', marginTop: spacing.md, alignSelf: 'stretch' },
  stat: { flex: 1, gap: spacing.xxs },
  statDivider: { width: 1, backgroundColor: colors.border },
  center: { textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
