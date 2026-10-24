import { useEffect, useImperativeHandle, useState, type Ref } from 'react';
import { AppState, Image, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius } from '@/theme';

import { SUNA_MASCOT, type MascotArtwork, type MascotReaction } from './mascotArtwork';
import { useMascotController } from './useMascotController';

export interface MascotHandle {
  react(reaction: MascotReaction): void;
}

export interface MascotViewProps {
  /** Viewport width in points; height follows the artwork's aspect ratio. */
  size: number;
  /** Pause when the host screen is not visible. */
  paused?: boolean;
  /** Show the static fallback (OS or app reduced-motion preference). */
  reduceMotion?: boolean;
  artwork?: MascotArtwork;
  accessibilityLabel?: string;
  ref?: Ref<MascotHandle>;
}

/**
 * Replaceable mascot viewport. Independent of navigation and game logic:
 * hosts tell it when it is paused and may trigger reactions via `ref`.
 */
export function MascotView({
  size,
  paused = false,
  reduceMotion = false,
  artwork = SUNA_MASCOT,
  accessibilityLabel,
  ref,
}: MascotViewProps) {
  const appActive = useAppIsActive();
  const animate = !paused && !reduceMotion && appActive;
  const { animatedStyle, react } = useMascotController(animate);

  useImperativeHandle(ref, () => ({ react }), [react]);

  const height = (size * artwork.height) / artwork.width;

  return (
    <Pressable
      onPress={() => react('tap')}
      accessibilityRole="imagebutton"
      accessibilityLabel={accessibilityLabel}
      style={[styles.viewport, { width: size, height }]}
    >
      <Animated.View style={[styles.fill, styles.origin, animatedStyle]}>
        <Image source={artwork.source} style={styles.fill} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

function useAppIsActive() {
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);
  return active;
}

const styles = StyleSheet.create({
  // The current artwork draws its own rounded frame, so the viewport adds no
  // background. It is not clipped, so hop/sway never crop the artwork.
  viewport: { borderRadius: radius.lg },
  fill: { width: '100%', height: '100%' },
  // Sway pivots around the mascot's feet, not its centre.
  origin: { transformOrigin: '50% 100%' },
});
