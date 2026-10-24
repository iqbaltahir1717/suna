import type { TFunction } from 'i18next';

import { SURAH_NAMES, type LevelDefinition } from '../content';

/** "Al-Ikhlas · ayat 1–4" or "Al-Ikhlas · words of ayah 1". */
export function levelTitle(t: TFunction, level: LevelDefinition) {
  const { from, to } = level.ayahRange;
  const surah = SURAH_NAMES[level.surah];
  if (level.puzzleType === 'orderAyat') {
    return t('susunAyatEntry.levelTitle', { surah, from, to });
  }
  return from === to
    ? t('susunAyatEntry.levelTitleWordsOne', { surah, ayah: from })
    : t('susunAyatEntry.levelTitleWords', { surah, from, to });
}

/** "3 ayat" or "9 words". */
export function pieceCountLabel(t: TFunction, level: LevelDefinition) {
  const count = level.orderedSources.length;
  return level.puzzleType === 'orderAyat'
    ? t('susunAyatEntry.ayahCount', { count })
    : t('susunAyatEntry.wordCount', { count });
}
