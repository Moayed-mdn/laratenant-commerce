'use client';

import { useTranslations } from 'next-intl';
import { useCan } from '@/stores/authStore';
import { useUpdateOrderStatus } from '@/hooks/orders/useUpdateOrderStatus';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatusBadge } from '../../_components/OrderStatusBadge';
import type { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';

interface OrderStatusSelectProps {
  currentStatus: OrderStatus;
  storeId: string;
  orderId: string;
}

export default function OrderStatusSelect({
  currentStatus,
  storeId,
  orderId,
}: OrderStatusSelectProps) {
  const canManageOrders = useCan('canManageOrders');
  const t = useTranslations('orders');

  const { mutate, isPending } = useUpdateOrderStatus(storeId, orderId, {
    onSuccess: () => {
      toast.success(t('detail.statusUpdated'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!canManageOrders) {
    return <OrderStatusBadge status={currentStatus} />;
  }

  const handleChange = (value: string | null) => {
    if (!value) return;
    mutate({ status: value as OrderStatus });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t('detail.statusLabel')}
      </label>
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(
            (status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      {isPending && (
        <p className="text-xs text-muted-foreground">
          {t('detail.updating')}
        </p>
      )}
    </div>
  );
}
