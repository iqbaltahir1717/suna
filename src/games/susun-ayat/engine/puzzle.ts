/**
 * Pure puzzle rules for Susun Ayat. No React, no storage, no Quran text: the
 * engine only sees opaque pieces, so it is tested with neutral fixtures.
 *
 * Matching is by `matchKey`, not by card id. Two pieces with the same key
 * (e.g. two identical ayat) are interchangeable, so a visibly correct answer
 * is never rejected because "the other copy" was placed first.
 */

export interface PuzzlePiece {
  /** Unique and stable within one puzzle, e.g. a source reference "1:3". */
  id: string;
  /** Pieces that look the same must share a key. Usually the exact text. */
  matchKey: string;
}

export type PuzzleStatus = 'playing' | 'solved';

export interface PuzzleState {
  /** Expected matchKey per slot, in the correct order. */
  readonly solution: readonly string[];
  readonly pieces: Readonly<Record<string, PuzzlePiece>>;
  /** Unplaced piece ids, in display order. */
  readonly pool: readonly string[];
  /** Piece id per answer slot, or null when empty. */
  readonly slots: readonly (string | null)[];
  /** Slots filled by a hint. They are correct and cannot be moved. */
  readonly lockedSlots: readonly boolean[];
  /** Slots flagged by the last failed check; cleared by the next move. */
  readonly flaggedSlots: readonly number[];
  readonly hintsUsed: number;
  /** Failed checks. Informational only; never used to punish. */
  readonly mistakes: number;
  readonly status: PuzzleStatus;
}

export type Random = () => number;

/**
 * Builds a puzzle from pieces given in the correct order. The pool is
 * shuffled so that, where possible, it does not already read correctly.
 */
export function createPuzzle(
  orderedPieces: readonly PuzzlePiece[],
  random: Random = Math.random,
): PuzzleState {
  if (orderedPieces.length === 0) throw new Error('A puzzle needs at least one piece.');
  const pieces: Record<string, PuzzlePiece> = {};
  for (const piece of orderedPieces) {
    if (pieces[piece.id]) throw new Error(`Duplicate piece id "${piece.id}".`);
    pieces[piece.id] = piece;
  }
  const solution = orderedPieces.map((piece) => piece.matchKey);
  const ids = orderedPieces.map((piece) => piece.id);

  let pool = shuffle(ids, random);
  // Retry a few times so the pool rarely starts in the solved order. When all
  // keys are equal no other order exists, and that is fine.
  for (let attempt = 0; attempt < 10 && readsCorrectly(pool, pieces, solution); attempt++) {
    pool = shuffle(ids, random);
  }

  return {
    solution,
    pieces,
    pool,
    slots: solution.map(() => null),
    lockedSlots: solution.map(() => false),
    flaggedSlots: [],
    hintsUsed: 0,
    mistakes: 0,
    status: 'playing',
  };
}

/**
 * Places a piece into `slotIndex`, or into the first empty slot when omitted
 * (tap-to-place). Works for pieces in the pool or already in a slot:
 * - pool → empty slot: placed.
 * - pool → occupied slot: the occupant returns to the pool.
 * - slot → slot: the two pieces swap.
 * Locked slots never change. Invalid moves return the same state object.
 */
export function placePiece(state: PuzzleState, pieceId: string, slotIndex?: number): PuzzleState {
  if (state.status !== 'playing' || !state.pieces[pieceId]) return state;
  const target = slotIndex ?? state.slots.indexOf(null);
  if (target < 0 || target >= state.slots.length || state.lockedSlots[target]) return state;

  const from = state.slots.indexOf(pieceId);
  if (from === target) return state;
  if (from >= 0 && state.lockedSlots[from]) return state;

  const slots = [...state.slots];
  let pool = [...state.pool];
  const occupant = slots[target] ?? null;

  if (from >= 0) {
    slots[from] = occupant;
  } else {
    pool = pool.filter((id) => id !== pieceId);
    if (occupant) pool.push(occupant);
  }
  slots[target] = pieceId;
  return { ...state, slots, pool, flaggedSlots: [] };
}

