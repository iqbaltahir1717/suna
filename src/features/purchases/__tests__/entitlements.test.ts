import {
  ENTITLEMENT_KEYS,
  noPurchasesSource,
  resolveEntitlements,
  type EntitlementKey,
} from '@/features/purchases/entitlements';
import { PREMIUM_PACKAGE } from '@/features/purchases/premiumPackage';

describe('entitlements', () => {
  it('grants nothing in production until store billing exists', async () => {
    expect((await noPurchasesSource.getActive()).size).toBe(0);
  });

  it('ignores the dev override outside development builds', () => {
    const result = resolveEntitlements(new Set(), { hafalan_tracker: true }, false);
    expect(result.has('hafalan_tracker')).toBe(false);
  });

  it('applies the dev override per key in development builds', () => {
    const granted = new Set<EntitlementKey>(['susun_ayat_full']);
    const result = resolveEntitlements(
      granted,
      { hafalan_tracker: true, susun_ayat_full: false },
      true,
    );
    expect(result.has('hafalan_tracker')).toBe(true);
    expect(result.has('susun_ayat_full')).toBe(false);
  });

  it('keeps the two premium checks distinct but grants both via the package', () => {
    expect(ENTITLEMENT_KEYS).toEqual(['hafalan_tracker', 'susun_ayat_full']);
    expect([...PREMIUM_PACKAGE.grants].sort()).toEqual([...ENTITLEMENT_KEYS].sort());
  });
});
