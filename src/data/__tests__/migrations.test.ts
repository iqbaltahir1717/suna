import {
  getSchemaVersion,
  LATEST_SCHEMA_VERSION,
  migrateDatabase,
  migrations,
  type Migration,
} from '@/data/db/migrations';
import { createTestDatabase } from '@/test/nodeSqlite';

async function tableNames(db: ReturnType<typeof createTestDatabase>) {
  const rows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  return rows.map((row) => row.name);
}

describe('migrateDatabase', () => {
  it('creates the latest schema on a fresh database', async () => {
    const db = createTestDatabase();
    expect(await getSchemaVersion(db)).toBe(0);

    const applied = await migrateDatabase(db);

    expect(applied).toEqual(migrations.map((m) => m.version));
    expect(await getSchemaVersion(db)).toBe(LATEST_SCHEMA_VERSION);
    expect(await tableNames(db)).toEqual([
      'challenge_progress',
      'game_sessions',
      'hafalan_entries',
      'hafalan_events',
      'notifications',
      'settings',
    ]);
  });

  it('is idempotent', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db);
    expect(await migrateDatabase(db)).toEqual([]);
  });

  it('applies only newer migrations and keeps existing data', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db);
    await db.runAsync(
      "INSERT INTO settings (key, value, updated_at) VALUES ('soundEnabled', 'false', 1)",
    );

    const next: Migration = {
      version: LATEST_SCHEMA_VERSION + 1,
      description: 'test-only column',
      up: (d) => d.execAsync('ALTER TABLE settings ADD COLUMN extra TEXT'),
    };
    expect(await migrateDatabase(db, [...migrations, next])).toEqual([next.version]);
    expect(await getSchemaVersion(db)).toBe(next.version);
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'soundEnabled'",
    );
    expect(row?.value).toBe('false');
  });

  it('rolls back a failing migration, including its version bump', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db);
    const broken: Migration = {
      version: LATEST_SCHEMA_VERSION + 1,
      description: 'fails halfway',
      up: async (d) => {
        await d.execAsync('CREATE TABLE half_done (id INTEGER)');
        await d.execAsync('THIS IS NOT SQL');
      },
    };
    await expect(migrateDatabase(db, [...migrations, broken])).rejects.toThrow();
    expect(await getSchemaVersion(db)).toBe(LATEST_SCHEMA_VERSION);
    expect(await tableNames(db)).not.toContain('half_done');
  });

  it('refuses a database created by a newer app version', async () => {
    const db = createTestDatabase();
    await db.execAsync('PRAGMA user_version = 99');
    await expect(migrateDatabase(db)).rejects.toThrow(/newer/);
  });

  it('rejects gaps in migration numbering', async () => {
    const db = createTestDatabase();
    const gap: Migration = {
      version: LATEST_SCHEMA_VERSION + 2,
      description: 'gap',
      up: async () => {},
    };
    await expect(migrateDatabase(db, [...migrations, gap])).rejects.toThrow(/without gaps/);
  });

  it('upgrades a v1 database to v2 without touching game activity', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db, migrations.slice(0, 1));
    await db.runAsync(
      "INSERT INTO game_sessions (game_id, started_at, completed) VALUES ('susun-ayat', 1, 1)",
    );

    expect(await migrateDatabase(db)).toEqual([2]);
    const sessions = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM game_sessions',
    );
    expect(sessions?.n).toBe(1);
    const hafalan = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM hafalan_entries',
    );
    expect(hafalan?.n).toBe(0);
  });
});

describe('v2 hafalan constraints', () => {
  const insert = (db: ReturnType<typeof createTestDatabase>, values: string) =>
    db.execAsync(
      `INSERT INTO hafalan_entries (id, surah, from_ayah, to_ayah, status, created_at, updated_at, status_changed_at) VALUES ${values}`,
    );

  it('rejects unknown statuses, reversed ranges, and invalid surahs', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db);
    await expect(insert(db, "('a', 1, 1, 7, 'learning', 1, 1, 1)")).resolves.toBeUndefined();
    await expect(insert(db, "('b', 1, 1, 7, 'done', 1, 1, 1)")).rejects.toThrow();
    await expect(insert(db, "('c', 1, 5, 2, 'learning', 1, 1, 1)")).rejects.toThrow();
    await expect(insert(db, "('d', 115, 1, 1, 'learning', 1, 1, 1)")).rejects.toThrow();
    await expect(insert(db, "('e', 1, 0, 1, 'learning', 1, 1, 1)")).rejects.toThrow();
  });
});
