import { useEffect, useRef, type ComponentRef } from 'react';
import { Pressable, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { motion } from '@/theme';

import type { DragController } from './drag';
import { resolveDropSlot } from './dropTargets';
import { PieceFace, type PieceTone, type PieceVariant } from './PieceFace';

export type { PieceTone } from './PieceFace';

export interface CardFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PieceCardProps {
  text: string;
  /** A whole ayah (full-width card) or a single word (compact chip). */
  variant?: PieceVariant;
  tone?: PieceTone;
  disabled?: boolean;
  /** Hidden while its floating copy is being dragged. */
  hidden?: boolean;
  reduceMotion?: boolean;
  /** Changes to this number shake the card (a gentle "not yet"). */
  shakeKey?: number;
  /** When set, the card bounces once after this delay (ms) to celebrate. */
  celebrateDelay?: number | null;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  drag?: DragController;
  /** Called on the JS thread once the drag starts, with the card's window frame. */
  onDragStart?: (frame: CardFrame) => void;
  /** Called on release; the finger's last position is `drag.px/py`. */
  onDragEnd?: (canceled: boolean) => void;
}

/**
 * One puzzle piece. Dragging is the main interaction and starts as soon as
 * the finger moves; a floating copy (DragGhost) follows the finger above all
 * scroll views while the slot under it lights up. Tap-to-place stays as the
 * accessible alternative. Per-frame motion runs on the UI thread.
 */
export function PieceCard({
  text,
  variant = 'ayah',
  tone = 'default',
  disabled = false,
  hidden = false,
  reduceMotion = false,
  shakeKey = 0,
  celebrateDelay = null,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  drag,
  onDragStart,
  onDragEnd,
}: PieceCardProps) {
  const viewRef = useRef<ComponentRef<typeof View>>(null);
  // A release after a drag must not also count as a tap.
  const dragging = useRef(false);
  const lastDragEndAt = useRef(0);
  const shakeX = useSharedValue(0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    if (shakeKey === 0 || reduceMotion) return;
    shakeX.set(
      withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 70 }),
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [shakeKey, reduceMotion, shakeX]);

  useEffect(() => {
    if (celebrateDelay === null || reduceMotion) return;
    bounce.set(
      withDelay(
        celebrateDelay,
        withSequence(withTiming(1.15, { duration: 140 }), withSpring(1, motion.snapSpring)),
      ),
    );
  }, [celebrateDelay, reduceMotion, bounce]);

  const handleActivate = () => {
    dragging.current = true;
    viewRef.current?.measureInWindow((x, y, width, height) => {
      onDragStart?.({ x, y, width, height });
    });
  };

  const handleRelease = (canceled: boolean) => {
    dragging.current = false;
    lastDragEndAt.current = Date.now();
    onDragEnd?.(canceled);
  };

  const handlePress = () => {
    if (dragging.current || Date.now() - lastDragEndAt.current < 300) return;
    onPress();
  };

  // Translation is measured from the finger's position at activation, so
  // the floating copy and the drop point both follow absolute coordinates.
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);

  const pan = usePanGesture({
    enabled: !disabled && !!drag,
    minDistance: motion.dragMinDistance,
    onActivate: (event) => {
      'worklet';
      if (!drag) return;
      grabX.set(event.absoluteX);
      grabY.set(event.absoluteY);
      drag.px.set(event.absoluteX);
      drag.py.set(event.absoluteY);
      drag.tx.set(0);
      drag.ty.set(0);
      scheduleOnRN(handleActivate);
    },
    onUpdate: (event) => {
      'worklet';
      if (!drag) return;
      drag.px.set(event.absoluteX);
      drag.py.set(event.absoluteY);
      drag.tx.set(event.absoluteX - grabX.get());
      drag.ty.set(event.absoluteY - grabY.get());
      drag.hover.set(
        resolveDropSlot(drag.slots.get(), drag.area.get(), event.absoluteX, event.absoluteY),
      );
    },
    onDeactivate: (event) => {
      'worklet';
      scheduleOnRN(handleRelease, event.canceled);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.get() }, { scale: bounce.get() }],
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : ZoomIn.springify().damping(14)}
      layout={reduceMotion ? undefined : LinearTransition.springify().damping(18)}
    >
      <GestureDetector gesture={pan}>
        <Animated.View ref={viewRef} style={[animatedStyle, hidden && { opacity: 0.25 }]}>
          <Pressable
            onPress={handlePress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled }}
          >
            {({ pressed }) => (
              <PieceFace text={text} variant={variant} tone={tone} pressed={pressed} />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
