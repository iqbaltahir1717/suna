import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { celebrationColors, radius } from '@/theme';

const PIECES = 22;

/**
 * A one-shot confetti burst for a solved puzzle. Flat shapes in placeholder
 * colours; plays once, never loops, and renders nothing with reduced motion.
 */
export function Celebration({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: PIECES }, (_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}

function Piece({ index }: { index: number }) {
  const progress = useSharedValue(0);
  // Deterministic spread so every burst looks balanced.
  const angle = (index / PIECES) * Math.PI * 2;
  const distance = 90 + (index % 4) * 30;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance * 0.6 - 60;
  const spin = (index % 2 ? 1 : -1) * (180 + (index % 5) * 60);
  const round = index % 3 === 0;

  useEffect(() => {
    progress.set(
      withDelay(
        (index % 6) * 25,
        withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }),
      ),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25,
      transform: [
        { translateX: dx * p },
        // Up and out first, then a gentle fall.
        { translateY: dy * p + 160 * p * p },
        { rotate: `${spin * p}deg` },
        { scale: 1 - 0.3 * p },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        round && styles.round,
        { backgroundColor: celebrationColors[index % celebrationColors.length] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: '50%', top: '35%', width: 10, height: 14, borderRadius: 2 },
  round: { width: 10, height: 10, borderRadius: radius.pill },
});
