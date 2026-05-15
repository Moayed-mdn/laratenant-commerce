'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface Props {
  isComplete?: boolean;
}

export function TranslationStatusBadge({ isComplete }: Props) {
  const t = useTranslations('products');

  if (isComplete === undefined) return null;

  return (
    <Badge variant={isComplete ? 'secondary' : 'outline'}>
      {isComplete ? t('editor.translationStatus.complete') : t('editor.translationStatus.incomplete')}
    </Badge>
  );
}
