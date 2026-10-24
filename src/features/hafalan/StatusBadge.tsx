import { useTranslation } from 'react-i18next';

import { Badge, type IconName } from '@/components';

import type { HafalanStatus } from './types';

/** Each status has its own icon so it never relies on color alone. */
export const STATUS_STYLE: Record<
  HafalanStatus,
  { tone: 'neutral' | 'info' | 'primary'; icon: IconName }
> = {
  learning: { tone: 'neutral', icon: 'book-outline' },
  reviewing: { tone: 'info', icon: 'repeat' },
  memorized: { tone: 'primary', icon: 'checkmark-circle' },
};

export function StatusBadge({ status }: { status: HafalanStatus }) {
  const { t } = useTranslation();
  const { tone, icon } = STATUS_STYLE[status];
  return <Badge label={t(`hafalan.status.${status}`)} tone={tone} icon={icon} />;
}
