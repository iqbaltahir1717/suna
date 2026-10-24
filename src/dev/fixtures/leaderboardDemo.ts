/**
 * DEVELOPMENT FIXTURE — not real users or scores.
 *
 * Only read through `getLeaderboardDemo()`, which returns null outside dev
 * builds. Delete this file when the real leaderboard (Phase 8) lands.
 */
export interface DemoLeaderboardEntry {
  rank: number;
  pseudonym: string;
  points: number;
}

const DEMO_ENTRIES: readonly DemoLeaderboardEntry[] = [
  { rank: 1, pseudonym: 'Demo A', points: 120 },
  { rank: 2, pseudonym: 'Demo B', points: 95 },
  { rank: 3, pseudonym: 'Demo C', points: 80 },
];

export function getLeaderboardDemo(isDevBuild: boolean = __DEV__) {
  return isDevBuild ? DEMO_ENTRIES : null;
}
