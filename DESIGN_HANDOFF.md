# Design handoff

Figma file: `Suna-Games` (`cAAsdLTEgV0sgybvqgE3Kn`), Home wireframe node
`2003:324` ("mock", 393×1071). Reference capture:
`docs/figma/home-wireframe-2003-324.png`. The wireframe is low-fidelity and
structural; final UI is designed separately.

## Figma inventory (checked 2026-10-24, Phase 5)

Read through the Figma MCP server (read-only). Pages `MVP`, `Design`,
`Draft`, and `Cover` are empty. `↳ Workspace` holds:

| Node | What it is | Usable as |
| --- | --- | --- |
| `2003:324` "mock" | Low-fidelity Home wireframe (unchanged since Phase 0) | Structure only (already applied) |
| `2003:328` "Frame 2" / `2001:309` "image 2" | Flattened raster concept of a Susun Ayat start screen: green palette, four-leaf logo, "Pilih Level" / "Pilih Surah" buttons, best scores Normal/Sulit, sound and settings buttons | Concept only. Not a layered frame: no variables, text styles, or components to extract |
| `2003:321` / `2003:326` "image 5/6" | Flattened sheet of blue mascot poses (idle, sleepy, waving, rocket, glasses, etc.) | Pose reference only. Not layered; ownership/licence to be confirmed before shipping any pose |
| `2001:311`, `2001:314` "image 3/4" | Moodboard screenshots of other games' characters | Inspiration only. Never ship these |

There are no Figma variables (`get_variable_defs` on `2003:324` is empty),
no final screen frames, and no layered mascot. Iqbal then asked for an
interim in-house design (see below). Figma asset URLs are still unreachable from the cloud build
environment; screenshots are only available at the node's natural size, so
the mascot could not be re-exported at 3x from here.

## What the wireframe defines (and how it was mapped)

| Wireframe | Implementation |
| --- | --- |
| Logo block + "Logo" text, top left | Placeholder "S" tile + "Suna" (`HomeHeader`) |
| Grey square, top right | Notification button → local inbox |
| Mascot image (2003:386, 91×85) + "Welcome back with Suna" / "Belajar, susun dan mainkan" | `WelcomeSection` with `MascotView`; generic welcome (no personal name) |
| "Static User" block | Activity summary (real local values + empty state) |
| "Suna Games" block | Registry-driven game card (Susun Ayat, "in development") |
| "Leaderboard Suna" block | Demo rows labelled as demo, dev builds only |
| "List Hafalan Kamu" block | Locked premium preview → premium info |
| Floating 3-item bottom bar (Home, Statisic, Account) | Standard tab bar with **4** tabs per spec: Home, Hafalan, Statistik, Profil |
| Blue mascot (2003:380) as Account icon | Used as the local profile avatar; tabs use outline icons |

## Interim design (Phase 5, 2026-10-24)

No final Figma design exists yet, so Iqbal asked Claude to design an interim
version that will be replaced later. Everything below is meant to be swapped
without touching game logic.

- **Direction:** taken from the green Susun Ayat concept (`2003:328`): deep
  green primary, soft sage, a warm peach accent, warm off-white background,
  white cards with a hairline border and a soft shadow, generous radii.
- **Tokens:** `src/theme/tokens.ts` (colors, `fontFamilies`, typography,
  radius incl. `xl`, `elevation`, motion incl. mascot blink timing).
  Contrast is checked by `src/theme/__tests__/tokens.test.ts` (WCAG AA).
- **UI font:** Nunito (SIL OFL 1.1) via `@expo-google-fonts/nunito`,
  bundled. Quran text keeps Amiri Quran.
- **Components restyled:** `Card`, `Button` (adds `tonal`, `icon`,
  `fullWidth`; `secondary` is now outlined), `IconButton` (round),
  `EmptyState` (icon in a tinted circle), `TextField`, tab bar, stack header
  font, puzzle cards.
- **Screens:** Home welcome card with a rounded mascot viewport; Susun Ayat
  entry gets the concept's hero (mark, two-tone title, tagline, progress
  stats, full-width "Random practice"). Other screens follow through tokens.
