#!/usr/bin/env node
/**
 * Extracts surah metadata (index, Arabic name, ayah count) from a Tanzil
 * Quran XML file into src/data/quran/surahs.tanzil-uthmani.json. The hafalan
 * tracker uses it to validate ayah ranges for all 114 surahs.
 *
 * Usage:
 *   node scripts/extract-tanzil-metadata.mjs <tanzil.xml> <out.json> [--obtained-via <text>]
 *
 * Names are copied verbatim (only XML entities are decoded); counts come from
 * the <aya> elements. No Quran text is stored. Never hand-edit the output.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [xmlPath, outPath, ...rest] = process.argv.slice(2);
if (!xmlPath || !outPath) {
  console.error('Usage: extract-tanzil-metadata.mjs <tanzil.xml> <out.json> [--obtained-via <text>]');
  process.exit(1);
}
const viaIndex = rest.indexOf('--obtained-via');
const obtainedVia = viaIndex >= 0 ? rest[viaIndex + 1] : null;

const raw = readFileSync(xmlPath);
const xml = raw.toString('utf8');

const header = xml.match(/<!--([\s\S]*?)-->/)?.[1];
if (!header || !header.includes('Tanzil Quran Text')) {
  throw new Error('Tanzil copyright block not found; refusing to extract from an unverified file.');
}
const title = header.match(/Tanzil Quran Text \(([^,]+), version ([^)]+)\)/);
if (!title) throw new Error('Could not read text type/version from the copyright block.');

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const surahs = [...xml.matchAll(/<sura index="(\d+)" name="([^"]*)">([\s\S]*?)<\/sura>/g)].map((m) => {
  const indices = [...m[3].matchAll(/<aya index="(\d+)"/g)].map((a) => Number(a[1]));
  indices.forEach((n, i) => {
    if (n !== i + 1) throw new Error(`Unexpected ayah numbering in surah ${m[1]} at ${n}.`);
  });
  return { surah: Number(m[1]), nameArabic: decode(m[2]), ayahCount: indices.length };
});
surahs.forEach((s, i) => {
  if (s.surah !== i + 1) throw new Error(`Unexpected surah numbering at ${s.surah}.`);
});
if (surahs.length !== 114) throw new Error(`Expected 114 surahs, found ${surahs.length}.`);

const out = {
  source: {
    name: 'Tanzil Quran Text',
    textType: title[1],
    version: title[2],
    url: 'https://tanzil.net',
    license: 'Creative Commons Attribution 3.0 (verbatim copies only; changing the text is not allowed)',
    sourceFile: basename(xmlPath),
    sourceFileMd5: createHash('md5').update(raw).digest('hex'),
    sourceFileSha256: createHash('sha256').update(raw).digest('hex'),
    obtainedVia,
    copyrightBlock: header.replace(/^\n+|\s+$/g, ''),
  },
  totalAyat: surahs.reduce((sum, s) => sum + s.ayahCount, 0),
  surahs,
};
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote metadata of ${surahs.length} surahs (${out.totalAyat} ayat) to ${outPath}`);
