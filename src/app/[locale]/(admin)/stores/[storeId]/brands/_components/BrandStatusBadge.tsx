/**
 * Badge component for brand active/inactive status.
 */

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Props {
  isActive: boolean;
}

export function BrandStatusBadge({ isActive }: Props) {
  const t = useTranslations('brands');

  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('status.active') : t('status.inactive')}
    </Badge>
  );
}
