import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card, Screen, Section } from '@/components';
import { useRepositories } from '@/data/DataProvider';
import type { ChallengeCompletion } from '@/data/repositories/progressRepository';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { spacing } from '@/theme';

import { canPlayLevel, CONTENT_REVIEW_STATUS, getSurahText, LEVELS, SURAH_NAMES } from '../content';
import { GAME_ID } from './usePlaySession';

const TANZIL_URL = 'https://tanzil.net';

export function SusunAyatEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { has } = useEntitlements();
  const completions = useCompletions();
  const source = getSurahText(1).source;

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <AppText color="textMuted">{t('susunAyatEntry.intro')}</AppText>

      <Section title={t('susunAyatEntry.challengesTitle')}>
        {LEVELS.map((level) => {
          const count = level.ayahRange.to - level.ayahRange.from + 1;
          const done = completions[level.id];
          const playable = canPlayLevel(level, has);
          return (
            <Card key={level.id}>
              <AppText variant="heading">
                {t('susunAyatEntry.levelTitle', {
                  surah: SURAH_NAMES[level.surah],
                  from: level.ayahRange.from,
                  to: level.ayahRange.to,
                })}
              </AppText>
              <View style={styles.badges}>
                <Badge label={t(`susunAyatEntry.difficulty.${level.difficulty}`)} />
                <Badge label={t('susunAyatEntry.ayahCount', { count })} />
                {done ? (
                  <Badge label={t('susunAyatEntry.completed')} tone="primary" icon="checkmark" />
                ) : null}
                {!playable ? (
                  <Badge label={t('susunAyatEntry.locked')} tone="locked" icon="lock-closed" />
                ) : null}
              </View>
              {playable ? (
                <Button
                  label={done ? t('susunAyatEntry.playAgain') : t('susunAyatEntry.play')}
                  variant={done ? 'secondary' : 'primary'}
                  onPress={() => router.push(`/games/susun-ayat/${level.id}`)}
                />
              ) : (
                <Button
                  label={t('premium.title')}
                  variant="secondary"
                  onPress={() => router.push('/premium')}
                />
              )}
            </Card>
          );
        })}
        <AppText variant="caption" color="textMuted">
          {t('susunAyatEntry.difficultyNote')}
        </AppText>
      </Section>

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

function useCompletions() {
  const { progress } = useRepositories();
  const [completions, setCompletions] = useState<Record<string, ChallengeCompletion>>({});
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      progress
        .listCompletedChallenges(GAME_ID)
        .then((next) => {
          if (!cancelled) setCompletions(next);
        })
        .catch((error: unknown) => console.warn('Failed to load completions', error));
      return () => {
        cancelled = true;
      };
    }, [progress]),
  );
  return completions;
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
