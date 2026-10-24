/**
 * Hafalan is self-reported by the user. It is never derived from game
 * results, and access is gated by the `hafalan_tracker` entitlement.
 */
export const HAFALAN_STATUSES = ['learning', 'reviewing', 'memorized'] as const;
export type HafalanStatus = (typeof HAFALAN_STATUSES)[number];

export interface AyahRange {
  surah: number;
  fromAyah: number;
  toAyah: number;
}

export interface HafalanEntry {
  id: string;
  range: AyahRange;
  status: HafalanStatus;
  note: string | null;
  /** Epoch ms when the user added the range. */
  createdAt: number;
  /** Epoch ms of the last edit of any field. */
  updatedAt: number;
  /** Epoch ms when the user last set the status. */
  statusChangedAt: number;
  /** Epoch ms of the last "reviewed today" log; null if never logged. */
  lastReviewedAt: number | null;
}

/** One dated user action on an entry; the history of an entry. */
export type HafalanEventKind = 'created' | 'status_changed' | 'range_changed' | 'reviewed';

export interface HafalanEvent {
  id: number;
  entryId: string;
  kind: HafalanEventKind;
  /** Status of the entry right after the action. */
  status: HafalanStatus;
  at: number;
}

export interface HafalanSummary {
  entries: number;
  /** Ayat per status. Ranges never overlap, so these simply add up. */
  ayatByStatus: Record<HafalanStatus, number>;
  trackedAyat: number;
  surahsTracked: number;
  /** Surahs whose every ayah is in a `memorized` range. */
  surahsMemorized: number;
  lastActivityAt: number | null;
}

export interface HafalanInput {
  range: AyahRange;
  status: HafalanStatus;
  note: string | null;
}

export interface HafalanRepository {
  /** All entries, ordered by surah then first ayah. */
  list(): Promise<HafalanEntry[]>;
  get(id: string): Promise<HafalanEntry | null>;
  /** Validates and inserts. Throws `HafalanValidationError` on a bad range. */
  create(input: HafalanInput, at: number): Promise<HafalanEntry>;
  /** Validates and updates; logs status and range changes as events. */
  update(id: string, input: HafalanInput, at: number): Promise<HafalanEntry>;
  /** Logs a review (murajaah) without changing the status. */
  logReview(id: string, at: number): Promise<void>;
  remove(id: string): Promise<void>;
  /** Events of one entry, newest first. */
  history(id: string): Promise<HafalanEvent[]>;
  summary(): Promise<HafalanSummary>;
}
