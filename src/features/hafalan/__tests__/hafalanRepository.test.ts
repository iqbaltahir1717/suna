import { migrateDatabase } from '@/data/db/migrations';
import { getSurah, SURAHS, TOTAL_AYAT } from '@/data/quran';
import metadata from '@/data/quran/surahs.tanzil-uthmani.json';
import { createHafalanRepository } from '@/data/repositories/hafalanRepository';
import { createProgressRepository } from '@/data/repositories/progressRepository';
import { QURAN_TEXTS } from '@/games/susun-ayat/content/quran';
import { createTestDatabase } from '@/test/nodeSqlite';

import { HafalanValidationError, validateRange } from '../ranges';

async function setup() {
  const db = createTestDatabase();
  await migrateDatabase(db);
  let n = 0;
  return { db, repo: createHafalanRepository(db, () => `e${++n}`) };
}

const fatihah = { surah: 1, fromAyah: 1, toAyah: 7 };

describe('surah metadata', () => {
  it('covers 114 surahs and 6236 ayat from the verified Tanzil file', () => {
    expect(SURAHS).toHaveLength(114);
    expect(TOTAL_AYAT).toBe(6236);
    expect(SURAHS.reduce((sum, s) => sum + s.ayahCount, 0)).toBe(TOTAL_AYAT);
    expect(getSurah(2)?.ayahCount).toBe(286);
    expect(metadata.source.copyrightBlock).toContain('Tanzil Quran Text');
  });

  it('matches every bundled Susun Ayat surah (same source file)', () => {
    for (const text of Object.values(QURAN_TEXTS)) {
      expect(text.source.sourceFileMd5).toBe(metadata.source.sourceFileMd5);
      expect(getSurah(text.surah)).toEqual({
        surah: text.surah,
        nameArabic: text.surahNameArabic,
        ayahCount: text.ayat.length,
      });
    }
  });
});

describe('validateRange', () => {
  it('accepts a full surah and rejects bad bounds, order, and surah', () => {
    expect(validateRange(fatihah, [])).toEqual({ ok: true });
    expect(validateRange({ surah: 1, fromAyah: 1, toAyah: 8 }, [])).toMatchObject({
      reason: 'bounds',
    });
    expect(validateRange({ surah: 1, fromAyah: 0, toAyah: 2 }, [])).toMatchObject({
      reason: 'bounds',
    });
    expect(validateRange({ surah: 1, fromAyah: 5, toAyah: 2 }, [])).toMatchObject({
      reason: 'order',
    });
    expect(validateRange({ surah: 115, fromAyah: 1, toAyah: 1 }, [])).toMatchObject({
      reason: 'surah',
    });
  });

  it('rejects overlap within a surah but not across surahs or with itself', () => {
    const others = [{ id: 'a', range: { surah: 2, fromAyah: 1, toAyah: 5 } }];
    expect(validateRange({ surah: 2, fromAyah: 5, toAyah: 9 }, others)).toEqual({
      ok: false,
      reason: 'overlap',
      conflictId: 'a',
    });
    expect(validateRange({ surah: 2, fromAyah: 6, toAyah: 9 }, others)).toEqual({ ok: true });
    expect(validateRange({ surah: 3, fromAyah: 1, toAyah: 5 }, others)).toEqual({ ok: true });
    expect(validateRange({ surah: 2, fromAyah: 1, toAyah: 3 }, others, 'a')).toEqual({ ok: true });
  });
});

