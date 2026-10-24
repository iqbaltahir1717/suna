/**
 * Interim design tokens (Phase 5).
 *
 * Claude's own interim direction, approved by Iqbal on 2026-10-24 until the
 * final Figma design exists. Derived from the green "Susun Ayat" concept in
 * Figma (node 2003:328): deep green primary, soft sage, a warm peach accent,
 * and a warm off-white background. Replace the values here when final
 * variables land; components read tokens and never hardcode styles.
 *
 * Contrast (WCAG AA): text/textMuted on background and surface ≥ 4.5:1;
 * textInverse on primary ≥ 4.5:1; primary/accentStrong on their soft tints
 * ≥ 4.5:1 (checked in src/theme/__tests__/tokens.test.ts).
 */

export const colors = {
  background: '#F7F5EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFECE2',
  placeholder: '#DAD6C8',
  border: '#E5E1D5',
  text: '#1D2A23',
  textMuted: '#56625A',
  textInverse: '#FFFFFF',
  primary: '#2E5B44',
  primaryPressed: '#24493A',
  primarySoft: '#DDE8DA',
  sage: '#A9BFA2',
  /** Sage for large display text only (≥ 3:1 on background). */
  sageText: '#5F8257',
  accent: '#E7A272',
  accentSoft: '#FBEADC',
  accentStrong: '#8A4A1E',
  locked: '#646B66',
  dev: '#8A5A00',
  devSoft: '#FFF1D6',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  success: '#2E5B44',
  successSoft: '#DDE8DA',
  info: '#1F4E79',
  infoSoft: '#E3EEF8',
} as const;

/** Confetti colours for the completion celebration (from the palette). */
export const celebrationColors = ['#2E5B44', '#E7A272', '#A9BFA2', '#F2C14E', '#7FB3D5'] as const;

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
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const borders = {
  hairline: 1,
  thick: 2,
} as const;

/** Soft, low shadows; flat surfaces stay flat. */
export const elevation = {
  card: {
    shadowColor: '#2E3B2F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1F3A2C',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

/**
 * UI font: Nunito (SIL OFL 1.1, bundled via @expo-google-fonts/nunito), a
 * rounded sans that reads friendly for children and stays calm for adults.
 * Each weight is its own family, so no `fontWeight` (Android ignores weights
 * on custom families). Unloaded fonts fall back to the system font.
 */
export const fontFamilies = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const typography = {
  hero: { fontSize: 32, lineHeight: 40, fontFamily: fontFamilies.extrabold },
  display: { fontSize: 26, lineHeight: 34, fontFamily: fontFamilies.extrabold },
  title: { fontSize: 20, lineHeight: 28, fontFamily: fontFamilies.bold },
  heading: { fontSize: 17, lineHeight: 24, fontFamily: fontFamilies.bold },
  body: { fontSize: 16, lineHeight: 23, fontFamily: fontFamilies.regular },
  caption: { fontSize: 14, lineHeight: 20, fontFamily: fontFamilies.regular },
  label: { fontSize: 12, lineHeight: 16, fontFamily: fontFamilies.semibold },
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
  /** Mascot blink: one close+open, and the random gap between blinks. */
  mascotBlinkMs: 160,
  mascotBlinkMinMs: 2500,
  mascotBlinkMaxMs: 6000,
  reactionMs: 520,
  pressFeedbackOpacity: 0.7,
  /** Finger travel (pt) before a card starts dragging; tiny, so drag feels immediate. */
  dragMinDistance: 4,
  dragLiftScale: 1.04,
  dragTiltDeg: -1,
  /** Cards fade in and the bank reflows with short, eased timing (no springs). */
  cardEnterMs: 160,
  cardReflowMs: 200,
  celebrateScale: 1.06,
  /** Fly-back of a card dropped nowhere; critically damped, no bounce. */
  snapSpring: { damping: 26, stiffness: 240 },
  /** Delay between cards when a solved answer bounces, one by one. */
  celebrateStaggerMs: 70,
  /** How long the celebration plays before the results screen. */
  celebrateMs: 1500,
} as const;

/** Minimum tap target size (Apple HIG 44pt, Material 48dp). */
export const minTapTarget = 48;
