import { getAyahText } from './quran';
import { segmentAyah } from './segmentation';
import type {
  Difficulty,
  DifficultyRule,
  LevelDefinition,
  PuzzleType,
  SourceReference,
} from './types';

/**
 * Content set version. Bump it whenever levels or bundled text change so
 * progress rows record which version was completed.
 */
export const CONTENT_VERSION = '2026.10-2';

/**
 * Qualified human review of the text, the word segmentation, and these
 * level ranges is still pending. Keep this `pending` until a reviewer signs
 * off (see CONTENT.md).
 */
export const CONTENT_REVIEW_STATUS: 'pending' | 'approved' = 'pending';

/** Difficulty labels are provisional; the rules below are what they mean. */
export const DIFFICULTY_RULES: Readonly<Record<Difficulty, DifficultyRule>> = {
  beginner: { pieces: { min: 2, max: 4 }, hintsPerPiece: 0.4, showAyahBreaks: true },
  medium: { pieces: { min: 4, max: 7 }, hintsPerPiece: 0.3, showAyahBreaks: true },
  hard: { pieces: { min: 8, max: 12 }, hintsPerPiece: 0.2, showAyahBreaks: true },
  expert: { pieces: { min: 13, max: 20 }, hintsPerPiece: 0.15, showAyahBreaks: false },
};

/**
 * The free introductory set: every challenge from these surahs. All other
 * challenges need `susun_ayat_full`. Al-Fatihah stays free because its
 * Phase 2 challenges shipped free.
 */
export const FREE_SURAHS: readonly number[] = [1, 114, 113];

export function hintsFor(difficulty: Difficulty, pieceCount: number) {
  return Math.max(1, Math.round(pieceCount * DIFFICULTY_RULES[difficulty].hintsPerPiece));
}

function sourcesFor(type: PuzzleType, surah: number, from: number, to: number) {
  const refs: SourceReference[] = [];
  for (let ayah = from; ayah <= to; ayah++) {
    if (type === 'orderAyat') {
      refs.push({ surah, ayah });
    } else {
      segmentAyah(getAyahText(surah, ayah)).forEach((_, i) =>
        refs.push({ surah, ayah, word: i + 1 }),
      );
    }
  }
  return refs;
}

function level(
  id: string,
  puzzleType: PuzzleType,
  surah: number,
  [from, to]: [number, number],
  difficulty: Difficulty,
): LevelDefinition {
  const orderedSources = sourcesFor(puzzleType, surah, from, to);
  return {
    id,
    contentVersion: CONTENT_VERSION,
    surah,
    ayahRange: { from, to },
    puzzleType,
    difficulty,
    orderedSources,
    allowedHints: hintsFor(difficulty, orderedSources.length),
    access: FREE_SURAHS.includes(surah) ? 'free' : 'susun_ayat_full',
  };
}

const ayat = (id: string, surah: number, from: number, to: number, difficulty: Difficulty) =>
  level(id, 'orderAyat', surah, [from, to], difficulty);
const words = (id: string, surah: number, from: number, to: number, difficulty: Difficulty) =>
  level(id, 'orderWords', surah, [from, to], difficulty);

/**
 * All challenges in display order: Al-Fatihah first, then Juz ‘Amma from
 * An-Nas backwards, the order most learners memorize in. Within a surah,
 * whole-ayat challenges come before word challenges.
 *
 * Ids are permanent once shipped. The first five are from Phase 2.
 */
export const LEVELS: readonly LevelDefinition[] = [
  // Al-Fatihah (free)
  ayat('fatihah-ayat-1-3', 1, 1, 3, 'beginner'),
  ayat('fatihah-ayat-3-5', 1, 3, 5, 'beginner'),
  ayat('fatihah-ayat-5-7', 1, 5, 7, 'beginner'),
  ayat('fatihah-ayat-1-5', 1, 1, 5, 'medium'),
  ayat('fatihah-ayat-1-7', 1, 1, 7, 'medium'),
  words('fatihah-words-2', 1, 2, 2, 'beginner'),
  words('fatihah-words-5', 1, 5, 5, 'beginner'),
  words('fatihah-words-7', 1, 7, 7, 'hard'),
  words('fatihah-words-5-7', 1, 5, 7, 'expert'),
  // An-Nas (free)
  ayat('nas-ayat-1-3', 114, 1, 3, 'beginner'),
  ayat('nas-ayat-1-6', 114, 1, 6, 'medium'),
  words('nas-words-1', 114, 1, 1, 'beginner'),
  words('nas-words-4-6', 114, 4, 6, 'hard'),
  // Al-Falaq (free)
  ayat('falaq-ayat-1-5', 113, 1, 5, 'medium'),
  words('falaq-words-1', 113, 1, 1, 'beginner'),
  words('falaq-words-2-3', 113, 2, 3, 'hard'),
  words('falaq-words-1-3', 113, 1, 3, 'expert'),
  // Al-Ikhlas
  ayat('ikhlas-ayat-1-4', 112, 1, 4, 'medium'),
  words('ikhlas-words-1', 112, 1, 1, 'beginner'),
  words('ikhlas-words-4', 112, 4, 4, 'medium'),
  words('ikhlas-words-1-4', 112, 1, 4, 'expert'),
  // An-Nasr
  ayat('nasr-ayat-1-3', 110, 1, 3, 'beginner'),
  words('nasr-words-1', 110, 1, 1, 'medium'),
  words('nasr-words-2', 110, 2, 2, 'medium'),
  words('nasr-words-2-3', 110, 2, 3, 'expert'),
  // Al-Kafirun (ayat 3 and 5 are identical; either card is accepted)
  ayat('kafirun-ayat-1-6', 109, 1, 6, 'medium'),
  words('kafirun-words-2', 109, 2, 2, 'beginner'),
  words('kafirun-words-4', 109, 4, 4, 'medium'),
  // Al-Kautsar
  ayat('kautsar-ayat-1-3', 108, 1, 3, 'beginner'),
  words('kautsar-words-1', 108, 1, 1, 'beginner'),
  words('kautsar-words-3', 108, 3, 3, 'beginner'),
  words('kautsar-words-1-3', 108, 1, 3, 'hard'),
  // Al-Ma‘un
  ayat('maun-ayat-1-3', 107, 1, 3, 'beginner'),
  ayat('maun-ayat-4-7', 107, 4, 7, 'medium'),
  words('maun-words-1', 107, 1, 1, 'beginner'),
  words('maun-words-1-3', 107, 1, 3, 'expert'),
  // Quraisy
  ayat('quraisy-ayat-1-4', 106, 1, 4, 'medium'),
  words('quraisy-words-1-2', 106, 1, 2, 'medium'),
  words('quraisy-words-4', 106, 4, 4, 'medium'),
  words('quraisy-words-3-4', 106, 3, 4, 'hard'),
  // Al-‘Asr
  ayat('asr-ayat-1-3', 103, 1, 3, 'beginner'),
  words('asr-words-2', 103, 2, 2, 'beginner'),
  words('asr-words-3', 103, 3, 3, 'hard'),
  words('asr-words-1-3', 103, 1, 3, 'expert'),
];

export function getLevel(id: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === id);
}
