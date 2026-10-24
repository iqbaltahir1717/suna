/* global __dirname, Buffer */
/**
 * Renders the vector brand sources in assets/brand/*.svg to the PNGs the app
 * and app.json use. Re-run after editing an SVG:
 *
 *   node scripts/render-brand-assets.js
 *
 * Needs Playwright with Chromium (not a project dependency; install it
 * globally or run where it is available). PNGs are committed, so building
 * the app never needs this script.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const brand = (name) => path.join(root, 'assets/brand', name);

/** One output per screen density: name.png, name@2x.png, name@3x.png. */
function scaled(source, base, width, height) {
  return [1, 2, 3].map((x) => [
    source,
    `${base}${x === 1 ? '' : `@${x}x`}.png`,
    width * x,
    height * x,
  ]);
}

/** [source svg, output png, width, height] */
const OUTPUTS = [
  ['app-icon.svg', 'assets/icon.png', 1024, 1024],
  ['android-icon-foreground.svg', 'assets/android-icon-foreground.png', 512, 512],
  ['android-icon-background.svg', 'assets/android-icon-background.png', 512, 512],
  ['android-icon-monochrome.svg', 'assets/android-icon-monochrome.png', 512, 512],
  ['splash-icon.svg', 'assets/splash-icon.png', 1024, 1024],
  ['suna-logo.svg', 'assets/favicon.png', 48, 48],
  // In-app images at 1x/2x/3x; Metro picks the density, code requires the 1x name.
  ...scaled('suna-logo.svg', 'assets/brand/suna-logo', 48, 48),
  ...scaled('susun-ayat-mark.svg', 'assets/brand/susun-ayat-mark', 96, 96),
  ...scaled('susun-ayat-banner.svg', 'assets/brand/susun-ayat-banner', 360, 135),
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [source, output, width, height] of OUTPUTS) {
    const svg = fs.readFileSync(brand(source), 'utf8');
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">` +
        `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" ` +
        `style="display:block;width:${width}px;height:${height}px"></body></html>`,
    );
    await page.screenshot({ path: path.join(root, output), omitBackground: true });
    console.log(`${source} → ${output} (${width}×${height})`);
  }
  await browser.close();
})();
