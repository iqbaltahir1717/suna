import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Pressable, View } from 'react-native';

import { MascotView, type MascotHandle } from '@/features/mascot/MascotView';

// The React Native test environment keeps one timer of its own alive, so
// assertions compare against an identical render without the mascot.
let baseline = 0;

beforeEach(async () => {
  jest.useFakeTimers();
  const plain = await render(
    <Pressable>
      <View />
    </Pressable>,
  );
  baseline = await pendingTimersAfterSettling();
  await plain.unmount();
});
afterEach(() => jest.useRealTimers());

/** Lets Reanimated's JS frame loop settle, then reports pending timers. */
async function pendingTimersAfterSettling() {
  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  return jest.getTimerCount();
}

describe('MascotView', () => {
  it('leaves no timers or frame loops running after unmount', async () => {
    const view = await render(<MascotView size={96} accessibilityLabel="mascot" />);
    expect(await pendingTimersAfterSettling()).toBeGreaterThan(baseline); // idle is animating
    await view.unmount();
    expect(await pendingTimersAfterSettling()).toBe(baseline);
  });

  it('is fully static when paused', async () => {
    await render(<MascotView size={96} paused />);
    expect(await pendingTimersAfterSettling()).toBe(baseline);
  });

  it('is fully static with reduced motion, even when tapped or asked to react', async () => {
    const ref = createRef<MascotHandle>();
    await render(<MascotView size={96} reduceMotion ref={ref} accessibilityLabel="mascot" />);
    await act(async () => ref.current?.react('greet'));
    await fireEvent.press(screen.getByLabelText('mascot'));
    expect(await pendingTimersAfterSettling()).toBe(baseline);
  });

  it('stops everything when it becomes paused', async () => {
    const view = await render(<MascotView size={96} />);
    expect(await pendingTimersAfterSettling()).toBeGreaterThan(baseline);
    await view.rerender(<MascotView size={96} paused />);
    expect(await pendingTimersAfterSettling()).toBe(baseline);
  });

  it('accepts overlapping reactions and taps without errors', async () => {
    const ref = createRef<MascotHandle>();
    await render(<MascotView size={96} ref={ref} accessibilityLabel="mascot" />);
    await act(async () => {
      ref.current?.react('greet');
      ref.current?.react('tap'); // lower priority: ignored while greeting
    });
    await fireEvent.press(screen.getByLabelText('mascot'));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
  });
});
