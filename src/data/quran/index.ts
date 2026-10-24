import metadata from './surahs.tanzil-uthmani.json';

/**
 * Surah metadata for all 114 surahs, extracted by
 * `scripts/extract-tanzil-metadata.mjs` from the same verified Tanzil
 * Uthmani 1.0.2 file as the bundled Susun Ayat text. Contains names and ayah
 * counts only, no Quran text. Never edit the JSON by hand.
 */
export interface SurahMeta {
  surah: number;
  nameArabic: string;
  ayahCount: number;
}

export const QURAN_METADATA_SOURCE = metadata.source;
export const SURAHS: readonly SurahMeta[] = metadata.surahs;
export const TOTAL_AYAT: number = metadata.totalAyat;

export function getSurah(surah: number): SurahMeta | undefined {
  return SURAHS[surah - 1];
}
