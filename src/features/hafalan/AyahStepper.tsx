import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Icon } from '@/components';
import { borders, colors, minTapTarget, motion, radius, spacing, typography } from '@/theme';

/** Ayah number with -/+ buttons and direct entry for long surahs. */
export function AyahStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(String(value));
  // Follow outside changes (buttons, "whole surah") while keeping free typing.
  const [shown, setShown] = useState(value);
  if (shown !== value) {
    setShown(value);
    setDraft(String(value));
  }

  const commit = (text: string) => {
    const parsed = Number.parseInt(text, 10);
    if (Number.isNaN(parsed)) setDraft(String(value));
    else onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <View style={styles.container}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <View style={styles.row}>
        <StepButton
          icon="remove"
          disabled={value <= min}
          accessibilityLabel={t('hafalan.editor.decrease', { label })}
          onPress={() => onChange(Math.max(min, value - 1))}
        />
        <TextInput
          value={draft}
          onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, ''))}
          onEndEditing={(event) => commit(event.nativeEvent.text)}
          onBlur={() => commit(draft)}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
          selectTextOnFocus
          accessibilityLabel={label}
          style={styles.input}
        />
        <StepButton
          icon="add"
          disabled={value >= max}
          accessibilityLabel={t('hafalan.editor.increase', { label })}
          onPress={() => onChange(Math.min(max, value + 1))}
        />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  disabled,
  accessibilityLabel,
  onPress,
}: {
  icon: 'add' | 'remove';
  disabled: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.step, (pressed || disabled) && styles.pressed]}
    >
      <Icon name={icon} color={disabled ? 'textMuted' : 'text'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  step: {
    width: minTapTarget,
    height: minTapTarget,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: motion.pressFeedbackOpacity },
  input: {
    ...typography.heading,
    flex: 1,
    minWidth: minTapTarget,
    height: minTapTarget,
    textAlign: 'center',
    color: colors.text,
    borderRadius: radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
