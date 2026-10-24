import type { EntitlementKey } from '@/features/purchases/entitlements';

import type { PuzzlePiece } from '../engine';
import { LEVELS } from './levels';
import { getAyahText, QURAN_TEXTS } from './quran';
import type { LevelDefinition, SourceReference } from './types';

export { CONTENT_REVIEW_STATUS, CONTENT_VERSION, getLevel, LEVELS } from './levels';
export { getAyahText, QURAN_TEXTS, SURAH_NAMES } from './quran';
export type { Difficulty, LevelDefinition, SourceReference } from './types';

export const sourceKey = (ref: SourceReference) => `${ref.surah}:${ref.ayah}`;

export interface LevelCard extends PuzzlePiece {
  ref: SourceReference;
  /** Verbatim source text. */
  text: string;
}

/**
 * Cards for a level in the correct order. The match key is the exact text,
 * so identical ayat are interchangeable during validation.
 */
export function buildLevelCards(level: LevelDefinition): LevelCard[] {
  if (level.puzzleType !== 'orderAyat') {
    throw new Error(`Puzzle type ${level.puzzleType} is not implemented yet.`);
  }
  return level.orderedSources.map((ref) => {
    const text = getAyahText(ref.surah, ref.ayah);
    return { id: sourceKey(ref), matchKey: text, ref, text };
  });
}

export function canPlayLevel(level: LevelDefinition, has: (key: EntitlementKey) => boolean) {
  return level.access === 'free' || has(level.access);
}

export function getSurahText(surah: number) {
  const text = QURAN_TEXTS[surah];
  if (!text) throw new Error(`Surah ${surah} is not bundled.`);
  return text;
}

/** Level ids in display order; handy for "next challenge". */
export function nextLevelId(id: string): string | undefined {
  const index = LEVELS.findIndex((level) => level.id === id);
  return index >= 0 ? LEVELS[index + 1]?.id : undefined;
}
