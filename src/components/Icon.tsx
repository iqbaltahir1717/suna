import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 22,
  color = 'text',
}: {
  name: IconName;
  size?: number;
  color?: keyof typeof colors;
}) {
  return <Ionicons name={name} size={size} color={colors[color]} accessible={false} />;
}
