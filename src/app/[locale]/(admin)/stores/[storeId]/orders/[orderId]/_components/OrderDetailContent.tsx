/**
 * Order detail content (RSC).
 * Server-side data fetching with error handling.
 */

import { getTranslations } from 'next-intl/server';
import { serverFetch } from '@/lib/api/server/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse } from '@/types/api';
import type { AdminOrder } from '@/types/order';
import { mapOrderDetail } from '@/lib/mappers/orders';
import OrderDetailCard from './OrderDetailCard';
import OrderLineItemsTable from './OrderLineItemsTable';
import OrderStatusSelect from './OrderStatusSelect';

interface Props {
  storeId: string;
  orderId: string;
}

export default async function OrderDetailContent({ storeId, orderId }: Props) {
  const t = await getTranslations('orders');

  try {
    const response = await serverFetch<ApiResponse<AdminOrder>>(
      API_ROUTES.store(storeId).orders.detail(orderId)
    );

    if (!response.data) {
      throw new Error('No order data received');
    }

    const order = mapOrderDetail(response.data);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('detail.title')} #{order.orderNumber}
          </h1>
        </div>

        <OrderDetailCard order={order} storeId={storeId} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrderLineItemsTable lineItems={order.lineItems} />
          </div>
          <div>
            <OrderStatusSelect
              currentStatus={order.status}
              storeId={storeId}
              orderId={String(order.id)}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-destructive">{t('detail.error')}</p>
      </div>
    );
  }
}
