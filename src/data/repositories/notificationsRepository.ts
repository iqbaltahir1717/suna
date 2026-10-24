import type { SqlDatabase } from '../db/types';

/**
 * Local, on-device inbox. Nothing writes to it yet; there is no push service
 * and no notification permission request.
 */
export interface InboxNotification {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: number;
  readAt: number | null;
}

export interface NotificationsRepository {
  list(): Promise<InboxNotification[]>;
  countUnread(): Promise<number>;
  markRead(id: string, at: number): Promise<void>;
}

interface Row {
  id: string;
  kind: string;
  payload: string;
  created_at: number;
  read_at: number | null;
}

export function createNotificationsRepository(db: SqlDatabase): NotificationsRepository {
  return {
    async list() {
      const rows = await db.getAllAsync<Row>(
        'SELECT id, kind, payload, created_at, read_at FROM notifications ORDER BY created_at DESC',
      );
      return rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        payload: safeParse(row.payload),
        createdAt: row.created_at,
        readAt: row.read_at,
      }));
    },
    async countUnread() {
      const row = await db.getFirstAsync<{ n: number }>(
        'SELECT COUNT(*) AS n FROM notifications WHERE read_at IS NULL',
      );
      return row?.n ?? 0;
    },
    async markRead(id, at) {
      await db.runAsync(
        'UPDATE notifications SET read_at = ? WHERE id = ? AND read_at IS NULL',
        at,
        id,
      );
    },
  };
}

function safeParse(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
