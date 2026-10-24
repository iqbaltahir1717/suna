import { resolveDropSlot, type SlotRect } from '../dropTargets';

const slot = (x: number, empty = true, locked = false): SlotRect => ({
  x,
  y: 0,
  width: 50,
  height: 50,
  empty,
  locked,
});
const area = { x: 0, y: 0, width: 300, height: 50 };

describe('resolveDropSlot', () => {
  const slots = [slot(0, false), slot(100), slot(200)];

  it('picks the slot under the point, even when filled', () => {
    expect(resolveDropSlot(slots, area, 25, 25)).toBe(0);
    expect(resolveDropSlot(slots, area, 225, 25)).toBe(2);
  });

  it('snaps a loose drop on the area to the nearest empty slot', () => {
    // Between slot 0 (filled, nearer) and slot 1 (empty).
    expect(resolveDropSlot(slots, area, 70, 25)).toBe(1);
    // Just below the area, within the margin.
    expect(resolveDropSlot(slots, area, 230, 70)).toBe(2);
  });

  it('falls back to the nearest filled slot when none is empty', () => {
    const full = [slot(0, false), slot(100, false)];
    expect(resolveDropSlot(full, area, 70, 25)).toBe(0);
  });

  it('never targets a locked slot', () => {
    const withLock = [slot(0, false, true), slot(100)];
    expect(resolveDropSlot(withLock, area, 25, 25)).toBe(1);
  });

  it('returns -1 outside the answer area', () => {
    expect(resolveDropSlot(slots, area, 150, 400)).toBe(-1);
    expect(resolveDropSlot(slots, null, 150, 400)).toBe(-1);
  });
});
