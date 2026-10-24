import { useTranslation } from 'react-i18next';

import { AppText, Screen, Section } from '@/components';

import { HafalanAccessCard } from './HafalanAccessCard';

export function HafalanScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('hafalan.title')}
      </AppText>
      <AppText color="textMuted">{t('hafalan.description')}</AppText>
      <Section title={t('home.hafalanTitle')}>
        <HafalanAccessCard showDescription={false} />
      </Section>
    </Screen>
  );
}
