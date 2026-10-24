import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { motion } from '@/theme';

import type { AreaRect, SlotRect } from './dropTargets';
import { PieceFace, type PieceVariant } from './PieceFace';

/**
 * Shared drag state for one puzzle screen. Only one card drags at a time, so
 * a single set of shared values is enough. Per-frame motion and the slot
 * highlight run on the UI thread; React only renders at drag start and end.
 */
export interface DragController {
  /** Finger travel since the drag activated; moves the floating copy. */
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  /** Finger position in window coordinates. Drops land where the finger is. */
  px: SharedValue<number>;
  py: SharedValue<number>;
  slots: SharedValue<SlotRect[]>;
  area: SharedValue<AreaRect | null>;
  /** Slot under the dragged card, or -1. */
  hover: SharedValue<number>;
}

export function useDragController(): DragController {
  return {
    tx: useSharedValue(0),
    ty: useSharedValue(0),
    px: useSharedValue(NaN),
    py: useSharedValue(NaN),
    slots: useSharedValue<SlotRect[]>([]),
    area: useSharedValue<AreaRect | null>(null),
    hover: useSharedValue(-1),
  };
}

export interface GhostInfo {
  pieceId: string;
  text: string;
  variant: PieceVariant;
  /** Card frame at drag start, relative to the ghost layer. */
  left: number;
  top: number;
  width: number;
}

/**
 * The floating copy of the dragged card. It lives above every scroll view,
 * so a card can travel from the bank to the answer area without clipping.
 */
export function DragGhost({
  ghost,
  drag,
  reduceMotion,
}: {
  ghost: GhostInfo | null;
  drag: DragController;
  reduceMotion: boolean;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drag.tx.get() },
      { translateY: drag.ty.get() },
      { scale: reduceMotion ? 1 : motion.dragLiftScale },
      { rotate: reduceMotion ? '0deg' : `${motion.dragTiltDeg}deg` },
    ],
  }));
  if (!ghost) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ghost, { left: ghost.left, top: ghost.top, width: ghost.width }, style]}
    >
      <PieceFace text={ghost.text} variant={ghost.variant} tone="lifted" />
    </Animated.View>
  );
}

/**
 * Ghost state plus the "fly back" when a card is dropped nowhere: the ghost
 * springs back to where it came from, then disappears.
 */
export function useGhost(drag: DragController, reduceMotion: boolean) {
  const [ghost, setGhost] = useState<GhostInfo | null>(null);

  const hide = () => {
    setGhost(null);
    drag.tx.set(0);
    drag.ty.set(0);
  };

  const release = (landed: boolean) => {
    drag.hover.set(-1);
    if (landed || reduceMotion) {
      hide();
      return;
    }
    drag.tx.set(withSpring(0, motion.snapSpring));
    drag.ty.set(
      withSpring(0, motion.snapSpring, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(hide);
      }),
    );
  };

  return { ghost, show: setGhost, release };
}

const styles = StyleSheet.create({
  ghost: { position: 'absolute', zIndex: 100 },
});
