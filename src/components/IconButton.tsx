import { Pressable, StyleSheet, View } from 'react-native';

import { colors, minTapTarget, motion, radius } from '@/theme';

import { Icon, type IconName } from './Icon';

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  showDot = false,
}: {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  showDot?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name={icon} size={24} />
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTapTarget,
    height: minTapTarget,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: motion.pressFeedbackOpacity },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});
