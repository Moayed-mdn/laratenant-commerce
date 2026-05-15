/**
 * Order status badge component (client version).
 * Maps order status to badge variant with translated label.
 */

'use client';
// Reason: used in client table and OrderStatusSelect

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';
import { useTranslations } from 'next-intl';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const variantMap: Record<OrderStatus, 'outline' | 'default' | 'destructive' | 'secondary'> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'secondary',
};

/**
 * Badge displaying order status with appropriate variant.
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslations('orders');

  return (
    <Badge variant={variantMap[status]}>
      {t(`status.${status}`)}
    </Badge>
  );
}
