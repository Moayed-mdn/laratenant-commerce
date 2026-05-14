'use client';

import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/types/product';

interface Props {
  status: ProductStatus;
}

const variantMap: Record<ProductStatus, 'default' | 'outline' | 'secondary'> = {
  active: 'default',
  draft: 'outline',
};

export function ProductStatusBadge({ status }: Props) {
  return (
    <Badge variant={variantMap[status] ?? 'secondary'}>
      {status}
    </Badge>
  );
}
