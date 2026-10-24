import { Pressable, StyleSheet } from 'react-native';

import { borders, colors, minTapTarget, motion, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  fullWidth = false,
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  /** primary: filled green; secondary: outlined; tonal: soft green fill. */
  variant?: 'primary' | 'secondary' | 'tonal';
  icon?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && (primary ? styles.primaryPressed : styles.pressed),
        disabled && styles.disabled,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={primary ? 'textInverse' : 'primary'} /> : null}
      <AppText variant="heading" color={primary ? 'textInverse' : 'primary'} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTapTarget + 4,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  label: { textAlign: 'center', flexShrink: 1 },
  primary: { backgroundColor: colors.primary },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: borders.thick,
    borderColor: colors.primarySoft,
  },
  tonal: { backgroundColor: colors.primarySoft },
  pressed: { opacity: motion.pressFeedbackOpacity },
  disabled: { opacity: 0.5 },
});
