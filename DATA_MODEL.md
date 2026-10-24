# Data model

All data is local SQLite (`suna.db`, expo-sqlite). There is no server.

## Schema versioning

- Version lives in `PRAGMA user_version`.
- `src/data/db/migrations.ts` holds an ordered, append-only list numbered
  1..n. `migrateDatabase()` runs on every launch (in `SQLiteProvider.onInit`),
  applies only newer migrations, each inside a transaction together with its
  version bump.
- A failed migration rolls back fully and the app does not start on a
  half-migrated schema.
- A database with a higher version than the app knows is refused (downgrade
  protection).
- Never edit a shipped migration. Add a new one, add a test, update this file.

Connection pragmas: `journal_mode = WAL`, `foreign_keys = ON`.

## v1 tables

### `settings`
| column | type | notes |
| --- | --- | --- |
| key | TEXT PK | `language`, `soundEnabled`, `reduceMotion` |
| value | TEXT | JSON-encoded, validated on read and write |
| updated_at | INTEGER | epoch ms |

Unknown keys and invalid values are ignored on load (defaults apply).

### `game_sessions` (game activity, automatic)
| column | type | notes |
| --- | --- | --- |
| id | INTEGER PK | autoincrement |
| game_id | TEXT | registry id, e.g. `susun-ayat` |
| level_id | TEXT? | stable level id |
| content_version | TEXT? | version of the reviewed content set |
| started_at / ended_at | INTEGER | epoch ms; `ended_at` null if abandoned |
| completed | INTEGER | 0/1 |
| hints_used, mistakes | INTEGER | informational; never punitive |

### `challenge_progress` (game activity, automatic)
| column | type | notes |
| --- | --- | --- |
| game_id + level_id | PK | |
| content_version | TEXT | last version completed |
| first_completed_at / last_completed_at | INTEGER | epoch ms |
| completion_count | INTEGER | |

### `notifications` (local inbox)
| column | type | notes |
| --- | --- | --- |
| id | TEXT PK | |
| kind | TEXT | no kinds defined yet |
| payload | TEXT | JSON |
| created_at / read_at | INTEGER | `read_at` null = unread |

## Repositories (`src/data/repositories/`)

| Interface | Implemented | Used by |
| --- | --- | --- |
| `SettingsRepository` (`load`, `save`) | ✅ SQLite | SettingsProvider |
| `ProgressRepository` (`getActivitySummary`, `getGameStats`, `listCompletedChallenges`, `recordSession`, `markChallengeCompleted`) | ✅ SQLite | Home and Statistik summary; Susun Ayat writes sessions and completions, reads completions and per-level stats for the challenge list, and `getGameStats` for Statistik |
| `NotificationsRepository` (`list`, `countUnread`, `markRead`) | ✅ SQLite | Notification inbox and header dot |
| `HafalanRepository` (`list`, `get`, `create`, `update`, `logReview`, `remove`, `history`, `summary`) | ✅ SQLite (`hafalanRepository.ts`, contract in `features/hafalan/types.ts`) | Hafalan tab, editor, Home and Statistik summary |

Repositories depend on the narrow `SqlDatabase` interface
(`src/data/db/types.ts`), which expo-sqlite satisfies on device and
`src/test/nodeSqlite.ts` satisfies in Jest via `node:sqlite`.

## How Susun Ayat writes progress (Phase 2)

- One `game_sessions` row per attempt. A solved attempt stores `ended_at`,
  `completed = 1`, hints used, and failed checks (`mistakes`, informational).
  An attempt the player touched but left (back, replay, next) is stored with
  `ended_at = NULL`, `completed = 0`. Untouched visits store nothing.
- A solved attempt also upserts `challenge_progress` with the level's
  `content_version`.
- No schema change was needed; the database stays at v1.

## Separation rule: activity vs hafalan

`game_sessions` and `challenge_progress` record what happened in games.
Hafalan (Phase 4) is a separate table written only by explicit user action.
No code path may derive hafalan status from game results.

## v2 tables (Phase 4, hafalan)

Written only by explicit user action in the hafalan screens.

### `hafalan_entries`
| column | type | notes |
| --- | --- | --- |
| id | TEXT PK | random, generated in the app |
| surah | INTEGER | 1..114 (CHECK) |
| from_ayah / to_ayah | INTEGER | inclusive; `from_ayah >= 1`, `to_ayah >= from_ayah` (CHECK). Upper bound validated in the app against `src/data/quran` |
| status | TEXT | `learning` / `reviewing` / `memorized` (CHECK) |
| note | TEXT? | trimmed, empty → NULL |
| created_at / updated_at | INTEGER | epoch ms |
| status_changed_at | INTEGER | epoch ms of the last status the user set |
| last_reviewed_at | INTEGER? | epoch ms of the last "reviewed today" log |

Ranges in one surah may not overlap (`validateRange`, enforced in the
repository), so each ayah has at most one status and summaries add up.

### `hafalan_events` (dated history)
| column | type | notes |
| --- | --- | --- |
| id | INTEGER PK | autoincrement |
| entry_id | TEXT FK | `ON DELETE CASCADE`; also deleted explicitly |
| kind | TEXT | `created`, `status_changed`, `range_changed`, `reviewed` |
| status | TEXT | entry status right after the action |
| at | INTEGER | epoch ms |

Summary (`summary()`): ayat per status, tracked surahs, surahs whose every
ayah is in a `memorized` range, last event time. Computed from the entries
and the Tanzil ayah counts; game tables are never read.

Surah metadata (`src/data/quran/surahs.tanzil-uthmani.json`) is generated by
`scripts/extract-tanzil-metadata.mjs` from the same verified Tanzil file as
the Susun Ayat text (names and ayah counts only, no Quran text).

## Planned migrations

- Purchases (Phase 6) are **not** stored as local truth. RevenueCat's
  customer info is the source; at most a cache with an expiry may be added.

## Entitlements (`src/features/purchases/`)

- Keys: `hafalan_tracker`, `susun_ayat_full`.
- `EntitlementSource.getActive()` is the production source. Today it is
  `noPurchasesSource` (grants nothing). Phase 6 replaces it with a
  RevenueCat-backed source.
- `resolveEntitlements(granted, devOverride, isDevBuild)` applies the
  in-memory dev override only when `__DEV__` is true. It is never persisted.

## Future remote services

Accounts, sync, and leaderboard (Phase 8, Supabase) will sit behind new
interfaces. Local SQLite stays the offline source of truth; sync is additive.
Scores submitted online must be validated server-side.

## Statistics (Phase 3)

`getGameStats(gameId, recentLimit = 5)` reads only `game_sessions`:

- Per level: attempts, completed attempts, fewest hints in a completed
  attempt (`bestHintsUsed`, null if never completed), last played.
- Active days: distinct local calendar days with an attempt
  (`date(started_at / 1000, 'unixepoch', 'localtime')`).
- Recent attempts, newest first.

`games/susun-ayat/stats.ts` joins these rows with the current level list to
count completion by difficulty and mode. Rows for removed levels are ignored.
Word challenges use the same tables; level ids distinguish them. No schema
change was needed; the database stays at v1.

