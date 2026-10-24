/**
 * Feature entitlements.
 *
 * Each premium feature checks its own key, even though one purchase package
 * is planned to grant both. Nothing in this file is proof of purchase: the
 * only production source today grants nothing, because purchases are not
 * implemented yet (RevenueCat is planned for Phase 6).
 */

export const ENTITLEMENT_KEYS = ['hafalan_tracker', 'susun_ayat_full'] as const;
export type EntitlementKey = (typeof ENTITLEMENT_KEYS)[number];

export type EntitlementSet = ReadonlySet<EntitlementKey>;

/** Source of truth for granted entitlements. A store-backed impl comes later. */
export interface EntitlementSource {
  getActive(): Promise<EntitlementSet>;
}

/** Production default until store billing exists: no premium access. */
export const noPurchasesSource: EntitlementSource = {
  getActive: async () => new Set(),
};

/** Development-only preview toggles; ignored entirely outside dev builds. */
export type DevEntitlementOverride = Partial<Record<EntitlementKey, boolean>>;

export function resolveEntitlements(
  granted: EntitlementSet,
  override: DevEntitlementOverride,
  isDevBuild: boolean,
): EntitlementSet {
  if (!isDevBuild) return granted;
  const result = new Set(granted);
  for (const key of ENTITLEMENT_KEYS) {
    const value = override[key];
    if (value === true) result.add(key);
    if (value === false) result.delete(key);
  }
  return result;
}
