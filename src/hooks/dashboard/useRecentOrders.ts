'use client';

/**
 * Hook for fetching recent orders.
 * Uses TanStack Query with automatic mapping to view shape.
 */

import { useQuery } from '@tanstack/react-query';
import { getRecentOrders } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapRecentOrder } from '@/lib/mappers/dashboard';
import type { RecentOrderItemView, RecentOrderItem } from '@/types/dashboard';
import { useStoreStore, selectCurrentStoreCurrency } from '@/stores/storeStore';

/**
 * Fetch recent orders for a store.
 * @param storeId - Store ID from URL params
 */
export function useRecentOrders(storeId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.
  const currency = useStoreStore(selectCurrentStoreCurrency);

  return useQuery<RecentOrderItem[], Error, RecentOrderItemView[]>({
    queryKey: queryKeys.dashboard(storeId).recentOrders(),
    queryFn: () => getRecentOrders(storeId),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => data.map((item) => mapRecentOrder(item, currency)),
  });
}
