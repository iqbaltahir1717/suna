import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { configureConnection, migrateDatabase } from './db/migrations';
import {
  createNotificationsRepository,
  type NotificationsRepository,
} from './repositories/notificationsRepository';
import {
  createProgressRepository,
  type ProgressRepository,
} from './repositories/progressRepository';
import {
  createSettingsRepository,
  type SettingsRepository,
} from './repositories/settingsRepository';

export const DATABASE_NAME = 'suna.db';

interface Repositories {
  settings: SettingsRepository;
  progress: ProgressRepository;
  notifications: NotificationsRepository;
}

const RepositoriesContext = createContext<Repositories | null>(null);

async function initDatabase(db: SQLiteDatabase) {
  await configureConnection(db);
  await migrateDatabase(db);
}

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <RepositoriesProvider>{children}</RepositoriesProvider>
    </SQLiteProvider>
  );
}

function RepositoriesProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const repositories = useMemo<Repositories>(
    () => ({
      settings: createSettingsRepository(db),
      progress: createProgressRepository(db),
      notifications: createNotificationsRepository(db),
    }),
    [db],
  );
  return (
    <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const value = useContext(RepositoriesContext);
  if (!value) throw new Error('useRepositories must be used inside <DataProvider>');
  return value;
}
