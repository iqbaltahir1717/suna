import { getSurah } from '@/data/quran';

import type { AyahRange, HafalanEntry, HafalanStatus, HafalanSummary } from './types';

export type RangeError = 'surah' | 'bounds' | 'order' | 'overlap';

export class HafalanValidationError extends Error {
  constructor(
    readonly reason: RangeError,
    readonly conflictId?: string,
  ) {
    super(`Invalid hafalan range: ${reason}`);
    this.name = 'HafalanValidationError';
  }
}

export function ayahCount(range: AyahRange): number {
  return range.toAyah - range.fromAyah + 1;
}

function overlaps(a: AyahRange, b: AyahRange): boolean {
  return a.surah === b.surah && a.fromAyah <= b.toAyah && b.fromAyah <= a.toAyah;
}

/**
 * Checks a range against the Tanzil surah metadata and the user's other
 * entries. Ranges in one surah may not overlap, so every ayah has at most one
 * status and summaries never double count.
 */
export function validateRange(
  range: AyahRange,
  others: readonly Pick<HafalanEntry, 'id' | 'range'>[],
  ignoreId?: string,
): { ok: true } | { ok: false; reason: RangeError; conflictId?: string } {
  const surah = getSurah(range.surah);
  if (!surah || !Number.isInteger(range.surah)) return { ok: false, reason: 'surah' };
  if (!Number.isInteger(range.fromAyah) || !Number.isInteger(range.toAyah)) {
    return { ok: false, reason: 'bounds' };
  }
  if (range.fromAyah < 1 || range.toAyah > surah.ayahCount) return { ok: false, reason: 'bounds' };
  if (range.fromAyah > range.toAyah) return { ok: false, reason: 'order' };
  const conflict = others.find((other) => other.id !== ignoreId && overlaps(other.range, range));
  if (conflict) return { ok: false, reason: 'overlap', conflictId: conflict.id };
  return { ok: true };
}

export function summarize(
  entries: readonly HafalanEntry[],
  lastActivityAt: number | null,
): HafalanSummary {
  const ayatByStatus: Record<HafalanStatus, number> = { learning: 0, reviewing: 0, memorized: 0 };
  const memorizedBySurah = new Map<number, number>();
  const surahs = new Set<number>();
  for (const entry of entries) {
    const count = ayahCount(entry.range);
    ayatByStatus[entry.status] += count;
    surahs.add(entry.range.surah);
    if (entry.status === 'memorized') {
      memorizedBySurah.set(
        entry.range.surah,
        (memorizedBySurah.get(entry.range.surah) ?? 0) + count,
      );
    }
  }
  let surahsMemorized = 0;
  for (const [surah, count] of memorizedBySurah) {
    if (count === getSurah(surah)?.ayahCount) surahsMemorized += 1;
  }
  return {
    entries: entries.length,
    ayatByStatus,
    trackedAyat: ayatByStatus.learning + ayatByStatus.reviewing + ayatByStatus.memorized,
    surahsTracked: surahs.size,
    surahsMemorized,
    lastActivityAt,
  };
}
