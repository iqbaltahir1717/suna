import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borders, colors, elevation, motion, radius, spacing } from '@/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/** Rounded white surface with a hairline border and a soft shadow. */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: CardProps) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    ...elevation.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: motion.pressFeedbackOpacity },
});
