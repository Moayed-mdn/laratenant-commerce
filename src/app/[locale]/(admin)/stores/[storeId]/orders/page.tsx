/**
 * Orders list page (RSC).
 * Thin wrapper with Suspense boundary.
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { OrdersSkeleton } from './_components/OrdersSkeleton';
import OrdersContent from './_components/OrdersContent';
import { OrderFiltersSchema } from '@/schemas/orders';

interface PageProps {
  params: Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function OrdersPage({ params, searchParams }: PageProps) {
  const { storeId } = await params;
  const rawSearchParams = await searchParams;
  const t = await getTranslations('orders');

  // Parse and validate search params
  const parsed = OrderFiltersSchema.safeParse({
    search: rawSearchParams.search ?? '',
    status: rawSearchParams.status ?? 'all',
    payment_status: rawSearchParams.payment_status ?? 'all',
    page: rawSearchParams.page ?? 1,
    perPage: rawSearchParams.per_page ?? 10,
  });

  const filters = parsed.success ? parsed.data : {
    search: '',
    status: 'all' as const,
    payment_status: 'all' as const,
    page: 1,
    perPage: 10,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent storeId={storeId} initialFilters={filters} />
      </Suspense>
    </div>
  );
}
