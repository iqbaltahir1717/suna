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

export interface ChallengeCompletion {
  levelId: string;
  contentVersion: string;
  firstCompletedAt: number;
  lastCompletedAt: number;
  completionCount: number;
}

/** Per-level aggregates over all recorded attempts. */
export interface LevelStats {
  levelId: string;
  /** Recorded attempts, finished or abandoned. */
  attempts: number;
  completions: number;
  /** Fewest hints used in a completed attempt; null if never completed. */
  bestHintsUsed: number | null;
  lastPlayedAt: number;
}

export interface RecentSession {
  levelId: string | null;
  startedAt: number;
  completed: boolean;
  hintsUsed: number;
}

export interface GameStats {
  levels: Record<string, LevelStats>;
  /** Distinct local calendar days with at least one attempt. */
  activeDays: number;
  /** Most recent attempts first. */
  recent: RecentSession[];
}

export interface ProgressRepository {
  getActivitySummary(): Promise<ActivitySummary>;
  /** Completed levels of one game, keyed by level id. */
  listCompletedChallenges(gameId: string): Promise<Record<string, ChallengeCompletion>>;
  /** Real per-level statistics of one game, from recorded sessions. */
  getGameStats(gameId: string, recentLimit?: number): Promise<GameStats>;
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

    async listCompletedChallenges(gameId) {
      const rows = await db.getAllAsync<{
        level_id: string;
        content_version: string;
        first_completed_at: number;
        last_completed_at: number;
        completion_count: number;
      }>(
        `SELECT level_id, content_version, first_completed_at, last_completed_at, completion_count
         FROM challenge_progress WHERE game_id = ?`,
        gameId,
      );
      return Object.fromEntries(
        rows.map((row) => [
          row.level_id,
          {
            levelId: row.level_id,
            contentVersion: row.content_version,
            firstCompletedAt: row.first_completed_at,
            lastCompletedAt: row.last_completed_at,
            completionCount: row.completion_count,
          },
        ]),
      );
    },

    async getGameStats(gameId, recentLimit = 5) {
      const [levels, days, recent] = await Promise.all([
        db.getAllAsync<{
          level_id: string;
          attempts: number;
          completions: number;
          best_hints: number | null;
          last_played: number;
        }>(
          `SELECT level_id,
                  COUNT(*) AS attempts,
                  SUM(completed) AS completions,
                  MIN(CASE WHEN completed = 1 THEN hints_used END) AS best_hints,
                  MAX(started_at) AS last_played
           FROM game_sessions
           WHERE game_id = ? AND level_id IS NOT NULL
           GROUP BY level_id`,
          gameId,
        ),
        db.getFirstAsync<{ n: number }>(
          `SELECT COUNT(DISTINCT date(started_at / 1000, 'unixepoch', 'localtime')) AS n
           FROM game_sessions WHERE game_id = ?`,
          gameId,
        ),
        db.getAllAsync<{
          level_id: string | null;
          started_at: number;
          completed: number;
          hints_used: number;
        }>(
          `SELECT level_id, started_at, completed, hints_used FROM game_sessions
           WHERE game_id = ? ORDER BY started_at DESC, id DESC LIMIT ?`,
          gameId,
          recentLimit,
        ),
      ]);
      return {
        levels: Object.fromEntries(
          levels.map((row) => [
            row.level_id,
            {
              levelId: row.level_id,
              attempts: row.attempts,
              completions: row.completions,
              bestHintsUsed: row.best_hints,
              lastPlayedAt: row.last_played,
            },
          ]),
        ),
        activeDays: days?.n ?? 0,
        recent: recent.map((row) => ({
          levelId: row.level_id,
          startedAt: row.started_at,
          completed: row.completed === 1,
          hintsUsed: row.hints_used,
        })),
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
