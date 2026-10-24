import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Card, Screen, Section } from '@/components';
import { spacing } from '@/theme';

import { DIFFICULTIES } from '../content/types';

/**
 * Phase 1 entry screen. Honest placeholder: no puzzle, no Quran text, and no
 * play button until reviewed content exists (Phase 2).
 */
export function SusunAyatEntryScreen() {
  const { t } = useTranslation();
  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <AppText color="textMuted">{t('games.susunAyat.description')}</AppText>

      <Card>
        <Badge label={t('games.availability.preview')} icon="construct-outline" />
        <AppText variant="heading">{t('susunAyatEntry.statusTitle')}</AppText>
        <AppText variant="caption" color="textMuted">
          {t('susunAyatEntry.statusBody')}
        </AppText>
      </Card>

      <Section title={t('susunAyatEntry.howTitle')}>
        <AppText>{t('susunAyatEntry.howBody')}</AppText>
        <AppText variant="caption" color="textMuted">
          {t('susunAyatEntry.note')}
        </AppText>
      </Section>

      <Section title={t('susunAyatEntry.difficultyTitle')}>
        <View style={styles.levels}>
          {DIFFICULTIES.map((level) => (
            <Badge key={level} label={t(`susunAyatEntry.difficulty.${level}`)} />
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  levels: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
