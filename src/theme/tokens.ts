/**
 * Low-fidelity design tokens.
 *
 * These are deliberately plain placeholders derived from the Figma wireframe
 * (grey blocks, neutral text, rounded cards). Final branding will replace the
 * values here; components must read from tokens instead of hardcoding styles.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceMuted: '#EBEBEB',
  placeholder: '#D9D9D9',
  border: '#E0E0E0',
  text: '#111111',
  textMuted: '#555555',
  textInverse: '#FFFFFF',
  // Provisional accent sampled from the mascot artwork's green outline.
  primary: '#2F5E45',
  primarySoft: '#DDE8DF',
  locked: '#6B6B6B',
  dev: '#8A5A00',
  devSoft: '#FFF1D6',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  success: '#2F5E45',
  successSoft: '#DDE8DF',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const borders = {
  hairline: 1,
  thick: 2,
} as const;

export const typography = {
  display: { fontSize: 24, lineHeight: 30, fontWeight: '600' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  caption: { fontSize: 14, lineHeight: 19, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

export type TypographyVariant = keyof typeof typography;

/**
 * Quran text only. Amiri Quran (SIL OFL 1.1) is bundled so harakat and
 * Uthmani marks render the same on iOS and Android. The tall line height
 * leaves room for stacked marks above and below the letters.
 */
export const quranTypography = {
  fontFamily: 'AmiriQuran_400Regular',
  card: { fontSize: 24, lineHeight: 48 },
  word: { fontSize: 24, lineHeight: 44 },
  passage: { fontSize: 26, lineHeight: 54 },
} as const;

export const motion = {
  /** Duration of one half of the idle breathing cycle. */
  idleBreathMs: 1600,
  idleVariationMinMs: 7000,
  idleVariationMaxMs: 14000,
  reactionMs: 520,
  pressFeedbackOpacity: 0.7,
  /** Hold before a card starts dragging, so quick swipes still scroll. */
  dragActivationMs: 180,
  dragLiftScale: 1.03,
} as const;

/** Minimum tap target size (Apple HIG 44pt, Material 48dp). */
export const minTapTarget = 48;
