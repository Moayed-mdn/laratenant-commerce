import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Props { isActive: boolean }

export function TagStatusBadge({ isActive }: Props) {
  const t = useTranslations('tags');
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('status.active') : t('status.inactive')}
    </Badge>
  );
}
