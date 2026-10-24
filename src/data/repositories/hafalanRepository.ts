import { HafalanValidationError, summarize, validateRange } from '@/features/hafalan/ranges';
import {
  HAFALAN_STATUSES,
  type HafalanEntry,
  type HafalanEvent,
  type HafalanEventKind,
  type HafalanInput,
  type HafalanRepository,
  type HafalanStatus,
} from '@/features/hafalan/types';

import type { SqlDatabase } from '../db/types';

/**
 * Self-reported hafalan. Written only by explicit user action in the hafalan
 * screens; no game code may call this repository.
 */

interface EntryRow {
  id: string;
  surah: number;
  from_ayah: number;
  to_ayah: number;
  status: string;
  note: string | null;
  created_at: number;
  updated_at: number;
  status_changed_at: number;
  last_reviewed_at: number | null;
}

const ENTRY_COLUMNS =
  'id, surah, from_ayah, to_ayah, status, note, created_at, updated_at, status_changed_at, last_reviewed_at';

function toStatus(value: string): HafalanStatus {
  if ((HAFALAN_STATUSES as readonly string[]).includes(value)) return value as HafalanStatus;
  throw new Error(`Unknown hafalan status: ${value}`);
}

function toEntry(row: EntryRow): HafalanEntry {
  return {
    id: row.id,
    range: { surah: row.surah, fromAyah: row.from_ayah, toAyah: row.to_ayah },
    status: toStatus(row.status),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    statusChangedAt: row.status_changed_at,
    lastReviewedAt: row.last_reviewed_at,
  };
}

function cleanNote(note: string | null): string | null {
  const trimmed = note?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function defaultEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHafalanRepository(
  db: SqlDatabase,
  newId: () => string = defaultEntryId,
): HafalanRepository {
  const list = async () =>
    (
      await db.getAllAsync<EntryRow>(
        `SELECT ${ENTRY_COLUMNS} FROM hafalan_entries ORDER BY surah, from_ayah`,
      )
    ).map(toEntry);

  const get = async (id: string) => {
    const row = await db.getFirstAsync<EntryRow>(
      `SELECT ${ENTRY_COLUMNS} FROM hafalan_entries WHERE id = ?`,
      id,
    );
    return row ? toEntry(row) : null;
  };

  const logEvent = (entryId: string, kind: HafalanEventKind, status: HafalanStatus, at: number) =>
    db.runAsync(
      'INSERT INTO hafalan_events (entry_id, kind, status, at) VALUES (?, ?, ?, ?)',
      entryId,
      kind,
      status,
      at,
    );

  const assertValid = async (input: HafalanInput, ignoreId?: string) => {
    toStatus(input.status);
    const result = validateRange(input.range, await list(), ignoreId);
    if (!result.ok) throw new HafalanValidationError(result.reason, result.conflictId);
  };

  return {
    list,
    get,

    async create(input, at) {
      await assertValid(input);
      const id = newId();
      const { surah, fromAyah, toAyah } = input.range;
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO hafalan_entries (${ENTRY_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
          id,
          surah,
          fromAyah,
          toAyah,
          input.status,
          cleanNote(input.note),
          at,
          at,
          at,
        );
        await logEvent(id, 'created', input.status, at);
      });
      const created = await get(id);
      if (!created) throw new Error('Hafalan entry was not stored.');
      return created;
    },

    async update(id, input, at) {
      const existing = await get(id);
      if (!existing) throw new Error(`Hafalan entry ${id} does not exist.`);
      await assertValid(input, id);
      const statusChanged = existing.status !== input.status;
      const rangeChanged =
        existing.range.surah !== input.range.surah ||
        existing.range.fromAyah !== input.range.fromAyah ||
        existing.range.toAyah !== input.range.toAyah;
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE hafalan_entries
           SET surah = ?, from_ayah = ?, to_ayah = ?, status = ?, note = ?, updated_at = ?,
               status_changed_at = ?
           WHERE id = ?`,
          input.range.surah,
          input.range.fromAyah,
          input.range.toAyah,
          input.status,
          cleanNote(input.note),
          at,
          statusChanged ? at : existing.statusChangedAt,
          id,
        );
        if (rangeChanged) await logEvent(id, 'range_changed', input.status, at);
        if (statusChanged) await logEvent(id, 'status_changed', input.status, at);
      });
      const updated = await get(id);
      if (!updated) throw new Error('Hafalan entry was not stored.');
      return updated;
    },

    async logReview(id, at) {
      const existing = await get(id);
      if (!existing) throw new Error(`Hafalan entry ${id} does not exist.`);
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'UPDATE hafalan_entries SET last_reviewed_at = ?, updated_at = ? WHERE id = ?',
          at,
          at,
          id,
        );
        await logEvent(id, 'reviewed', existing.status, at);
      });
    },

    async remove(id) {
      // Events are deleted explicitly too, in case foreign keys are off.
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM hafalan_events WHERE entry_id = ?', id);
        await db.runAsync('DELETE FROM hafalan_entries WHERE id = ?', id);
      });
    },

    async history(id) {
      const rows = await db.getAllAsync<{
        id: number;
        entry_id: string;
        kind: HafalanEventKind;
        status: string;
        at: number;
      }>(
        'SELECT id, entry_id, kind, status, at FROM hafalan_events WHERE entry_id = ? ORDER BY at DESC, id DESC',
        id,
      );
      return rows.map<HafalanEvent>((row) => ({
        id: row.id,
        entryId: row.entry_id,
        kind: row.kind,
        status: toStatus(row.status),
        at: row.at,
      }));
    },

    async summary() {
      const [entries, last] = await Promise.all([
        list(),
        db.getFirstAsync<{ last: number | null }>('SELECT MAX(at) AS last FROM hafalan_events'),
      ]);
      return summarize(entries, last?.last ?? null);
    },
  };
}
