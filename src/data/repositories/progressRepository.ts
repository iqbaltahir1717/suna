import type { SqlDatabase } from '../db/types';

/**
 * Game activity (automatic, from play). This is never hafalan: completing a
 * challenge must not mark anything as memorized. Hafalan has its own
 * repository in Phase 4.
 */

export interface ActivitySummary {
  completedChallenges: number;
  practiceSessions: number;
  /** Epoch ms of the most recent session start, or null for a new user. */
  lastActivityAt: number | null;
}

export interface SessionRecord {
  gameId: string;
  levelId: string | null;
  contentVersion: string | null;
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
  hintsUsed: number;
  mistakes: number;
}

export interface ProgressRepository {
  getActivitySummary(): Promise<ActivitySummary>;
  /** Records one finished or abandoned play session. Returns its row id. */
  recordSession(session: SessionRecord): Promise<number>;
  /** Upserts per-level completion. Called by a game after validation succeeds. */
  markChallengeCompleted(input: {
    gameId: string;
    levelId: string;
    contentVersion: string;
    completedAt: number;
  }): Promise<void>;
}

export function createProgressRepository(db: SqlDatabase): ProgressRepository {
  return {
    async getActivitySummary() {
      const [challenges, sessions] = await Promise.all([
        db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM challenge_progress'),
        db.getFirstAsync<{ n: number; last: number | null }>(
          'SELECT COUNT(*) AS n, MAX(started_at) AS last FROM game_sessions',
        ),
      ]);
      return {
        completedChallenges: challenges?.n ?? 0,
        practiceSessions: sessions?.n ?? 0,
        lastActivityAt: sessions?.last ?? null,
      };
    },

    async recordSession(session) {
      const result = await db.runAsync(
        `INSERT INTO game_sessions
           (game_id, level_id, content_version, started_at, ended_at, completed, hints_used, mistakes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        session.gameId,
        session.levelId,
        session.contentVersion,
        session.startedAt,
        session.endedAt,
        session.completed ? 1 : 0,
        session.hintsUsed,
        session.mistakes,
      );
      return result.lastInsertRowId;
    },

    async markChallengeCompleted({ gameId, levelId, contentVersion, completedAt }) {
      await db.runAsync(
        `INSERT INTO challenge_progress
           (game_id, level_id, content_version, first_completed_at, last_completed_at, completion_count)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(game_id, level_id) DO UPDATE SET
           content_version = excluded.content_version,
           last_completed_at = excluded.last_completed_at,
           completion_count = completion_count + 1`,
        gameId,
        levelId,
        contentVersion,
        completedAt,
        completedAt,
      );
    },
  };
}
