import { useLocalSearchParams } from 'expo-router';

import { HafalanEditorScreen } from '@/features/hafalan/HafalanEditorScreen';

export default function EditHafalanEntryRoute() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <HafalanEditorScreen entryId={entryId} />;
}
