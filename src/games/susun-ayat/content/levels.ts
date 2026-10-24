import type { LevelDefinition } from './types';

/**
 * Content set version. Bump it whenever levels or bundled text change so
 * progress rows record which version was completed.
 */
export const CONTENT_VERSION = '2026.10-1';

/**
 * Qualified human review of the text and of these level ranges is still
 * pending. Keep this `pending` until a reviewer signs off (see CONTENT.md).
 */
export const CONTENT_REVIEW_STATUS: 'pending' | 'approved' = 'pending';

const ayahRange = (surah: number, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ surah, ayah: from + i }));

function orderAyatLevel(
  id: string,
  surah: number,
  from: number,
  to: number,
  difficulty: LevelDefinition['difficulty'],
  allowedHints: number,
): LevelDefinition {
  return {
    id,
    contentVersion: CONTENT_VERSION,
    surah,
    ayahRange: { from, to },
    puzzleType: 'orderAyat',
    difficulty,
    orderedSources: ayahRange(surah, from, to),
    allowedHints,
    access: 'free',
  };
}

/**
 * Phase 2: five complete-ayat challenges from Al-Fatihah, all in the free
 * introductory set. Ids are permanent once shipped.
 */
export const LEVELS: readonly LevelDefinition[] = [
  orderAyatLevel('fatihah-ayat-1-3', 1, 1, 3, 'beginner', 1),
  orderAyatLevel('fatihah-ayat-3-5', 1, 3, 5, 'beginner', 1),
  orderAyatLevel('fatihah-ayat-5-7', 1, 5, 7, 'beginner', 1),
  orderAyatLevel('fatihah-ayat-1-5', 1, 1, 5, 'medium', 2),
  orderAyatLevel('fatihah-ayat-1-7', 1, 1, 7, 'medium', 2),
];

export function getLevel(id: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === id);
}
