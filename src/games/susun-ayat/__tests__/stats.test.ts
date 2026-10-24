import { LEVELS } from '../content';
import { summarizeProgress } from '../stats';

const empty = { levels: {}, activeDays: 0, recent: [] };
const row = (
  levelId: string,
  attempts: number,
  completions: number,
  bestHintsUsed: number | null,
) => ({
  levelId,
  attempts,
  completions,
  bestHintsUsed,
  lastPlayedAt: 1,
});

describe('summarizeProgress', () => {
  it('counts every level as open for a new player', () => {
    const summary = summarizeProgress(LEVELS, empty);
    expect(summary.overall).toEqual({ completed: 0, total: LEVELS.length });
    const byDifficulty = Object.values(summary.byDifficulty).reduce((n, c) => n + c.total, 0);
    const byType = Object.values(summary.byType).reduce((n, c) => n + c.total, 0);
    expect(byDifficulty).toBe(LEVELS.length);
    expect(byType).toBe(LEVELS.length);
    expect(summary.attempts).toBe(0);
  });

  it('joins recorded rows with level difficulty and mode', () => {
    const summary = summarizeProgress(LEVELS, {
      activeDays: 2,
      recent: [],
      levels: {
        'fatihah-ayat-1-3': row('fatihah-ayat-1-3', 3, 2, 0),
        'fatihah-words-7': row('fatihah-words-7', 1, 1, 2),
        'nas-words-1': row('nas-words-1', 2, 0, null),
        'removed-level': row('removed-level', 5, 5, 0),
      },
    });
    expect(summary.overall.completed).toBe(2);
    expect(summary.byDifficulty.beginner.completed).toBe(1);
    expect(summary.byDifficulty.hard.completed).toBe(1);
    expect(summary.byType.orderAyat.completed).toBe(1);
    expect(summary.byType.orderWords.completed).toBe(1);
    expect(summary.attempts).toBe(6);
    expect(summary.completedAttempts).toBe(3);
    expect(summary.solvedWithoutHints).toBe(1);
    expect(summary.activeDays).toBe(2);
  });
});
