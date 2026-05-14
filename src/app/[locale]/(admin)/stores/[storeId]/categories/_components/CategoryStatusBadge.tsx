/**
 * Badge component for category active/inactive status.
 */

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Props {
  isActive: boolean;
}

export function CategoryStatusBadge({ isActive }: Props) {
  const t = useTranslations('categories');

  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('status.active') : t('status.inactive')}
    </Badge>
  );
}
