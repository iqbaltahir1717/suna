import 'react-native-gesture-handler/jestSetup';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ensureI18n } from '@/locales/i18n';

import { buildLevelCards, getLevel } from '../../content';
import { SusunAyatPlayScreen } from '../SusunAyatPlayScreen';

const mockProgress = {
  getActivitySummary: jest.fn(),
  getGameStats: jest.fn(),
  listCompletedChallenges: jest.fn(),
  recordSession: jest.fn(async () => 1),
  markChallengeCompleted: jest.fn(async () => {}),
};

// Gesture Handler installs UI-runtime bindings on import, which the Jest
// (web) build of Worklets does not support. Drag is not exercised here.
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => undefined,
}));
// Icon fonts are not in the Jest asset registry.
jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('@/data/DataProvider', () => ({ useRepositories: () => ({ progress: mockProgress }) }));
const mockFeedback = jest.fn();
jest.mock('@/features/feedback/useGameFeedback', () => ({ useGameFeedback: () => mockFeedback }));
let mockLevelId = 'fatihah-ayat-1-3';
let mockPremium = false;
jest.mock('@/features/purchases/EntitlementsProvider', () => ({
  useEntitlements: () => ({ has: () => mockPremium }),
}));
jest.mock('@/features/settings/SettingsProvider', () => ({
  useSettings: () => ({ reduceMotion: true }),
}));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useIsFocused: () => true,
  useLocalSearchParams: () => ({ levelId: mockLevelId }),
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn() }),
}));

const cards = buildLevelCards(getLevel('fatihah-ayat-1-3')!);
const poolCard = (text: string) => screen.getByLabelText(text, { exact: true });

const renderScreen = () =>
  render(
    <GestureHandlerRootView>
      <SusunAyatPlayScreen />
    </GestureHandlerRootView>,
  );

beforeAll(() => ensureI18n('en'));
beforeEach(() => {
  jest.clearAllMocks();
  mockLevelId = 'fatihah-ayat-1-3';
  mockPremium = false;
});

describe('SusunAyatPlayScreen', () => {
  it('checks automatically when the last card is placed, celebrates, and saves progress', async () => {
    await renderScreen();
    for (const card of cards) await fireEvent.press(poolCard(card.text));

    expect(await screen.findByText('The order is correct!')).toBeTruthy();
    expect(mockFeedback).toHaveBeenCalledWith('place');
    expect(mockFeedback).toHaveBeenCalledWith('success');
    // The results screen follows the short celebration.
    expect(await screen.findByText('Next challenge', {}, { timeout: 3000 })).toBeTruthy();
    await waitFor(() => expect(mockProgress.markChallengeCompleted).toHaveBeenCalledTimes(1));
    expect(mockProgress.recordSession).toHaveBeenCalledWith(
      expect.objectContaining({ levelId: 'fatihah-ayat-1-3', completed: true, mistakes: 0 }),
    );
  });

  it('gives gentle feedback for a wrong order and keeps playing', async () => {
    await renderScreen();
    for (const card of [...cards].reverse()) await fireEvent.press(poolCard(card.text));

    expect(screen.getByText(/Almost!/)).toBeTruthy();
    expect(mockFeedback).toHaveBeenCalledWith('retry');
    expect(screen.queryByText('The order is correct!')).toBeNull();
    expect(mockProgress.markChallengeCompleted).not.toHaveBeenCalled();
  });

  it('records an abandoned attempt only after the player touched it', async () => {
    const first = await renderScreen();
    await first.unmount();
    expect(mockProgress.recordSession).not.toHaveBeenCalled();

    const second = await renderScreen();
    await fireEvent.press(poolCard(cards[0]!.text));
    await second.unmount();
    expect(mockProgress.recordSession).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false, endedAt: null }),
    );
  });

  it('solves a word puzzle with repeated words by tapping in source order', async () => {
    // An-Nas 4–6 repeats ٱلنَّاسِ; identical word cards are interchangeable.
    mockLevelId = 'nas-words-4-6';
    const words = buildLevelCards(getLevel(mockLevelId)!);
    await renderScreen();
    expect(screen.getByText('Word cards')).toBeTruthy();
    for (const word of words) {
      await fireEvent.press(screen.getAllByLabelText(word.text, { exact: true })[0]!);
    }
    expect(await screen.findByText('The order is correct!')).toBeTruthy();
    await waitFor(() =>
      expect(mockProgress.markChallengeCompleted).toHaveBeenCalledWith(
        expect.objectContaining({ levelId: 'nas-words-4-6' }),
      ),
    );
  });

  it('shows a locked state for premium challenges without the entitlement', async () => {
    mockLevelId = 'ikhlas-words-1';
    await renderScreen();
    expect(screen.getByText('This challenge is part of premium')).toBeTruthy();
    expect(screen.queryByText('Word cards')).toBeNull();

    mockPremium = true;
    await renderScreen();
    expect(screen.getByText('Word cards')).toBeTruthy();
  });
});
