'use client';

/**
 * Hook for fetching top products.
 * Uses TanStack Query with automatic mapping to view shape.
 */

import { useQuery } from '@tanstack/react-query';
import { getTopProducts } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapTopProduct } from '@/lib/mappers/dashboard';
import type { TopProductItemView } from '@/types/dashboard';
import { useStoreStore, selectCurrentStoreCurrency } from '@/stores/storeStore';

/**
 * Fetch top products for a store.
 * @param storeId - Store ID from URL params
 */
export function useTopProducts(storeId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.
  const currency = useStoreStore(selectCurrentStoreCurrency);

  return useQuery<TopProductItemView[]>({
    queryKey: queryKeys.dashboard(storeId).topProducts(),
    queryFn: () => getTopProducts(storeId),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => data.map((item) => mapTopProduct(item, currency)),
  });
}
