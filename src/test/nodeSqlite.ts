import { DatabaseSync } from 'node:sqlite';

import type { SqlDatabase, SqlValue } from '@/data/db/types';

/**
 * Test-only adapter: runs the app's SQL against Node's built-in SQLite
 * through the same narrow interface expo-sqlite satisfies on device.
 */
export function createTestDatabase(): SqlDatabase & { close(): void } {
  const db = new DatabaseSync(':memory:');
  return {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, ...params: SqlValue[]) {
      const result = db.prepare(source).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getFirstAsync<T>(source: string, ...params: SqlValue[]) {
      return (db.prepare(source).get(...params) as T | undefined) ?? null;
    },
    async getAllAsync<T>(source: string, ...params: SqlValue[]) {
      return db.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      db.close();
    },
  };
}
