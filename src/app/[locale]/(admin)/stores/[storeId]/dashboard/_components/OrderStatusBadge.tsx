/**
 * Order status badge component.
 * Maps order status to badge variant with translated label.
 */

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';
import { getTranslations } from 'next-intl/server';

// RSC ONLY — do not import from client components
// Reason: uses getTranslations from next-intl/server (async RSC)

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const variantMap: Record<OrderStatus, 'outline' | 'default' | 'destructive' | 'secondary'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  refunded: 'secondary',
};

/**
 * Badge displaying order status with appropriate variant.
 */
export async function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = await getTranslations('dashboard');

  return (
    <Badge variant={variantMap[status]}>
      {t(`orderStatus.${status}`)}
    </Badge>
  );
}
