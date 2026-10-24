#!/usr/bin/env node
/**
 * Extracts one surah, verbatim, from a Tanzil Quran XML file into the JSON
 * shape used by src/games/susun-ayat/content/quran/.
 *
 * Usage:
 *   node scripts/extract-tanzil-surah.mjs <tanzil.xml> <surah> <out.json> [--obtained-via <text>]
 *
 * The ayah strings are copied byte-for-byte (only XML entities are decoded).
 * The Tanzil copyright block is copied verbatim, as its license requires.
 * Never hand-edit the output; re-run this script against a verified file.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [xmlPath, surahArg, outPath, ...rest] = process.argv.slice(2);
if (!xmlPath || !surahArg || !outPath) {
  console.error('Usage: extract-tanzil-surah.mjs <tanzil.xml> <surah> <out.json> [--obtained-via <text>]');
  process.exit(1);
}
const viaIndex = rest.indexOf('--obtained-via');
const obtainedVia = viaIndex >= 0 ? rest[viaIndex + 1] : null;

const raw = readFileSync(xmlPath);
const xml = raw.toString('utf8');
const surah = Number(surahArg);

const header = xml.match(/<!--([\s\S]*?)-->/)?.[1];
if (!header || !header.includes('Tanzil Quran Text')) {
  throw new Error('Tanzil copyright block not found; refusing to extract from an unverified file.');
}
const title = header.match(/Tanzil Quran Text \(([^,]+), version ([^)]+)\)/);
if (!title) throw new Error('Could not read text type/version from the copyright block.');

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const suraMatch = xml.match(new RegExp(`<sura index="${surah}" name="([^"]*)">([\\s\\S]*?)</sura>`));
if (!suraMatch) throw new Error(`Surah ${surah} not found.`);
const ayat = [...suraMatch[2].matchAll(/<aya index="(\d+)" text="([^"]*)"/g)].map((m) => ({
  ayah: Number(m[1]),
  text: decode(m[2]),
}));
ayat.forEach((a, i) => {
  if (a.ayah !== i + 1) throw new Error(`Unexpected ayah numbering at ${a.ayah}.`);
});

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
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
  surah,
  surahNameArabic: decode(suraMatch[1]),
  ayat,
  /** sha256 of the ayah texts joined with "\n"; the content test re-checks it. */
  ayatSha256: sha256(ayat.map((a) => a.text).join('\n')),
};
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${ayat.length} ayat of surah ${surah} to ${outPath}`);
