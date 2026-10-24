/**
 * Phase 4 contract only; no table or implementation exists yet.
 *
 * Hafalan is self-reported by the user. It is never derived from game
 * results, and access is gated by the `hafalan_tracker` entitlement.
 */
export type HafalanStatus = 'learning' | 'reviewing' | 'memorized';

export interface AyahRange {
  surah: number;
  fromAyah: number;
  toAyah: number;
}

export interface HafalanEntry {
  id: string;
  range: AyahRange;
  status: HafalanStatus;
  /** Epoch ms when the user last changed the status. */
  updatedAt: number;
  note: string | null;
}

export interface HafalanRepository {
  list(): Promise<HafalanEntry[]>;
  upsert(entry: HafalanEntry): Promise<void>;
  remove(id: string): Promise<void>;
}
