import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import id from './id';

export const SUPPORTED_LANGUAGES = ['id', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
/** 'system' follows the device language; otherwise an explicit choice. */
export type LanguagePreference = 'system' | AppLanguage;

export const resources = {
  id: { translation: id },
  en: { translation: en },
} as const;

/** Indonesian devices get Indonesian; every other device language gets English. */
export function resolveLanguage(
  preference: LanguagePreference,
  deviceLanguageCode: string | null | undefined,
): AppLanguage {
  if (preference !== 'system') return preference;
  return deviceLanguageCode?.toLowerCase() === 'id' ? 'id' : 'en';
}

const i18n = createInstance();

/** Initializes once, synchronously, so the first render is already translated. */
export function ensureI18n(language: AppLanguage) {
  if (i18n.isInitialized) return i18n;
  void i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'id',
    interpolation: { escapeValue: false },
    returnNull: false,
    initAsync: false,
  });
  return i18n;
}

export default i18n;
