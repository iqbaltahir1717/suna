import type { EntitlementKey } from '@/features/purchases/entitlements';

import type { PuzzlePiece, Random } from '../engine';
import { DIFFICULTY_RULES, LEVELS } from './levels';
import { getAyahText, QURAN_TEXTS } from './quran';
import { segmentAyah } from './segmentation';
import type { LevelDefinition, SourceReference } from './types';

export {
  CONTENT_REVIEW_STATUS,
  CONTENT_VERSION,
  DIFFICULTY_RULES,
  FREE_SURAHS,
  getLevel,
  hintsFor,
  LEVELS,
} from './levels';
export { getAyahText, QURAN_TEXTS, SURAH_NAMES } from './quran';
export { segmentAyah } from './segmentation';
export { DIFFICULTIES, PUZZLE_TYPES } from './types';
export type { Difficulty, LevelDefinition, PuzzleType, SourceReference } from './types';

export const sourceKey = (ref: SourceReference) =>
  ref.word === undefined ? `${ref.surah}:${ref.ayah}` : `${ref.surah}:${ref.ayah}:${ref.word}`;

export interface LevelCard extends PuzzlePiece {
  ref: SourceReference;
  /** Verbatim source text: a whole ayah, or one word of it. */
  text: string;
}

function sourceText(ref: SourceReference) {
  const ayah = getAyahText(ref.surah, ref.ayah);
  if (ref.word === undefined) return ayah;
  const word = segmentAyah(ayah)[ref.word - 1];
  if (word === undefined) throw new Error(`Word ${sourceKey(ref)} does not exist.`);
  return word;
}

/**
 * Cards for a level in the correct order. The match key is the exact text,
 * so identical ayat or words are interchangeable during validation.
 */
export function buildLevelCards(level: LevelDefinition): LevelCard[] {
  return level.orderedSources.map((ref) => {
    const text = sourceText(ref);
    return { id: sourceKey(ref), matchKey: text, ref, text };
  });
}

/** The complete ayat a level covers, in source order, for the results screen. */
export function levelPassage(level: LevelDefinition) {
  const { from, to } = level.ayahRange;
  return Array.from({ length: to - from + 1 }, (_, i) => ({
    ayah: from + i,
    text: getAyahText(level.surah, from + i),
  }));
}

export function showsAyahBreaks(level: LevelDefinition) {
  return (
    level.puzzleType === 'orderWords' &&
    level.ayahRange.to > level.ayahRange.from &&
    DIFFICULTY_RULES[level.difficulty].showAyahBreaks
  );
}

export function canPlayLevel(level: LevelDefinition, has: (key: EntitlementKey) => boolean) {
  return level.access === 'free' || has(level.access);
}

export function getSurahText(surah: number) {
  const text = QURAN_TEXTS[surah];
  if (!text) throw new Error(`Surah ${surah} is not bundled.`);
  return text;
}

/** Surahs in the order their challenges are listed. */
export function listSurahs(levels: readonly LevelDefinition[] = LEVELS) {
  return [...new Set(levels.map((level) => level.surah))];
}

/** The next challenge in display order that the player can open, if any. */
export function nextLevelId(
  id: string,
  canPlay: (level: LevelDefinition) => boolean = () => true,
  levels: readonly LevelDefinition[] = LEVELS,
): string | undefined {
  const index = levels.findIndex((level) => level.id === id);
  if (index < 0) return undefined;
  return levels.slice(index + 1).find(canPlay)?.id;
}

/**
 * Practice picks a random playable challenge from `candidates`, preferring
 * ones not completed yet so practice also moves the player forward.
 */
export function pickPracticeLevel(
  candidates: readonly LevelDefinition[],
  isCompleted: (id: string) => boolean,
  random: Random = Math.random,
): LevelDefinition | undefined {
  const fresh = candidates.filter((level) => !isCompleted(level.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(random() * pool.length)];
}

/** Free and premium challenge counts, for the premium package contents. */
export function accessSummary(levels: readonly LevelDefinition[] = LEVELS) {
  const premium = levels.filter((level) => level.access !== 'free');
  return {
    free: levels.length - premium.length,
    premium: premium.length,
    premiumSurahs: listSurahs(premium).length,
  };
}
