import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/features/settings/SettingsProvider';
import { SURAH_NAMES } from '@/games/susun-ayat/content/quran';

import type { AyahRange } from './types';

/** Display helpers shared by the hafalan screens. */
export function useHafalanFormat() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  // Latin names exist only for the surahs Susun Ayat bundles; other surahs
  // show their number with the Arabic name from the Tanzil metadata.
  const surahName = useCallback(
    (surah: number) => SURAH_NAMES[surah] ?? t('hafalan.surahLabel', { number: surah }),
    [t],
  );

  const rangeText = useCallback(
    (range: AyahRange) =>
      range.fromAyah === range.toAyah
        ? t('hafalan.singleAyahLabel', { ayah: range.fromAyah })
        : t('hafalan.rangeLabel', { from: range.fromAyah, to: range.toAyah }),
    [t],
  );

  const formatDate = useCallback(
    (ms: number) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    [locale],
  );

  return { surahName, rangeText, formatDate };
}
