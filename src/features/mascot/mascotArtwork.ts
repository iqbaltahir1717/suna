import type { ImageSourcePropType } from 'react-native';

/**
 * Mascot artwork description. Swapping art means changing this file only;
 * the controller and MascotView adapt to what the artwork supports.
 *
 * Today only a flattened image exists in Figma (node 2003:386, 91×85), so
 * only whole-image motion is possible. A future `layered` variant (body,
 * eyes, mouths, arms with anchors) is described in DESIGN_HANDOFF.md.
 */
export interface FlattenedMascotArtwork {
  kind: 'flattened';
  source: ImageSourcePropType;
  /** Intrinsic size in Figma points; used to preserve aspect ratio. */
  width: number;
  height: number;
}

export type MascotArtwork = FlattenedMascotArtwork;

export const SUNA_MASCOT: MascotArtwork = {
  kind: 'flattened',
  source: require('../../../assets/mascot/suna-mascot.png'),
  width: 91,
  height: 85,
};

/** Planned states (see DESIGN_HANDOFF.md). Not all are implemented. */
export type MascotState =
  | 'idle'
  | 'blink'
  | 'smile'
  | 'wave'
  | 'lookLeft'
  | 'lookRight'
  | 'sniff'
  | 'sleepy'
  | 'sleeping'
  | 'happy'
  | 'encourage';

/** Reactions that work with the current flattened artwork. */
/** Implemented reactions. `happy` and `encourage` are whole-image motion only. */
export type MascotReaction = 'greet' | 'tap' | 'encourage' | 'happy';

export const IMPLEMENTED_STATES: readonly MascotState[] = ['idle'];
