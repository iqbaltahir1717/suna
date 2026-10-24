import { useLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nextProvider } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { useRepositories } from '@/data/DataProvider';
import { DEFAULT_SETTINGS, type AppSettings } from '@/data/repositories/settingsRepository';
import i18n, { ensureI18n, resolveLanguage, type AppLanguage } from '@/locales/i18n';

interface SettingsContextValue {
  settings: AppSettings;
  /** Language actually in use after resolving 'system'. */
  language: AppLanguage;
  /** True when either the OS or the app asks for reduced motion. */
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  update<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings: repository } = useRepositories();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const deviceLanguage = useLocales()[0]?.languageCode;
  const systemReduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    repository
      .load()
      .catch((error: unknown) => {
        console.warn('Failed to load settings; using defaults', error);
        return DEFAULT_SETTINGS;
      })
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const language = resolveLanguage(settings?.language ?? 'system', deviceLanguage);
  // First init happens once settings are known, so the first frame is
  // already in the right language.
  if (settings) ensureI18n(language);

  // Later switches notify every translated component, so they must happen
  // after render, not during it.
  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== language) void i18n.changeLanguage(language);
  }, [language]);

  const update = useCallback<SettingsContextValue['update']>(
    (key, value) => {
      setSettings((previous) => (previous ? { ...previous, [key]: value } : previous));
      repository.save(key, value).catch((error: unknown) => {
        console.warn(`Failed to save setting "${key}"`, error);
      });
    },
    [repository],
  );

  const value = useMemo<SettingsContextValue | null>(
    () =>
      settings && {
        settings,
        language,
        reduceMotion: settings.reduceMotion || systemReduceMotion,
        systemReduceMotion,
        update,
      },
    [settings, language, systemReduceMotion, update],
  );

  // Settings come from a local database and load in a few ms; render nothing
  // until then so the first frame uses the right language.
  if (!value) return null;

  return (
    <SettingsContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>');
  return value;
}
