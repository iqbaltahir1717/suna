import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, minTapTarget, motion, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

/**
 * A settings-style row. Without `onPress` it renders as static, non-interactive
 * content, so placeholders never look like working controls.
 */
export function ListRow({
  icon,
  label,
  caption,
  accessory,
  onPress,
}: {
  icon?: IconName;
  label: string;
  caption?: string;
  accessory?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon ? <Icon name={icon} color={onPress ? 'text' : 'textMuted'} /> : null}
      <View style={styles.text}>
        <AppText color={onPress ? 'text' : 'textMuted'}>{label}</AppText>
        {caption ? (
          <AppText variant="caption" color="textMuted">
            {caption}
          </AppText>
        ) : null}
      </View>
      {accessory}
      {onPress ? <Icon name="chevron-forward" size={18} color="textMuted" /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function RowDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1, gap: spacing.xxs },
  pressed: { opacity: motion.pressFeedbackOpacity },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
