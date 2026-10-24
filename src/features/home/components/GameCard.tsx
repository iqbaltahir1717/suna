import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card, Icon } from '@/components';
import { isPlayable, type GameDefinition } from '@/games/registry';
import { colors, radius, spacing } from '@/theme';

export function GameCard({ game }: { game: GameDefinition }) {
  const { t } = useTranslation();
  const router = useRouter();
  const playable = isPlayable(game);

  return (
    <Card>
      {game.banner ? (
        <View style={styles.banner}>
          <Image
            source={game.banner}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            accessible={false}
          />
        </View>
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]}>
          <Icon name="extension-puzzle-outline" size={36} color="textMuted" />
        </View>
      )}
      <View style={styles.text}>
        <AppText variant="heading">{t(game.titleKey)}</AppText>
        <AppText variant="caption" color="textMuted">
          {t(game.descriptionKey)}
        </AppText>
        <Badge
          label={t(`games.availability.${game.availability}`)}
          tone={playable ? 'primary' : 'neutral'}
          icon={playable ? 'play' : 'construct-outline'}
        />
      </View>
      <Button
        label={t('games.open')}
        variant={playable ? 'primary' : 'secondary'}
        onPress={() => router.push(game.route)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', aspectRatio: 16 / 6, borderRadius: radius.md, overflow: 'hidden' },
  bannerPlaceholder: {
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { gap: spacing.xs },
});
