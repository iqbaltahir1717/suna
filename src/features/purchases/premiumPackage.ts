import type { EntitlementKey } from './entitlements';

/**
 * Definition of the single one-time premium package (provisional).
 *
 * Prices are intentionally absent: the paywall must show the localized price
 * returned by the store (Phase 6). Planning values live in ROADMAP.md only.
 */
export const PREMIUM_PACKAGE = {
  id: 'suna_premium',
  grants: ['hafalan_tracker', 'susun_ayat_full'] as const satisfies readonly EntitlementKey[],
  /** Explicit non-promises shown to the user. Keys under `premium.excludes`. */
  excludes: ['futureGames', 'allQuran', 'online'] as const,
} as const;
