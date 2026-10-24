import type { ComponentRef, ReactNode, Ref } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { borders, colors, radius, spacing } from '@/theme';

import { SlotHighlight } from './SlotHighlight';

/** A numbered answer position. Empty slots show a dashed drop target. */
export function AnswerSlot({
  number,
  label,
  emptyLabel,
  children,
  hover,
  reduceMotion,
  ref,
}: {
  number: number;
  /** Slot index currently under a dragged card. */
  hover?: SharedValue<number>;
  reduceMotion?: boolean;
  label: string;
  /** Shown inside an empty slot; omit to keep the slot quiet. */
  emptyLabel?: string;
  children?: ReactNode;
  ref?: Ref<ComponentRef<typeof View>>;
}) {
  return (
    <View ref={ref} style={styles.row} accessibilityLabel={label}>
      <View style={styles.number}>
        <AppText variant="label" color="textMuted">
          {number}
        </AppText>
      </View>
      <View style={styles.body}>
        <SlotHighlight index={number - 1} hover={hover} reduceMotion={reduceMotion}>
          {children ?? (
            <View style={styles.empty}>
              {emptyLabel ? (
                <AppText variant="caption" color="textMuted">
                  {emptyLabel}
                </AppText>
              ) : null}
            </View>
          )}
        </SlotHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  number: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  empty: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: borders.thick,
    borderStyle: 'dashed',
    borderColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
});
