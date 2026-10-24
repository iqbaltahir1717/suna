import type { LanguagePreference } from '@/locales/i18n';

import type { SqlDatabase } from '../db/types';

export interface AppSettings {
  language: LanguagePreference;
  soundEnabled: boolean;
  /** App-level preference; the OS reduce-motion setting is honoured separately. */
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'system',
  soundEnabled: true,
  reduceMotion: false,
};

const validators: { [K in keyof AppSettings]: (value: unknown) => value is AppSettings[K] } = {
  language: (v): v is LanguagePreference => v === 'system' || v === 'id' || v === 'en',
  soundEnabled: (v): v is boolean => typeof v === 'boolean',
  reduceMotion: (v): v is boolean => typeof v === 'boolean',
};

export interface SettingsRepository {
  load(): Promise<AppSettings>;
  save<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>;
}

export function createSettingsRepository(
  db: SqlDatabase,
  now: () => number = Date.now,
): SettingsRepository {
  return {
    async load() {
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings',
      );
      const settings: AppSettings = { ...DEFAULT_SETTINGS };
      for (const row of rows) {
        if (!(row.key in validators)) continue; // Unknown keys are ignored.
        const key = row.key as keyof AppSettings;
        let parsed: unknown;
        try {
          parsed = JSON.parse(row.value);
        } catch {
          continue;
        }
        if (validators[key](parsed)) {
          (settings as Record<keyof AppSettings, unknown>)[key] = parsed;
        }
      }
      return settings;
    },

    async save(key, value) {
      if (!validators[key](value)) {
        throw new Error(`Invalid value for setting "${key}"`);
      }
      await db.runAsync(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        key,
        JSON.stringify(value),
        now(),
      );
    },
  };
}
