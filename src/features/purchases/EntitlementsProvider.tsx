import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  noPurchasesSource,
  resolveEntitlements,
  type DevEntitlementOverride,
  type EntitlementKey,
  type EntitlementSet,
  type EntitlementSource,
} from './entitlements';

/** True only in development bundles; Metro sets `__DEV__ = false` for release. */
export const DEV_OVERRIDE_AVAILABLE = __DEV__;

interface EntitlementsContextValue {
  has(key: EntitlementKey): boolean;
  /** Dev-only preview state; always empty in production builds. */
  devOverride: DevEntitlementOverride;
  setDevOverride(key: EntitlementKey, value: boolean | undefined): void;
}

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

export function EntitlementsProvider({
  children,
  source = noPurchasesSource,
}: {
  children: ReactNode;
  source?: EntitlementSource;
}) {
  const [granted, setGranted] = useState<EntitlementSet>(() => new Set());
  // Kept in memory on purpose: a preview toggle must never be persisted where
  // it could later be mistaken for a purchase record.
  const [devOverride, setOverride] = useState<DevEntitlementOverride>({});

  useEffect(() => {
    let cancelled = false;
    source
      .getActive()
      .then((active) => {
        if (!cancelled) setGranted(active);
      })
      .catch((error: unknown) => console.warn('Failed to load entitlements', error));
    return () => {
      cancelled = true;
    };
  }, [source]);

  const value = useMemo<EntitlementsContextValue>(() => {
    const active = resolveEntitlements(granted, devOverride, DEV_OVERRIDE_AVAILABLE);
    return {
      has: (key) => active.has(key),
      devOverride: DEV_OVERRIDE_AVAILABLE ? devOverride : {},
      setDevOverride: (key, next) => {
        if (!DEV_OVERRIDE_AVAILABLE) return;
        setOverride((previous) => ({ ...previous, [key]: next }));
      },
    };
  }, [granted, devOverride]);

  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>;
}

export function useEntitlements(): EntitlementsContextValue {
  const value = useContext(EntitlementsContext);
  if (!value) throw new Error('useEntitlements must be used inside <EntitlementsProvider>');
  return value;
}
