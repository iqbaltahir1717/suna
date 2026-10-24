import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText, IconButton, TextField } from '@/components';
import { SURAHS, type SurahMeta } from '@/data/quran';
import { colors, minTapTarget, motion, spacing } from '@/theme';

import { SurahArabicName } from './HafalanEntryRow';
import { useHafalanFormat } from './useHafalanFormat';

/** Full-screen list of all 114 surahs with search by number or name. */
export function SurahPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (surah: number) => void;
}) {
  const { t } = useTranslation();
  const { surahName } = useHafalanFormat();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SURAHS;
    // Digits search the surah number; anything else searches the names.
    if (/^\d+$/.test(q)) return SURAHS.filter((s) => String(s.surah).startsWith(q));
    return SURAHS.filter(
      (s) => surahName(s.surah).toLowerCase().includes(q) || s.nameArabic.includes(q),
    );
  }, [query, surahName]);

  const renderItem = ({ item }: { item: SurahMeta }) => (
    <Pressable
      onPress={() => {
        onSelect(item.surah);
        setQuery('');
      }}
      accessibilityRole="button"
      accessibilityLabel={`${surahName(item.surah)}, ${t('hafalan.editor.ayahTotal', { count: item.ayahCount })}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppText variant="heading" style={styles.number}>
        {String(item.surah)}
      </AppText>
      <View style={styles.text}>
        <AppText>{surahName(item.surah)}</AppText>
        <AppText variant="caption" color="textMuted">
          {t('hafalan.editor.ayahTotal', { count: item.ayahCount })}
        </AppText>
      </View>
      <SurahArabicName surah={item.surah} />
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header" style={styles.title}>
            {t('hafalan.editor.chooseSurah')}
          </AppText>
          <IconButton
            icon="close"
            onPress={onClose}
            accessibilityLabel={t('hafalan.editor.cancel')}
          />
        </View>
        <View style={styles.search}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('hafalan.editor.searchSurah')}
            accessibilityLabel={t('hafalan.editor.searchSurah')}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.surah)}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText color="textMuted">{t('hafalan.editor.noSurahFound')}</AppText>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  title: { flex: 1 },
  search: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    minHeight: minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  number: { width: 36, textAlign: 'center' },
  text: { flex: 1, gap: spacing.xxs },
  pressed: { opacity: motion.pressFeedbackOpacity },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
