import { colors } from '@/theme';

function luminance(hex: string) {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const AA = 4.5;

describe('color tokens meet WCAG AA for text', () => {
  it.each([
    ['text', 'background'],
    ['text', 'surface'],
    ['text', 'surfaceMuted'],
    ['textMuted', 'background'],
    ['textMuted', 'surface'],
    ['textMuted', 'surfaceMuted'],
    ['textInverse', 'primary'],
    ['textInverse', 'primaryPressed'],
    ['primary', 'primarySoft'],
    ['primary', 'background'],
    ['primary', 'surface'],
    ['accentStrong', 'accentSoft'],
    ['locked', 'surfaceMuted'],
    ['dev', 'devSoft'],
    ['danger', 'dangerSoft'],
    ['info', 'infoSoft'],
  ] as const)('%s on %s', (fg, bg) => {
    expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(AA);
  });
});

describe('large-text colors meet WCAG AA large (3:1)', () => {
  it.each([['sageText', 'background']] as const)('%s on %s', (fg, bg) => {
    expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(3);
  });
});
