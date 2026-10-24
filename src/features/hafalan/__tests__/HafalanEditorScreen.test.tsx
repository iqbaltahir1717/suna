import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { migrateDatabase } from '@/data/db/migrations';
import { createHafalanRepository } from '@/data/repositories/hafalanRepository';
import type { HafalanRepository } from '@/features/hafalan/types';
import { ensureI18n } from '@/locales/i18n';
import { createTestDatabase } from '@/test/nodeSqlite';

import { HafalanEditorScreen } from '../HafalanEditorScreen';

let mockRepo: HafalanRepository;
let mockPremium = true;
const mockBack = jest.fn();

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('@/data/DataProvider', () => ({ useRepositories: () => ({ hafalan: mockRepo }) }));
jest.mock('@/features/purchases/EntitlementsProvider', () => ({
  useEntitlements: () => ({ has: () => mockPremium }),
}));
jest.mock('@/features/settings/SettingsProvider', () => ({
  useSettings: () => ({ language: 'en' }),
}));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ back: mockBack, push: jest.fn(), navigate: jest.fn() }),
}));

beforeAll(() => ensureI18n('en'));
beforeEach(async () => {
  jest.clearAllMocks();
  mockPremium = true;
  const db = createTestDatabase();
  await migrateDatabase(db);
  mockRepo = createHafalanRepository(db);
});

async function chooseSurah(query: string, label: string) {
  await fireEvent.press(await screen.findByLabelText('Choose a surah'));
  await fireEvent.changeText(screen.getByLabelText('Search surah number or name'), query);
  await fireEvent.press(screen.getByText(label));
}

describe('HafalanEditorScreen', () => {
  it('shows the locked premium card without the entitlement', async () => {
    mockPremium = false;
    await render(<HafalanEditorScreen />);
    expect(screen.getByText('See what premium includes')).toBeTruthy();
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('adds a whole surah with a self-chosen status', async () => {
    await render(<HafalanEditorScreen />);
    await chooseSurah('fatihah', 'Al-Fatihah');
    expect(screen.getByText('Ayat 1–7')).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Memorized' }));
    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    const [entry] = await mockRepo.list();
    expect(entry).toMatchObject({
      range: { surah: 1, fromAyah: 1, toAyah: 7 },
      status: 'memorized',
    });
  });

  it('explains an overlap and blocks saving', async () => {
    await mockRepo.create(
      { range: { surah: 2, fromAyah: 1, toAyah: 5 }, status: 'learning', note: null },
      1,
    );
    await render(<HafalanEditorScreen />);
    await chooseSurah('2', 'Surah 2');

    expect(screen.getByText(/overlaps another record \(Ayat 1–5\)/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Save'));
    expect(mockBack).not.toHaveBeenCalled();
    expect(await mockRepo.list()).toHaveLength(1);
  });

  it('logs a review and shows the dated history of an entry', async () => {
    const entry = await mockRepo.create(
      { range: { surah: 114, fromAyah: 1, toAyah: 6 }, status: 'reviewing', note: null },
      Date.UTC(2026, 9, 1, 12),
    );
    await render(<HafalanEditorScreen entryId={entry.id} />);
    expect(await screen.findByText('Added as “Reviewing”')).toBeTruthy();

    await fireEvent.press(screen.getByText('Log a review today'));
    expect(await screen.findByText('Reviewed (murajaah)')).toBeTruthy();
    expect((await mockRepo.get(entry.id))?.lastReviewedAt).not.toBeNull();
  });
});
