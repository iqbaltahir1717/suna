import { useCallback, useEffect, useRef } from 'react';

import { useRepositories } from '@/data/DataProvider';

import type { LevelDefinition } from '../content';

export const GAME_ID = 'susun-ayat';

export interface AttemptStats {
  hintsUsed: number;
  mistakes: number;
}

/**
 * Records one play session per attempt. A finished attempt also upserts the
 * level's completion. An attempt the player touched but left unfinished is
 * recorded as abandoned when the screen unmounts or a new attempt starts.
 * Never writes hafalan data.
 */
export function usePlaySession(level: LevelDefinition | undefined) {
  const { progress } = useRepositories();
  const attempt = useRef<{
    startedAt: number;
    touched: boolean;
    done: boolean;
    stats: AttemptStats;
  } | null>(null);

  const recordAbandoned = useCallback(() => {
    const current = attempt.current;
    if (!level || !current || current.done || !current.touched) return;
    current.done = true;
    progress
      .recordSession({
        gameId: GAME_ID,
        levelId: level.id,
        contentVersion: level.contentVersion,
        startedAt: current.startedAt,
        endedAt: null,
        completed: false,
        ...current.stats,
      })
      .catch((error: unknown) => console.warn('Failed to record session', error));
  }, [level, progress]);

  const start = useCallback(() => {
    recordAbandoned();
    attempt.current = {
      startedAt: Date.now(),
      touched: false,
      done: false,
      stats: { hintsUsed: 0, mistakes: 0 },
    };
  }, [recordAbandoned]);

  useEffect(() => {
    start();
    return recordAbandoned;
  }, [start, recordAbandoned]);

  /** Marks the attempt as started by the player and keeps its latest stats. */
  const touch = useCallback((stats: AttemptStats) => {
    if (!attempt.current) return;
    attempt.current.touched = true;
    attempt.current.stats = stats;
  }, []);

  const complete = useCallback(
    async ({ hintsUsed, mistakes }: AttemptStats) => {
      const current = attempt.current;
      if (!level || !current || current.done) return;
      current.done = true;
      const now = Date.now();
      try {
        await progress.recordSession({
          gameId: GAME_ID,
          levelId: level.id,
          contentVersion: level.contentVersion,
          startedAt: current.startedAt,
          endedAt: now,
          completed: true,
          hintsUsed,
          mistakes,
        });
        await progress.markChallengeCompleted({
          gameId: GAME_ID,
          levelId: level.id,
          contentVersion: level.contentVersion,
          completedAt: now,
        });
      } catch (error) {
        console.warn('Failed to save progress', error);
      }
    },
    [level, progress],
  );

  return { start, touch, complete };
}
