import {
  applyHint,
  checkAnswer,
  createPuzzle,
  findWrongSlots,
  isComplete,
  placePiece,
  returnPiece,
  seededRandom,
  type PuzzlePiece,
  type PuzzleState,
} from '../puzzle';

// Neutral, clearly non-Quran fixtures (see AGENTS.md).
const COLORS: PuzzlePiece[] = [
  { id: 'a', matchKey: 'red' },
  { id: 'b', matchKey: 'green' },
  { id: 'c', matchKey: 'blue' },
  { id: 'd', matchKey: 'yellow' },
];

// Positions 2 and 4 look identical, like a repeated line in a song.
const CHORUS: PuzzlePiece[] = [
  { id: 'v1', matchKey: 'verse one' },
  { id: 'c1', matchKey: 'la la la' },
  { id: 'v2', matchKey: 'verse two' },
  { id: 'c2', matchKey: 'la la la' },
];

function solveInOrder(state: PuzzleState, ids: string[]) {
  return ids.reduce((s, id, index) => placePiece(s, id, index), state);
}

describe('createPuzzle', () => {
  it('starts empty with every piece in the pool', () => {
    const state = createPuzzle(COLORS, seededRandom(1));
    expect(state.slots).toEqual([null, null, null, null]);
    expect([...state.pool].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(state.status).toBe('playing');
  });

  it('does not deal the pool already in the solved order', () => {
    for (let seed = 0; seed < 200; seed++) {
      const state = createPuzzle(COLORS.slice(0, 2), seededRandom(seed));
      expect(state.pool).toEqual(['b', 'a']);
    }
  });

  it('accepts a puzzle where every piece looks the same', () => {
    const same = [
      { id: 'x', matchKey: 'k' },
      { id: 'y', matchKey: 'k' },
    ];
    expect(() => createPuzzle(same, seededRandom(3))).not.toThrow();
  });

  it('rejects empty puzzles and duplicate ids', () => {
    expect(() => createPuzzle([])).toThrow();
    expect(() => createPuzzle([COLORS[0]!, COLORS[0]!])).toThrow();
  });
});

describe('placePiece and returnPiece', () => {
  const start = createPuzzle(COLORS, seededRandom(7));

  it('tap-to-place fills the first empty slot', () => {
    const next = placePiece(placePiece(start, 'c'), 'a');
    expect(next.slots).toEqual(['c', 'a', null, null]);
    expect(next.pool).not.toContain('c');
  });

  it('dropping on an occupied slot returns the occupant to the pool', () => {
    const next = placePiece(placePiece(start, 'c', 0), 'a', 0);
    expect(next.slots[0]).toBe('a');
    expect(next.pool).toContain('c');
  });

  it('moving between slots swaps the pieces', () => {
    const placed = placePiece(placePiece(start, 'a', 0), 'b', 1);
    expect(placePiece(placed, 'a', 1).slots.slice(0, 2)).toEqual(['b', 'a']);
  });

  it('moving to an empty slot leaves the old slot empty', () => {
    const placed = placePiece(start, 'a', 0);
    expect(placePiece(placed, 'a', 3).slots).toEqual([null, null, null, 'a']);
  });

  it('returning a piece puts it back in the pool', () => {
    const placed = placePiece(start, 'a', 2);
    const back = returnPiece(placed, 2);
    expect(back.slots[2]).toBeNull();
    expect(back.pool.at(-1)).toBe('a');
  });

  it('ignores invalid moves', () => {
    expect(placePiece(start, 'missing', 0)).toBe(start);
    expect(placePiece(start, 'a', 9)).toBe(start);
    expect(returnPiece(start, 0)).toBe(start);
    const full = solveInOrder(start, ['a', 'b', 'c', 'd']);
    expect(placePiece(full, 'a')).toBe(full); // no empty slot left
  });
});

describe('checkAnswer', () => {
  it('solves a correct answer', () => {
    const state = solveInOrder(createPuzzle(COLORS, seededRandom(2)), ['a', 'b', 'c', 'd']);
    const result = checkAnswer(state);
    expect(result.correct).toBe(true);
    expect(result.state.status).toBe('solved');
    expect(result.state.mistakes).toBe(0);
  });

  it('flags wrong slots and counts a mistake without ending the game', () => {
    const state = solveInOrder(createPuzzle(COLORS, seededRandom(2)), ['b', 'a', 'c', 'd']);
    const result = checkAnswer(state);
    expect(result.correct).toBe(false);
    expect(result.state.flaggedSlots).toEqual([0, 1]);
    expect(result.state.mistakes).toBe(1);
    expect(result.state.status).toBe('playing');
    // The next move clears the flags.
    expect(placePiece(result.state, 'a', 0).flaggedSlots).toEqual([]);
  });

  it('does nothing for an incomplete answer', () => {
    const state = placePiece(createPuzzle(COLORS, seededRandom(2)), 'a', 0);
    expect(isComplete(state)).toBe(false);
    expect(checkAnswer(state)).toEqual({ state, correct: false });
  });

  it('accepts visibly identical pieces in either order', () => {
    const start = createPuzzle(CHORUS, seededRandom(4));
    for (const order of [
      ['v1', 'c1', 'v2', 'c2'],
      ['v1', 'c2', 'v2', 'c1'],
    ]) {
      expect(checkAnswer(solveInOrder(start, order)).correct).toBe(true);
    }
    expect(checkAnswer(solveInOrder(start, ['c1', 'v1', 'v2', 'c2'])).correct).toBe(false);
  });

  it('locks the board once solved', () => {
    const solved = checkAnswer(
      solveInOrder(createPuzzle(COLORS, seededRandom(2)), ['a', 'b', 'c', 'd']),
    ).state;
    expect(returnPiece(solved, 0)).toBe(solved);
    expect(placePiece(solved, 'b', 0)).toBe(solved);
  });
});

describe('applyHint', () => {
  it('places the correct piece in the first open slot and locks it', () => {
    const state = applyHint(createPuzzle(COLORS, seededRandom(5)), 2);
    expect(state.slots[0]).toBe('a');
    expect(state.lockedSlots[0]).toBe(true);
    expect(state.hintsUsed).toBe(1);
    expect(returnPiece(state, 0)).toBe(state);
    expect(placePiece(state, 'b', 0)).toBe(state);
  });

  it('replaces a wrong piece and moves a misplaced correct piece', () => {
    let state = solveInOrder(createPuzzle(COLORS, seededRandom(5)), ['d', 'b', 'a']);
    state = applyHint(state, 3);
    // 'a' moved from slot 2 to slot 0; 'd' was wrong in both places, so it
    // goes back to the pool instead of creating a new misplacement.
    expect(state.slots).toEqual(['a', 'b', null, null]);
    expect(findWrongSlots(state)).toEqual([]);
    expect([...state.pool].sort()).toEqual(['c', 'd']);
  });

  it('keeps a piece that the swap moved into its correct slot', () => {
    // Slot 0 holds 'c' (belongs in slot 2), slot 2 holds 'a' (belongs in slot 0).
    let state = solveInOrder(createPuzzle(COLORS, seededRandom(5)), ['c', 'b', 'a', 'd']);
    state = applyHint(state, 1);
    expect(state.slots).toEqual(['a', 'b', 'c', 'd']);
  });

  it('respects the hint allowance', () => {
    let state = createPuzzle(COLORS, seededRandom(5));
    state = applyHint(applyHint(state, 1), 1);
    expect(state.hintsUsed).toBe(1);
    expect(state.slots.filter(Boolean)).toHaveLength(1);
  });

  it('treats identical pieces as interchangeable', () => {
    let state = createPuzzle(CHORUS, seededRandom(9));
    state = placePiece(state, 'c2', 1);
    state = applyHint(state, 4); // slot 0 needs 'verse one'
    expect(state.slots[0]).toBe('v1');
    expect(state.slots[1]).toBe('c2'); // already correct, left alone
    state = applyHint(state, 4);
    expect(state.slots[2]).toBe('v2');
    state = applyHint(state, 4);
    expect(state.slots[3]).toBe('c1');
    expect(checkAnswer(state).correct).toBe(true);
  });
});
