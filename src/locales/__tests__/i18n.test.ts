import en from '@/locales/en';
import id from '@/locales/id';
import { resolveLanguage } from '@/locales/i18n';

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

function placeholders(text: string) {
  return [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();
}

function lookup(obj: unknown, path: string): string {
  return path.split('.').reduce((o, k) => (o as Record<string, unknown>)[k], obj) as string;
}

describe('locales', () => {
  it('Indonesian and English define the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(id).sort());
  });

  it('use the same interpolation placeholders', () => {
    for (const key of keys(id)) {
      expect([key, placeholders(lookup(en, key))]).toEqual([key, placeholders(lookup(id, key))]);
    }
  });

  it('has no empty strings', () => {
    for (const key of keys(id)) {
      expect([key, lookup(id, key).trim().length > 0]).toEqual([key, true]);
      expect([key, lookup(en, key).trim().length > 0]).toEqual([key, true]);
    }
  });
});

describe('resolveLanguage', () => {
  it('follows the device for "system"', () => {
    expect(resolveLanguage('system', 'id')).toBe('id');
    expect(resolveLanguage('system', 'en')).toBe('en');
    expect(resolveLanguage('system', 'ar')).toBe('en');
    expect(resolveLanguage('system', null)).toBe('en');
  });

  it('respects an explicit choice', () => {
    expect(resolveLanguage('id', 'en')).toBe('id');
    expect(resolveLanguage('en', 'id')).toBe('en');
  });
});
