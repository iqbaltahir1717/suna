import { StyleSheet, Switch, View } from 'react-native';

import { colors, minTapTarget, spacing } from '@/theme';

import { AppText } from './AppText';

export function SwitchRow({
  label,
  caption,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  caption?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText>{label}</AppText>
        {caption ? (
          <AppText variant="caption" color="textMuted">
            {caption}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ true: colors.primary, false: colors.placeholder }}
      />
    </View>
  );
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
});
