import { createHash } from 'node:crypto';

import { checkAnswer, createPuzzle, placePiece, seededRandom } from '../../engine';
import {
  buildLevelCards,
  canPlayLevel,
  CONTENT_VERSION,
  LEVELS,
  nextLevelId,
  QURAN_TEXTS,
} from '..';

describe('bundled Quran text', () => {
  it.each(Object.values(QURAN_TEXTS))('surah $surah is unchanged since extraction', (text) => {
    const hash = createHash('sha256')
      .update(text.ayat.map((a) => a.text).join('\n'))
      .digest('hex');
    expect(hash).toBe(text.ayatSha256);
  });

  it.each(Object.values(QURAN_TEXTS))('surah $surah keeps Tanzil attribution', (text) => {
    expect(text.source.name).toBe('Tanzil Quran Text');
    expect(text.source.copyrightBlock).toContain(
      'PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK',
    );
    expect(text.source.copyrightBlock).toContain(`version ${text.source.version}`);
    text.ayat.forEach((a, i) => expect(a.ayah).toBe(i + 1));
  });
});

describe('levels', () => {
  it('has five unique, free Phase 2 challenges', () => {
    expect(LEVELS).toHaveLength(5);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(5);
    LEVELS.forEach((level) => {
      expect(level.contentVersion).toBe(CONTENT_VERSION);
      expect(canPlayLevel(level, () => false)).toBe(true);
    });
  });

  it.each(LEVELS)('$id references consecutive bundled ayat', (level) => {
    const refs = level.orderedSources;
    expect(refs).toHaveLength(level.ayahRange.to - level.ayahRange.from + 1);
    refs.forEach((ref, i) => {
      expect(ref.surah).toBe(level.surah);
      expect(ref.ayah).toBe(level.ayahRange.from + i);
    });
    const cards = buildLevelCards(level);
    expect(cards.map((c) => c.text)).toEqual(
      refs.map((r) => QURAN_TEXTS[r.surah]!.ayat[r.ayah - 1]!.text),
    );
  });

  it.each(LEVELS)('$id is solvable through the engine', (level) => {
    const cards = buildLevelCards(level);
    const solved = cards.reduce(
      (state, card, index) => placePiece(state, card.id, index),
      createPuzzle(cards, seededRandom(11)),
    );
    expect(checkAnswer(solved).correct).toBe(true);
  });

  it('chains levels in order', () => {
    expect(nextLevelId(LEVELS[0]!.id)).toBe(LEVELS[1]!.id);
    expect(nextLevelId(LEVELS.at(-1)!.id)).toBeUndefined();
  });

  it('gates premium levels behind susun_ayat_full', () => {
    const premium = { ...LEVELS[0]!, access: 'susun_ayat_full' as const };
    expect(canPlayLevel(premium, () => false)).toBe(false);
    expect(canPlayLevel(premium, (key) => key === 'susun_ayat_full')).toBe(true);
  });
});
