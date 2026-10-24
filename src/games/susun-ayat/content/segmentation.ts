/**
 * Word segmentation for `orderWords` puzzles.
 *
 * Words are the space-separated tokens of the verbatim source text (U+0020),
 * exactly as Tanzil writes them. Nothing is normalized, merged, or removed,
 * so `segmentAyah(text).join(' ') === text` always holds.
 *
 * Tanzil can also write pause marks (waqf signs) as separate tokens. No rule
 * for attaching them to a word has been reviewed yet, so such text is
 * refused instead of turning a mark into a "word".
 */

/** Quranic annotation signs (small high letters, pause marks, ayah markers). */
const ANNOTATION_ONLY = /^[ۖ-ۭ࣓-ࣿ؀-؅]+$/u;

export function segmentAyah(text: string): string[] {
  if (text.length === 0 || text !== text.trim() || text.includes('  ')) {
    throw new Error('Ayah text has unexpected spacing; refusing to segment.');
  }
  if (/[\t\n\r ​-‏]/u.test(text)) {
    throw new Error('Ayah text contains non-space separators; refusing to segment.');
  }
  const words = text.split(' ');
  const mark = words.find((word) => ANNOTATION_ONLY.test(word));
  if (mark !== undefined) {
    throw new Error('A token is only an annotation mark; segmentation needs a reviewed rule.');
  }
  return words;
}
