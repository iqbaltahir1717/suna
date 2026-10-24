import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DataProvider } from '@/data/DataProvider';
import { EntitlementsProvider } from '@/features/purchases/EntitlementsProvider';
import { SettingsProvider } from '@/features/settings/SettingsProvider';
import { colors } from '@/theme';

export default function RootLayout() {
  // Bundled locally (no network). If loading fails, Quran text falls back to
  // the system Arabic font rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts({ AmiriQuran_400Regular });
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
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: t('notifications.title') }} />
      <Stack.Screen name="premium" options={{ title: t('premium.title') }} />
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
