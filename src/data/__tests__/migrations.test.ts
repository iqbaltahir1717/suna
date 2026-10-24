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
  it('creates the v1 schema on a fresh database', async () => {
    const db = createTestDatabase();
    expect(await getSchemaVersion(db)).toBe(0);

    const applied = await migrateDatabase(db);

    expect(applied).toEqual(migrations.map((m) => m.version));
    expect(await getSchemaVersion(db)).toBe(LATEST_SCHEMA_VERSION);
    expect(await tableNames(db)).toEqual([
      'challenge_progress',
      'game_sessions',
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

    const v2: Migration = {
      version: 2,
      description: 'test-only column',
      up: (d) => d.execAsync('ALTER TABLE settings ADD COLUMN extra TEXT'),
    };
    expect(await migrateDatabase(db, [...migrations, v2])).toEqual([2]);
    expect(await getSchemaVersion(db)).toBe(2);
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'soundEnabled'",
    );
    expect(row?.value).toBe('false');
  });

  it('rolls back a failing migration, including its version bump', async () => {
    const db = createTestDatabase();
    await migrateDatabase(db);
    const broken: Migration = {
      version: 2,
      description: 'fails halfway',
      up: async (d) => {
        await d.execAsync('CREATE TABLE half_done (id INTEGER)');
        await d.execAsync('THIS IS NOT SQL');
      },
    };
    await expect(migrateDatabase(db, [...migrations, broken])).rejects.toThrow();
    expect(await getSchemaVersion(db)).toBe(1);
    expect(await tableNames(db)).not.toContain('half_done');
  });

  it('refuses a database created by a newer app version', async () => {
    const db = createTestDatabase();
    await db.execAsync('PRAGMA user_version = 99');
    await expect(migrateDatabase(db)).rejects.toThrow(/newer/);
  });

  it('rejects gaps in migration numbering', async () => {
    const db = createTestDatabase();
    const gap: Migration = { version: 3, description: 'gap', up: async () => {} };
    await expect(migrateDatabase(db, [...migrations, gap])).rejects.toThrow(/without gaps/);
  });
});
