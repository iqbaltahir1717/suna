/**
 * The subset of the expo-sqlite async API that repositories and migrations
 * use. Keeping it narrow lets tests run the same SQL against Node's built-in
 * SQLite (see src/test/nodeSqlite.ts) without a device.
 */
export type SqlValue = string | number | null;

export interface SqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(
    source: string,
    ...params: SqlValue[]
  ): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(source: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: SqlValue[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
