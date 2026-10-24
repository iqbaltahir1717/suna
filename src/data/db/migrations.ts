import type { SqlDatabase } from './types';

/**
 * Ordered, append-only schema migrations. The applied version is stored in
 * SQLite's `PRAGMA user_version`.
 *
 * Rules:
 * - Never edit or reorder a migration that has shipped; add a new one.
 * - Each migration runs inside a transaction together with its version bump.
 * - Document every change in DATA_MODEL.md.
 */
export interface Migration {
  version: number;
  description: string;
  up: (db: SqlDatabase) => Promise<void>;
}

export const migrations: readonly Migration[] = [
  {
    version: 1,
    description: 'Settings, game sessions, challenge progress, local notifications',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE game_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_id TEXT NOT NULL,
          level_id TEXT,
          content_version TEXT,
          started_at INTEGER NOT NULL,
          ended_at INTEGER,
          completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
          hints_used INTEGER NOT NULL DEFAULT 0,
          mistakes INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX idx_game_sessions_started_at ON game_sessions (started_at);

        CREATE TABLE challenge_progress (
          game_id TEXT NOT NULL,
          level_id TEXT NOT NULL,
          content_version TEXT NOT NULL,
          first_completed_at INTEGER NOT NULL,
          last_completed_at INTEGER NOT NULL,
          completion_count INTEGER NOT NULL DEFAULT 1,
          PRIMARY KEY (game_id, level_id)
        );

        CREATE TABLE notifications (
          id TEXT PRIMARY KEY NOT NULL,
          kind TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          read_at INTEGER
        );
      `);
    },
  },
  {
    version: 2,
    description: 'Self-reported hafalan entries and their dated history',
    up: async (db) => {
      // Ayah upper bounds depend on the surah and are validated in the app
      // against the Tanzil metadata (src/data/quran).
      await db.execAsync(`
        CREATE TABLE hafalan_entries (
          id TEXT PRIMARY KEY NOT NULL,
          surah INTEGER NOT NULL CHECK (surah BETWEEN 1 AND 114),
          from_ayah INTEGER NOT NULL CHECK (from_ayah >= 1),
          to_ayah INTEGER NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('learning', 'reviewing', 'memorized')),
          note TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          status_changed_at INTEGER NOT NULL,
          last_reviewed_at INTEGER,
          CHECK (to_ayah >= from_ayah)
        );
        CREATE INDEX idx_hafalan_entries_surah ON hafalan_entries (surah, from_ayah);

        CREATE TABLE hafalan_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entry_id TEXT NOT NULL REFERENCES hafalan_entries (id) ON DELETE CASCADE,
          kind TEXT NOT NULL
            CHECK (kind IN ('created', 'status_changed', 'range_changed', 'reviewed')),
          status TEXT NOT NULL CHECK (status IN ('learning', 'reviewing', 'memorized')),
          at INTEGER NOT NULL
        );
        CREATE INDEX idx_hafalan_events_entry ON hafalan_events (entry_id, at);
      `);
    },
  },
];

export const LATEST_SCHEMA_VERSION = migrations.at(-1)?.version ?? 0;

export async function getSchemaVersion(db: SqlDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/**
 * Brings the database up to the latest schema. Safe to call on every launch.
 * Returns the list of versions that were applied.
 */
export async function migrateDatabase(
  db: SqlDatabase,
  list: readonly Migration[] = migrations,
): Promise<number[]> {
  assertOrdered(list);
  const current = await getSchemaVersion(db);
  const latest = list.at(-1)?.version ?? 0;
  if (current > latest) {
    // A newer app version created this database. Refuse to guess.
    throw new Error(`Database schema v${current} is newer than this app supports (v${latest}).`);
  }

  const applied: number[] = [];
  for (const migration of list) {
    if (migration.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      // PRAGMA does not accept bound parameters; version is a trusted integer.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    applied.push(migration.version);
  }
  return applied;
}

function assertOrdered(list: readonly Migration[]) {
  list.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(
        `Migrations must be numbered 1..n without gaps; found v${migration.version} at position ${index + 1}.`,
      );
    }
  });
}

/** Connection-level pragmas; run before migrations on every open. */
export async function configureConnection(db: SqlDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
}
