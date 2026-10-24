import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, IconButton } from '@/components';
import { useUnreadCount } from '@/features/notifications/useUnreadCount';
import { colors, minTapTarget, radius, spacing } from '@/theme';

export function HomeHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const unread = useUnreadCount();

  return (
    <View style={styles.header}>
      <View
        style={styles.brand}
        accessible
        accessibilityRole="header"
        accessibilityLabel={t('common.appName')}
      >
        {/* Placeholder logo slot until the final logo asset exists. */}
        <View style={styles.logo}>
          <AppText variant="title" color="primary">
            S
          </AppText>
        </View>
        <AppText variant="display">{t('common.appName')}</AppText>
      </View>
      <IconButton
        icon="notifications-outline"
        onPress={() => router.push('/notifications')}
        accessibilityLabel={
          unread > 0 ? t('home.notificationsUnreadA11y') : t('home.notificationsA11y')
        }
        showDot={unread > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  logo: {
    width: minTapTarget,
    height: minTapTarget,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
