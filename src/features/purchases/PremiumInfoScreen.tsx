import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Card, Icon, Screen, Section } from '@/components';
import { accessSummary } from '@/games/susun-ayat/content';
import { spacing } from '@/theme';

import { useEntitlements } from './EntitlementsProvider';
import { PREMIUM_PACKAGE } from './premiumPackage';

/** Information only. There is deliberately no purchase button yet. */
export function PremiumInfoScreen() {
  const { t } = useTranslation();
  const { has } = useEntitlements();

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <AppText>{t('premium.intro')}</AppText>

      <Section title={t('premium.includesTitle')}>
        {PREMIUM_PACKAGE.grants.map((key) => (
          <Card key={key}>
            <View style={styles.row}>
              <Icon name="checkmark-circle-outline" color="primary" />
              <View style={styles.text}>
                <AppText variant="heading">{t(`premium.features.${key}.title`)}</AppText>
                <AppText variant="caption" color="textMuted">
                  {t(`premium.features.${key}.body`)}
                </AppText>
                {key === 'susun_ayat_full' ? (
                  <AppText variant="caption">
                    {t('premium.susunAyatContents', accessSummary())}
                  </AppText>
                ) : null}
                {has(key) ? <Badge label={t('premium.active')} tone="dev" /> : null}
              </View>
            </View>
          </Card>
        ))}
      </Section>

      <Section title={t('premium.excludesTitle')}>
        <Card>
          {PREMIUM_PACKAGE.excludes.map((key) => (
            <View key={key} style={styles.row}>
              <Icon name="close-circle-outline" color="textMuted" />
              <AppText style={styles.text}>{t(`premium.excludes.${key}`)}</AppText>
            </View>
          ))}
        </Card>
      </Section>

      <Card>
        <Badge label={t('common.comingSoon')} icon="time-outline" />
        <AppText>{t('premium.unavailable')}</AppText>
        <AppText variant="caption" color="textMuted">
          {t('premium.priceNote')}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  text: { flex: 1, gap: spacing.xs },
});
