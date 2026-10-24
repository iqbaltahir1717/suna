import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated';

import { colors, radius } from '@/theme';

/** Lights up and grows slightly while a dragged card hovers over this slot. */
export function SlotHighlight({
  index,
  hover,
  reduceMotion = false,
  children,
}: {
  index: number;
  hover?: SharedValue<number>;
  reduceMotion?: boolean;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const active = hover?.get() === index;
    const scale = active && !reduceMotion ? 1.02 : 1;
    return {
      backgroundColor: active ? colors.primarySoft : 'transparent',
      transform: [{ scale: reduceMotion ? scale : withTiming(scale, { duration: 120 }) }],
    };
  });
  return <Animated.View style={[styles.base, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md },
});
