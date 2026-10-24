import type { Href } from 'expo-router';
import type { ImageSourcePropType } from 'react-native';
import type { ParseKeys } from 'i18next';

import type { EntitlementKey } from '@/features/purchases/entitlements';

/**
 * - available: playable.
 * - preview: has an entry screen, but no playable content yet.
 * - comingSoon: listed only; no entry screen.
 */
export type GameAvailability = 'available' | 'preview' | 'comingSoon';

export interface GameDefinition {
  id: string;
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
  /** Banner artwork; null renders the flat placeholder until art exists. */
  banner: ImageSourcePropType | null;
  route: Href;
  availability: GameAvailability;
  /** Entitlement needed to open the game at all, if any. */
  requiredEntitlement?: EntitlementKey;
}
