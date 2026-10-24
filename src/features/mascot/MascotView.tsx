import { useEffect, useImperativeHandle, useState, type ComponentType, type Ref } from 'react';
import { AppState, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

import { radius } from '@/theme';

import { SUNA_MASCOT, type MascotArtwork, type MascotReaction } from './mascotArtwork';
import { ARTBOARD, PIVOTS, SunaLayers } from './sunaMascotLayers';
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
  const { styles: motionStyles, react } = useMascotController(animate);

  useImperativeHandle(ref, () => ({ react }), [react]);

  const height = (size * artwork.height) / artwork.width;

  return (
    <Pressable
      onPress={() => react('tap')}
      accessibilityRole="imagebutton"
      accessibilityLabel={accessibilityLabel}
      style={[styles.viewport, { width: size, height }]}
    >
      {artwork.kind === 'flattened' ? (
        <Animated.View style={[styles.fill, styles.feetOrigin, motionStyles.character]}>
          <Image source={artwork.source} style={styles.fill} resizeMode="contain" />
        </Animated.View>
      ) : (
        <View style={styles.fill} pointerEvents="none">
          <Part Layer={SunaLayers.Shadow} style={motionStyles.shadow} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.feetOrigin, motionStyles.character]}>
            <Part Layer={SunaLayers.Legs} />
            <Part Layer={SunaLayers.ArmLeft} style={[styles.armLeftOrigin, motionStyles.armLeft]} />
            <Part Layer={SunaLayers.ArmRight} style={[styles.armRightOrigin, motionStyles.armRight]} />
            <Part Layer={SunaLayers.Body} />
            <Animated.View style={[StyleSheet.absoluteFill, motionStyles.face]}>
              <Part Layer={SunaLayers.Cheeks} />
              <Part Layer={SunaLayers.EyesOpen} style={[styles.eyeOrigin, motionStyles.eyesOpen]} />
              <Part Layer={SunaLayers.EyesHappy} style={motionStyles.eyesHappy} />
              <Part Layer={SunaLayers.EyesClosed} style={motionStyles.eyesClosed} />
              <Part Layer={SunaLayers.MouthSmile} style={motionStyles.mouthSmile} />
              <Part Layer={SunaLayers.MouthNeutral} style={motionStyles.mouthNeutral} />
              <Part Layer={SunaLayers.MouthOpen} style={motionStyles.mouthOpen} />
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

type PartStyle = AnimatedStyle<ViewStyle> | ViewStyle | (AnimatedStyle<ViewStyle> | ViewStyle)[];

/** One artboard-sized layer; all layers stack at (0,0). */
function Part({ Layer, style }: { Layer: ComponentType; style?: PartStyle }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Layer />
    </Animated.View>
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

const pct = (value: number) => `${(value / ARTBOARD) * 100}%`;
const origin = ({ x, y }: { x: number; y: number }) => `${pct(x)} ${pct(y)}`;

const styles = StyleSheet.create({
  // The viewport is not clipped, so hops, waves, and sway never crop the art.
  viewport: { borderRadius: radius.lg },
  fill: { width: '100%', height: '100%' },
  feetOrigin: { transformOrigin: origin(PIVOTS.feet) },
  armLeftOrigin: { transformOrigin: origin(PIVOTS.armLeft) },
  armRightOrigin: { transformOrigin: origin(PIVOTS.armRight) },
  eyeOrigin: { transformOrigin: origin({ x: PIVOTS.face.x, y: 100 }) },
});
