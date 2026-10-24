import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
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

/** Eye layer shown: open (default), happy arcs, or closed arcs. */
export const EYES = { open: 0, happy: 1, closed: 2 } as const;
/** Mouth layer shown: smile (default), neutral, or open. */
export const MOUTH = { smile: 0, neutral: 1, open: 2 } as const;

const ease = Easing.inOut(Easing.sin);

function between(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Switch a discrete layer for `holdMs`, then back to its default. */
function hold(value: SharedValue<number>, layer: number, holdMs: number, rest = 0) {
  value.set(
    withSequence(withTiming(layer, { duration: 0 }), withDelay(holdMs, withTiming(rest, { duration: 0 }))),
  );
}

/**
 * Lightweight animation controller for the mascot.
 *
 * All per-frame work runs on the UI thread through Reanimated shared values;
 * React never re-renders during animation. JS only schedules occasional idle
 * variations (blink, look around, sway) and tracks which reaction owns the
 * mascot. Layer swaps (eyes, mouth) are shared values too, so expressions
 * change without a render.
 *
 * `animate` false (unfocused, backgrounded, reduced motion) cancels every
 * animation and timer and leaves the mascot at rest, smiling.
 */
export function useMascotController(animate: boolean) {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const hop = useSharedValue(0);
  const scale = useSharedValue(1);
  const blink = useSharedValue(0);
  const look = useSharedValue(0);
  const armLeft = useSharedValue(0);
  const armRight = useSharedValue(0);
  const eyes = useSharedValue<number>(EYES.open);
  const mouth = useSharedValue<number>(MOUTH.smile);

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

  // Idle loop while animating; full stop otherwise.
  useEffect(() => {
    const values = [breath, sway, hop, scale, blink, look, armLeft, armRight, eyes, mouth];
    if (!animate) {
      clearReaction();
      for (const value of values) cancelAnimation(value);
      breath.set(0);
      sway.set(0);
      hop.set(0);
      scale.set(1);
      blink.set(0);
      look.set(0);
      armLeft.set(0);
      armRight.set(0);
      eyes.set(EYES.open);
      mouth.set(MOUTH.smile);
      return;
    }

    breath.set(
      withRepeat(withTiming(1, { duration: motion.idleBreathMs, easing: ease }), -1, true),
    );

    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        const close = { duration: motion.mascotBlinkMs / 2 };
        // Occasionally a double blink, like a real one.
        const twice = Math.random() < 0.2;
        blink.set(
          twice
            ? withSequence(
                withTiming(1, close),
                withTiming(0, close),
                withTiming(1, close),
                withTiming(0, close),
              )
            : withSequence(withTiming(1, close), withTiming(0, close)),
        );
        scheduleBlink();
      }, between(motion.mascotBlinkMinMs, motion.mascotBlinkMaxMs));
    };
    scheduleBlink();

    let variationTimer: ReturnType<typeof setTimeout>;
    const scheduleVariation = () => {
      variationTimer = setTimeout(() => {
        if (!activeReaction.current) {
          const roll = Math.random();
          if (roll < 0.6) {
            // Glance to one side, linger, come back.
            const side = Math.random() < 0.5 ? -1 : 1;
            look.set(
              withSequence(
                withTiming(side, { duration: 260, easing: ease }),
                withDelay(900, withTiming(0, { duration: 300, easing: ease })),
              ),
            );
          } else {
            sway.set(
              withSequence(
                withTiming(-3, { duration: 400, easing: ease }),
                withTiming(3, { duration: 600, easing: ease }),
                withTiming(0, { duration: 400, easing: ease }),
              ),
            );
          }
        }
        scheduleVariation();
      }, between(motion.idleVariationMinMs, motion.idleVariationMaxMs));
    };
    scheduleVariation();

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(variationTimer);
      cancelAnimation(breath);
    };
  }, [animate, breath, sway, hop, scale, blink, look, armLeft, armRight, eyes, mouth, clearReaction]);

  useEffect(() => clearReaction, [clearReaction]);

  const react = useCallback(
    (reaction: MascotReaction) => {
      if (!animateRef.current) return; // Static fallback: no motion.
      const priority = REACTION_PRIORITY[reaction];
      if (activeReaction.current && activeReaction.current.priority >= priority) return;
      clearReaction();

      // Reactions take over from ambient motion, then settle back to rest;
      // the breathing loop and blinking keep running underneath.
      cancelAnimation(sway);
      cancelAnimation(look);
      look.set(withTiming(0, { duration: 150 }));
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
        hold(eyes, EYES.happy, 600, EYES.open);
        hold(mouth, MOUTH.open, 600, MOUTH.smile);
        duration = motion.reactionMs;
      } else if (reaction === 'encourage') {
        // A slow, kind nod with a little raised arm: "you can do it".
        hop.set(
          withSequence(
            withTiming(4, { duration: 220, easing: ease }),
            withTiming(0, { duration: 260, easing: ease }),
            withTiming(3, { duration: 200, easing: ease }),
            withTiming(0, { duration: 240, easing: ease }),
          ),
        );
        armRight.set(
          withSequence(
            withTiming(-70, { duration: 260, easing: ease }),
            withDelay(500, withTiming(0, { duration: 300, easing: ease })),
          ),
        );
        sway.set(withTiming(0, { duration: 200 }));
        duration = 1060;
      } else if (reaction === 'happy') {
        // Two bouncy jumps, arms up, laughing face.
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
        for (const [arm, sign] of [
          [armLeft, 1],
          [armRight, -1],
        ] as const) {
          arm.set(
            withSequence(
              withTiming(sign * 110, { duration: 200, easing: ease }),
              withDelay(500, withTiming(0, { duration: 260, easing: ease })),
            ),
          );
        }
        hold(eyes, EYES.happy, 1000, EYES.open);
        hold(mouth, MOUTH.open, 1000, MOUTH.smile);
        duration = 1000;
      } else {
        // Greet: a small hop and a wave.
        hop.set(
          withSequence(
            withTiming(-10, { duration: 180, easing: ease }),
            withTiming(0, { duration: 220, easing: ease }),
          ),
        );
        armRight.set(
          withSequence(
            withTiming(-120, { duration: 220, easing: ease }),
            withTiming(-90, { duration: 160, easing: ease }),
            withTiming(-120, { duration: 160, easing: ease }),
            withTiming(-90, { duration: 160, easing: ease }),
            withTiming(-120, { duration: 160, easing: ease }),
            withTiming(0, { duration: 260, easing: ease }),
          ),
        );
        hold(mouth, MOUTH.open, 900, MOUTH.smile);
        duration = 1120;
      }

      activeReaction.current = {
        priority,
        timer: setTimeout(() => {
          activeReaction.current = null;
        }, duration),
      };
    },
    [clearReaction, hop, scale, sway, look, armLeft, armRight, eyes, mouth],
  );

  /** Whole character: hop, sway, squash, breathing. */
  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hop.get() - breath.get() * 2 },
      { rotate: `${sway.get()}deg` },
      { scale: scale.get() * (1 + breath.get() * 0.015) },
    ],
  }));
  /** The ground shadow shrinks while the mascot is in the air. */
  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + Math.min(0, hop.get()) / 60 }],
    opacity: 1 + Math.min(0, hop.get()) / 40,
  }));
  const armLeftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${armLeft.get()}deg` }],
  }));
  const armRightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${armRight.get()}deg` }],
  }));
  /** Face features follow the gaze a little. */
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: look.get() * 5 }],
  }));
  const eyesOpenStyle = useAnimatedStyle(() => ({
    opacity: eyes.get() === EYES.open ? 1 : 0,
    transform: [{ translateX: look.get() * 2 }, { scaleY: 1 - blink.get() * 0.9 }],
  }));
  const eyesHappyStyle = useAnimatedStyle(() => ({ opacity: eyes.get() === EYES.happy ? 1 : 0 }));
  const eyesClosedStyle = useAnimatedStyle(() => ({ opacity: eyes.get() === EYES.closed ? 1 : 0 }));
  const mouthSmileStyle = useAnimatedStyle(() => ({ opacity: mouth.get() === MOUTH.smile ? 1 : 0 }));
  const mouthNeutralStyle = useAnimatedStyle(() => ({
    opacity: mouth.get() === MOUTH.neutral ? 1 : 0,
  }));
  const mouthOpenStyle = useAnimatedStyle(() => ({ opacity: mouth.get() === MOUTH.open ? 1 : 0 }));

  return {
    react,
    styles: {
      character: characterStyle,
      shadow: shadowStyle,
      armLeft: armLeftStyle,
      armRight: armRightStyle,
      face: faceStyle,
      eyesOpen: eyesOpenStyle,
      eyesHappy: eyesHappyStyle,
      eyesClosed: eyesClosedStyle,
      mouthSmile: mouthSmileStyle,
      mouthNeutral: mouthNeutralStyle,
      mouthOpen: mouthOpenStyle,
    },
  };
}
