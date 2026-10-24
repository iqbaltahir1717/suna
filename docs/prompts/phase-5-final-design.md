# Prompt: Suna Phase 5 — final design and animation

Paste everything below the line into Claude Code (VS Code extension) on the
Mac, opened at the root of a local clone of `github.com/iqbaltahir1717/suna`.

---

You are continuing **Suna**, an Expo (React Native + TypeScript) Quran-learning
game hub for iOS and Android. Its first game is **Susun Ayat** (verse
ordering). Phases 0–4 are implemented. Your task is **Phase 5 — final design
and animation**, as defined in `ROADMAP.md`.

Communicate progress and explanations to me in concise **Indonesian**. Write
code identifiers, comments, commit messages, and technical docs in
**English**. Do not stop at planning: implement, verify, and commit. Make
routine, reversible decisions yourself; ask only when missing information
truly blocks you (for example a Figma frame that does not exist yet).

## 1. Get the right code first

1. `git fetch origin` and list remote branches. Phases are stacked pull
   requests: PR #1 (Phase 0–1) → #2 (Phase 2) → #3 (Phase 3) → Phase 4
   (branch `claude/project-thread-gjp3jq`). Check which are merged into
   `main` with `gh pr list --state all` (or GitHub in the browser).
2. Branch from the newest of these: `main` if Phase 4 is merged, otherwise
   `claude/project-thread-gjp3jq`. Name the branch `phase-5-final-design`.
3. `npm ci`, then `npm run verify` (typecheck + lint + Jest). All tests must
   pass before you change anything. If they fail, stop and tell me.
4. Run the app with `npm start` (Metro on **port 8082**; port 8081 is used
   by another project on this Mac). Use Expo Go, the iOS Simulator
   (`npm run ios`), or web (`npm run web`). Check what is installed
   (`xcrun simctl list devices`, `adb devices`) instead of assuming.

## 2. Read before editing

Read, in this order: `AGENTS.md` (Expo rules: always `npx expo install`,
read the versioned Expo docs for SDK 58, never hand-edit `ios/`/`android/`),
`ROADMAP.md`, `DESIGN_HANDOFF.md`, `README.md`, `DATA_MODEL.md`,
`CONTENT.md`, then `src/theme/tokens.ts`, `src/components/`,
`src/features/mascot/`, and `src/games/susun-ayat/components/`.

Stack facts that differ from older training data: Expo SDK 58, React Native
0.88, React 19.3, Expo Router, Reanimated 4.7 (shared values use
`.get()`/`.set()`), React Native Gesture Handler 3.3 (hook API such as
`usePanGesture`), expo-sqlite, expo-audio, expo-haptics, i18next. React
Native Testing Library 14: `render`/`fireEvent` are async, `await` them.

## 3. Design source

