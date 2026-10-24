import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppText,
  Badge,
  Card,
  ListRow,
  RowDivider,
  Screen,
  Section,
  SegmentedControl,
  SwitchRow,
} from '@/components';
import type { LanguagePreference } from '@/locales/i18n';
import { ENTITLEMENT_KEYS } from '@/features/purchases/entitlements';
import { DEV_OVERRIDE_AVAILABLE, useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { useSettings } from '@/features/settings/SettingsProvider';
import { radius, spacing } from '@/theme';

export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { settings, update, systemReduceMotion } = useSettings();

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('profile.languageSystem') },
    { value: 'id', label: t('profile.languageId') },
    { value: 'en', label: t('profile.languageEn') },
  ];

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('tabs.profile')}
      </AppText>

      <Card>
        <View style={styles.profile}>
          <Image
            source={require('../../../assets/brand/suna-logo.png')}
            style={styles.avatar}
            accessible={false}
          />
          <View style={styles.profileText}>
            <AppText variant="heading">{t('profile.localName')}</AppText>
            <AppText variant="caption" color="textMuted">
              {t('profile.localBody')}
            </AppText>
          </View>
        </View>
      </Card>

      <Section title={t('profile.settingsTitle')}>
        <Card>
          <AppText>{t('profile.language')}</AppText>
          <SegmentedControl
            options={languageOptions}
            value={settings.language}
            onChange={(value) => update('language', value)}
            accessibilityLabel={t('profile.language')}
          />
          <RowDivider />
          <SwitchRow
            label={t('profile.sound')}
            caption={t('profile.soundCaption')}
            value={settings.soundEnabled}
            onValueChange={(value) => update('soundEnabled', value)}
          />
          <RowDivider />
          <SwitchRow
            label={t('profile.reduceMotion')}
            caption={
              systemReduceMotion
                ? t('profile.reduceMotionSystem')
                : t('profile.reduceMotionCaption')
            }
            value={settings.reduceMotion || systemReduceMotion}
            disabled={systemReduceMotion}
            onValueChange={(value) => update('reduceMotion', value)}
          />
        </Card>
      </Section>

      <Section title={t('profile.premiumTitle')}>
        <Card>
          <ListRow
            icon="star-outline"
            label={t('profile.premiumRow')}
            onPress={() => router.push('/premium')}
          />
        </Card>
      </Section>

      {DEV_OVERRIDE_AVAILABLE ? <DevEntitlementPanel /> : null}

      <Section title={t('profile.aboutTitle')}>
        <Card>
          {/* Placeholders: no destination exists yet, so these are not tappable. */}
          <ListRow
            icon="help-circle-outline"
            label={t('profile.support')}
            accessory={<Badge label={t('common.comingSoon')} />}
          />
          <RowDivider />
          <ListRow
            icon="shield-checkmark-outline"
            label={t('profile.privacy')}
            accessory={<Badge label={t('common.comingSoon')} />}
          />
          <RowDivider />
          <ListRow
            icon="information-circle-outline"
            label={t('profile.version', { version: Constants.expoConfig?.version ?? '—' })}
          />
        </Card>
      </Section>
    </Screen>
  );
}

function DevEntitlementPanel() {
  const { t } = useTranslation();
  const { has, setDevOverride } = useEntitlements();
  return (
    <Section
      title={t('profile.devTitle')}
      accessory={<Badge label={t('common.devOnly')} tone="dev" icon="flask-outline" />}
    >
      <Card>
        <AppText variant="caption" color="dev">
          {t('profile.devBody')}
        </AppText>
        {ENTITLEMENT_KEYS.map((key) => (
          <SwitchRow
            key={key}
            label={key}
            value={has(key)}
            onValueChange={(value) => setDevOverride(key, value)}
          />
        ))}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: radius.md },
  profileText: { flex: 1, gap: spacing.xxs },
});
