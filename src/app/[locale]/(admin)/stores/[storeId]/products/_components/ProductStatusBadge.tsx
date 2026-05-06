'use client';
// Reason: used inside ProductsTable client component; cannot import async RSC into client

/**
 * Product status badge component.
 * Displays product status with appropriate styling.
 */

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/types/product';

interface Props {
  status: ProductStatus;
}

const variantMap: Record<ProductStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  inactive: 'outline',
};

export function ProductStatusBadge({ status }: Props) {
  const t = useTranslations('dashboard');

  return (
    <Badge variant={variantMap[status]}>
      {t(`productStatus.${status}`)}
    </Badge>
  );
}
