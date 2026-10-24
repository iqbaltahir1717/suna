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
| `ProgressRepository` (`getActivitySummary`, `recordSession`, `markChallengeCompleted`) | ✅ SQLite | Home and Statistik summary; writes start in Phase 2 |
| `NotificationsRepository` (`list`, `countUnread`, `markRead`) | ✅ SQLite | Notification inbox and header dot |
| `HafalanRepository` (`list`, `upsert`, `remove`) | ⬜ interface only (`features/hafalan/types.ts`) | Phase 4 |

Repositories depend on the narrow `SqlDatabase` interface
(`src/data/db/types.ts`), which expo-sqlite satisfies on device and
`src/test/nodeSqlite.ts` satisfies in Jest via `node:sqlite`.

## Separation rule: activity vs hafalan

`game_sessions` and `challenge_progress` record what happened in games.
Hafalan (Phase 4) is a separate table written only by explicit user action.
No code path may derive hafalan status from game results.

## Planned migrations

- **v2 (Phase 4) `hafalan_entries`**: `id TEXT PK`, `surah INTEGER`,
  `from_ayah INTEGER`, `to_ayah INTEGER`, `status TEXT CHECK IN
  ('learning','reviewing','memorized')`, `note TEXT`, `created_at`,
  `updated_at`, plus a status-history table if dates per transition are needed.
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
