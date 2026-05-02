'use client';

/**
 * Hook for fetching order detail.
 */

import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@/lib/api/orders';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { AdminOrder, OrderDetailView } from '@/types/order';
import type { ApiError } from '@/types/api';
import { mapOrderDetail } from '@/lib/mappers/orders';

export function useOrderDetail(storeId: string, orderId: string) {
  return useQuery<AdminOrder, ApiError, OrderDetailView>({
    queryKey: queryKeys.orders(storeId).detail(orderId),
    queryFn: () => getOrderDetail(storeId, orderId),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => mapOrderDetail(data),
  });
}
