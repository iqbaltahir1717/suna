import type { ImageSourcePropType } from 'react-native';

/**
 * Mascot artwork description. Swapping art means changing this file only;
 * the controller and MascotView adapt to what the artwork supports.
 *
 * `layered` art (body, eyes, mouths, arms with pivots) supports facial and
 * arm animation; `flattened` art (a single image) only whole-image motion.
 */
export interface FlattenedMascotArtwork {
  kind: 'flattened';
  source: ImageSourcePropType;
  /** Intrinsic size in Figma points; used to preserve aspect ratio. */
  width: number;
  height: number;
}

export interface LayeredMascotArtwork {
  kind: 'layered';
  /** Artboard size shared by every layer (see sunaMascotLayers.tsx). */
  width: number;
  height: number;
}

export type MascotArtwork = FlattenedMascotArtwork | LayeredMascotArtwork;

/** In-house vector redraw of the Figma mascot (node 2003:386), layered. */
export const SUNA_MASCOT: MascotArtwork = { kind: 'layered', width: 200, height: 200 };

/** The original flattened Figma render, kept as a fallback artwork. */
export const SUNA_MASCOT_FLAT: MascotArtwork = {
  kind: 'flattened',
  source: require('../../../assets/mascot/suna-mascot.png'),
  width: 91,
  height: 85,
};

/**
 * Reactions hosts can trigger. With layered art each has its own face and
 * arm motion; with flattened art they fall back to whole-image motion.
 * Idle (breathing, blinking, looking left/right, sway) runs on its own.
 */
export type MascotReaction = 'greet' | 'tap' | 'encourage' | 'happy';