- **Brand assets:** vector sources in `assets/brand/*.svg`, rendered to PNG
  by `node scripts/render-brand-assets.js` (needs Playwright):

| Source | Outputs | Use |
| --- | --- | --- |
| `suna-logo.svg` | `assets/brand/suna-logo{,@2x,@3x}.png`, `assets/favicon.png` | Home header, profile avatar |
| `app-icon.svg` | `assets/icon.png` | App icon (iOS) |
| `android-icon-{foreground,background,monochrome}.svg` | `assets/android-icon-*.png` | Android adaptive icon |
| `splash-icon.svg` | `assets/splash-icon.png` | Splash (`expo-splash-screen` plugin; needs a development build, Expo Go shows its own) |
| `susun-ayat-mark.svg` | `assets/brand/susun-ayat-mark{,@2x,@3x}.png` | Susun Ayat hero |
| `susun-ayat-banner.svg` | `assets/brand/susun-ayat-banner{,@2x,@3x}.png` | Game card banner (registry) |

Screenshots: `docs/screenshots/phase-5/` (Indonesian, 390×844 web preview)
and `maskot.gif` (idle, blink, glance, tap reaction).

## Assets in the repo

| File | Source | Notes |
| --- | --- | --- |
| `src/features/mascot/sunaMascotLayers.tsx` | Claude's vector redraw of node 2003:386 | Layered mascot in use (see below) |
| `assets/mascot/suna-mascot.png` | node 2003:386 render | 91×85 @1x, flattened; kept as `SUNA_MASCOT_FLAT` fallback |

The blue companion (node 2003:380) is no longer used; the profile avatar
now uses the Suna logo.

## Mascot

`SUNA_MASCOT` is now a **layered** vector redraw of the tofu-cube mascot
(`src/features/mascot/sunaMascotLayers.tsx`). All layers share one 200×200
artboard and stack at (0,0); pivots are in `PIVOTS` (shoulders, face, feet).
Layers: `Shadow`, `Legs`, `ArmLeft`, `ArmRight`, `Body`, `Cheeks`,
`EyesOpen`, `EyesHappy`, `EyesClosed`, `MouthSmile`, `MouthNeutral`,
`MouthOpen`. Expressions switch on the UI thread (shared values), so they
never re-render React.

| State | Status | How |
| --- | --- | --- |
| idle | ✅ | Breathing, random blink (sometimes double), glance left/right, occasional sway |
| blink | ✅ | Eyes scale shut around the eye line |
| smile | ✅ | Default mouth |
| lookLeft / lookRight | ✅ | Eyes and face shift toward the gaze (2D, no 3D turn) |
| greet | ✅ | Hop + right-arm wave + open mouth (Home focus, results) |
| tap | ✅ | Squash + laughing eyes + open mouth |
| happy | ✅ | Two bounces, both arms up, laughing face (solved puzzle) |
| encourage | ✅ | Slow nod + raised arm, smiling (wrong answer) |
| sleepy / sleeping, sniff | ⬜ | `EyesClosed` exists; no trigger defined yet |

Reduced motion (app or OS), an unfocused screen, or a backgrounded app stop
every animation and timer; the mascot rests smiling.

**To replace with designer art:** export the same layer list on one shared
artboard (SVG preferred), keep or update `PIVOTS`, and swap the drawings in
`sunaMascotLayers.tsx`. The controller does not change.

## Still pending from design

- Final Figma frames and variables → replace token values and restyle.
- Designer-made logo, app icon, splash, Susun Ayat banner (replace the SVG
  sources in `assets/brand/` and re-run the render script).
- Designer layered mascot (optional; the interim one is complete).
- Tab icons if custom ones are desired (Ionicons used now).
- Designed short SFX and optional mascot sounds. Placeholders today:
  `assets/sfx/{pick,place,retry,success}.wav`, synthesized tones from
  `scripts/generate-sfx.py`. Replace the files, keep the names, record the
  licence here.
- Arabic Quran font choice (Phase 2).
