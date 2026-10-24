import { createHash } from 'node:crypto';

import { checkAnswer, createPuzzle, placePiece, seededRandom } from '../../engine';
import {
  accessSummary,
  buildLevelCards,
  canPlayLevel,
  CONTENT_VERSION,
  DIFFICULTIES,
  DIFFICULTY_RULES,
  FREE_SURAHS,
  getLevel,
  hintsFor,
  LEVELS,
  levelPassage,
  listSurahs,
  nextLevelId,
  pickPracticeLevel,
  PUZZLE_TYPES,
  QURAN_TEXTS,
  segmentAyah,
  showsAyahBreaks,
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

const PHASE_2_IDS = [
  'fatihah-ayat-1-3',
  'fatihah-ayat-3-5',
  'fatihah-ayat-5-7',
  'fatihah-ayat-1-5',
  'fatihah-ayat-1-7',
];

describe('word segmentation', () => {
  it.each(Object.values(QURAN_TEXTS))('splits surah $surah losslessly', (text) => {
    for (const { text: ayah } of text.ayat) {
      const words = segmentAyah(ayah);
      expect(words.join(' ')).toBe(ayah);
      words.forEach((word) => expect(word.length).toBeGreaterThan(0));
    }
  });

  it('keeps every character of a word, marks included', () => {
    expect(segmentAyah('alpha beta\u0652 gamma')).toEqual(['alpha', 'beta\u0652', 'gamma']);
  });

  it('refuses text it cannot split safely', () => {
    expect(() => segmentAyah(' leading')).toThrow();
    expect(() => segmentAyah('double  space')).toThrow();
    expect(() => segmentAyah('no\u00A0break')).toThrow();
    // A standalone pause mark (U+06D6) is not a word.
    expect(() => segmentAyah('alpha \u06D6 beta')).toThrow();
  });
});

describe('levels', () => {
  it('has about 40 unique challenges over about 10 surahs', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
    expect(listSurahs()).toHaveLength(10);
    listSurahs().forEach((surah) => expect(QURAN_TEXTS[surah]).toBeDefined());
  });

  it('keeps the shipped Phase 2 challenges with the same ids, ranges, and access', () => {
    expect(LEVELS.slice(0, 5).map((l) => l.id)).toEqual(PHASE_2_IDS);
    PHASE_2_IDS.forEach((id) => {
      const level = getLevel(id)!;
      expect(level.puzzleType).toBe('orderAyat');
      expect(level.access).toBe('free');
    });
  });

  it('covers both modes and all four difficulties', () => {
    for (const type of PUZZLE_TYPES) expect(LEVELS.some((l) => l.puzzleType === type)).toBe(true);
    for (const d of DIFFICULTIES) expect(LEVELS.some((l) => l.difficulty === d)).toBe(true);
  });

  it('defines the free introductory set by surah', () => {
    LEVELS.forEach((level) => {
      expect(level.contentVersion).toBe(CONTENT_VERSION);
      expect(canPlayLevel(level, () => false)).toBe(FREE_SURAHS.includes(level.surah));
    });
    const summary = accessSummary();
    expect(summary.free + summary.premium).toBe(LEVELS.length);
    expect(summary.free).toBeGreaterThan(0);
  });

  it.each(LEVELS)('$id follows its difficulty rule', (level) => {
    const rule = DIFFICULTY_RULES[level.difficulty];
    const pieces = level.orderedSources.length;
    expect(pieces).toBeGreaterThanOrEqual(rule.pieces.min);
    expect(pieces).toBeLessThanOrEqual(rule.pieces.max);
    expect(level.allowedHints).toBe(hintsFor(level.difficulty, pieces));
    expect(level.allowedHints).toBeGreaterThanOrEqual(1);
  });

  it.each(LEVELS)('$id references its source text verbatim', (level) => {
    const { from, to } = level.ayahRange;
    const ayat = QURAN_TEXTS[level.surah]!.ayat.slice(from - 1, to).map((a) => a.text);
    expect(ayat).toHaveLength(to - from + 1);
    const cards = buildLevelCards(level);
    level.orderedSources.forEach((ref) => {
      expect(ref.surah).toBe(level.surah);
      expect(ref.ayah).toBeGreaterThanOrEqual(from);
      expect(ref.ayah).toBeLessThanOrEqual(to);
    });
    if (level.puzzleType === 'orderAyat') {
      expect(cards.map((c) => c.text)).toEqual(ayat);
    } else {
      // Joining the word cards of each ayah gives back the exact ayah text.
      const perAyah = ayat.map((_, i) =>
        cards
          .filter((c) => c.ref.ayah === from + i)
          .map((c) => c.text)
          .join(' '),
      );
      expect(perAyah).toEqual(ayat);
    }
    expect(levelPassage(level).map((p) => p.text)).toEqual(ayat);
  });

  it.each(LEVELS)('$id is solvable through the engine', (level) => {
    const cards = buildLevelCards(level);
    const solved = cards.reduce(
      (state, card, index) => placePiece(state, card.id, index),
      createPuzzle(cards, seededRandom(11)),
    );
    expect(checkAnswer(solved).correct).toBe(true);
  });

  it('accepts identical ayat in either order (Al-Kafirun 3 and 5)', () => {
    const level = getLevel('kafirun-ayat-1-6')!;
    const cards = buildLevelCards(level);
    expect(cards[2]!.text).toBe(cards[4]!.text);
    const order = [0, 1, 4, 3, 2, 5];
    const solved = order.reduce(
      (state, cardIndex, slot) => placePiece(state, cards[cardIndex]!.id, slot),
      createPuzzle(cards, seededRandom(3)),
    );
    expect(checkAnswer(solved).correct).toBe(true);
  });

  it('shows ayah breaks only below expert in multi-ayah word puzzles', () => {
    expect(showsAyahBreaks(getLevel('falaq-words-2-3')!)).toBe(true);
    expect(showsAyahBreaks(getLevel('falaq-words-1-3')!)).toBe(false);
    expect(showsAyahBreaks(getLevel('falaq-words-1')!)).toBe(false);
    expect(showsAyahBreaks(getLevel('falaq-ayat-1-5')!)).toBe(false);
  });

  it('chains to the next playable challenge', () => {
    expect(nextLevelId(LEVELS[0]!.id)).toBe(LEVELS[1]!.id);
    expect(nextLevelId(LEVELS.at(-1)!.id)).toBeUndefined();
    const lastFree = LEVELS.filter((l) => l.access === 'free').at(-1)!;
    expect(nextLevelId(lastFree.id, (l) => l.access === 'free')).toBeUndefined();
  });

  it('gates premium levels behind susun_ayat_full', () => {
    const premium = { ...LEVELS[0]!, access: 'susun_ayat_full' as const };
    expect(canPlayLevel(premium, () => false)).toBe(false);
    expect(canPlayLevel(premium, (key) => key === 'susun_ayat_full')).toBe(true);
  });
});

describe('practice', () => {
  const levels = LEVELS.slice(0, 3);

  it('prefers challenges that are not completed yet', () => {
    const done = new Set([levels[0]!.id, levels[2]!.id]);
    for (const seed of [1, 2, 3, 4]) {
      expect(pickPracticeLevel(levels, (id) => done.has(id), seededRandom(seed))).toBe(levels[1]);
    }
  });

  it('falls back to any candidate when all are completed, and to nothing when empty', () => {
    expect(levels).toContain(pickPracticeLevel(levels, () => true, seededRandom(5)));
    expect(pickPracticeLevel([], () => false)).toBeUndefined();
  });
});
