import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

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
      <View style={styles.icon}>
        <Icon name={icon} size={24} color="primary" />
      </View>
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
