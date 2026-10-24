import alFatihah from './001-al-fatihah.tanzil-uthmani.json';

/**
 * Bundled Quran text. Every file here is produced by
 * `scripts/extract-tanzil-surah.mjs` from a verified Tanzil file and must
 * never be edited by hand (the Tanzil license forbids changing the text).
 */
export interface QuranSurahText {
  source: {
    name: string;
    textType: string;
    version: string;
    url: string;
    license: string;
    sourceFile: string;
    sourceFileMd5: string;
    sourceFileSha256: string;
    obtainedVia: string | null;
    copyrightBlock: string;
  };
  surah: number;
  surahNameArabic: string;
  ayat: { ayah: number; text: string }[];
  ayatSha256: string;
}

export const QURAN_TEXTS: Readonly<Record<number, QuranSurahText>> = {
  1: alFatihah,
};

/** Latin display names (UI text, not Quran text). */
export const SURAH_NAMES: Readonly<Record<number, string>> = {
  1: 'Al-Fatihah',
};

export function getAyahText(surah: number, ayah: number): string {
  const text = QURAN_TEXTS[surah]?.ayat[ayah - 1]?.text;
  if (text === undefined) throw new Error(`Ayah ${surah}:${ayah} is not bundled.`);
  return text;
}
