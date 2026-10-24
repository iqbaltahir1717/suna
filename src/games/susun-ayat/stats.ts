import type { GameStats } from '@/data/repositories/progressRepository';

import {
  DIFFICULTIES,
  PUZZLE_TYPES,
  type Difficulty,
  type LevelDefinition,
  type PuzzleType,
} from './content';

export interface ProgressCount {
  completed: number;
  total: number;
}

export interface SusunAyatProgress {
  overall: ProgressCount;
  byDifficulty: Record<Difficulty, ProgressCount>;
  byType: Record<PuzzleType, ProgressCount>;
  attempts: number;
  completedAttempts: number;
  /** Challenges completed at least once without any hint. */
  solvedWithoutHints: number;
  activeDays: number;
}

/**
 * Joins recorded game statistics with the current level list. Rows for
 * levels that no longer exist are ignored. Game activity only: nothing here
 * says anything about hafalan.
 */
export function summarizeProgress(
  levels: readonly LevelDefinition[],
  stats: GameStats,
): SusunAyatProgress {
  const count = (): ProgressCount => ({ completed: 0, total: 0 });
  const byDifficulty = Object.fromEntries(DIFFICULTIES.map((d) => [d, count()])) as Record<
    Difficulty,
    ProgressCount
  >;
  const byType = Object.fromEntries(PUZZLE_TYPES.map((p) => [p, count()])) as Record<
    PuzzleType,
    ProgressCount
  >;
  const overall = count();
  let attempts = 0;
  let completedAttempts = 0;
  let solvedWithoutHints = 0;

  for (const level of levels) {
    const row = stats.levels[level.id];
    const done = (row?.completions ?? 0) > 0;
    for (const bucket of [overall, byDifficulty[level.difficulty], byType[level.puzzleType]]) {
      bucket.total += 1;
      if (done) bucket.completed += 1;
    }
    attempts += row?.attempts ?? 0;
    completedAttempts += row?.completions ?? 0;
    if (row?.bestHintsUsed === 0) solvedWithoutHints += 1;
  }

  return {
    overall,
    byDifficulty,
    byType,
    attempts,
    completedAttempts,
    solvedWithoutHints,
    activeDays: stats.activeDays,
  };
}
