import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, Icon } from '@/components';
import { getSurah } from '@/data/quran';
import { colors, quranTypography, spacing } from '@/theme';

import { StatusBadge } from './StatusBadge';
import type { HafalanEntry } from './types';
import { useHafalanFormat } from './useHafalanFormat';

export function HafalanEntryRow({ entry, onPress }: { entry: HafalanEntry; onPress: () => void }) {
  const { t } = useTranslation();
  const { surahName, rangeText, formatDate } = useHafalanFormat();
  const name = surahName(entry.range.surah);
  const range = rangeText(entry.range);
  const status = t(`hafalan.status.${entry.status}`);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={t('hafalan.entryA11y', { surah: name, range, status })}
    >
      <View style={styles.top}>
        <View style={styles.title}>
          <AppText variant="heading">{name}</AppText>
          <AppText color="textMuted">{range}</AppText>
        </View>
        <SurahArabicName surah={entry.range.surah} />
        <Icon name="chevron-forward" size={18} color="textMuted" />
      </View>
      <View style={styles.meta}>
        <StatusBadge status={entry.status} />
        <AppText variant="caption" color="textMuted">
          {t('hafalan.statusSince', { status, date: formatDate(entry.statusChangedAt) })}
        </AppText>
      </View>
      {entry.lastReviewedAt ? (
        <AppText variant="caption" color="textMuted">
          {t('hafalan.reviewedOn', { date: formatDate(entry.lastReviewedAt) })}
        </AppText>
      ) : null}
      {entry.note ? (
        <AppText variant="caption" numberOfLines={2}>
          {entry.note}
        </AppText>
      ) : null}
    </Card>
  );
}

/** Surah name as written in the Tanzil metadata. */
export function SurahArabicName({ surah }: { surah: number }) {
  const meta = getSurah(surah);
  if (!meta) return null;
  return (
    <Text style={styles.arabic} accessibilityLanguage="ar">
      {meta.nameArabic}
    </Text>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, gap: spacing.xxs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  arabic: {
    fontFamily: quranTypography.fontFamily,
    fontSize: 20,
    lineHeight: 36,
    color: colors.text,
    writingDirection: 'rtl',
  },
});
