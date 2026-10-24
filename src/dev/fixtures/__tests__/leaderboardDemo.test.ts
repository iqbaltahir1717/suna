import { getLeaderboardDemo } from '@/dev/fixtures/leaderboardDemo';

it('exposes demo leaderboard rows only in development builds', () => {
  expect(getLeaderboardDemo(false)).toBeNull();
  expect(getLeaderboardDemo(true)?.length).toBeGreaterThan(0);
});
