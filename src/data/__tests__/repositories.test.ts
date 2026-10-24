import { migrateDatabase } from '@/data/db/migrations';
import { createNotificationsRepository } from '@/data/repositories/notificationsRepository';
import { createProgressRepository } from '@/data/repositories/progressRepository';
import { createSettingsRepository, DEFAULT_SETTINGS } from '@/data/repositories/settingsRepository';
import { createTestDatabase } from '@/test/nodeSqlite';

async function setup() {
  const db = createTestDatabase();
  await migrateDatabase(db);
  return db;
}

describe('settings repository', () => {
  it('returns defaults for a new user', async () => {
    const repo = createSettingsRepository(await setup());
    expect(await repo.load()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists and overwrites values', async () => {
    const db = await setup();
    const repo = createSettingsRepository(db);
    await repo.save('language', 'en');
    await repo.save('soundEnabled', false);
    await repo.save('language', 'id');
    // A fresh repository instance reads what was stored.
    expect(await createSettingsRepository(db).load()).toEqual({
      ...DEFAULT_SETTINGS,
      language: 'id',
      soundEnabled: false,
    });
  });

  it('ignores corrupt or unknown rows instead of crashing', async () => {
    const db = await setup();
    await db.runAsync("INSERT INTO settings VALUES ('language', '\"fr\"', 1)");
    await db.runAsync("INSERT INTO settings VALUES ('reduceMotion', 'not json', 1)");
    await db.runAsync("INSERT INTO settings VALUES ('removedSetting', 'true', 1)");
    expect(await createSettingsRepository(db).load()).toEqual(DEFAULT_SETTINGS);
  });

  it('rejects invalid values on save', async () => {
    const repo = createSettingsRepository(await setup());
    // @ts-expect-error deliberately invalid
    await expect(repo.save('language', 'fr')).rejects.toThrow();
  });
});

describe('progress repository', () => {
  it('reports an empty summary for a new user', async () => {
    const repo = createProgressRepository(await setup());
    expect(await repo.getActivitySummary()).toEqual({
      completedChallenges: 0,
      practiceSessions: 0,
      lastActivityAt: null,
    });
  });

  it('counts sessions and distinct completed challenges', async () => {
    const repo = createProgressRepository(await setup());
    const session = {
      gameId: 'susun-ayat',
      levelId: 'fixture-1',
      contentVersion: 'test',
      endedAt: null,
      completed: true,
      hintsUsed: 0,
      mistakes: 0,
    };
    await repo.recordSession({ ...session, startedAt: 1000 });
    await repo.recordSession({ ...session, startedAt: 3000 });
    const completion = { gameId: 'susun-ayat', levelId: 'fixture-1', contentVersion: 'test' };
    await repo.markChallengeCompleted({ ...completion, completedAt: 1000 });
    await repo.markChallengeCompleted({ ...completion, completedAt: 3000 });

    expect(await repo.getActivitySummary()).toEqual({
      completedChallenges: 1,
      practiceSessions: 2,
      lastActivityAt: 3000,
    });
  });
});

describe('progress repository: completed challenges', () => {
  it('lists completions per game with counts', async () => {
    const repo = createProgressRepository(await setup());
    expect(await repo.listCompletedChallenges('susun-ayat')).toEqual({});
    const base = { gameId: 'susun-ayat', levelId: 'lvl-1', contentVersion: 'v1' };
    await repo.markChallengeCompleted({ ...base, completedAt: 100 });
    await repo.markChallengeCompleted({ ...base, contentVersion: 'v2', completedAt: 200 });
    await repo.markChallengeCompleted({ ...base, gameId: 'other-game', completedAt: 300 });
    expect(await repo.listCompletedChallenges('susun-ayat')).toEqual({
      'lvl-1': {
        levelId: 'lvl-1',
        contentVersion: 'v2',
        firstCompletedAt: 100,
        lastCompletedAt: 200,
        completionCount: 2,
      },
    });
  });
});

describe('progress repository: game statistics', () => {
  const session = (
    levelId: string | null,
    startedAt: number,
    completed: boolean,
    hintsUsed = 0,
  ) => ({
    gameId: 'susun-ayat',
    levelId,
    contentVersion: 'v1',
    startedAt,
    endedAt: completed ? startedAt + 1000 : null,
    completed,
    hintsUsed,
    mistakes: 0,
  });

  it('is empty for a new user', async () => {
    const repo = createProgressRepository(await setup());
    expect(await repo.getGameStats('susun-ayat')).toEqual({
      levels: {},
      activeDays: 0,
      recent: [],
    });
  });

  it('aggregates attempts, completions, best hints, and active days', async () => {
    const repo = createProgressRepository(await setup());
    const day = 24 * 60 * 60 * 1000;
    const t0 = new Date(2026, 9, 20, 12).getTime();
    await repo.recordSession(session('lvl-1', t0, false, 1));
    await repo.recordSession(session('lvl-1', t0 + 1000, true, 2));
    await repo.recordSession(session('lvl-1', t0 + day, true, 0));
    await repo.recordSession(session('lvl-2', t0 + 3 * day, false));
    await repo.recordSession({ ...session('lvl-9', t0, true), gameId: 'other-game' });

    const stats = await repo.getGameStats('susun-ayat', 2);
    expect(stats.levels).toEqual({
      'lvl-1': {
        levelId: 'lvl-1',
        attempts: 3,
        completions: 2,
        bestHintsUsed: 0,
        lastPlayedAt: t0 + day,
      },
      'lvl-2': {
        levelId: 'lvl-2',
        attempts: 1,
        completions: 0,
        bestHintsUsed: null,
        lastPlayedAt: t0 + 3 * day,
      },
    });
    expect(stats.activeDays).toBe(3);
    expect(stats.recent).toEqual([
      { levelId: 'lvl-2', startedAt: t0 + 3 * day, completed: false, hintsUsed: 0 },
      { levelId: 'lvl-1', startedAt: t0 + day, completed: true, hintsUsed: 0 },
    ]);
  });
});

describe('notifications repository', () => {
  it('starts empty and tracks unread items', async () => {
    const db = await setup();
    const repo = createNotificationsRepository(db);
    expect(await repo.list()).toEqual([]);
    expect(await repo.countUnread()).toBe(0);

    await db.runAsync("INSERT INTO notifications VALUES ('n1', 'test', '{\"a\":1}', 10, NULL)");
    expect(await repo.countUnread()).toBe(1);
    await repo.markRead('n1', 20);
    expect(await repo.countUnread()).toBe(0);
    expect((await repo.list())[0]).toMatchObject({ id: 'n1', payload: { a: 1 }, readAt: 20 });
  });
});
