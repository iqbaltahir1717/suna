import type { GameDefinition } from './types';

export type { GameAvailability, GameDefinition } from './types';

/**
 * All games in the Suna hub, in display order. Adding a game means adding an
 * entry here plus its route under src/app/games/.
 */
export const GAMES: readonly GameDefinition[] = [
  {
    id: 'susun-ayat',
    titleKey: 'games.susunAyat.title',
    descriptionKey: 'games.susunAyat.description',
    banner: null,
    route: '/games/susun-ayat',
    availability: 'available',
    // The intro set is free; premium levels inside the game check
    // `susun_ayat_full` themselves, so opening the game needs no entitlement.
  },
];

/** Games shown on Home: anything with an entry screen. */
export function listVisibleGames(games: readonly GameDefinition[] = GAMES) {
  return games.filter((game) => game.availability !== 'comingSoon');
}

export function isPlayable(game: GameDefinition) {
  return game.availability === 'available';
}
