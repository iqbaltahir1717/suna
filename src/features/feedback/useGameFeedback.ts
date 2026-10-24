import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useSettings } from '@/features/settings/SettingsProvider';

/**
 * Short, optional game feedback: a sound effect plus a light haptic tap.
 * Both follow the "Sound effects" setting. No background music, ever.
 *
 * The sounds are synthesized placeholders (scripts/generate-sfx.py); final
 * SFX replace the files without code changes.
 */
export type FeedbackEvent = 'pick' | 'place' | 'retry' | 'success';

const SOURCES: Record<FeedbackEvent, number> = {
  pick: require('../../../assets/sfx/pick.wav'),
  place: require('../../../assets/sfx/place.wav'),
  retry: require('../../../assets/sfx/retry.wav'),
  success: require('../../../assets/sfx/success.wav'),
};

const HAPTICS: Record<FeedbackEvent, () => Promise<void>> = {
  pick: () => Haptics.selectionAsync(),
  place: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  retry: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

export function useGameFeedback() {
  const { settings } = useSettings();
  const enabled = settings.soundEnabled;
  const players = useRef<Partial<Record<FeedbackEvent, AudioPlayer>>>({});

  useEffect(() => {
    if (!enabled) return;
    // Respect the silent switch and never interrupt the user's own audio.
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(
      () => {},
    );
    const created = Object.fromEntries(
      (Object.keys(SOURCES) as FeedbackEvent[]).map((event) => [
        event,
        createAudioPlayer(SOURCES[event]),
      ]),
    ) as Record<FeedbackEvent, AudioPlayer>;
    players.current = created;
    return () => {
      players.current = {};
      Object.values(created).forEach((player) => player.remove());
    };
  }, [enabled]);

  return useCallback(
    (event: FeedbackEvent) => {
      if (!enabled) return;
      const player = players.current[event];
      if (player) {
        player.seekTo(0).catch(() => {});
        player.play();
      }
      if (Platform.OS !== 'web') HAPTICS[event]().catch(() => {});
    },
    [enabled],
  );
}