describe('hafalan repository', () => {
  it('starts empty', async () => {
    const { repo } = await setup();
    expect(await repo.list()).toEqual([]);
    expect(await repo.summary()).toEqual({
      entries: 0,
      ayatByStatus: { learning: 0, reviewing: 0, memorized: 0 },
      trackedAyat: 0,
      surahsTracked: 0,
      surahsMemorized: 0,
      lastActivityAt: null,
    });
  });

  it('creates, updates, reviews, and records dated history', async () => {
    const { repo } = await setup();
    const created = await repo.create({ range: fatihah, status: 'learning', note: '  ' }, 100);
    expect(created).toEqual({
      id: 'e1',
      range: fatihah,
      status: 'learning',
      note: null,
      createdAt: 100,
      updatedAt: 100,
      statusChangedAt: 100,
      lastReviewedAt: null,
    });

    await repo.update('e1', { range: fatihah, status: 'learning', note: 'with teacher' }, 150);
    let entry = await repo.get('e1');
    expect(entry).toMatchObject({ note: 'with teacher', updatedAt: 150, statusChangedAt: 100 });

    await repo.update('e1', { range: fatihah, status: 'memorized', note: 'with teacher' }, 200);
    await repo.logReview('e1', 300);
    entry = await repo.get('e1');
    expect(entry).toMatchObject({ status: 'memorized', statusChangedAt: 200, lastReviewedAt: 300 });

    const history = await repo.history('e1');
    expect(history.map((e) => [e.kind, e.status, e.at])).toEqual([
      ['reviewed', 'memorized', 300],
      ['status_changed', 'memorized', 200],
      ['created', 'learning', 100],
    ]);
  });

  it('logs range changes and refuses overlapping or out-of-bounds ranges', async () => {
    const { repo } = await setup();
    await repo.create(
      { range: { surah: 2, fromAyah: 1, toAyah: 5 }, status: 'learning', note: null },
      1,
    );
    await expect(
      repo.create(
        { range: { surah: 2, fromAyah: 3, toAyah: 8 }, status: 'learning', note: null },
        2,
      ),
    ).rejects.toBeInstanceOf(HafalanValidationError);
    await expect(
      repo.create(
        { range: { surah: 2, fromAyah: 280, toAyah: 287 }, status: 'learning', note: null },
        2,
      ),
    ).rejects.toMatchObject({ reason: 'bounds' });

    await repo.update(
      'e1',
      { range: { surah: 2, fromAyah: 1, toAyah: 10 }, status: 'learning', note: null },
      3,
    );
    expect((await repo.history('e1'))[0]).toMatchObject({ kind: 'range_changed', at: 3 });
    expect(await repo.list()).toHaveLength(1);
  });

  it('summarizes ayat per status and fully memorized surahs', async () => {
    const { repo } = await setup();
    await repo.create({ range: fatihah, status: 'memorized', note: null }, 10);
    await repo.create(
      { range: { surah: 114, fromAyah: 1, toAyah: 3 }, status: 'memorized', note: null },
      20,
    );
    await repo.create(
      { range: { surah: 114, fromAyah: 4, toAyah: 6 }, status: 'reviewing', note: null },
      30,
    );
    await repo.create(
      { range: { surah: 2, fromAyah: 1, toAyah: 5 }, status: 'learning', note: null },
      40,
    );

    expect(await repo.summary()).toEqual({
      entries: 4,
      ayatByStatus: { learning: 5, reviewing: 3, memorized: 10 },
      trackedAyat: 18,
      surahsTracked: 3,
      surahsMemorized: 1,
      lastActivityAt: 40,
    });
    expect((await repo.list()).map((e) => e.id)).toEqual(['e1', 'e4', 'e2', 'e3']);
  });

  it('removes an entry with its history', async () => {
    const { db, repo } = await setup();
    await repo.create({ range: fatihah, status: 'learning', note: null }, 1);
    await repo.remove('e1');
    expect(await repo.list()).toEqual([]);
    const events = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM hafalan_events',
    );
    expect(events?.n).toBe(0);
  });

  it('is independent of game activity in both directions', async () => {
    const { db, repo } = await setup();
    const progress = createProgressRepository(db);
    await progress.recordSession({
      gameId: 'susun-ayat',
      levelId: 'fatihah-1-7',
      contentVersion: 'x',
      startedAt: 1,
      endedAt: 2,
      completed: true,
      hintsUsed: 0,
      mistakes: 0,
    });
    await progress.markChallengeCompleted({
      gameId: 'susun-ayat',
      levelId: 'fatihah-1-7',
      contentVersion: 'x',
      completedAt: 2,
    });
    expect((await repo.summary()).entries).toBe(0);

    await repo.create({ range: fatihah, status: 'memorized', note: null }, 3);
    expect(await progress.getActivitySummary()).toMatchObject({
      completedChallenges: 1,
      practiceSessions: 1,
    });
  });
});
