import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Card, EmptyState, RowDivider } from '@/components';
import { getLeaderboardDemo } from '@/dev/fixtures/leaderboardDemo';
import { spacing } from '@/theme';

/**
 * No live leaderboard exists. Dev builds show clearly labelled demo rows;
 * production builds show an honest "not available" state.
 */
export function LeaderboardPreview() {
  const { t } = useTranslation();
  const demo = getLeaderboardDemo();

  if (!demo) {
    return (
      <Card>
        <EmptyState
          icon="trophy-outline"
          title={t('leaderboard.unavailableTitle')}
          body={t('leaderboard.unavailableBody')}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Badge label={t('common.demoData')} tone="dev" icon="flask-outline" />
      <AppText variant="caption" color="dev">
        {t('leaderboard.demoNotice')}
      </AppText>
      <View>
        {demo.map((entry, index) => (
          <View key={entry.rank}>
            {index > 0 ? <RowDivider /> : null}
            <View style={styles.row} accessible>
              <AppText
                variant="heading"
                style={styles.rank}
                accessibilityLabel={t('leaderboard.rank', { rank: entry.rank })}
              >
                {entry.rank}
              </AppText>
              <AppText style={styles.name}>{entry.pseudonym}</AppText>
              <AppText variant="caption" color="textMuted">
                {t('leaderboard.points', { count: entry.points })}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rank: { width: 24 },
  name: { flex: 1 },
});
