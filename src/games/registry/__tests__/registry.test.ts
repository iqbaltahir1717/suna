import { GAMES, isPlayable, listVisibleGames, type GameDefinition } from '@/games/registry';

describe('game registry', () => {
  it('contains Susun Ayat, not yet playable', () => {
    const susunAyat = GAMES.find((g) => g.id === 'susun-ayat');
    expect(susunAyat).toBeDefined();
    expect(isPlayable(susunAyat!)).toBe(false);
  });

  it('has unique ids', () => {
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(GAMES.length);
  });

  it('hides games without an entry screen', () => {
    const comingSoon: GameDefinition = { ...GAMES[0]!, id: 'later', availability: 'comingSoon' };
    expect(listVisibleGames([...GAMES, comingSoon]).map((g) => g.id)).not.toContain('later');
  });
});
