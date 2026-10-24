import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const tones = {
  neutral: { bg: colors.surfaceMuted, fg: 'textMuted' },
  primary: { bg: colors.primarySoft, fg: 'primary' },
  locked: { bg: colors.surfaceMuted, fg: 'locked' },
  dev: { bg: colors.devSoft, fg: 'dev' },
} as const;

export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: keyof typeof tones;
  icon?: IconName;
}) {
  const { bg, fg } = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <AppText variant="label" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
});
