import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

import type { MascotReaction } from './mascotArtwork';

/** Higher wins. Ambient idle variations are 0 and never interrupt a reaction. */
const REACTION_PRIORITY: Record<MascotReaction, number> = {
  tap: 1,
  encourage: 2,
  greet: 2,
  happy: 3,
};

const ease = Easing.inOut(Easing.sin);

/**
 * Lightweight animation controller for whole-image mascot motion.
 *
 * All per-frame work runs on the UI thread through Reanimated shared values;
 * React never re-renders during animation. JS only schedules occasional idle
 * variations and tracks which reaction owns the mascot.
 *
 * `animate` false (unfocused, backgrounded, reduced motion) cancels every
 * animation and timer and leaves the mascot at rest.
 */
export function useMascotController(animate: boolean) {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const hop = useSharedValue(0);
  const scale = useSharedValue(1);

  const activeReaction = useRef<{ priority: number; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );
  const animateRef = useRef(animate);
  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const clearReaction = useCallback(() => {
    if (activeReaction.current) clearTimeout(activeReaction.current.timer);
    activeReaction.current = null;
  }, []);

  // Idle breathing + occasional sway while animating; full stop otherwise.
  useEffect(() => {
    if (!animate) {
      clearReaction();
      for (const value of [breath, sway, hop, scale]) cancelAnimation(value);
      breath.set(0);
      sway.set(0);
      hop.set(0);
      scale.set(1);
      return;
    }

    breath.set(
      withRepeat(withTiming(1, { duration: motion.idleBreathMs, easing: ease }), -1, true),
    );

    let variationTimer: ReturnType<typeof setTimeout>;
    const scheduleVariation = () => {
      const delay =
        motion.idleVariationMinMs +
        Math.random() * (motion.idleVariationMaxMs - motion.idleVariationMinMs);
      variationTimer = setTimeout(() => {
        if (!activeReaction.current) {
          sway.set(
            withSequence(
              withTiming(-3, { duration: 400, easing: ease }),
              withTiming(3, { duration: 600, easing: ease }),
              withTiming(0, { duration: 400, easing: ease }),
            ),
          );
        }
        scheduleVariation();
      }, delay);
    };
    scheduleVariation();

    return () => {
      clearTimeout(variationTimer);
      cancelAnimation(breath);
    };
  }, [animate, breath, sway, hop, scale, clearReaction]);

  useEffect(() => clearReaction, [clearReaction]);

  const react = useCallback(
    (reaction: MascotReaction) => {
      if (!animateRef.current) return; // Static fallback: no motion.
      const priority = REACTION_PRIORITY[reaction];
      if (activeReaction.current && activeReaction.current.priority >= priority) return;
      clearReaction();

      // Reactions take over from ambient sway, then settle back to rest; the
      // breathing loop keeps running underneath, so idle resumes seamlessly.
      cancelAnimation(sway);
      const half = motion.reactionMs / 2;
      let duration: number;
      if (reaction === 'tap') {
        scale.set(
          withSequence(
            withTiming(0.92, { duration: half * 0.4 }),
            withTiming(1.04, { duration: half * 0.6, easing: ease }),
            withTiming(1, { duration: half, easing: ease }),
          ),
        );
        sway.set(withTiming(0, { duration: half }));
        duration = motion.reactionMs;
      } else if (reaction === 'encourage') {
        // A slow, kind nod: "you can do it".
        hop.set(
          withSequence(
            withTiming(4, { duration: 220, easing: ease }),
            withTiming(0, { duration: 260, easing: ease }),
            withTiming(3, { duration: 200, easing: ease }),
            withTiming(0, { duration: 240, easing: ease }),
          ),
        );
        sway.set(withTiming(0, { duration: 200 }));
        duration = 920;
      } else if (reaction === 'happy') {
        // Two bouncy jumps with a squash on landing.
        hop.set(
          withSequence(
            withTiming(-18, { duration: 200, easing: ease }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
            withTiming(-12, { duration: 180, easing: ease }),
            withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) }),
          ),
        );
        scale.set(
          withSequence(
            withTiming(1.08, { duration: 200 }),
            withTiming(0.94, { duration: 200 }),
            withTiming(1.05, { duration: 180 }),
            withTiming(1, { duration: 220, easing: ease }),
          ),
        );
        sway.set(
          withSequence(
            withTiming(-8, { duration: 200, easing: ease }),
            withTiming(8, { duration: 380, easing: ease }),
            withTiming(0, { duration: 220, easing: ease }),
          ),
        );
        duration = 820;
      } else {
        hop.set(
          withSequence(
            withTiming(-10, { duration: 180, easing: ease }),
            withTiming(0, { duration: 220, easing: ease }),
            withTiming(-5, { duration: 150, easing: ease }),
            withTiming(0, { duration: 170, easing: ease }),
          ),
        );
        sway.set(
          withSequence(
            withTiming(-6, { duration: 180, easing: ease }),
            withTiming(6, { duration: 300, easing: ease }),
            withTiming(0, { duration: 240, easing: ease }),
          ),
        );
        duration = 720;
      }

      activeReaction.current = {
        priority,
        timer: setTimeout(() => {
          activeReaction.current = null;
        }, duration),
      };
    },
    [clearReaction, hop, scale, sway],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hop.get() - breath.get() * 2 },
      { rotate: `${sway.get()}deg` },
      { scale: scale.get() * (1 + breath.get() * 0.015) },
    ],
  }));

  return { animatedStyle, react };
}
