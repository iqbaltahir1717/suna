import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { borders, colors, minTapTarget, motion, radius, spacing } from '@/theme';

import { QuranText } from './QuranText';

export interface DropPoint {
  x: number;
  y: number;
}

export type PieceCardTone = 'default' | 'locked' | 'flagged';

interface PieceCardProps {
  text: string;
  /** A whole ayah (full-width card) or a single word (compact chip). */
  variant?: 'ayah' | 'word';
  tone?: PieceCardTone;
  disabled?: boolean;
  reduceMotion?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  onDragStart?: () => void;
  /** Called with the card's centre in window coordinates where it was released. */
  onDrop?: (point: DropPoint) => void;
}

/**
 * One puzzle piece: an ayah card or a word chip. Tap is the primary, accessible interaction; press-and-hold
 * then drag is the alternative. Drag motion runs on the UI thread through
 * shared values, and only the start and drop touch React.
 */
export function PieceCard({
  text,
  variant = 'ayah',
  tone = 'default',
  disabled = false,
  reduceMotion = false,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  onDragStart,
  onDrop,
}: PieceCardProps) {
  const viewRef = useRef<ComponentRef<typeof View>>(null);
  const startCenter = useRef<DropPoint | null>(null);
  // A release after a drag must not also count as a tap.
  const dragging = useRef(false);
  const lastDragEndAt = useRef(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lifted = useSharedValue(0);

  const handleActivate = () => {
    dragging.current = true;
    startCenter.current = null;
    viewRef.current?.measureInWindow((x, y, width, height) => {
      startCenter.current = { x: x + width / 2, y: y + height / 2 };
    });
    onDragStart?.();
  };

  const handleRelease = (dx: number, dy: number, canceled: boolean) => {
    dragging.current = false;
    lastDragEndAt.current = Date.now();
    const start = startCenter.current;
    if (start && !canceled) onDrop?.({ x: start.x + dx, y: start.y + dy });
  };

  const handlePress = () => {
    if (dragging.current || Date.now() - lastDragEndAt.current < 300) return;
    onPress();
  };

  const pan = usePanGesture({
    enabled: !disabled && !!onDrop,
    activateAfterLongPress: motion.dragActivationMs,
    onActivate: () => {
      'worklet';
      lifted.set(1);
      scheduleOnRN(handleActivate);
    },
    onUpdate: (event) => {
      'worklet';
      tx.set(event.translationX);
      ty.set(event.translationY);
    },
    onDeactivate: (event) => {
      'worklet';
      scheduleOnRN(handleRelease, event.translationX, event.translationY, event.canceled);
    },
    onFinalize: () => {
      'worklet';
      lifted.set(0);
      if (reduceMotion) {
        tx.set(0);
        ty.set(0);
      } else {
        tx.set(withSpring(0));
        ty.set(withSpring(0));
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: lifted.get() ? 10 : 0,
    transform: [
      { translateX: tx.get() },
      { translateY: ty.get() },
      { scale: lifted.get() ? motion.dragLiftScale : 1 },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View ref={viewRef} style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          style={({ pressed }) => [
            styles.card,
            variant === 'word' && styles.word,
            toneStyles[tone],
            pressed && styles.pressed,
          ]}
        >
          <QuranText size={variant === 'word' ? 'word' : 'card'}>{text}</QuranText>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: borders.thick,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  word: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minWidth: minTapTarget },
  pressed: { opacity: motion.pressFeedbackOpacity },
});

const toneStyles = StyleSheet.create({
  default: {},
  locked: { borderColor: colors.success, backgroundColor: colors.successSoft },
  flagged: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
});
