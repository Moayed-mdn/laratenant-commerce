/**
 * Order detail page (RSC).
 * Thin wrapper with Suspense boundary.
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import OrderDetailContent from './_components/OrderDetailContent';
import { OrderDetailSkeleton } from './_components/OrderDetailSkeleton';

interface PageProps {
  params: Promise<{ storeId: string; orderId: string; locale: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { storeId, orderId } = await params;
  const t = await getTranslations('orders');

  return (
    <div className="space-y-6">
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailContent storeId={storeId} orderId={orderId} />
      </Suspense>
    </div>
  );
}
