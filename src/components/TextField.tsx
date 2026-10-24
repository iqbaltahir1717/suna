import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { borders, colors, minTapTarget, radius, spacing, typography } from '@/theme';

import { AppText } from './AppText';

/** Labelled single- or multi-line text input. */
export function TextField({ label, style, ...rest }: TextInputProps & { label?: string }) {
  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={[styles.input, rest.multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: minTapTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  multiline: { minHeight: minTapTarget * 2, textAlignVertical: 'top' },
});
