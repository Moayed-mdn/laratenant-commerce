'use client';

/**
 * Hook for fetching dashboard stats.
 * Uses TanStack Query with automatic mapping to view shape.
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapDashboardStats } from '@/lib/mappers/dashboard';
import type { DashboardStatsView } from '@/types/dashboard';
import { useStoreStore, selectCurrentStoreCurrency } from '@/stores/storeStore';

/**
 * Fetch dashboard stats for a store.
 * @param storeId - Store ID from URL params
 */
export function useDashboardStats(storeId: string) {
  const currency = useStoreStore(selectCurrentStoreCurrency);

  return useQuery<DashboardStatsView>({
    queryKey: queryKeys.dashboard(storeId).stats(),
    queryFn: () => getDashboardStats(storeId),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => mapDashboardStats(data, currency),
  });
}
