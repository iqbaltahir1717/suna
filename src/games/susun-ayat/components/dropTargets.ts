/**
 * Drop-target geometry for dragging puzzle cards. Pure and worklet-safe, so
 * the UI thread can highlight the slot under a dragged card every frame and
 * JS can resolve the same slot on release.
 */
export interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Empty slots are preferred for a loose drop near, not on, a slot. */
  empty: boolean;
  /** Hint-locked slots never accept a card. */
  locked: boolean;
}

export interface AreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Extra margin around the answer area that still counts as a drop on it. */
export const DROP_AREA_MARGIN = 32;

const contains = (r: AreaRect, x: number, y: number, margin = 0) => {
  'worklet';
  return (
    x >= r.x - margin &&
    x <= r.x + r.width + margin &&
    y >= r.y - margin &&
    y <= r.y + r.height + margin
  );
};

/**
 * The slot a card dropped at (x, y) lands in, or -1:
 * - directly on an unlocked slot → that slot;
 * - elsewhere on the answer area → the nearest empty slot, or the nearest
 *   unlocked slot when all are filled;
 * - outside the area → -1 (a placed card returns to the bank).
 */
export function resolveDropSlot(
  slots: readonly SlotRect[],
  area: AreaRect | null,
  x: number,
  y: number,
): number {
  'worklet';
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    if (!slot.locked && contains(slot, x, y)) return i;
  }
  if (!area || !contains(area, x, y, DROP_AREA_MARGIN)) return -1;

  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    if (slot.locked) continue;
    const dx = slot.x + slot.width / 2 - x;
    const dy = slot.y + slot.height / 2 - y;
    // Filled slots only win when no empty slot exists.
    const score = dx * dx + dy * dy + (slot.empty ? 0 : 1e12);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}
