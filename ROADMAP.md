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

## Phase 2 — First playable loop ✅ (pending content review and device QA)

- ✅ Surah: **Al-Fatihah** (7 ayat). Chosen because it is the surah every
  beginner, child or adult, already hears daily, and 7 ayat give five
  distinct ranges.
- ✅ Text: Tanzil Quran Text, Uthmani v1.0.2 (CC BY 3.0, verbatim), with the
  copyright block, file hashes, and provenance kept in the content JSON;
  in-app attribution and link to tanzil.net. See CONTENT.md.
- ✅ Five complete-ayat challenges, all free: 1–3, 3–5, 5–7 (beginner), 1–5,
  1–7 (medium).
- ✅ Pure engine (`createPuzzle`, `placePiece`, `returnPiece`, `checkAnswer`,
  `applyHint`) with tests; identical cards accepted in either order.
- ✅ Tap-to-place (primary, accessible) and press-and-hold drag (RNGH v3 +
  Reanimated, UI-thread motion); hints that lock a correct card; gentle
  "try again" with flagged slots; no timer, no lives.
- ✅ Results screen with the full passage in order and the "not hafalan" note.
- ✅ Local progress: one `game_sessions` row per attempt (abandoned attempts
  only if the player touched them), `challenge_progress` on completion,
  "Completed" badges on the challenge list, Home/Statistik summary.
- ✅ Arabic rendering: bundled Amiri Quran font (OFL), RTL local to
  `QuranText`, tall line height for harakat; checked in the web preview.
- ⬜ **Qualified human review** of the text and challenge ranges
  (`CONTENT_REVIEW_STATUS = 'pending'`).
- ⬜ Re-download Tanzil Uthmani from tanzil.net (latest version) and diff;
  tanzil.net was blocked from the build environment.
- ⬜ Device QA: Arabic shaping on iOS and Android, drag inside the scroll
  view, largest text size, small phones.
- ⬜ Sound effects: no licensed SFX yet, so none play (Phase 5).
- ⬜ No auto-scroll while dragging; long challenges rely on tap-to-place.

Phase 2 follow-ups (review, tanzil.net re-check, device QA) carry over into
Phase 3 below.

## Phase 3 — Content and progression ✅ (pending content review and device QA)

- ✅ Word-ordering mode (`orderWords`) on the same pure engine. Words are the
  verbatim ayah split at spaces; identical words are interchangeable. Word
  slots and chips flow right to left; multi-ayah puzzles show ayah breaks
  except at Expert.
- ✅ Four difficulty levels (Beginner/Medium/Hard/Expert, provisional labels)
  defined in one table, `DIFFICULTY_RULES`: piece-count range, hints per
  piece, ayah breaks. Difficulty is a filter independent of surah.
- ✅ 10 short surahs (Al-Fatihah, An-Nas, Al-Falaq, Al-Ikhlas, An-Nasr,
  Al-Kafirun, Al-Kautsar, Al-Ma‘un, Quraisy, Al-‘Asr) and 44 challenges
  (16 order-ayat, 28 order-words; 18/14/6/6 by difficulty). Same Tanzil
  Uthmani 1.0.2 source file as Phase 2; letters and word counts cross-checked
  against two independent distributions.
- ✅ Free introductory set decided: all challenges of Al-Fatihah, An-Nas,
  and Al-Falaq (17). The other 27 need `susun_ayat_full`; the play route
  checks access too, and the premium screen lists the current counts.
- ✅ Replay on every card and result; random practice for the selected
  difficulty that prefers unfinished challenges; "next" skips locked ones.
- ✅ Real statistics on Statistik: completion by difficulty and mode,
  attempts, finished attempts, solved without hints, active days, recent
  attempts. Computed from `game_sessions`; no schema change (still v1).
- ✅ Phase 2 ids, ranges, and free access unchanged; `CONTENT_VERSION`
  bumped to `2026.10-2`.
- ⬜ **Qualified human review** of the new text, word segmentation, and all
  44 ranges (CONTENT.md checklist). `CONTENT_REVIEW_STATUS = 'pending'`.
- ⬜ Re-download from tanzil.net and diff (still blocked from the build
  environment).
- ⬜ Device QA for word chips: Arabic shaping of single words, RTL wrapping on
  small phones, drag between wrapped rows, largest text size.
- ⬜ Terminology review of the four difficulty labels.

**Next concrete task:** content review of the 10 surahs and 44 challenges,
then device QA. After that, Phase 4 (hafalan tracker).

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
  features. Free intro set (Phase 3): every challenge of Al-Fatihah, An-Nas,
  and Al-Falaq (`FREE_SURAHS`).

## Phase 7 — Release ⬜

Content and license review, device QA, offline/persistence checks, privacy
disclosures suitable for children and adults, store materials.

## Phase 8 — Online features ⬜

Optional auth, cloud sync (Supabase), public leaderboard with pseudonyms and
server-validated scores, push only if justified. Offline play stays usable.
Remove `src/dev/fixtures/leaderboardDemo.ts` here.
