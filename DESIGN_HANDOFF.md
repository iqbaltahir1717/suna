# Design handoff

Figma file: `Suna-Games` (`cAAsdLTEgV0sgybvqgE3Kn`), Home wireframe node
`2003:324` ("mock", 393×1071). Reference capture:
`docs/figma/home-wireframe-2003-324.png`. The wireframe is low-fidelity and
structural; final UI is designed separately.

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

## Assets in the repo

| File | Source | Notes |
| --- | --- | --- |
| `assets/mascot/suna-mascot.png` | node 2003:386 render | 91×85 @1x, flattened, includes its own rounded cream frame |
| `assets/mascot/companion-blue.png` | node 2003:380 render | 51×48 @1x, flattened |

Limitation: these were captured as @1x node renders because the export URLs
were not reachable from the build environment. They look soft on @2x/@3x
screens. **Needed:** re-export at 3x PNG (or SVG) and replace the files
in place; no code changes required if the aspect ratio stays the same
(otherwise update `width`/`height` in `mascotArtwork.ts`).

## Mascot: what exists vs what is needed

The mascot is a single flattened image, so only whole-image motion is
implemented: idle breathing (translate + ≤1.5% uniform scale), occasional
sway, greeting hop, and tap squash. No facial animation is faked.

| State | Status | Needs |
| --- | --- | --- |
| idle | ✅ whole-image | — |
| greet / tap (reactions) | ✅ whole-image | — |
| blink | ⬜ | Separate left/right eye layers, or open/closed eye overlays |
| smile | ⬜ | Mouth expression layers (neutral, smile, open) |
| wave | ⬜ | Separate left/right arm layers with shoulder anchor |
| lookLeft / lookRight | ⬜ | Eye/pupil layers or alternate face poses (no true 3D turn from 2D) |
| sniff | ⬜ | Nose/face layer for small coordinated motion |
| sleepy / sleeping | ⬜ | Half-closed and closed eye poses |
| happy / encourage | 🟡 whole-image motion | Implemented as bounce (happy, on a solved puzzle) and a slow nod (encourage, on a wrong check). Needs smile/encouraging face layers for real expressions |

### Requested layered export

Export each part as a transparent PNG (3x) or SVG, all on the **same artboard
size** so parts stack at (0,0) without manual offsets:

- `body` (box without face and arms)
- `eye-left-open`, `eye-left-closed`, `eye-right-open`, `eye-right-closed`
- `mouth-neutral`, `mouth-smile`, `mouth-open`
- `arm-left`, `arm-right` (+ shoulder pivot coordinates)
- `legs` if they move
- `cheeks` (optional)

Anchor convention: coordinates in artboard points, origin top-left. Provide
pivot points for arms (shoulder) and the whole body (bottom-centre between the
feet; current sway pivots at `50% 100%`). The code will scale every layer by
the same factor so parts stay aligned at any viewport size.

## Other pending assets

- App logo (header tile and app icon; current icons are Expo defaults).
- Susun Ayat banner (16:6 slot in the game card; placeholder shown now).
- Tab icons if custom ones are desired (Ionicons used now).
- Final colors and typography → replace values in `src/theme/tokens.ts`.
- Designed short SFX and optional mascot sounds. Placeholders today:
  `assets/sfx/{pick,place,retry,success}.wav`, synthesized tones from
  `scripts/generate-sfx.py`. Replace the files, keep the names.
- Confetti colours (`celebrationColors` in tokens) and mascot happy /
  encourage face layers.
- Arabic Quran font choice (Phase 2).
