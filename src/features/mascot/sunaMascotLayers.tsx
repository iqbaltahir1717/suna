import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Layered Suna mascot ("tofu cube"), drawn as vector art so every part can
 * move on its own. An interim, in-house redraw of the Figma mascot (node
 * 2003:386) until the designer's layered export exists; replace this file
 * (or point `SUNA_MASCOT` at new layers) without touching the controller.
 *
 * Every layer shares one 200×200 artboard, so layers stack at (0,0) and
 * scale together. Pivots below are in artboard units.
 */
export const ARTBOARD = 200;

export const PIVOTS = {
  /** Shoulders, where arms rotate. */
  armLeft: { x: 40, y: 112 },
  armRight: { x: 160, y: 112 },
  /** Centre of the face, used for blinking and looking around. */
  face: { x: 94, y: 104 },
  /** Between the feet: sway and squash pivot. */
  feet: { x: 94, y: 182 },
} as const;

/** Artwork palette (not UI tokens: this is the character's own colouring). */
const ink = '#23493A';
const front = '#BDCDAE';
const side = '#9DB393';
const top = '#FBF8EE';
const cream = '#F7F2E2';
const blush = '#EBA07E';
const eye = '#1E3B2F';
const tongue = '#E98B7A';

function Layer({ children }: { children: React.ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${ARTBOARD} ${ARTBOARD}`}>
      {children}
    </Svg>
  );
}

const ARM_LEFT = 'M40 112 C24 118 16 132 14 146';
const ARM_RIGHT = 'M160 112 C176 118 184 132 186 146';

function Arm({ d }: { d: string }) {
  return (
    <Layer>
      <Path d={d} stroke={ink} strokeWidth={16} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={cream} strokeWidth={8.5} strokeLinecap="round" fill="none" />
    </Layer>
  );
}

export const SunaLayers = {
  Shadow: () => (
    <Layer>
      <Ellipse cx={96} cy={186} rx={58} ry={7} fill={ink} opacity={0.12} />
    </Layer>
  ),
  Legs: () => (
    <Layer>
      <G stroke={ink} strokeWidth={4} fill={cream}>
        <Rect x={64} y={150} width={16} height={32} rx={8} />
        <Rect x={108} y={150} width={16} height={32} rx={8} />
      </G>
    </Layer>
  ),
  ArmLeft: () => <Arm d={ARM_LEFT} />,
  ArmRight: () => <Arm d={ARM_RIGHT} />,
  Body: () => (
    <Layer>
      <G stroke={ink} strokeWidth={4.5} strokeLinejoin="round">
        <Path d="M146 54 L160 39 Q166 35 166 43 L166 146 Q166 152 160 156 L146 164 Z" fill={side} />
        <Path d="M48 54 L62 40 Q66 36 72 36 L158 36 Q166 36 162 40 L148 54 Z" fill={top} />
        <Rect x={34} y={52} width={120} height={112} rx={18} fill={front} />
      </G>
    </Layer>
  ),
  Cheeks: () => (
    <Layer>
      <G stroke={blush} strokeWidth={2.5} strokeLinecap="round">
        <Path d="M56 122 l4 -6 M62 122 l4 -6 M68 122 l4 -6" />
        <Path d="M118 122 l4 -6 M124 122 l4 -6 M130 122 l4 -6" />
      </G>
    </Layer>
  ),
  EyesOpen: () => (
    <Layer>
      <G fill={eye}>
        <Ellipse cx={66} cy={100} rx={7.5} ry={8.5} />
        <Ellipse cx={122} cy={100} rx={7.5} ry={8.5} />
      </G>
      <Circle cx={68.5} cy={97} r={2.4} fill="#FFFFFF" />
      <Circle cx={124.5} cy={97} r={2.4} fill="#FFFFFF" />
    </Layer>
  ),
  /** Upward arcs: laughing / delighted. */
  EyesHappy: () => (
    <Layer>
      <G stroke={eye} strokeWidth={4} strokeLinecap="round" fill="none">
        <Path d="M58 103 Q66 93 74 103" />
        <Path d="M114 103 Q122 93 130 103" />
      </G>
    </Layer>
  ),
  /** Downward arcs: calm, sleepy. */
  EyesClosed: () => (
    <Layer>
      <G stroke={eye} strokeWidth={4} strokeLinecap="round" fill="none">
        <Path d="M58 101 Q66 107 74 101" />
        <Path d="M114 101 Q122 107 130 101" />
      </G>
    </Layer>
  ),
  MouthNeutral: () => (
    <Layer>
      <Path d="M88 118 L100 118" stroke={eye} strokeWidth={4} strokeLinecap="round" />
    </Layer>
  ),
  MouthSmile: () => (
    <Layer>
      <Path d="M84 114 Q94 126 104 114" stroke={eye} strokeWidth={4} strokeLinecap="round" fill="none" />
    </Layer>
  ),
  MouthOpen: () => (
    <Layer>
      <Path
        d="M84 113 Q94 113 104 113 Q104 128 94 128 Q84 128 84 113 Z"
        fill={eye}
        stroke={eye}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M89 123 Q94 120 99 123 Q97 126 94 126 Q91 126 89 123Z" fill={tongue} />
    </Layer>
  ),
};
