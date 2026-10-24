# Suna — rules for contributors and coding agents

Suna is a portrait-first iOS/Android Quran-learning game hub (Expo + React
Native). Susun Ayat is the first game. Read ROADMAP.md for the current phase
and do not build beyond it without instruction.

## Language

- Talk to the product owner in concise Indonesian.
- Code identifiers, comments, and technical docs are in English.
- UI strings live only in `src/locales/{id,en}.ts`; both must have the same
  keys (enforced by a test). Quran text is never a UI string.

## Product constraints (do not violate)

- No mandatory account. Core play, progress, and hafalan work offline.
- No ads. No background music. Sound effects and mascot sounds are short,
  optional, and respect the sound setting.
- Gentle encouragement only: no lives, no punishment, no mandatory timer in
  learning modes.
- **Game performance and hafalan are separate.** Completing a puzzle never
  marks an ayah as memorized; hafalan changes only by explicit user action.
- Never present demo data as real. Leaderboard fixtures live in
  `src/dev/fixtures/` and only render in `__DEV__`.
- Never show an unbuilt game as playable, or a placeholder as a working
  control. Non-functional rows are rendered non-interactive with a
  "Segera hadir" badge.
- Do not award "Hafiz" or imply a religious qualification. Difficulty labels
  are provisional until terminology is reviewed.

## Quran content

- Never generate, paraphrase, or invent Quran text, translations, or answer
  keys with AI. Never invent sample ayat.
- Technical scaffolding uses neutral, clearly non-Quran fixtures.
- Real content requires: a verified source, a license/attribution review,
  preserved source and version metadata, and qualified human review of text
  and segmentation.
- Arabic direction is local to Quran components (`QuranText`). Never flip
  the whole UI to RTL.
- Bundled text lives in `src/games/susun-ayat/content/quran/*.json`, produced
  only by `scripts/extract-tanzil-surah.mjs`. Never hand-edit it: the Tanzil
  license forbids changing the text, and a test checks each file's hash.
  Keep the Tanzil copyright block and the in-app link to tanzil.net.
- Level ids are permanent once shipped (progress rows key on them). Bump
  `CONTENT_VERSION` when levels or text change. Keep `CONTENT_REVIEW_STATUS`
  at `pending` until a qualified reviewer signs off (see CONTENT.md).
- Validation compares card text, not card identity, so identical ayat are
  interchangeable.

## Premium

- Entitlement keys: `hafalan_tracker`, `susun_ayat_full`. Features check
  their own key even though one package grants both.
- A local boolean is never proof of purchase. The dev override is in-memory,
  gated by `__DEV__`, and must stay unavailable in production.
- No real payments, store credentials, checkout links, or hardcoded prices.
  Show store-localized prices once RevenueCat lands (Phase 6).
- Do not promise all future content or all Quran content.

## Architecture

- `src/app/` holds routes only; screens live in `src/features/` or `src/games/`.
- Puzzle rules (`games/susun-ayat/engine/`) are pure TypeScript with no
  React, storage, or Quran imports; tests use neutral fixtures.
- Persistence goes through repository interfaces in `src/data/`. Schema
  changes are new, append-only migrations, documented in DATA_MODEL.md.
- The mascot (`src/features/mascot/`) is independent of navigation and game
  logic: hosts pass `paused`/`reduceMotion` and call `react()` via ref.
- Styles come from `src/theme/tokens.ts`. Do not hardcode colors or sizes in
  screens; extend tokens or shared components instead.
- Keep the game registry minimal. Do not build a generic game framework.
- Future remote services (purchases, Supabase) stay behind interfaces.

## Animation

- Reanimated shared values only; no React state per frame.
- Prefer transform and opacity. Use `.get()`/`.set()` on shared values.
- Pause when unfocused or backgrounded; clean up timers on unmount; honour OS
  and app reduced motion with a static fallback.
- Do not fake facial animation by distorting a flattened image.

## Expo specifics

Expo changes between SDKs. Before touching an Expo/React Native API, check the
installed version (`package.json`) and its versioned docs at
`https://docs.expo.dev/versions/v58.0.0/` (or the type definitions in
`node_modules` when offline).

- Install with `npx expo install <pkg>`, never bare `npm install` for
  SDK-managed packages.
- Tabs come from `expo-router/js-tabs`, stacks from `expo-router/stack`.
- `ios/` and `android/` are generated (CNG); configure via `app.json`.
- Native modules not in Expo Go require a development build; document it.

## Before declaring work done

```bash
npm run verify    # typecheck + lint + tests
```

Do not claim device, simulator, platform, or frame-rate verification that was
not actually performed. Do not push, publish, or submit without instruction.
Never commit secrets.
