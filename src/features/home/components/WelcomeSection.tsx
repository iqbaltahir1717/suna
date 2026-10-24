import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { MascotView, type MascotHandle } from '@/features/mascot/MascotView';
import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, radius, spacing } from '@/theme';

/** Re-greet at most this often when returning to Home. */
const GREETING_COOLDOWN_MS = 5 * 60 * 1000;
let lastGreetingAt = 0;

const MASCOT_SIZE = 92;

export function WelcomeSection() {
  const { t } = useTranslation();
  const { reduceMotion } = useSettings();
  const mascot = useRef<MascotHandle>(null);
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      // Let the mascot resume before greeting.
      const timer = setTimeout(() => {
        const now = Date.now();
        if (now - lastGreetingAt < GREETING_COOLDOWN_MS) return;
        lastGreetingAt = now;
        mascot.current?.react('greet');
      }, 400);
      return () => {
        clearTimeout(timer);
        setFocused(false);
      };
    }, []),
  );

  return (
    <View style={styles.row}>
      <View style={styles.viewport}>
        <MascotView
          ref={mascot}
          size={MASCOT_SIZE}
          paused={!focused}
          reduceMotion={reduceMotion}
          accessibilityLabel={t('home.mascotA11y')}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="title" color="primary">{t('home.welcomeTitle')}</AppText>
        <AppText color="textMuted">{t('home.welcomeMessage')}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  // Rounded mascot viewport (wireframe node 2003:386).
  viewport: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
  text: { flex: 1, gap: spacing.xs },
});
