# Suna

Suna is an iOS and Android Quran-learning game hub for children and adults.
Its first game is **Susun Ayat**, a verse-ordering puzzle.

Current status: **Phase 3** (content and progression). Susun Ayat has 44
challenges over 10 short surahs, in two modes (order ayat, order words) and
four provisional difficulty levels. The Quran text, word segmentation, and
challenge ranges still await qualified human review.
See [ROADMAP.md](ROADMAP.md).

| Doc | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Durable project rules and product constraints |
| [ROADMAP.md](ROADMAP.md) | Phases, boundaries, status, next tasks |
| [DATA_MODEL.md](DATA_MODEL.md) | Local entities, repositories, migrations |
| [DESIGN_HANDOFF.md](DESIGN_HANDOFF.md) | Figma assets, mascot layers, pending art |
| [CONTENT.md](CONTENT.md) | Quran text source, license, review checklist |

## Stack

Expo SDK 58 (React Native 0.88, React 19.3), TypeScript, Expo Router,
React Native Reanimated 4, React Native Gesture Handler, expo-sqlite,
i18next + react-i18next + expo-localization. No backend.

## Requirements

- Node.js 22 LTS (tested with 22.22) and npm 10.
- To preview on a phone: the **Expo Go** app for the SDK 58 release on
  iOS or Android, on the same network as your computer.
- Optional: Xcode (macOS) or Android Studio for simulators and native builds.

## Install

```bash
npm ci            # exact versions from package-lock.json
```

Add packages with `npx expo install <package>` so versions match the SDK.

## Run

```bash
npm start         # Metro dev server; scan the QR code with Expo Go
npm run ios       # open in iOS Simulator (macOS + Xcode)
npm run android   # open in Android emulator or a connected device
npm run web       # browser preview (development aid only)
```

The scripts use port **8082** so Suna can run next to another Expo project on
the default 8081. Override with `npx expo start --port <port>` if needed.

Phases 0–2 run in **Expo Go**: every native module used ships with Expo Go
(the Amiri Quran font is a bundled asset loaded with expo-font).

### When a development build becomes necessary

Use `npx expo run:ios|android` or `npx eas-cli@latest build --profile development`
once any of these lands:

- In-app purchases (RevenueCat / native store billing, Phase 6). Purchases
  **cannot** be tested in Expo Go.
- Any native module not bundled with Expo Go.
- Release/profile performance checks of mascot animation (Expo Go and dev
  bundles are not representative of release frame rates).

### Web preview note

The web build is only a quick layout preview. `metro.config.js` adds the
`.wasm` asset type and cross-origin isolation headers that expo-sqlite needs
in the browser. Web is not a target platform.

## Verify

```bash
npm run typecheck # tsc --noEmit
npm run lint      # expo lint (ESLint, expo config)
npm test          # Jest (jest-expo preset)
npm run verify    # all three
```

Tests cover the Susun Ayat engine (placement, swaps, hints, identical
cards), content integrity (text hashes, Tanzil attribution, level ranges),
the play screen (tap-to-place, wrong answer, saved progress), SQLite migrations (fresh install, idempotency, upgrade,
rollback on failure, newer-schema refusal), repositories, entitlement
resolution, locale key parity, the game registry, demo-fixture isolation,
and mascot timer/animation cleanup. Database tests run real SQL through
Node's built-in `node:sqlite` (prints an "experimental" warning; expected).

### Manual checks before release-oriented work

On real iPhone and Android devices (not yet done, see ROADMAP):

1. Navigate all four tabs, notifications, premium info, and Susun Ayat
   entry repeatedly; go back and forth.
2. Switch language (Sistem / Indonesia / English), restart the app, confirm
   it persists.
3. Turn on OS reduced motion and the in-app toggle; the mascot must be still.
4. Background the app on Home and return; the mascot pauses and resumes.
5. Check a small phone (e.g. iPhone SE) and the largest system text size.
6. Susun Ayat: play each challenge by tapping and by press-and-hold drag
   (including dragging a placed card back to the pool and between slots);
   check Arabic harakat and line wrapping on both platforms; use a hint;
   confirm "Selesai" badges and Home stats after a restart.
7. In a dev build, use **Profil → Pratinjau entitlement** to preview
   locked/unlocked Hafalan. This panel does not exist in production bundles.

## Project layout

```
src/
  app/                 Expo Router routes only (thin re-exports)
  components/          Shared flat UI components
  theme/               Design tokens (colors, type, spacing, radius, motion)
  locales/             id/en strings and i18n setup
  data/                SQLite provider, migrations, repositories
  features/            home, hafalan, statistics, profile, notifications,
                       mascot, purchases, settings
  games/
    registry/          Minimal game registry
    susun-ayat/
      engine/          Pure puzzle rules (no React, no Quran text)
      content/         Levels + verbatim Tanzil text (generated JSON)
      components/      QuranText, AyahCard, AnswerSlot, ResultsView
      screens/         Challenge list, play screen, session recording
  dev/fixtures/        Development-only fixtures (excluded from release UI)
  test/                Test helpers
scripts/               extract-tanzil-surah.mjs (content import)
assets/mascot/         Mascot artwork exported from Figma
docs/figma/            Wireframe reference image
```
