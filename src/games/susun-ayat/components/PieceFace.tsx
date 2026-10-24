import { StyleSheet, View } from 'react-native';

import { borders, colors, minTapTarget, radius, spacing } from '@/theme';

import { QuranText } from './QuranText';

export type PieceVariant = 'ayah' | 'word';
export type PieceTone = 'default' | 'locked' | 'flagged' | 'lifted' | 'success';

/** The look of a puzzle piece, without any interaction. */
export function PieceFace({
  text,
  variant,
  tone = 'default',
  pressed = false,
}: {
  text: string;
  variant: PieceVariant;
  tone?: PieceTone;
  pressed?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        variant === 'word' && styles.word,
        toneStyles[tone],
        pressed && styles.pressed,
      ]}
    >
      <QuranText size={variant === 'word' ? 'word' : 'card'}>{text}</QuranText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: borders.thick,
    borderColor: colors.border,
    // A thicker bottom edge makes cards read as physical, pickable tiles.
    borderBottomWidth: borders.thick * 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  word: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minWidth: minTapTarget },
  pressed: { backgroundColor: colors.surface },
});

const toneStyles = StyleSheet.create({
  default: {},
  locked: { borderColor: colors.success, backgroundColor: colors.successSoft },
  flagged: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  lifted: { borderColor: colors.primary, backgroundColor: colors.background },
  success: { borderColor: colors.success, backgroundColor: colors.successSoft },
});
