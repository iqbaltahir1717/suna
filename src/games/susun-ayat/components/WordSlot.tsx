import type { ComponentRef, ReactNode, Ref } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { borders, colors, minTapTarget, radius, spacing } from '@/theme';

import { SlotHighlight } from './SlotHighlight';

/**
 * A compact answer position for one word. Slots flow right-to-left like the
 * Arabic text; an empty slot shows its position number.
 */
export function WordSlot({
  number,
  label,
  children,
  hover,
  reduceMotion,
  ref,
}: {
  number: number;
  hover?: SharedValue<number>;
  reduceMotion?: boolean;
  label: string;
  children?: ReactNode;
  ref?: Ref<ComponentRef<typeof View>>;
}) {
  return (
    <View ref={ref} accessibilityLabel={label} style={styles.slot}>
      <SlotHighlight index={number - 1} hover={hover} reduceMotion={reduceMotion}>
        {children ?? (
          <View style={styles.empty}>
            <AppText variant="label" color="textMuted">
              {number}
            </AppText>
          </View>
        )}
      </SlotHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { minWidth: minTapTarget + spacing.sm },
  empty: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: borders.thick,
    borderStyle: 'dashed',
    borderColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
