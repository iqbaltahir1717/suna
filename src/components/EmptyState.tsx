import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={28} color="textMuted" />
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption" color="textMuted">
        {body}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
