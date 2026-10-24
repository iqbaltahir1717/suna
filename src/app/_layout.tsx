import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DataProvider } from '@/data/DataProvider';
import { EntitlementsProvider } from '@/features/purchases/EntitlementsProvider';
import { SettingsProvider } from '@/features/settings/SettingsProvider';
import { colors, typography } from '@/theme';

export default function RootLayout() {
  // Bundled locally (no network). If loading fails, text falls back to the
  // system fonts rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts({
    AmiriQuran_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <DataProvider>
        <SettingsProvider>
          <EntitlementsProvider>
            <RootStack />
            <StatusBar style="dark" />
          </EntitlementsProvider>
        </SettingsProvider>
      </DataProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerBackTitle: t('common.back'),
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: typography.heading.fontFamily },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: t('notifications.title') }} />
      <Stack.Screen name="premium" options={{ title: t('premium.title') }} />
      <Stack.Screen name="hafalan-entry/new" options={{ title: t('hafalan.editor.newTitle') }} />
      <Stack.Screen
        name="hafalan-entry/[entryId]"
        options={{ title: t('hafalan.editor.editTitle') }}
      />
      <Stack.Screen name="games/susun-ayat/index" options={{ title: t('games.susunAyat.title') }} />
      <Stack.Screen
        name="games/susun-ayat/[levelId]"
        options={{ title: t('games.susunAyat.title') }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