/** Returns the piece in `slotIndex` to the end of the pool (tap a placed card). */
export function returnPiece(state: PuzzleState, slotIndex: number): PuzzleState {
  if (state.status !== 'playing' || state.lockedSlots[slotIndex]) return state;
  const pieceId = state.slots[slotIndex];
  if (!pieceId) return state;
  const slots = [...state.slots];
  slots[slotIndex] = null;
  return { ...state, slots, pool: [...state.pool, pieceId], flaggedSlots: [] };
}

export function isComplete(state: PuzzleState): boolean {
  return state.slots.every((id) => id !== null);
}

/** Slot indexes whose piece does not match the expected key. Empty slots excluded. */
export function findWrongSlots(state: PuzzleState): number[] {
  const wrong: number[] = [];
  state.slots.forEach((id, index) => {
    if (id && state.pieces[id]?.matchKey !== state.solution[index]) wrong.push(index);
  });
  return wrong;
}

export type CheckResult = { state: PuzzleState; correct: boolean };

/**
 * Validates a fully filled answer. A correct answer moves to `solved`; a
 * wrong one flags the mismatched slots and counts one mistake. Checking an
 * incomplete answer changes nothing.
 */
export function checkAnswer(state: PuzzleState): CheckResult {
  if (state.status === 'solved') return { state, correct: true };
  if (!isComplete(state)) return { state, correct: false };
  const wrong = findWrongSlots(state);
  if (wrong.length === 0)
    return { state: { ...state, status: 'solved', flaggedSlots: [] }, correct: true };
  return { state: { ...state, flaggedSlots: wrong, mistakes: state.mistakes + 1 }, correct: false };
}

export function hintsRemaining(state: PuzzleState, allowedHints: number): number {
  return Math.max(0, allowedHints - state.hintsUsed);
}

/**
 * Fills the first slot that is empty or wrong with a correct piece and locks
 * it. Prefers a matching piece from the pool, otherwise takes one from a
 * slot where it is misplaced. Returns the same state when no hint applies.
 */
export function applyHint(state: PuzzleState, allowedHints: number): PuzzleState {
  if (state.status !== 'playing' || hintsRemaining(state, allowedHints) === 0) return state;

  const target = state.slots.findIndex(
    (id, index) =>
      !state.lockedSlots[index] &&
      (id === null || state.pieces[id]?.matchKey !== state.solution[index]),
  );
  if (target < 0) return state;
  const wanted = state.solution[target];

  const fromPool = state.pool.find((id) => state.pieces[id]?.matchKey === wanted);
  const fromSlot = state.slots.findIndex(
    (id, index) =>
      index !== target &&
      !state.lockedSlots[index] &&
      id !== null &&
      state.pieces[id]?.matchKey === wanted &&
      state.solution[index] !== wanted,
  );
  const pieceId = fromPool ?? (fromSlot >= 0 ? state.slots[fromSlot] : null);
  if (!pieceId) return state;

  let next = placePiece(state, pieceId, target);
  // A swap may have moved a wrong piece into the source slot; send it back to
  // the pool so the hint never creates a new misplacement.
  const swapped = fromPool === undefined ? next.slots[fromSlot] : null;
  if (swapped && state.pieces[swapped]?.matchKey !== state.solution[fromSlot]) {
    next = returnPiece(next, fromSlot);
  }

  const lockedSlots = [...next.lockedSlots];
  lockedSlots[target] = true;
  return { ...next, lockedSlots, hintsUsed: state.hintsUsed + 1 };
}

function readsCorrectly(
  ids: readonly string[],
  pieces: Record<string, PuzzlePiece>,
  solution: readonly string[],
) {
  return ids.every((id, index) => pieces[id]?.matchKey === solution[index]);
}

function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/** Deterministic PRNG (mulberry32) for tests and reproducible shuffles. */
export function seededRandom(seed: number): Random {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
