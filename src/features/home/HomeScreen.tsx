import { useTranslation } from 'react-i18next';

import { Screen, Section } from '@/components';
import { HafalanAccessCard } from '@/features/hafalan/HafalanAccessCard';
import { ActivitySummaryCard } from '@/features/statistics/ActivitySummaryCard';
import { listVisibleGames } from '@/games/registry';

import { GameCard } from './components/GameCard';
import { HomeHeader } from './components/HomeHeader';
import { LeaderboardPreview } from './components/LeaderboardPreview';
import { WelcomeSection } from './components/WelcomeSection';

export function HomeScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <HomeHeader />
      <WelcomeSection />
      <Section title={t('home.statsTitle')}>
        <ActivitySummaryCard />
      </Section>
      <Section title={t('home.gamesTitle')}>
        {listVisibleGames().map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </Section>
      <Section title={t('home.leaderboardTitle')}>
        <LeaderboardPreview />
      </Section>
      <Section title={t('home.hafalanTitle')}>
        <HafalanAccessCard />
      </Section>
    </Screen>
  );
}
