import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText, Button, Card } from '@/components';
import { MascotView, type MascotHandle } from '@/features/mascot/MascotView';
import { colors, radius, spacing } from '@/theme';

import { QuranText } from './QuranText';

/**
 * Shown after a correct answer: the full passage in source order, gentle
 * feedback, and next steps. Says nothing about memorization on purpose.
 */
export function ResultsView({
  passage,
  hintsUsed,
  reduceMotion,
  onNext,
  onReplay,
  onBack,
}: {
  /** The complete ayat of the level, in source order. */
  passage: { ayah: number; text: string }[];
  hintsUsed: number;
  reduceMotion: boolean;
  onNext?: () => void;
  onReplay: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const mascot = useRef<MascotHandle>(null);

  useEffect(() => {
    if (!reduceMotion) mascot.current?.react('greet');
  }, [reduceMotion]);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header} accessibilityLiveRegion="polite">
          <MascotView ref={mascot} size={88} reduceMotion={reduceMotion} />
          <View style={styles.headerText}>
            <AppText variant="title">{t('susunAyatPlay.results.title')}</AppText>
            <AppText variant="caption" color="textMuted">
              {hintsUsed > 0
                ? t('susunAyatPlay.results.hintsUsed', { count: hintsUsed })
                : t('susunAyatPlay.results.noHints')}
            </AppText>
          </View>
        </View>

        <AppText>{t('susunAyatPlay.results.body')}</AppText>
        <Card>
          {passage.map((item) => (
            <View key={item.ayah} style={styles.ayah}>
              <View
                style={styles.ayahNumber}
                accessibilityLabel={t('susunAyatPlay.results.ayahNumber', {
                  number: item.ayah,
                })}
              >
                <AppText variant="label" color="primary">
                  {item.ayah}
                </AppText>
              </View>
              <QuranText size="passage" style={styles.ayahText}>
                {item.text}
              </QuranText>
            </View>
          ))}
        </Card>

        <AppText variant="caption" color="textMuted">
          {t('susunAyatEntry.note')}
        </AppText>

        <View style={styles.actions}>
          {onNext ? <Button label={t('susunAyatPlay.results.next')} onPress={onNext} /> : null}
          <Button label={t('susunAyatEntry.playAgain')} variant="secondary" onPress={onReplay} />
          <Button
            label={t('susunAyatPlay.results.backToList')}
            variant="secondary"
            onPress={onBack}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: spacing.xs },
  ayah: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ayahNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahText: { flex: 1 },
  actions: { gap: spacing.sm },
});