Figma file `Suna-Games`, key `cAAsdLTEgV0sgybvqgE3Kn`
(https://www.figma.com/design/cAAsdLTEgV0sgybvqgE3Kn/Suna-Games). Node
`2003:324` is the old low-fidelity Home wireframe. Use the Figma MCP server
if it is connected (`get_metadata` on the file to find the **approved**
final frames, then `get_design_context`, `get_variable_defs`,
`get_screenshot`). If Figma is not reachable, or no final frames exist for
a screen yet, say so and leave that screen on the current low-fidelity UI.
Never claim to have inspected a design you could not open.

Rules for design work:
- Do **not** edit Figma.
- Download assets into the repo (`assets/...`); never reference temporary
  Figma URLs at runtime. Export at 3x PNG or SVG.
- Apply the design **progressively** and only where a final frame exists:
  first tokens, then shared components, then screens.
- Put all colors, typography, spacing, radius, borders, and motion values in
  `src/theme/tokens.ts`; components read tokens, screens do not hardcode
  style values. Keep the token names stable where possible.
- Keep game logic, persistence, and entitlements untouched. Presentation
  must stay replaceable without changing the engine.

## 4. Phase 5 scope

1. **Tokens and typography** from the approved Figma variables/styles. Keep
   contrast at least WCAG AA. Keep the bundled Amiri Quran font for Quran
   text unless a reviewed alternative is decided (ask me).
2. **Shared components** (`Button`, `Card`, `Badge`, `ListRow`,
   `SegmentedControl`, `TextField`, `EmptyState`, tab bar, headers) restyled
   to the design.
3. **Screens**: Home, Hafalan (list, summary, editor, surah picker),
   Statistik, Profil, notification inbox, premium info, Susun Ayat list,
   play, and results, as far as final frames exist.
4. **Assets**: app logo and app icon/splash (via `app.json`), Susun Ayat
   banner, custom tab icons if designed. Replace placeholder files in place
   where `DESIGN_HANDOFF.md` says so.
5. **Mascot**: if layered mascot art exists (see the requested layer list in
   `DESIGN_HANDOFF.md`: body, eyes open/closed, mouths, arms with pivots),
   implement the missing states (blink, smile, wave, look left/right, happy
   and encourage faces) in `src/features/mascot/` with Reanimated on the UI
   thread, pausing on blur/background and respecting reduced motion. If the
   layers do not exist, keep the current whole-image motion and list exactly
   which exports are still needed.
6. **Sound**: replace `assets/sfx/{pick,place,retry,success}.wav` with
   designed, licensed short sounds if I provide them (keep the file names;
   record license and source in `DESIGN_HANDOFF.md`). Optional short mascot
   sounds follow the same "Sound effects" setting. No background music.
7. **Animation polish**: keep card and drag motion smooth and subtle (I
   asked earlier for less exaggerated card animation). Tune only values in
   `motion` tokens unless a component change is needed. Everything must
   honor the in-app and OS reduced-motion settings.
8. **Accessibility pass**: screen-reader labels and roles on every control,
   44–48 pt tap targets, largest Dynamic Type / font scale without clipped
   text, status never shown by color alone, focus order on the hafalan
   editor.
9. **Performance pass**: no dropped frames when dragging on a mid-range
   Android device in a release-like build; mascot idle loop paused off
   screen; avoid unnecessary re-renders on the play screen.

## 5. Product rules that must stay true

- Quran text stays verbatim from Tanzil (see `CONTENT.md`); never retype,
  generate, or "fix" Arabic text. Surah metadata comes only from
  `src/data/quran/` (generated from the verified Tanzil file).
- Completing a puzzle never marks hafalan; hafalan is self-reported only.
- No ads, no background music, no lives or punitive timers, no mandatory
  account, offline-first.
- Leaderboard data stays clearly labelled demo data, dev builds only.
- No real purchase flow (Phase 6). Premium gating uses entitlements
  `hafalan_tracker` and `susun_ayat_full`; the dev override in Profil is
  dev-only and never persisted.
- Indonesian and English for every new string (`src/locales/id.ts`,
  `src/locales/en.ts`); never hardcode UI text.
- Never commit secrets. Do not publish or submit to app stores.

## 6. Verify and deliver

1. `npm run verify` must pass; add or update tests for any logic you touch.
2. Run the app and check each changed screen in Indonesian and English, on
   a small phone size and with the largest text size. Take screenshots of
   the main screens and save them under `docs/screenshots/phase-5/`.
3. Update `ROADMAP.md` (Phase 5 status with ✅/🟡/⬜ items and what still
   needs final art or device QA), `DESIGN_HANDOFF.md` (what was applied,
   which Figma frames/nodes, which assets are still missing), and
   `README.md` if run steps changed.
4. Commit in logical steps with clear messages. Push the branch and open a
   pull request against the Phase 4 branch (or `main` if Phase 4 is
   merged), describing what was applied, what is still placeholder, and how
   it was tested.
5. Finish with a short summary in Indonesian: what changed, what is still
   waiting for design assets, and what I should test on my iPhone and
   Android device.
