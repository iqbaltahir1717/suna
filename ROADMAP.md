# Roadmap

Status legend: ✅ done · 🟡 partial · ⬜ not started

## Phase 0 — Project foundation ✅

- ✅ Expo SDK 58 + TypeScript + Expo Router scaffold, reproducible `npm ci`.
- ✅ Four tabs: Home, Hafalan, Statistik, Profil; stack routes for
  notifications, premium info, and the Susun Ayat entry.
- ✅ Flat UI components and centralized tokens (color, type, spacing, radius,
  borders, motion).
- ✅ Indonesian/English localization with a "follow device" option.
- ✅ SQLite with `user_version` migrations (v1) and a migration test suite.
- ✅ Settings persistence (language, sound, reduced motion).
- ✅ Game registry with Susun Ayat (`preview`, not playable).
- ✅ Repository interfaces: settings, progress/statistics, notifications;
  hafalan interface defined for Phase 4.
- ✅ Entitlement interface with a dev-only override.

## Phase 1 — App shell and Home ✅ (pending device QA)

- ✅ Home: header (logo placeholder + name, notification button), welcome
  with mascot, activity summary with empty state, Suna Games card, labelled
  demo leaderboard (dev only), locked Hafalan preview.
- ✅ Hafalan, Statistik, Profil, local notification inbox, premium info.
- ✅ MascotView: idle breathing, occasional sway, greeting, tap feedback,
  pause on blur/background, reduced-motion static fallback.
- ⬜ QA on real iPhone and Android devices (navigation, language, small
  screens, largest text size, background/foreground, mascot smoothness in a
  release build). Only a web preview and Jest were run so far.

Boundaries kept: no puzzle engine, no Quran text, no purchases, no backend,
no push, no notification permission request.

## Phase 2 — First playable loop ⬜

- One reviewed surah; five verse-ordering challenges (complete ayat).
- Card selection with drag and tap-to-place; hints; validation that accepts
  visibly identical repeated cards in either order; results screen showing
  the full correct passage; local progress via `ProgressRepository`.
- Verify Arabic rendering early (font, shaping, harakat, wrapping, RTL local
  to the Quran component).

**Next concrete task:** choose and document the verified Quran text source
(license, attribution, version), then build the pure `engine/` module
(`createPuzzle`, `placeCard`, `validate`) with unit tests using neutral
non-Quran fixtures, before any UI.

## Phase 3 — Content and progression ⬜

Word-ordering mode; four difficulty levels (Beginner/Medium/Hard/Expert,
provisional labels); ~10 reviewed short surahs and ~40 curated challenges;
replay/practice; real statistics.

## Phase 4 — Hafalan tracker ⬜

Manual statuses (learning, reviewing, memorized) per ayah range, with dates
and local summaries. Separate from puzzle scores. Gated by `hafalan_tracker`.
New migration adds the hafalan table (see DATA_MODEL.md).

## Phase 5 — Final design and animation ⬜ (can overlap)

Apply approved Figma UI progressively; replace placeholders and tokens; full
mascot states with layered art; licensed SFX and optional mascot voice;
accessibility and performance passes.

## Phase 6 — Purchases ⬜

RevenueCat with native store billing (requires a development build).
Defined free vs premium content, parental gate, restore purchases,
pending/failed/cancelled/refunded/restored states, documented offline
access. No promise of cross-platform restore without an identity design.

Planning values only (do not hardcode): IDR 17,000 launch / IDR 29,000
normal. The app must display the store's localized price.

Premium package (provisional definition, `src/features/purchases/premiumPackage.ts`):

- Includes: `hafalan_tracker`; `susun_ayat_full` = all Susun Ayat challenges
  outside the free introductory set, as listed in the in-app package contents.
- Excludes: other future games, any guarantee of all Quran content, online
  features. The free intro set size is decided in Phase 3.

## Phase 7 — Release ⬜

Content and license review, device QA, offline/persistence checks, privacy
disclosures suitable for children and adults, store materials.

## Phase 8 — Online features ⬜

Optional auth, cloud sync (Supabase), public leaderboard with pseudonyms and
server-validated scores, push only if justified. Offline play stays usable.
Remove `src/dev/fixtures/leaderboardDemo.ts` here.
