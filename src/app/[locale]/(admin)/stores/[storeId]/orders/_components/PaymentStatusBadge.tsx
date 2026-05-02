/**
 * Payment status badge component.
 * Maps payment status to badge variant with translated label.
 */

'use client';
// Reason: used in client table

import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/types/order';
import { useTranslations } from 'next-intl';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

/**
 * Badge displaying payment status with appropriate variant.
 * For 'paid' status, applies success styling via className override.
 */
export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const t = useTranslations('orders');

  if (status === 'paid') {
    return (
      <Badge variant="outline" className="border-success text-success">
        {t(`paymentStatus.${status}`)}
      </Badge>
    );
  }

  const variantMap: Record<Exclude<PaymentStatus, 'paid'>, 'outline' | 'default' | 'destructive' | 'secondary'> = {
    pending: 'outline',
    failed: 'destructive',
    refunded: 'secondary',
  };

  return (
    <Badge variant={variantMap[status]}>
      {t(`paymentStatus.${status}`)}
    </Badge>
  );
}
