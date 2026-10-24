import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, quranTypography } from '@/theme';

/**
 * Renders Quran text verbatim. Right-to-left direction is local to this
 * component; the surrounding Indonesian/English UI stays left-to-right.
 */
export function QuranText({
  children,
  size = 'card',
  style,
  ...rest
}: TextProps & { children: string; size?: 'card' | 'word' | 'passage' }) {
  return (
    <Text {...rest} style={[styles.base, quranTypography[size], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: quranTypography.fontFamily,
    color: colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
